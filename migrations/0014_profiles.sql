-- Public send-out profiles: one per user, published as a snapshot the user chooses.
CREATE TABLE IF NOT EXISTS profiles (
  user_id TEXT PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  data_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
