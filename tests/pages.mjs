// KoffyKraft (C) 2026 T M Thomas. AGPL-3.0 with additional terms (attribution, names): see NOTICE.
// Page checks in a phone-sized browser: every main page opens without script errors and
// without spilling sideways, and the key journeys work end to end against a stand-in API.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

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
    const pages = ['home', 'origin', 'cup', 'roasts', 'roast-timer-v14', 'roast-graph', 'account', 'contents', 'journey', 'methods', 'crop', 'water', 'map', 'share', 'profile', 'data', 'roastbooks', 'license', 'privacy', 'terms'];
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
    await q.route('**/api/**', r => {
      const u = new URL(r.request().url()), m = r.request().method(); let o = { ok: true, items: [] };
      if (u.pathname === '/api/spaces' && m === 'GET') o = { items: [{ id: 's1', name: 'Circle', coffee: 'Lot 12', entries: 0, members: 1, mine: true }] };
      if (u.pathname === '/api/spaces/s1') o = { space: { id: 's1', name: 'Circle', public_token: null, owner: 'me' }, role: 'owner', members: [], entries: posted.map((x, i) => ({ id: 'e' + i, ...x, author_name: 'me', created_at: new Date().toISOString(), mine: true })), comments: [] };
      if (u.pathname.endsWith('/entries') && m === 'POST') { posted.push(r.request().postDataJSON()); o = { id: 'x' } }
      if (u.pathname === '/api/profile' && m === 'PUT') { profile = r.request().postDataJSON().data; o = { ok: true, token: 'b'.repeat(32) } }
      if (u.pathname === '/api/profile' && m === 'GET') o = { published: false };
      if (u.pathname.startsWith('/api/public/profile/')) o = { data: profile };
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
    await t.acheck('no script errors during the journeys', async () => { if (errs.length) throw new Error(errs[0]) });
  } finally {
    await browser.close(); srv.close();
  }
}
