// KoffyKraft cloud sync preferences, per section.
// off: stays on this device. selected: only records the user saves to the cloud. all: everything syncs.
const PREFS = (() => {
  const KEY = 'kk_sync_prefs_v1';
  const SECTIONS = { origin: 'Origin (farm, harvest, processing, green lots)', roasts: 'Roasts', cup: 'Cup (brews, cupping, tasting tests)' };
  const DEFAULT = { origin: 'selected', roasts: 'selected', cup: 'selected' };
  const MODES = ['off', 'selected', 'all'];
  function read() {
    try { return { ...DEFAULT, ...(JSON.parse(localStorage.getItem(KEY) || '{}')) }; } catch (e) { return { ...DEFAULT }; }
  }
  function get(section) { const m = read()[section]; return MODES.includes(m) ? m : 'selected'; }
  function headers() { return { 'content-type': 'application/json', authorization: 'Bearer ' + SYNC.getToken() }; }
  function signedIn() { return typeof SYNC !== 'undefined' && SYNC.isAuthenticated(); }
  async function set(section, mode) {
    if (!SECTIONS[section] || !MODES.includes(mode)) return;
    const p = read(); p[section] = mode; localStorage.setItem(KEY, JSON.stringify(p));
    if (signedIn()) { try { await fetch('/api/prefs', { method: 'POST', headers: headers(), body: JSON.stringify({ sync: p }) }); } catch (e) {} }
  }
  async function pull() {
    if (!signedIn() || !navigator.onLine) return read();
    try {
      const r = await fetch('/api/prefs', { headers: headers() });
      if (r.ok) { const x = await r.json(); if (x && x.sync) localStorage.setItem(KEY, JSON.stringify({ ...DEFAULT, ...x.sync })); }
    } catch (e) {}
    return read();
  }
  // section for an Origin-store record type
  function sectionOf(type) { return type === 'brew' || type === 'cupping' || type === 'tasting' ? 'cup' : 'origin'; }
  return { SECTIONS, MODES, get, set, pull, read, sectionOf };
})();
