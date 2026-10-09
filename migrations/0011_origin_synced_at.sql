-- Server-side change stamp so devices pull only what changed since their last pull.
ALTER TABLE origin_records ADD COLUMN synced_at TEXT;
UPDATE origin_records SET synced_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE synced_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_origin_owner_synced ON origin_records(owner_user_id, synced_at);
