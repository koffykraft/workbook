-- Sign-in code requests, used to rate limit /api/auth/request so nobody can
-- spam the sign-in form and use up the email provider's daily quota.
CREATE TABLE IF NOT EXISTS auth_requests (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  ip TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_auth_requests_email ON auth_requests(email, created_at);
CREATE INDEX IF NOT EXISTS idx_auth_requests_ip ON auth_requests(ip, created_at);
