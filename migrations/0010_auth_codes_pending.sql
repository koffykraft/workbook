-- Sign-in codes may now belong to an email that has no account yet (the account is created
-- only when the code is confirmed), and count wrong guesses.
CREATE TABLE IF NOT EXISTS auth_codes_new (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  user_id TEXT,
  code_hash TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  attempts INTEGER NOT NULL DEFAULT 0
);
INSERT OR IGNORE INTO auth_codes_new(id,email,user_id,code_hash,expires_at,created_at) SELECT id,email,user_id,code_hash,expires_at,created_at FROM auth_codes;
DROP TABLE auth_codes;
ALTER TABLE auth_codes_new RENAME TO auth_codes;
CREATE INDEX IF NOT EXISTS idx_auth_codes_email ON auth_codes(email);
