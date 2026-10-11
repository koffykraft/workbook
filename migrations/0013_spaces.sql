-- Shared spaces: an owner invites people by email; members add their own entries and comment.
CREATE TABLE IF NOT EXISTS spaces (
  id TEXT PRIMARY KEY,
  owner_user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  about TEXT,
  coffee TEXT,
  public_token TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_spaces_owner ON spaces(owner_user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_spaces_token ON spaces(public_token);
CREATE TABLE IF NOT EXISTS space_members (
  space_id TEXT NOT NULL,
  email TEXT NOT NULL,
  added_at TEXT NOT NULL,
  PRIMARY KEY (space_id, email)
);
CREATE INDEX IF NOT EXISTS idx_space_members_email ON space_members(email);
CREATE TABLE IF NOT EXISTS space_entries (
  id TEXT PRIMARY KEY,
  space_id TEXT NOT NULL,
  author_user_id TEXT NOT NULL,
  author_name TEXT,
  kind TEXT NOT NULL,
  title TEXT,
  data_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_space_entries_space ON space_entries(space_id, created_at);
CREATE TABLE IF NOT EXISTS space_comments (
  id TEXT PRIMARY KEY,
  space_id TEXT NOT NULL,
  entry_id TEXT NOT NULL,
  author_user_id TEXT NOT NULL,
  author_name TEXT,
  text TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_space_comments_entry ON space_comments(space_id, created_at);
