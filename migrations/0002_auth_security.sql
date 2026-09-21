CREATE TABLE IF NOT EXISTS auth_codes (id TEXT PRIMARY KEY,email TEXT NOT NULL,user_id TEXT NOT NULL,code_hash TEXT NOT NULL,expires_at TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,FOREIGN KEY(user_id) REFERENCES users(id));
CREATE INDEX IF NOT EXISTS idx_auth_codes_email ON auth_codes(email);
CREATE TABLE IF NOT EXISTS auth_sessions (id TEXT PRIMARY KEY,user_id TEXT NOT NULL,token_hash TEXT UNIQUE NOT NULL,expires_at TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,FOREIGN KEY(user_id) REFERENCES users(id));
CREATE INDEX IF NOT EXISTS idx_auth_sessions_user ON auth_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_token ON auth_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_process_templates_owner_scope ON process_templates(owner_user_id,scope);
CREATE INDEX IF NOT EXISTS idx_roast_runs_owner_date ON roast_runs(owner_user_id,roast_date);
CREATE INDEX IF NOT EXISTS idx_brew_runs_owner_date ON brew_runs(owner_user_id,brewed_at);