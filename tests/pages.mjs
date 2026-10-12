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
    const pages = ['home', 'origin', 'cup', 'roasts', 'roast-timer-v14', 'roast-graph', 'account', 'contents', 'journey', 'methods', 'crop', 'water', 'map', 'share', 'profile', 'trace', 'data', 'roastbooks', 'license', 'privacy', 'terms', 'brew', 'capture', 'index', 'ocr', 'process-run', 'process', 'rehydration', 'roastbook', 'stats', 'colour', 'trail', 'weather', 'fieldlog', 'team', 'jobs', 'ledger', 'land'];
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
    await t.acheck('Colour check saves a reading, names it and shows the ground and whole-bean gap', async () => {
      await q.goto(base + 'colour.html#new'); await q.waitForSelector('#fName');
      await q.fill('#fName', 'Test lot roast 1'); await q.click('[data-k="Bought coffee"]');
      await q.fill('#fMG', '60'); await q.fill('#fMW', '49');
      const res = await q.$eval('#result', e => e.innerText);
      if (!/Agtron Gourmet 60/.test(res) || !/11 points higher/.test(res)) throw new Error('result: ' + res.slice(0, 200));
      await q.click('#fSave'); await q.waitForURL(/#edit\//);
      await q.goto(base + 'colour.html'); await q.waitForSelector('a.card');
      const list = await q.$eval('#view', e => e.innerText); if (!list.includes('Test lot roast 1') || !list.includes('Bought coffee')) throw new Error('not listed');
      const rec = await q.evaluate(async () => (await ORIGIN.all('colour'))[0]); if (rec.agGround !== 60 || rec.kind !== 'Bought coffee') throw new Error(JSON.stringify(rec));
      await q.selectOption('#scheme', 'mc'); if (!(await q.$eval('#view', e => e.innerText)).includes('Medium')) throw new Error('scheme switch');
      await q.selectOption('#scheme', 'cr');
    });
    await t.acheck('Colour check learns ColorTrack and Colorette from the meter screen and estimates from L*', async () => {
      await q.goto(base + 'colour.html'); await q.waitForSelector('#view');
      await q.evaluate(async () => {
        const rows = [[86, 32.7, 41, 125], [70, 28.6, 52, 108], [55, 24.9, 63, 92]];
        for (const [g, L, ct, co] of rows)
          await ORIGIN.put({ type: 'colour', name: 'Meter ' + g, meter: 'agtron-g', mGround: g, agGround: g, L, a: 9, b: 15, space: 'cielab', xColortrack: ct, xColorette: co, at: '2026-10-01' });
      });
      await q.goto(base + 'colour.html#new'); await q.waitForSelector('#fName');
      await q.fill('#fName', 'L only'); await q.fill('#fL', '28.6'); await q.fill('#fA', '9'); await q.fill('#fB', '15');
      const res = await q.$eval('#result', e => e.innerText);
      if (!/From the meter L\*: about Agtron 7\d/.test(res)) throw new Error('L* estimate: ' + res.slice(0, 300));
      if (!/Your ColorTrack, about\s+5\d/.test(res) || !/Your Probat Colorette, about\s+1\d\d/.test(res)) throw new Error('learned scales: ' + res.slice(0, 600));
      await q.click('summary.mini'); if (!(await q.$('#fXT'))) throw new Error('extra fields missing');
    });
    await t.acheck('Colour check converts other meters and colour spaces', async () => {
      await q.goto(base + 'colour.html#new'); await q.waitForSelector('#fName');
      await q.fill('#fName', 'Tonino test'); await q.selectOption('#fMeter', 'tonino'); await q.fill('#fMG', '105');
      let res = await q.$eval('#result', e => e.innerText);
      if (!/Agtron Gourmet 63\.3/.test(res) || !/Agtron Commercial\s+48/.test(res)) throw new Error('tonino: ' + res.slice(0, 300));
      await q.selectOption('#fMeter', 'colortrack');
      if (!/No published conversion/.test(await q.$eval('#fConv', e => e.innerText)) || await q.$eval('#fKnownWrap', e => e.hidden)) throw new Error('colortrack should ask for pairs');
      await q.selectOption('#fMeter', 'agtron-g'); await q.fill('#fMG', ''); await q.selectOption('#fSpace', 'hunter');
      await q.fill('#fL', '33.54'); await q.fill('#fA', '7.49'); await q.fill('#fB', '11.28');
      res = await q.$eval('#result', e => e.innerText);
      if (!/L\* 40\.0 · a\* 10\.0 · b\* 20\.0/.test(res) || !/#78583E/.test(res)) throw new Error('hunter: ' + res.slice(0, 400));
    });
    await t.acheck('A processing run can start from a ready-made washed protocol', async () => {
      await q.goto(base + 'origin.html#edit/process/new'); await q.waitForSelector('#preset');
      const names = await q.$$eval('#preset option', o => o.map(x => x.text).join('|')); if (!/Kenyan/.test(names) || !/demucilaged/.test(names) || !/robusta/i.test(names)) throw new Error('protocols: ' + names);
      await q.selectOption('#preset', '0'); await q.waitForTimeout(300);
      const steps = await q.$$eval('#steps .step', a => a.length); if (steps < 6) throw new Error('steps added: ' + steps);
      const txt = await q.$eval('#steps', e => e.innerText); if (!/Coffee Board/.test(txt)) throw new Error('step guidance missing');
      const opts = await q.$$eval('#steps select[data-sk=method]', a => a.flatMap(s => [...s.options].map(o => o.text)));
      for (const m of ['Patio / barbecue (cement)', 'Polytunnel', 'Mechanical dryer, rotary drum', 'Enzyme (pectinase)']) if (!opts.some(o => o.includes(m))) throw new Error('method missing: ' + m);
    });
    await t.acheck('Coffee words include world terms, grades and units; robusta clones listed', async () => {
      const r = await q.evaluate(() => ({ w: COFFEE_WORDS.map(x => x[1]).join('|'), v: KK_VARIETIES.map(x => x.n + '|' + (x.a || '')).join('|'), robusta: KK_VARIETIES.filter(x => x.sp === 'Robusta').length }));
      for (const w of ['Giling basah', 'Beneficio', 'Supremo', 'Export bag', 'Quintal']) if (!r.w.includes(w)) throw new Error('word missing: ' + w);
      for (const v of ['TR9', 'KR6', 'BRS 1216', 'Roubi 1', 'Balehonnur', 'Vitória Incaper 8142', 'Castillo', '74110', 'BPL10', 'Esperanza', 'IPR 107', 'S4808']) if (!r.v.includes(v)) throw new Error('variety missing: ' + v);
      if (r.robusta < 50) throw new Error('robusta entries: ' + r.robusta);
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
    await t.acheck('Kannada, Tamil, Spanish and Portuguese show explanations', async () => {
      for (const c of ['kn', 'ta', 'es', 'pt']) {
        await q.goto(base + 'home.html'); await q.evaluate(c => localStorage.setItem('kk_lang', c), c);
        await q.goto(base + 'home.html'); await q.waitForTimeout(600);
        const n = await q.$$eval('[lang=' + c + ']', a => a.length); if (n < 3) throw new Error(c + ': only ' + n + ' blocks');
      }
      await q.evaluate(() => localStorage.setItem('kk_lang', 'en'));
    });
    await t.acheck('A kg field converts quintals and bags to kg', async () => {
      await q.goto(base + 'origin.html#edit/green/g1'); await q.waitForTimeout(700);
      const f = q.locator('input[data-k="weightKg"]'); await f.fill('3'); await f.focus();
      await q.click('.kku button[data-u="quintal 46"]'); await q.waitForTimeout(100);
      if ((await f.inputValue()) !== '138') throw new Error('got ' + (await f.inputValue()));
      if (!(await q.$eval('.kku-done', e => e.innerText)).includes('138 kg')) throw new Error('no note');
    });
    await t.acheck('Timer gram fields take ounces and pounds', async () => {
      await q.goto(base + 'roast-timer-v14.html'); await q.waitForTimeout(500);
      const f = q.locator('#greenWeight'); await f.fill('2'); await f.focus();
      await q.click('.kku button[data-u="lb"]'); await q.waitForTimeout(100);
      if ((await f.inputValue()) !== '907.2') throw new Error('got ' + (await f.inputValue()));
    });
    await t.acheck('Timer probe list and readers work', async () => {
      const r = await q.evaluate(() => {
        const sel = [...document.querySelectorAll('#kkpMode option')].map(o => o.value);
        const dv = new DataView(Uint8Array.of(0x00, 0x2c, 0x07, 0x00, 0xff).buffer); // 1836 × 10^-1 = 183.6 °C
        const es = new DataView(Uint8Array.of(0x8c, 0x47).buffer); // 18316 → 183.16 °C
        return { sel, ht: KKPROBE.parseHT(dv), es: KKPROBE.parseES(es), tc4: KKPROBE.nums('24.5,182.3,170.1') };
      });
      for (const m of ['manual', 'serial-line', 'serial-tc4', 'ble']) if (!r.sel.includes(m)) throw new Error('missing ' + m);
      if (Math.abs(r.ht - 183.6) > 0.01 || Math.abs(r.es - 183.16) > 0.01 || r.tc4[1] !== 182.3) throw new Error(JSON.stringify(r));
    });
    await t.acheck('Green lot share card carries the passport link', async () => {
      await q.goto(base + 'origin.html'); await q.waitForTimeout(500);
      const d = await q.evaluate(() => cardData('green', { id: 'gx', code: 'G-9', weightKg: 5, traceToken: 'ab'.repeat(16) }));
      if (!d.qr || !d.qr.endsWith('/trace.html#p/' + 'ab'.repeat(16))) throw new Error('no qr: ' + d.qr);
    });
    await t.acheck('Trail: record a walk with a stop and photo, kept on the device, saved as a pack', async () => {
      const stub = 'const mk=()=>{const f=function(){return p};const p=new Proxy(f,{get:(t,k)=>k==="then"?undefined:p,apply:()=>p});return p};window.L=mk();';
      await q.route(/leaflet.*\.js/, r => r.fulfill({ contentType: 'text/javascript', body: stub }));
      await ctx.grantPermissions(['geolocation']);
      await ctx.setGeolocation({ latitude: 9.0, longitude: 76.9, accuracy: 5 });
      await q.goto(base + 'trail.html#rec'); await q.waitForTimeout(600);
      await q.click('#go'); await q.waitForTimeout(300);
      for (let i = 1; i <= 4; i++) { await ctx.setGeolocation({ latitude: 9.0 + i * 0.0002, longitude: 76.9, accuracy: 5 }); await q.waitForTimeout(350) }
      if (!(await q.isVisible('#cam'))) throw new Error('no Photo here button');
      const barOk = await q.evaluate(() => { const r = document.querySelector('.recbar').getBoundingClientRect(); return r.bottom <= innerHeight + 1 && r.top >= 0 });
      if (!barOk) throw new Error('record buttons not on screen');
      await q.click('#stop'); await q.fill('#sT', 'Drying beds'); await q.fill('#sD', 'Raised beds, day 4');
      const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
      if (!(await q.isVisible('label:has(#sCam)')) || !(await q.isVisible('label:has(#sP)'))) throw new Error('photo buttons not shown');
      await q.setInputFiles('#sP', { name: 'beds.png', mimeType: 'image/png', buffer: png }); await q.waitForTimeout(300);
      await q.click('#sOk'); await q.waitForTimeout(300);
      await q.click('#fin'); await q.waitForTimeout(500);
      await q.fill('#eN', 'Thumpassery walk'); await q.click('#eOk'); await q.waitForTimeout(600);
      const r = await q.evaluate(async () => {
        const t = (await T.all()).find(x => x.name === 'Thumpassery walk');
        const photos = {}; for (const p of await P.of(t.id)) photos[p.id] = p;
        const z = await unzip(await (await pack(t, photos)).arrayBuffer());
        return { pts: t.points.length, stops: t.stops.length, ph: t.stops[0].photos.length, gpx: gpx(t), files: Object.keys(z), dist: stats(t.points).dist, cloud: !!(window.SYNC || window.KKSYNC) };
      });
      if (r.pts < 3) throw new Error('points ' + r.pts);
      if (r.stops !== 1 || r.ph !== 1) throw new Error('stop or photo missing');
      if (!r.gpx.includes('<trkpt') || !r.gpx.includes('Drying beds')) throw new Error('gpx');
      for (const f of ['index.html', 'trail.gpx', 'trail.kml', 'trail.geojson', 'koffykraft-trail.json', 'photos/001.jpg']) if (!r.files.includes(f)) throw new Error('pack missing ' + f);
      if (r.dist < 50 || r.dist > 120) throw new Error('distance ' + r.dist);
      if (r.cloud) throw new Error('trail page loads cloud sync');
      const listed = await q.evaluate(async () => { location.hash = ''; await new Promise(o => setTimeout(o, 400)); return document.body.innerText.includes('Thumpassery walk') });
      if (!listed) throw new Error('not in list');
    });
    await t.acheck('Trail: unsaved reminder, back up all, restore without duplicates', async () => {
      if (!(await q.$('#nag'))) throw new Error('no reminder for an unsaved trail');
      const r = await q.evaluate(async () => {
        const done = (await T.all()).filter(t => !t.draft);
        const blob = await backupAll(done);
        const z = await unzip(await blob.arrayBuffer());
        await markSaved(done);
        const saved = (await T.all()).every(t => !unsaved(t));
        const id = done[0].id;
        await T.del(id);
        await importFile(new File([blob], 'backup.zip'));
        await new Promise(o => setTimeout(o, 300));
        const back = await T.get(id);
        const photos = back ? (await P.of(id)).length : 0;
        await importFile(new File([blob], 'backup.zip'));
        await new Promise(o => setTimeout(o, 300));
        return { files: Object.keys(z), saved, back: !!back, photos, count: (await T.all()).length, stillSaved: back && !unsaved(back) };
      });
      if (!r.files.includes('index.html') || !r.files.some(f => /^trails\/01-.*\/koffykraft-trail\.json$/.test(f)) || !r.files.some(f => /^trails\/01-.*\/photos\/001\.jpg$/.test(f))) throw new Error('backup files: ' + r.files.join(', '));
      if (!r.saved) throw new Error('still marked unsaved after backup');
      if (!r.back || r.photos !== 1) throw new Error('restore lost the trail or photo');
      if (r.count !== 1) throw new Error('restoring twice made ' + r.count + ' trails');
      if (!r.stillSaved) throw new Error('restored trail shows as unsaved');
      await q.goto(base + 'trail.html'); await q.waitForTimeout(400);
      if (await q.$('#nag')) throw new Error('reminder still shown');
      await q.unroute(/leaflet.*\.js/);
    });
    await t.acheck('no script errors during the journeys', async () => { if (errs.length) throw new Error(errs[0]) });
  } finally {
    await browser.close(); srv.close();
  }
}
