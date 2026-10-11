#!/usr/bin/env bash
# KoffyKraft (C) 2026 T M Thomas. AGPL-3.0 with additional terms (attribution, names): see NOTICE.
# Safe deploy: run every check first and stop if any fail.
# Needs CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN in the environment (never in this file).
set -euo pipefail
cd "$(dirname "$0")/.."
echo "Running checks…"
node tests/run.mjs
echo "All checks passed. Deploying…"
npx wrangler deploy
