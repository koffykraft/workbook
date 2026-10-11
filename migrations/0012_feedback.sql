-- Feedback from the Contents and Home pages. Anonymous allowed; contact is optional.
CREATE TABLE IF NOT EXISTS feedback (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  page TEXT,
  kind TEXT,
  message TEXT NOT NULL,
  contact TEXT,
  user_id TEXT,
  ip_hash TEXT
);
CREATE INDEX IF NOT EXISTS idx_feedback_created ON feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_feedback_ip ON feedback(ip_hash, created_at);
