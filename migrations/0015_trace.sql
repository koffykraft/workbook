-- Lot passports: signed, linked entries per lot, handoffs between users, and the daily
-- public record (OpenTimestamps). Only hashes are stamped publicly.
CREATE TABLE IF NOT EXISTS trace_names (
  user_id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS trace_keys (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  jwk TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS trace_keys_user ON trace_keys(user_id);
CREATE TABLE IF NOT EXISTS trace_lots (
  id TEXT PRIMARY KEY,
  owner_user_id TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  withdrawn INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS trace_lots_owner ON trace_lots(owner_user_id);
CREATE TABLE IF NOT EXISTS trace_events (
  lot_id TEXT NOT NULL,
  seq INTEGER NOT NULL,
  hash TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL,
  key_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  body_json TEXT,
  sig TEXT,
  day TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (lot_id, seq)
);
CREATE INDEX IF NOT EXISTS trace_events_day ON trace_events(day);
CREATE TABLE IF NOT EXISTS trace_transfers (
  id TEXT PRIMARY KEY,
  lot_id TEXT NOT NULL,
  from_user_id TEXT NOT NULL,
  to_email TEXT NOT NULL,
  kg_sent REAL,
  status TEXT NOT NULL,
  kg_received REAL,
  receiver_user_id TEXT,
  created_at TEXT NOT NULL,
  received_at TEXT
);
CREATE INDEX IF NOT EXISTS trace_transfers_lot ON trace_transfers(lot_id);
CREATE INDEX IF NOT EXISTS trace_transfers_to ON trace_transfers(to_email, status);
CREATE TABLE IF NOT EXISTS trace_anchors (
  day TEXT PRIMARY KEY,
  digest TEXT NOT NULL,
  count INTEGER NOT NULL,
  ots_b64 TEXT,
  calendars TEXT,
  status TEXT NOT NULL,
  error TEXT,
  created_at TEXT NOT NULL
);
