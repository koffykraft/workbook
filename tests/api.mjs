// KoffyKraft (C) 2026 T M Thomas. AGPL-3.0 with additional terms (attribution, names): see NOTICE.
// Server checks: runs worker.js against a fresh local SQLite copy of the database
// (all migrations applied), with email sending captured instead of sent.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';

// A small stand-in for Cloudflare D1 on top of node:sqlite.
function d1(db) {
  const norm = a => a.map(v => v === undefined ? null : typeof v === 'boolean' ? (v ? 1 : 0) : v);
  class Stmt {
    constructor(sql) { this.sql = sql; this.args = [] }
    bind(...a) { const s = new Stmt(this.sql); s.args = norm(a); return s }
    async first(col) { const r = db.prepare(this.sql).get(...this.args); return r ? (col ? r[col] : { ...r }) : null }
    async all() { return { results: db.prepare(this.sql).all(...this.args).map(r => ({ ...r })), success: true } }
    async run() { const r = db.prepare(this.sql).run(...this.args); return { success: true, meta: { changes: r.changes } } }
  }
  return {
    prepare: sql => new Stmt(sql),
    batch: async list => { db.exec('BEGIN'); try { const out = []; for (const s of list) out.push(await s.run()); db.exec('COMMIT'); return out } catch (e) { db.exec('ROLLBACK'); throw e } },
    exec: async sql => db.exec(sql),
  };
}

export async function run(root, t) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'kk-api-'));
  for (const f of ['worker.js', 'trace-api.js', 'trace-core.js', 'kk-modules.js', 'weather-core.js', ...fs.readdirSync(root).filter(f => /^(weather|fieldlog|team|jobs|ledger|land)-api\.js$/.test(f))]) fs.copyFileSync(path.join(root, f), path.join(tmp, f));
  fs.writeFileSync(path.join(tmp, 'package.json'), '{"type":"module"}');
  const worker = (await import(path.join(tmp, 'worker.js'))).default;
  const { traceAnchor, traceUpgrade } = await import(path.join(tmp, 'trace-api.js'));
  const T = globalThis.KKTRACE;

  const db = new DatabaseSync(':memory:');
  const migs = fs.readdirSync(path.join(root, 'migrations')).filter(f => f.endsWith('.sql')).sort();
  for (const m of migs) {
    const sql = fs.readFileSync(path.join(root, 'migrations', m), 'utf8');
    t.check(`migration ${m} applies`, () => db.exec(sql));
  }

  const mail = [], stamps = [], upg = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (url, opt) => {
    const u = String(url);
    if (u.includes('resend.com')) { mail.push(JSON.parse(opt.body)); return new Response('{"id":"x"}', { status: 200 }) }
    if (u.includes('opentimestamps.org/timestamp/')) { upg.push(u); return new Response(Uint8Array.of(0x08, 0x00, 0x05, 0x88, 0x96, 0x0d, 0x73, 0xd7, 0x19, 0x01, 0x03, 0xb0, 0xe0, 0x35)) }
    if (u.includes('opentimestamps.org')) { stamps.push(u); const cal = [...Buffer.from(new URL(u).origin)]; const pl = [cal.length, ...cal]; return new Response(Uint8Array.of(0xf0, 0x01, 0xaa, 0x08, 0x00, 0x83, 0xdf, 0xe3, 0x0d, 0x2e, 0xf9, 0x0c, 0x8e, pl.length, ...pl)) }
    if (u.includes('cloudflare-dns.com')) return new Response(JSON.stringify({ Status: 0, Answer: [{ type: 15, data: '10 mx.example.com.' }] }));
    throw new Error('unexpected network call in test: ' + u);
  };

  const env = { DB: d1(db), ASSETS: { fetch: async () => new Response('asset', { status: 200 }) }, ADMIN_EMAILS: 'admin@example.com', RESEND_API_KEY: 'test', AUTH_EMAIL_FROM: 'KoffyKraft <signin@example.com>' };
  const waits = [];
  const ctx = { waitUntil: p => waits.push(p) };
  const sha = s => crypto.createHash('sha256').update(s).digest('hex');
  function user(id, email) {
    const tok = 'tok-' + id;
    db.prepare('INSERT INTO users(id,email,display_name) VALUES(?,?,?)').run(id, email, id);
    db.prepare('INSERT INTO auth_sessions(id,user_id,token_hash,expires_at) VALUES(?,?,?,?)').run('s-' + id, id, sha(tok), '2099-01-01 00:00:00');
    return tok;
  }
  const owner = user('owner', 'owner@example.com'), member = user('member', 'member@example.com'), stranger = user('stranger', 'stranger@example.com'), admin = user('admin', 'admin@example.com');
  async function call(method, p, body, tok, ip = '1.1.1.1') {
    const h = { 'content-type': 'application/json', 'cf-connecting-ip': ip };
    if (tok) h.authorization = 'Bearer ' + tok;
    const r = await worker.fetch(new Request('https://test.local' + p, { method, headers: h, body: body ? JSON.stringify(body) : undefined }), env, ctx);
    await Promise.all(waits.splice(0));
    let j = null; try { j = await r.clone().json() } catch (e) {}
    return { s: r.status, j };
  }
  const eq = (a, b, what) => { if (a !== b) throw new Error(`${what}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`) };

  try {
    await t.acheck('root page goes to home', async () => { const r = await worker.fetch(new Request('https://test.local/'), env, ctx); eq(await r.text(), 'asset', 'body') });
    await t.acheck('private API needs sign-in', async () => eq((await call('GET', '/api/spaces')).s, 401, 'status'));

    // feedback
    await t.acheck('feedback is accepted without an account', async () => eq((await call('POST', '/api/feedback', { message: 'Great tool', kind: 'Thanks', page: 'home', contact: 'x@y.z' })).s, 200, 'status'));
    await t.acheck('feedback is emailed to info@koffykraft.com', async () => { const m = mail.at(-1); if (!m) throw new Error('no email'); eq(m.to[0], 'info@koffykraft.com', 'to'); if (!m.text.includes('Great tool')) throw new Error('message missing') });
    await t.acheck('feedback list is refused to users', async () => eq((await call('GET', '/api/feedback', null, owner)).s, 403, 'status'));
    await t.acheck('feedback list is refused without sign-in', async () => eq((await call('GET', '/api/feedback')).s, 401, 'status'));
    await t.acheck('feedback list works for admins', async () => { const r = await call('GET', '/api/feedback', null, admin); eq(r.s, 200, 'status'); eq(r.j.items.length, 1, 'items') });
    await t.acheck('feedback is rate limited', async () => { let last; for (let i = 0; i < 7; i++) last = await call('POST', '/api/feedback', { message: 'spam ' + i }, null, '9.9.9.9'); eq(last.s, 429, 'status') });

    // shared spaces
    let sid, eid;
    await t.acheck('owner creates a space', async () => { const r = await call('POST', '/api/spaces', { name: 'Brew circle', coffee: 'Lot 12' }, owner); eq(r.s, 200, 'status'); sid = r.j.id });
    await t.acheck('stranger cannot see the space', async () => eq((await call('GET', '/api/spaces/' + sid, null, stranger)).s, 404, 'status'));
    await t.acheck('member cannot invite before being added', async () => eq((await call('POST', `/api/spaces/${sid}/members`, { email: 'x@example.com' }, member)).s, 403, 'status'));
    await t.acheck('owner invites a member by email', async () => eq((await call('POST', `/api/spaces/${sid}/members`, { email: 'Member@Example.com' }, owner)).s, 200, 'status'));
    await t.acheck('member sees the space in their list', async () => { const r = await call('GET', '/api/spaces', null, member); eq(r.j.items.length, 1, 'spaces'); eq(r.j.items[0].mine, false, 'mine') });
    await t.acheck('member adds a brew', async () => { const r = await call('POST', `/api/spaces/${sid}/entries`, { kind: 'brew', title: 'V60', data: { dose: 15, water: 250 } }, member); eq(r.s, 200, 'status'); eid = r.j.id });
    await t.acheck('unknown entry kinds are refused', async () => eq((await call('POST', `/api/spaces/${sid}/entries`, { kind: 'virus', data: {} }, member)).s, 400, 'status'));
    await t.acheck('oversized entries are refused', async () => eq((await call('POST', `/api/spaces/${sid}/entries`, { kind: 'note', data: { text: 'x'.repeat(70000) } }, member)).s, 400, 'status'));
    await t.acheck('owner comments on the brew', async () => eq((await call('POST', `/api/spaces/${sid}/entries/${eid}/comments`, { text: 'Try finer' }, owner)).s, 200, 'status'));
    await t.acheck('owner cannot edit a member\'s entry', async () => eq((await call('PATCH', `/api/spaces/${sid}/entries/${eid}`, { title: 'hacked' }, owner)).s, 403, 'status'));
    await t.acheck('members do not see member emails', async () => { const r = await call('GET', '/api/spaces/' + sid, null, member); eq(typeof r.j.members, 'number', 'members field') });
    let tok;
    await t.acheck('owner turns on the public link', async () => { const r = await call('PATCH', '/api/spaces/' + sid, { public: true }, owner); tok = r.j.public_token; if (!/^[a-f0-9]{32}$/.test(tok || '')) throw new Error('no token') });
    await t.acheck('public link shows entries and no emails', async () => { const r = await call('GET', '/api/public/space/' + tok); eq(r.s, 200, 'status'); eq(r.j.entries.length, 1, 'entries'); if (JSON.stringify(r.j).includes('@example.com')) throw new Error('email leaked') });
    await t.acheck('public link stops when turned off', async () => { await call('PATCH', '/api/spaces/' + sid, { public: false }, owner); eq((await call('GET', '/api/public/space/' + tok)).s, 404, 'status') });
    await t.acheck('member can leave', async () => { eq((await call('DELETE', `/api/spaces/${sid}/members/member%40example.com`, null, member)).s, 200, 'status'); eq((await call('GET', '/api/spaces/' + sid, null, member)).s, 404, 'after leaving') });
    await t.acheck('only the owner can delete the space', async () => { eq((await call('DELETE', '/api/spaces/' + sid, null, stranger)).s, 404, 'stranger'); eq((await call('DELETE', '/api/spaces/' + sid, null, owner)).s, 200, 'owner') });

    // public profile
    let ptok;
    await t.acheck('profile refuses a non-image logo', async () => eq((await call('PUT', '/api/profile', { data: { title: 'X', logo: 'javascript:alert(1)' } }, owner)).s, 400, 'status'));
    await t.acheck('profile publishes', async () => { const r = await call('PUT', '/api/profile', { data: { title: 'Thumpassery Estate', items: [] } }, owner); eq(r.s, 200, 'status'); ptok = r.j.token });
    await t.acheck('profile keeps its link on update', async () => eq((await call('PUT', '/api/profile', { data: { title: 'Renamed' } }, owner)).j.token, ptok, 'token'));
    await t.acheck('public profile reads without sign-in', async () => eq((await call('GET', '/api/public/profile/' + ptok)).j.data.title, 'Renamed', 'title'));
    await t.acheck('unpublished profile is gone', async () => { await call('DELETE', '/api/profile', null, owner); eq((await call('GET', '/api/public/profile/' + ptok)).s, 404, 'status') });

    // record sync, including colour readings
    await t.acheck('records sync to the cloud and back, colour readings included', async () => {
      const at = new Date().toISOString();
      const r = await call('POST', '/api/origin', { records: [{ id: 'colour-t1', type: 'colour', name: 'Lot 1', agGround: 60, updatedAt: at }, { id: 'x-bad', type: 'virus', updatedAt: at }] }, owner);
      eq(r.s, 200, 'status'); eq(r.j.saved, 1, 'saved'); eq(r.j.skipped, 1, 'unknown type skipped');
      const g = await call('GET', '/api/origin', null, owner); if (!g.j.items.some(x => x.id === 'colour-t1' && x.agGround === 60)) throw new Error('colour reading not returned');
      eq((await call('GET', '/api/origin', null, member)).j.items.length, 0, 'other users see nothing');
    });
    await t.acheck('an older database is upgraded in place and keeps its records', async () => {
      const old = new DatabaseSync(':memory:');
      for (const m of migs.filter(m => m < '0016')) old.exec(fs.readFileSync(path.join(root, 'migrations', m), 'utf8'));
      old.prepare('INSERT INTO users(id,email,display_name) VALUES(?,?,?)').run('u1', 'u1@example.com', 'u1');
      old.prepare('INSERT INTO auth_sessions(id,user_id,token_hash,expires_at) VALUES(?,?,?,?)').run('s-u1', 'u1', sha('tok-u1'), '2099-01-01 00:00:00');
      old.prepare("INSERT INTO origin_records(id,owner_user_id,type,data_json,updated_at,deleted,synced_at) VALUES('g-old','u1','green','{\"id\":\"g-old\",\"type\":\"green\"}','2026-01-01',0,'2026-01-01')").run();
      const w2 = (await import(path.join(tmp, 'worker.js') + '?fresh')).default;
      const env2 = { ...env, DB: d1(old) };
      const res = await w2.fetch(new Request('https://test.local/api/origin', { method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer tok-u1' }, body: JSON.stringify({ records: [{ id: 'colour-u1', type: 'colour', name: 'x', updatedAt: new Date().toISOString() }] }) }), env2, ctx);
      eq((await res.json()).saved, 1, 'colour saved after upgrade');
      const rows = old.prepare('SELECT id FROM origin_records ORDER BY id').all().map(r => r.id).join(',');
      eq(rows, 'colour-u1,g-old', 'records after upgrade');
      const st = await (await w2.fetch(new Request('https://test.local/api/status'), env2, ctx)).json(); eq(st.records, 'ready', 'status reports the upgrade');
      if (/CHECK/i.test(old.prepare("SELECT sql FROM sqlite_master WHERE name='origin_records'").get().sql)) throw new Error('type list still in schema');
    });
    // lot passports
    const kO = await T.newKey(), kB = await T.newKey();
    let lot, ltok;
    const head = L => { const ev = L.events || []; return { seq: ev.length, hash: ev.length ? ev[ev.length - 1].hash : '' } };
    const add = async (who, key, items, to, at) => { const L = (await call('GET', '/api/trace/lots/' + lot, null, who)).j || {}; const evs = await T.signRun(lot, at || head(L), key, items); return call('POST', '/api/trace/lots/' + lot + '/events', { events: evs, to }, who) };
    const pub = async () => (await call('GET', '/api/public/trace/' + ltok)).j;
    await t.acheck('passport: phones register signing keys', async () => { eq((await call('POST', '/api/trace/keys', { jwk: kO.jwk }, owner)).j.id, kO.id, 'owner key'); eq((await call('POST', '/api/trace/keys', { jwk: kB.jwk }, member)).j.id, kB.id, 'member key') });
    await t.acheck('passport: a key cannot be claimed by another account', async () => eq((await call('POST', '/api/trace/keys', { jwk: kO.jwk }, stranger)).s, 409, 'status'));
    await t.acheck('passport: owner creates a lot', async () => { const r = await call('POST', '/api/trace/lots', { title: 'G-1 Thumpassery' }, owner); eq(r.s, 201, 'status'); lot = r.j.id; ltok = r.j.token });
    await t.acheck('passport: owner seals origin records', async () => { const r = await add(owner, kO, [{ kind: 'record', data: { rtype: 'estate', rid: 'e1', card: { title: 'Thumpassery' } } }, { kind: 'record', data: { rtype: 'harvest', rid: 'h1', card: { title: 'H1' }, kg: { cherry: 100 } } }, { kind: 'record', data: { rtype: 'green', rid: 'g1', card: { title: 'G-1' }, kg: { green: 18 } } }]); eq(r.s, 200, 'status'); eq(r.j.seq, 2, 'last seq') });
    await t.acheck('passport: public page verifies every entry', async () => { const v = await pub(); eq(v.events.length, 3, 'entries'); const c = await T.verifyChain(v.events, v.keys); if (!c.every(x => x.ok)) throw new Error(JSON.stringify(c)); if (JSON.stringify(v).includes('@example.com')) throw new Error('email leaked') });
    await t.acheck('passport: a stale head is refused', async () => eq((await add(owner, kO, [{ kind: 'note', data: { text: 'x' } }], null, { seq: 1, hash: 'abc' })).s, 409, 'status'));
    await t.acheck('passport: a changed entry fails its signature', async () => { const L = (await call('GET', '/api/trace/lots/' + lot, null, owner)).j; const ev = await T.signRun(lot, head(L), kO, [{ kind: 'note', data: { text: 'true' } }]); ev[0].body.data.text = 'false'; ev[0].hash = await T.hashBody(ev[0].body); eq((await call('POST', '/api/trace/lots/' + lot + '/events', { events: ev }, owner)).s, 400, 'status') });
    await t.acheck('passport: signing with someone else\'s key is refused', async () => eq((await add(owner, kB, [{ kind: 'note', data: { text: 'x' } }])).s, 400, 'status'));
    await t.acheck('passport: strangers cannot add entries', async () => { const r = await call('POST', '/api/trace/lots/' + lot + '/events', { events: [] }, stranger); eq(r.s, 404, 'status') });
    let tid = 'tid-' + Date.now();
    await t.acheck('passport: handoff needs the buyer email', async () => eq((await add(owner, kO, [{ kind: 'transfer', data: { tid, kg: 10 } }])).s, 400, 'status'));
    await t.acheck('passport: owner sends 10 kg and the buyer is emailed', async () => { const r = await add(owner, kO, [{ kind: 'transfer', data: { tid, kg: 10, to: 'Roaster' } }], { [tid]: 'Member@Example.com' }); eq(r.s, 200, 'status'); eq(mail.at(-1).to[0], 'member@example.com', 'email to'); if (!mail.at(-1).text.includes('/trace.html')) throw new Error('no link') });
    await t.acheck('passport: buyer sees the incoming lot', async () => { const r = await call('GET', '/api/trace/incoming', null, member); eq(r.j.items.length, 1, 'items'); eq(r.j.items[0].kg_sent, 10, 'kg') });
    await t.acheck('passport: buyer cannot add roasts before confirming', async () => eq((await add(member, kB, [{ kind: 'roast', data: { rid: 'r1', kg: { green: 1 } } }])).s, 403, 'status'));
    await t.acheck('passport: buyer confirms and adds a roast', async () => { const r = await add(member, kB, [{ kind: 'receive', data: { tid, kg: 10 } }, { kind: 'roast', data: { rid: 'r1', card: { title: 'Roast #1' }, kg: { green: 4 } } }]); eq(r.s, 200, 'status'); eq((await call('GET', '/api/trace/incoming', null, member)).j.items.length, 0, 'incoming after') });
    await t.acheck('passport: buyer cannot add origin records', async () => eq((await add(member, kB, [{ kind: 'record', data: { rtype: 'green', rid: 'g1', kg: { green: 999 } } }])).s, 403, 'status'));
    await t.acheck('passport: weights add up, signers shown as parties', async () => { const v = await pub(); const b = T.balance(v.events); eq(b.warnings.length, 0, 'warnings ' + b.warnings.join(' ')); eq(v.events.at(-1).party, 'B', 'buyer party'); if (!Object.values(v.labels).includes('member')) throw new Error('labels') });
    await t.acheck('passport: roasting more than received is flagged', async () => { eq((await add(member, kB, [{ kind: 'roast', data: { rid: 'r2', kg: { green: 7 } } }])).s, 200, 'status'); const b = T.balance((await pub()).events); if (!b.warnings.some(w => w.includes('Party B'))) throw new Error(b.warnings.join(' | ') || 'no warning') });
    await t.acheck('passport: tampering is visible on the page', async () => { const v = await pub(); v.events[2].body.data.kg.green = 50; const c = await T.verifyChain(v.events, v.keys); if (c[2].ok || !c[1].ok) throw new Error('tamper not caught') });
    await t.acheck('passport: photo fingerprints are sealed, bad ones refused', async () => { eq((await add(owner, kO, [{ kind: 'photo', data: { sha: 'ab'.repeat(32), name: 'beds.jpg', note: 'Drying beds' } }])).s, 200, 'good'); eq((await add(owner, kO, [{ kind: 'photo', data: { name: 'x.jpg' } }])).s, 400, 'no fingerprint') });
    let digest;
    await t.acheck('passport: the day is stamped through OpenTimestamps', async () => { const tomorrow = new Date(Date.now() + 864e5); const r = await traceAnchor(env, tomorrow); eq(r.anchored.length, 1, 'days'); eq(r.anchored[0].status, 'ok', 'status'); eq(stamps.length, 2, 'calendars'); const v = await pub(); const d = v.events[0].day; digest = v.anchors[d].digest; eq(v.anchors[d].count, v.events.length, 'count') });
    await t.acheck('passport: manifest and proof files check out', async () => { const d = (await pub()).events[0].day; const m = await worker.fetch(new Request('https://test.local/api/public/trace-day/' + d + '/manifest'), env, ctx); const txt = await m.text(); eq(sha(txt), digest, 'manifest digest'); const o = new Uint8Array(await (await worker.fetch(new Request('https://test.local/api/public/trace-day/' + d + '/ots'), env, ctx)).arrayBuffer()); eq(Buffer.from(o.slice(1, 15)).toString(), 'OpenTimestamps', 'magic'); eq(Buffer.from(o.slice(33, 65)).toString('hex'), digest, 'digest in proof') });
    await t.acheck('passport: proofs are upgraded to the Bitcoin block', async () => { const later = new Date(Date.now() + 2 * 864e5); const r = await traceUpgrade(env, fetch, later); eq(r.upgraded.length, 1, 'days'); eq(r.upgraded[0].bitcoin, true, 'bitcoin'); eq(upg.length, 2, 'calendars asked'); const v = await pub(); const d = v.events[0].day; eq(v.anchors[d].bitcoin[0], 880688, 'block'); const o = new Uint8Array(await (await worker.fetch(new Request('https://test.local/api/public/trace-day/' + d + '/ots'), env, ctx)).arrayBuffer()); const info = T.otsInfo(o); eq(info.pending.length, 0, 'pending left'); eq(info.bitcoin.length, 2, 'bitcoin notes'); eq(Buffer.from(o.slice(33, 65)).toString('hex'), digest, 'digest kept'); eq((await traceUpgrade(env, fetch, later)).upgraded.length, 0, 'done once') });
    // plug-in modules from kk-templates
    await t.acheck('modules: field log entry saved and private', async () => {
      eq((await call('POST', '/api/fieldlog', { id: 'fl1', kind: 'water', day: '2026-02-20', place_id: 'p1', kind2: 'Blossom irrigation', mm: 25 }, owner)).s, 200, 'save');
      eq((await call('GET', '/api/fieldlog?kind=water', null, owner)).j.items[0].mm, 25, 'listed');
      eq((await call('GET', '/api/fieldlog', null, stranger)).j.items.length, 0, 'private');
    });
    await t.acheck('modules: worker, muster, picking job and the month wages', async () => {
      await call('POST', '/api/team/workers', { id: 'wk1', name: 'Lakshmi', role: 'Picker', pay_type: 'daily', rate: 450 }, owner);
      await call('POST', '/api/team/day', { day: '2026-01-05', marks: [{ worker_id: 'wk1', status: 'P' }] }, owner);
      await call('POST', '/api/jobs', { id: 'jb1', day: '2026-01-05', kind: 'Picking', basis: 'unit', unit: 'kg', rate: 5, status: 'Done', lines: [{ worker_id: 'wk1', qty: 40 }] }, owner);
      const m = await call('GET', '/api/team/month?month=2026-01', null, owner);
      const r = m.j.rows[0];
      eq(JSON.stringify([r.name, r.base, r.piece, r.net]), JSON.stringify(['Lakshmi', 450, 200, 650]), 'wages');
    });
    await t.acheck('modules: weather place and days', async () => {
      eq((await call('POST', '/api/weather/sites', { id: 'p1', name: 'Hill', lat: 9, lng: 77 }, owner)).s, 200, 'site');
      eq((await call('POST', '/api/weather/days', { site: 'p1', rows: [{ day: '2026-03-01', rain: 18 }] }, owner)).j.saved, 1, 'days');
      eq((await call('POST', '/api/weather/days', { site: 'p1', rows: [{ day: '2026-03-01', rain: 1 }] }, stranger)).s, 404, 'not theirs');
    });
    await t.acheck('passport: stamping runs daily and is admin-only by hand', async () => { if (typeof worker.scheduled !== 'function') throw new Error('no scheduled handler'); eq((await call('POST', '/api/trace/anchor', null, owner)).s, 403, 'owner'); eq((await call('POST', '/api/trace/anchor', null, admin)).s, 200, 'admin') });
    await t.acheck('passport: only the owner withdraws; data goes, hashes stay', async () => { eq((await call('DELETE', '/api/trace/lots/' + lot, null, member)).s, 403, 'buyer'); eq((await call('DELETE', '/api/trace/lots/' + lot, null, owner)).s, 200, 'owner'); const v = await pub(); if (!v.lot.withdrawn || v.events.some(e => e.body)) throw new Error('data still public'); eq(v.events.length, 8, 'hashes kept') });
  } finally {
    globalThis.fetch = realFetch;
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}
