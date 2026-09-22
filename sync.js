// KoffyKraft Cloud Sync Module
// Handles authentication, roast saving, and data sync between local and cloud

const SYNC = (() => {
  const API_BASE = '/api';
  let token = null;
  let userId = null;
  let userEmail = null;

  // Load saved token from localStorage
  function loadToken() {
    const saved = localStorage.getItem('kk_auth_token');
    if (saved) {
      token = saved;
      userId = localStorage.getItem('kk_user_id');
      userEmail = localStorage.getItem('kk_user_email');
    }
    return !!token;
  }

  // Check API health and auth status
  async function checkStatus() {
    try {
      const resp = await fetch(`${API_BASE}/status`);
      return resp.ok;
    } catch (e) {
      return false;
    }
  }

  // Request sign-in code
  async function requestSignIn(email) {
    try {
      const resp = await fetch(`${API_BASE}/auth/request`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });
      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || 'Sign-in request failed');
      }
      return { ok: true };
    } catch (e) {
      return { error: e.message };
    }
  }

  // Verify code and get token
  async function verifyCode(email, code) {
    try {
      const resp = await fetch(`${API_BASE}/auth/verify`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), code: code.trim() })
      });
      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || 'Code verification failed');
      }
      const data = await resp.json();
      token = data.token;
      userId = data.user_id;
      userEmail = email;
      localStorage.setItem('kk_auth_token', token);
      localStorage.setItem('kk_user_id', userId);
      localStorage.setItem('kk_user_email', userEmail);
      return { ok: true, token, user_id: userId };
    } catch (e) {
      return { error: e.message };
    }
  }

  // Get current user info
  async function getMe() {
    if (!token) return { error: 'not authenticated' };
    try {
      const resp = await fetch(`${API_BASE}/me`, {
        headers: { 'authorization': `Bearer ${token}` }
      });
      if (!resp.ok) {
        if (resp.status === 401) {
          clearAuth();
          return { error: 'session expired' };
        }
        throw new Error('Failed to get user info');
      }
      return await resp.json();
    } catch (e) {
      return { error: e.message };
    }
  }

  // Logout
  async function logout() {
    if (!token) return { ok: true };
    try {
      await fetch(`${API_BASE}/logout`, {
        method: 'POST',
        headers: { 'authorization': `Bearer ${token}` }
      });
    } catch (e) {}
    clearAuth();
    return { ok: true };
  }

  function clearAuth() {
    token = null;
    userId = null;
    userEmail = null;
    localStorage.removeItem('kk_auth_token');
    localStorage.removeItem('kk_user_id');
    localStorage.removeItem('kk_user_email');
  }

  // Save finished roast to cloud
  async function saveRoast(roastData) {
    if (!token) {
      return { saved: false, local: true, error: 'not authenticated' };
    }
    try {
      const resp = await fetch(`${API_BASE}/roasts`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'authorization': `Bearer ${token}`
        },
        body: JSON.stringify(roastData)
      });
      if (!resp.ok) {
        if (resp.status === 401) {
          clearAuth();
          return { saved: false, local: true, error: 'session expired' };
        }
        const err = await resp.json();
        return { saved: false, local: true, error: err.error || 'save failed' };
      }
      const data = await resp.json();
      return { saved: true, cloud: true, id: data.id };
    } catch (e) {
      return { saved: false, local: true, error: 'network error', offline: true };
    }
  }

  // Load all roasts for current user
  async function loadRoasts() {
    if (!token) {
      return { items: [], error: 'not authenticated' };
    }
    try {
      const resp = await fetch(`${API_BASE}/roasts`, {
        headers: { 'authorization': `Bearer ${token}` }
      });
      if (!resp.ok) {
        if (resp.status === 401) {
          clearAuth();
          return { items: [], error: 'session expired' };
        }
        throw new Error('Failed to load roasts');
      }
      const data = await resp.json();
      return { items: data.items || [], cloud: true };
    } catch (e) {
      return { items: [], error: 'network error', offline: true };
    }
  }

  // Load single roast
  async function loadRoast(id) {
    if (!token) {
      return { error: 'not authenticated' };
    }
    try {
      const resp = await fetch(`${API_BASE}/roasts/${encodeURIComponent(id)}`, {
        headers: { 'authorization': `Bearer ${token}` }
      });
      if (!resp.ok) {
        if (resp.status === 401) {
          clearAuth();
          return { error: 'session expired' };
        }
        if (resp.status === 404) {
          return { error: 'not found' };
        }
        throw new Error('Failed to load roast');
      }
      const data = await resp.json();
      return { ...data, cloud: true };
    } catch (e) {
      return { error: 'network error', offline: true };
    }
  }

  // Initialize
  loadToken();

  return {
    loadToken,
    checkStatus,
    requestSignIn,
    verifyCode,
    getMe,
    logout,
    clearAuth,
    saveRoast,
    loadRoasts,
    loadRoast,
    isAuthenticated: () => !!token,
    getToken: () => token,
    getUserEmail: () => userEmail,
    getUserId: () => userId
  };
})();
