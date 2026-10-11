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
- `npm test` runs tests/run.mjs: static checks, API checks against a fake D1 (node:sqlite), and phone-size browser checks with Playwright (Chromium at /opt/pw-browsers/chromium). Check count grows with each feature (348 on 11 Oct 2026). Every new feature gets a check.
- `bash scripts/deploy.sh` runs the tests then `npx wrangler deploy`. It needs a Cloudflare API token (CLOUDFLARE_API_TOKEN). Pushing to GitHub alone does not update the Worker.
- New migrations must be applied to D1 (`npx wrangler d1 migrations apply koffykraft --remote`).

## Code rules (from 11 Oct 2026)
- `node scripts/format.mjs` formats every .js file and the script and style blocks inside pages (Prettier, 110 columns). Page markup and text are never touched. The checks fail if code is not formatted.
- `tests/lint.mjs` runs ESLint on every script and page. Each page is checked with only the globals its own `<script src>` files provide, so a missing include fails the checks. It also checks that every onclick and onchange calls a function that exists.
- Shared helpers live in `kk-base.js` (esc, num, r1, r2). Load it before a page's own script or snap.js; never define these again in a page.
- Every page is opened in a phone-size browser by the checks (42 pages).
- Not served: tests, scripts, node_modules, trace-api.js (see .assetsignore).

## File map
- Pages: home (start), origin (farm records), roast-timer-v14 (live roast), roast-graph, roasts (Roastbook), cup (brews and cupping), methods (brew guide), water, crop, map, journey, contents (all features), share (spaces), profile (me and send-out profile), trace (lot passports), account, data, license, privacy, terms. Smaller tools: capture, ocr, process, process-run, rehydration, stats, roastbook, roastbooks, brew, index.
- Shared scripts: kk-base (helpers), kk.css + tap.js (look, tap sizes, update notice), i18n.js + lang/ (languages), sync.js (sign-in and cloud), origin-db.js and koffykraft-db.js (local databases), prefs.js, cloud-ui.js, snap.js (record snapshots for sharing), sharecard.js (images and PDF), export.js, howto.js and brewkb.js (guide content), colour.js, varieties.js, contents.js, feedback.js, pv.js, trace-core.js, qrcode.js (third party).
- Server: worker.js (routes), trace-api.js (passports), migrations/.
- Not KoffyKraft: post (an Instagram preview) sits in the repo and is publicly served. tagrobuild.html was removed on 11 Oct 2026.

## First steps guide (11 Oct 2026)
- home.html: role chips (grow, roast, brew) stored in localStorage kk_role; steps tick from real records (ORIGIN counts, roast count, kk_seen_methods set by methods.html). Hide stores kk_guide_hidden; the First steps link on home brings it back.

## Colour check page (11 Oct 2026)
- colour.html: standalone readings for any coffee (my roast, bought, sample, other), stored as ORIGIN type 'colour' (Cup cloud section). Meter: Agtron ground and whole bean, Gourmet or Commercial, L*a*b*; photo with white card via KKCOLOUR.measurePhoto. Names on three charts (Coffee Review, Sensegood, Moustache Coffee Club). Reference in localStorage kk_colour_ref.
- Meters (KKCOLOUR.METERS): Agtron G/C (E20CP manual formula), Lighttells and Javalytics (Agtron scale, Lighttells SCAA sheet), Tonino (published table, piecewise), SCA tiles; ColorTrack, Colorette, Neotec, Other learned from the user's own pairs (agKnown), with the SCA cupping anchor shown. Colour spaces: CIELAB, LCh, Hunter Lab (input too), XYZ, sRGB/HEX, D65. Records keep raw meter values (meter, mGround, mWhole, space) plus Gourmet equivalents in agGround/agWhole.
- worker.js /api/status reports records: ready after the one-time record table upgrade (also run nightly).
- colour.js exposes window.KKCOLOUR; the per-roast section in Roastbook still uses its own localStorage keys.
- Record table: migration 0016 drops the type CHECK; worker.js recordTypesReady() does the same rebuild once at runtime on the first /api/origin POST, because the deploy token cannot run migrations.

## Pending
- CoffeeMind guide points deployed (cache v86, 11 Oct 2026). The Cloudflare token was pasted in chat: roll it after the new app is set up.
- User checks: two-phone shared space test, Gmail sign-in, feedback email arriving, Malayalam wording review, profile logo and colour.
- Offers not yet decided: evidence labels on every tip (Study / Standard or maker / Expert practice / Common practice); a rate-of-rise span setting (Rao suggests 15 s or less, we use about 30 s).
- Backlog: LalCafé TDS PDFs, water sheet, charge temperature "8250" explanation, Probat/Neotec conversion, Malayalam chart labels, live probe reading in the Timer, commercial licence email (.com or .coffee).

## Lot passports (built 11 Oct 2026)
- Files: trace-core.js (hash, chain, signatures, weight check, OpenTimestamps file; shared by browser, server and tests), trace-api.js (server, imported by worker.js), trace.html (pages), qrcode.js (MIT, vendored), migrations/0015_trace.sql.
- Flow: Origin green lot > Passport and QR > trace.html#seal signs new or changed records and roasts with this phone's key (WebCrypto ECDSA P-256, private key in IndexedDB KoffyKraftTrace, one per account) > #lot/<id> QR, labels, send to buyer by email > buyer confirms weight on trace.html (adds a green record with traceLot in their Origin) and seals their roasts > public #p/<token> checks everything in the reader's browser.
- Public by default: no location, no notes, no stock; owner opts in to location and plot outline (GeoJSON for EU deforestation rule). Emails never shown. Parties shown as A (owner), B, C (buyers).
- Daily cron 18:35 UTC (00:05 IST) stamps each finished UTC day's manifest of hashes via a.pool and b.pool OpenTimestamps calendars; failed days retry next run. Admin can POST /api/trace/anchor. Files at /api/public/trace-day/<day>/manifest and /ots, checkable at opentimestamps.org.
- Withdraw removes entry bodies and signatures; hashes stay so stamped days still verify.
- Ideas not done: photos in entries, upgrade .ots to the Bitcoin attestation server-side, passport link on share cards.
