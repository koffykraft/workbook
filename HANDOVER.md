# KoffyKraft handover

Read this first in any new chat. It records how the app is built, the working rules, and what is pending, so work can continue without the earlier conversation. Read KOFFYKRAFT_ENGINE.md next for the data model.

## Owner and rules
- Owner: T M Thomas (KoffyKraft, Kerala). Repo github.com/koffykraft/workbook. Live at roast.koffykraft.coffee (also roast.tagroos.workers.dev).
- Licence: AGPL-3.0 with section 7 terms in NOTICE (attribution, changed versions marked, names). Guide text CC BY-SA 4.0. KoffyKraft is a registered trade mark of T M Thomas in India (no class named). Commercial licence: info@koffykraft.com.
- Writing rules: never use em dashes. Plain, short English. Credit every source; write in our own words, never copy (Asami, Lucia Solis and others have asked). Check ChatGPT-supplied material before using it.
- Do not reveal TAGRO irrigation code. No supplier price lists. Do not get around blocked websites.
- Languages: only overviews and explanations are translated (Malayalam now). Labels, buttons, fields, numbers and tips stay English. Same format for future languages (lang/<code>.js).

## Platform
- Cloudflare Worker `roast` (worker.js) serving static assets from the repo root; `run_worker_first` for /api/* and /. D1 database `koffykraft` (migrations/ 0001 to 0014). Email via Resend (sendEmail).
- Offline-first PWA: sw.js, stale-while-revalidate. Bump CACHE (`koffykraft-roastbooks-vNN`) on every release and add new files to CORE. Update notice shows on the Account page only.
- Local data: IndexedDB `KoffyKraftOrigin` (origin-db.js, records by type) and `KoffyKraftTemporaryRoastbook`. Cloud sync in sync.js.
- Admin: ADMIN_EMAILS in wrangler.jsonc. Admin feedback list is visible on Account to admins only. Feedback is emailed to info@koffykraft.coffee.

## Reusable engines (candidates for a crop app)
- Auth, sync, quota, spaces (shared groups, public links), profiles and send-out sheets: worker.js, sync.js, share.html, profile.html, snap.js.
- Process engine: origin.html STEP_TYPES and stepCalc (steps with duration, temperature, pH, moisture, salt %, water L/kg, holding pauses, soaking), process.html, process-run.html.
- Records for farm, harvest/lot, process, green: origin.html, origin-db.js. Crop calendar: crop.html. Map: map.html.
- Share cards: sharecard.js (Instagram post 1080x1350, story 1080x1920, A4 PDF via a built-in JPEG-to-PDF writer), album picker and select mode in origin.html.
- Guide engine: howto.js (`KK_HOWTO={S sources, H guides, PRO protocols}`, steps carry level 1 to 3 and a source key), rendered with a step timer in methods.html. brewkb.js for tips.
- Languages: i18n.js plus lang/*.js. Shared look: kk.css, tap.js. Contents/search: contents.js.

## Coffee-specific parts
Roast timer and graph, roastbooks, cup and brew pages, water, colour.js, varieties.js, brewkb.js content, howto.js content.

## Tests and release
- `npm test` runs tests/run.mjs: static checks, API checks against a fake D1 (node:sqlite), and phone-size browser checks with Playwright (Chromium at /opt/pw-browsers/chromium). 229 checks at last count. Every new feature gets a check.
- `bash scripts/deploy.sh` runs the tests then `npx wrangler deploy`. It needs a Cloudflare API token (CLOUDFLARE_API_TOKEN). Pushing to GitHub alone does not update the Worker.
- New migrations must be applied to D1 (`npx wrangler d1 migrations apply koffykraft --remote`).

## Pending
- CoffeeMind guide points deployed (cache v86, 11 Oct 2026). The Cloudflare token was pasted in chat: roll it after the new app is set up.
- User checks: two-phone shared space test, Gmail sign-in, feedback email arriving, Malayalam wording review, profile logo and colour.
- Offers not yet decided: evidence labels on every tip (Study / Standard or maker / Expert practice / Common practice); a rate-of-rise span setting (Rao suggests 15 s or less, we use about 30 s).
- Backlog: LalCafé TDS PDFs, water sheet, charge temperature "8250" explanation, Probat/Neotec conversion, Malayalam chart labels, live probe reading in the Timer, commercial licence email (.com or .coffee).

## Proposed: verifiable traceability (shared engine service, for coffee and the crop app)
1. Lot passport: unique lot ID, QR on the bag, public page with the journey (farm, harvest, process, green, roast), photos, optional GPS.
2. Signed handoffs: sender records transfer, receiver confirms weight; each phone holds a WebCrypto signing key.
3. Mass balance: flag lots where kg out exceeds kg in.
4. Hash chain: each record stores SHA-256 of its contents plus the previous hash; QR page shows verified or changed.
5. Daily anchoring of one Merkle root via OpenTimestamps (Bitcoin, free, no wallet). Only hashes go public, never personal or farm data, so deletion stays possible.
No tokens or paid chains. Relevant to EU deforestation rule (plot geolocation); check current deadlines.
