-- Colour readings join the synced records. The type list now lives in the Worker (which
-- refuses unknown types), so the table no longer needs rebuilding for each new type.
CREATE TABLE IF NOT EXISTS origin_records_new (
  id TEXT PRIMARY KEY,
  owner_user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  data_json TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted INTEGER NOT NULL DEFAULT 0,
  synced_at TEXT,
  FOREIGN KEY (owner_user_id) REFERENCES users(id)
);
INSERT OR IGNORE INTO origin_records_new (id, owner_user_id, type, data_json, updated_at, deleted, synced_at)
  SELECT id, owner_user_id, type, data_json, updated_at, deleted, synced_at FROM origin_records;
DROP TABLE origin_records;
ALTER TABLE origin_records_new RENAME TO origin_records;
CREATE INDEX IF NOT EXISTS idx_origin_owner ON origin_records(owner_user_id, updated_at);
CREATE INDEX IF NOT EXISTS idx_origin_owner_synced ON origin_records(owner_user_id, synced_at);
