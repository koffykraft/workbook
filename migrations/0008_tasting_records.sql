-- Allow tasting test records (triangle, describe, preference) in the synced record store.
CREATE TABLE IF NOT EXISTS origin_records_new (
  id TEXT PRIMARY KEY,
  owner_user_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('estate','plot','harvest','process','green','brew','cupping','tasting')),
  data_json TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (owner_user_id) REFERENCES users(id)
);
INSERT OR IGNORE INTO origin_records_new SELECT id, owner_user_id, type, data_json, updated_at, deleted FROM origin_records;
DROP TABLE origin_records;
ALTER TABLE origin_records_new RENAME TO origin_records;
CREATE INDEX IF NOT EXISTS idx_origin_owner ON origin_records(owner_user_id, updated_at);
