# KoffyKraft D1 setup

The first migration is migrations/0001_engine.sql.

Create one shared D1 database for the KoffyKraft engine, not a roast-only database. After Cloudflare provides its database_id, add the DB binding to wrangler.jsonc and apply this migration remotely.

The migration is intentionally not auto-applied by the static deployment. Existing Roast Timer and browser data continue working independently until cloud persistence is connected.
