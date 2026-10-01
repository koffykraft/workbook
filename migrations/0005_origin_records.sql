-- Producer-side records (estates, plots, harvests, processing runs, green lots)
-- synced from the Origin page. Stored as JSON documents; the app owns the shape.
CREATE TABLE IF NOT EXISTS origin_records (
  id TEXT PRIMARY KEY,
  owner_user_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('estate','plot','harvest','process','green')),
  data_json TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (owner_user_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_origin_owner ON origin_records(owner_user_id, updated_at);
