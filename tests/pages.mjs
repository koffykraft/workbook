// KoffyKraft (C) 2026 T M Thomas. AGPL-3.0 with additional terms (attribution, names): see NOTICE.
// Page checks in a phone-sized browser: every main page opens without script errors and
// without spilling sideways, and the key journeys work end to end against a stand-in API.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import crypto from 'node:crypto';

async function loadPlaywright() {
  const tries = [process.env.PLAYWRIGHT_MODULE, 'playwright', path.join(process.env.HOME || '', '.npm-global/lib/node_modules/playwright/index.mjs')].filter(Boolean);
  for (const m of tries) { try { return (await import(m)).default || (await import(m)) } catch (e) {} }
  try { return createRequire(import.meta.url)('playwright') } catch (e) {}
  return null;
}

function serve(root) {
  const types = { html: 'text/html', js: 'text/javascript', css: 'text/css', png: 'image/png', svg: 'image/svg+xml', json: 'application/json', webmanifest: 'application/manifest+json' };
  const srv = http.createServer((q, s) => {
    let p = decodeURIComponent(new URL(q.url, 'http://x').pathname).replace(/^\/+/, '') || 'home.html';
    const f = path.join(root, p);
    if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { s.writeHead(404); s.end(); return }
    s.writeHead(200, { 'content-type': types[p.split('.').pop()] || 'application/octet-stream' }); fs.createReadStream(f).pipe(s);
  });
  return new Promise(ok => srv.listen(0, '127.0.0.1', () => ok(srv)));
}

export async function run(root, t) {
  const pw = await loadPlaywright();
  if (!pw) { t.skip('browser checks', 'Playwright is not installed (npm i -D playwright)'); return }
  const srv = await serve(root); const base = 'http://127.0.0.1:' + srv.address().port + '/';
  const exe = process.env.CHROMIUM_PATH || (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
  const browser = await pw.chromium.launch(exe ? { executablePath: exe } : {});
  const ctx = await browser.newContext({ ...pw.devices['iPhone 13'], serviceWorkers: 'block' });
  await ctx.route(/cdnjs|tile|arcgis|openstreetmap|googleapis/, r => r.abort());
  try {
    // 1. every main page opens cleanly
    const pages = ['home', 'origin', 'cup', 'roasts', 'roast-timer-v14', 'roast-graph', 'account', 'contents', 'journey', 'methods', 'crop', 'water', 'map', 'share', 'profile', 'trace', 'data', 'roastbooks', 'license', 'privacy', 'terms', 'brew', 'capture', 'index', 'ocr', 'process-run', 'process', 'rehydration', 'roastbook', 'stats'];
    const p = await ctx.newPage();
    await p.route('**/api/**', r => r.fulfill({ status: 401, contentType: 'application/json', body: '{"error":"authentication required"}' }));
    for (const f of pages) {
      await t.acheck(`${f} opens without errors`, async () => {
        const errs = []; const on = e => errs.push(e.message); p.on('pageerror', on);
        await p.goto(base + f + '.html'); await p.waitForTimeout(350); p.off('pageerror', on);
        const ignore = /Leaflet|\bL is not defined/;
        const real = errs.filter(e => !ignore.test(e));
        if (real.length) throw new Error(real[0]);
        const text = await p.evaluate(() => document.body.innerText.trim().length);
        if (text < 50) throw new Error('page looks empty');
        const wide = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        if (wide > 2) throw new Error(`spills sideways by ${wide}px`);
      });
    }
    await p.close();

    // 2. key journeys with a stand-in API
    const q = await ctx.newPage(); const errs = []; q.on('pageerror', e => errs.push(e.message));
    const posted = []; let profile = null;
    const tr = { keys: {}, events: [], lot: null };
    const kid = j => crypto.createHash('sha256').update(JSON.stringify({ crv: j.crv, kty: j.kty, x: j.x, y: j.y })).digest('hex').slice(0, 16);
    const trView = () => ({ lot: { id: 'L1', title: tr.lot, token: 'c'.repeat(32), withdrawn: false, created_at: new Date().toISOString() }, events: tr.events, keys: tr.keys, labels: Object.fromEntries(Object.keys(tr.keys).map(k => [k, 'Test Estate'])), anchors: {}, transfers: [], role: 'owner' });
    await q.route('**/api/**', r => {
      const u = new URL(r.request().url()), m = r.request().method(); let o = { ok: true, items: [] };
      if (u.pathname === '/api/spaces' && m === 'GET') o = { items: [{ id: 's1', name: 'Circle', coffee: 'Lot 12', entries: 0, members: 1, mine: true }] };
      if (u.pathname === '/api/spaces/s1') o = { space: { id: 's1', name: 'Circle', public_token: null, owner: 'me' }, role: 'owner', members: [], entries: posted.map((x, i) => ({ id: 'e' + i, ...x, author_name: 'me', created_at: new Date().toISOString(), mine: true })), comments: [] };
      if (u.pathname.endsWith('/entries') && m === 'POST') { posted.push(r.request().postDataJSON()); o = { id: 'x' } }
      if (u.pathname === '/api/profile' && m === 'PUT') { profile = r.request().postDataJSON().data; o = { ok: true, token: 'b'.repeat(32) } }
      if (u.pathname === '/api/profile' && m === 'GET') o = { published: false };
      if (u.pathname.startsWith('/api/public/profile/')) o = { data: profile };
      if (u.pathname === '/api/trace/keys') { const jw = r.request().postDataJSON().jwk; tr.keys[kid(jw)] = jw; o = { id: kid(jw) } }
      if (u.pathname === '/api/trace/lots' && m === 'POST') { tr.lot = r.request().postDataJSON().title; o = { id: 'L1', token: 'c'.repeat(32) } }
      if (u.pathname === '/api/trace/lots/L1') o = trView();
      if (u.pathname === '/api/trace/lots/L1/events') { for (const x of r.request().postDataJSON().events) tr.events.push({ seq: x.body.seq, hash: x.hash, sig: x.sig, body: x.body, party: 'A', day: '2026-10-11' }); o = { ok: true } }
      if (u.pathname === '/api/public/trace/' + 'c'.repeat(32)) o = trView();
      r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(o) });
    });
    await q.goto(base + 'cup.html'); await q.waitForTimeout(300);
    await q.evaluate(async () => {
      localStorage.setItem('kk_auth_token', 't'); localStorage.setItem('kk_user_email', 'me@example.com');
      await ORIGIN.put({ type: 'brew', id: 'b1', method: 'V60', dose: 15, water: 250, tds: 1.35, roastLabel: 'Lot 12 #3', brewedAt: new Date().toISOString() });
      await ORIGIN.put({ type: 'green', id: 'g1', code: 'G-1', name: '<b>x</b>', weightKg: 30, date: '2026-09-01' });
    });

    await t.acheck('a brew can be shared to a space from Cup', async () => {
      await q.goto(base + 'cup.html#edit/brew/b1'); await q.waitForTimeout(600);
      await q.click('.sharebtn'); await q.waitForSelector('[data-to="s1"]', { timeout: 5000 }); await q.click('[data-to="s1"]'); await q.waitForTimeout(500);
      const b = posted.at(-1); if (!b || b.kind !== 'brew' || b.data.dose !== 15) throw new Error('brew not posted: ' + JSON.stringify(b));
    });
    await t.acheck('a green lot can be shared from Origin', async () => {
      await q.goto(base + 'origin.html#edit/green/g1'); await q.waitForTimeout(600);
      await q.click('.sharebtn'); await q.waitForSelector('[data-to="s1"]', { timeout: 5000 }); await q.click('[data-to="s1"]'); await q.waitForTimeout(500);
      if (posted.at(-1).kind !== 'green') throw new Error('green lot not posted');
    });
    await t.acheck('space page shows shared records, text escaped', async () => {
      await q.goto(base + 'share.html#s/s1'); await q.waitForTimeout(600);
      const html = await q.$eval('#view', e => e.innerHTML);
      if (!html.includes('Lot 12 #3')) throw new Error('brew not shown');
      if (html.includes('<b>x</b>')) throw new Error('record text not escaped');
    });
    await t.acheck('profile publishes and shows publicly with credit', async () => {
      await q.goto(base + 'profile.html#send'); await q.waitForTimeout(700);
      await q.fill('#pT', 'Test Estate'); await q.check('[data-k="green"]'); await q.click('#pPub'); await q.waitForTimeout(500);
      if (!profile || profile.title !== 'Test Estate' || profile.items.length !== 1) throw new Error('not published: ' + JSON.stringify(profile));
      await q.goto(base + 'profile.html#u/' + 'b'.repeat(32)); await q.waitForTimeout(500);
      const txt = await q.$eval('#view', e => e.innerText);
      if (!txt.includes('Test Estate') || !txt.includes('Made with KoffyKraft')) throw new Error('public sheet incomplete');
    });
    await t.acheck('Me page shows activity totals', async () => {
      await q.goto(base + 'profile.html'); await q.waitForTimeout(600);
      if (!(await q.$eval('#view', e => e.innerText)).includes('brews')) throw new Error('no totals');
    });
    await t.acheck('Brew guide shows step-by-step and runs the step timer', async () => {
      await q.goto(base + 'methods.html'); await q.evaluate(() => localStorage.setItem('kk_brew_level', '3')); await q.reload(); await q.waitForTimeout(500);
      for (const id of Object.keys(await q.evaluate(() => window.KK_HOWTO.H))) {
        const n = await q.$$eval('#m-' + id + ' ol.steps li', a => a.length); if (n < 6) throw new Error(id + ' has only ' + n + ' steps');
      }
      const pro = await q.$$eval('#protocols ~ details.card[id^="p-"]', a => a.length); if (pro < 6) throw new Error('protocols: ' + pro);
      await q.evaluate(() => document.getElementById('m-v60').open = true); await q.click('[data-run="v60"]'); await q.click('#rGo'); await q.waitForTimeout(400);
      if (!(await q.$eval('#rNow', e => e.innerText)).includes('Bloom')) throw new Error('timer did not start on the bloom');
      await q.click('#rClose'); await q.evaluate(() => localStorage.setItem('kk_brew_level', '1'));
    });
    await t.acheck('Origin records share as image and as a valid PDF', async () => {
      await q.goto(base + 'origin.html#edit/green/g1'); await q.waitForTimeout(700);
      await q.click('.imgbtn'); await q.waitForSelector('#kkcard .pv img', { timeout: 8000 });
      await q.click('[data-fmt=pdf]'); await q.waitForTimeout(1500);
      const info = await q.$eval('#kcInfo', e => e.innerText); if (!/\.pdf/.test(info)) throw new Error('no pdf: ' + info);
      const head = await q.evaluate(async () => { const c = document.createElement('canvas'); c.width = 20; c.height = 28; const b = KKCARD.pdf([c]); const t = await b.text(); return t.slice(0, 8) + '|' + t.includes('%%EOF') });
      if (head !== '%PDF-1.4|true') throw new Error('pdf malformed: ' + head);
      await q.click('#kcX');
      await q.goto(base + 'origin.html#green'); await q.waitForTimeout(600); await q.click('#selToggle'); await q.click('#listBody .card');
      if (!(await q.$eval('#selBar', e => e.innerText)).includes('1 selected')) throw new Error('selection failed');
      await q.click('#selBar >> text=Done');
    });
    await t.acheck('Album picker selects by heading and everything', async () => {
      await q.goto(base + 'origin.html'); await q.waitForTimeout(600); await q.click('text=Share'); await q.waitForSelector('#picker.on');
      await q.click('#pkAll'); const all = await q.$eval('#pkN', e => e.innerText);
      await q.click('#pkAll'); await q.click('[data-pg="green"]'); const one = await q.$eval('#pkN', e => e.innerText);
      if (!/selected/.test(all) || one !== '1 selected') throw new Error(all + ' / ' + one);
      await q.click('#pkX');
    });
    await t.acheck('Passport seals a green lot from Origin with valid signatures', async () => {
      await q.goto(base + 'origin.html#edit/green/g1'); await q.waitForTimeout(600);
      await q.click('.passbtn'); await q.waitForURL(/trace\.html#seal/); await q.waitForSelector('#go', { timeout: 8000 });
      await q.click('#go'); await q.waitForURL(/#lot\/L1/, { timeout: 8000 }); await q.waitForSelector('.qr svg', { timeout: 8000 });
      const g = tr.events.find(e => e.body.data.rtype === 'green'); if (!g) throw new Error('green not sealed: ' + tr.events.length);
      if (g.body.data.card.notes || g.body.data.geo) throw new Error('notes or location public by default');
      const lot = await q.evaluate(async () => (await ORIGIN.get('g1')).traceLot); if (lot !== 'L1') throw new Error('green not linked: ' + lot);
    });
    await t.acheck('Passport page checks entries and catches a change', async () => {
      await q.goto(base + 'trace.html#p/' + 'c'.repeat(32)); await q.waitForSelector('.banner', { timeout: 8000 });
      const ok = await q.$eval('#view', e => e.innerText); if (!/All \d+ entries check out/.test(ok)) throw new Error('not verified: ' + ok.slice(0, 200));
      if (!ok.includes('Weights add up')) throw new Error('no weight check');
      const keep = JSON.stringify(tr.events); tr.events.at(-1).body.data.card.title = 'Swapped lot';
      await q.goto(base + 'trace.html#q'); await q.goto(base + 'trace.html#p/' + 'c'.repeat(32)); await q.reload(); await q.waitForSelector('.banner', { timeout: 8000 });
      const bad = await q.$eval('#view', e => e.innerText); tr.events = JSON.parse(keep);
      if (!/do not check out/.test(bad) || !bad.includes('Changed after signing')) throw new Error('tamper not shown');
    });
    await t.acheck('First steps guide picks a role and ticks steps from real records', async () => {
      await q.goto(base + 'home.html'); await q.evaluate(() => { localStorage.removeItem('kk_guide_hidden'); localStorage.removeItem('kk_role') }); await q.reload(); await q.waitForSelector('[data-role=grow]');
      await q.click('[data-role=grow]'); await q.waitForSelector('.steps li');
      await q.evaluate(async () => ORIGIN.put({ type: 'estate', id: 'e-guide', name: 'Guide Estate' })); await q.reload(); await q.waitForSelector('.steps li');
      const first = await q.$eval('.steps li', e => e.className); if (first !== 'done') throw new Error('estate step not ticked: ' + first);
      const go = await q.$eval('.steps li.next .go', e => e.getAttribute('href')); if (!/edit\/plot\/new/.test(go)) throw new Error('next step link: ' + go);
      await q.click('#gHide'); if (await q.$('.guide')) throw new Error('did not hide');
      await q.evaluate(() => localStorage.removeItem('kk_guide_hidden'));
    });
    await t.acheck('Malayalam shows explanations only, labels stay English', async () => {
      await q.goto(base + 'home.html'); await q.evaluate(() => localStorage.setItem('kk_lang', 'ml'));
      await q.goto(base + 'crop.html'); await q.waitForTimeout(700);
      const ml = await q.$$eval('[lang=ml]', a => a.length); if (ml < 3) throw new Error('only ' + ml + ' Malayalam blocks');
      const nav = await q.$eval('.kkh-nav', e => e.innerText); if (!nav.includes('Origin') || !nav.includes('Roastbook')) throw new Error('menu changed');
      const chips = await q.$eval('#lvl', e => e.innerText); if (!chips.includes('Basic')) throw new Error('chips changed');
      await q.selectOption('.kk-lang', 'en'); await q.waitForTimeout(600);
      if (await q.$$eval('[lang=ml]', a => a.length)) throw new Error('English did not come back');
    });
    await t.acheck('no script errors during the journeys', async () => { if (errs.length) throw new Error(errs[0]) });
  } finally {
    await browser.close(); srv.close();
  }
}
