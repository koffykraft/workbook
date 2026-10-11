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
  fs.copyFileSync(path.join(root, 'worker.js'), path.join(tmp, 'worker.mjs'));
  const worker = (await import(path.join(tmp, 'worker.mjs'))).default;

  const db = new DatabaseSync(':memory:');
  const migs = fs.readdirSync(path.join(root, 'migrations')).filter(f => f.endsWith('.sql')).sort();
  for (const m of migs) {
    const sql = fs.readFileSync(path.join(root, 'migrations', m), 'utf8');
    t.check(`migration ${m} applies`, () => db.exec(sql));
  }

  const mail = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (url, opt) => {
    const u = String(url);
    if (u.includes('resend.com')) { mail.push(JSON.parse(opt.body)); return new Response('{"id":"x"}', { status: 200 }) }
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
    await t.acheck('feedback is emailed to info@koffykraft.coffee', async () => { const m = mail.at(-1); if (!m) throw new Error('no email'); eq(m.to[0], 'info@koffykraft.coffee', 'to'); if (!m.text.includes('Great tool')) throw new Error('message missing') });
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
  } finally {
    globalThis.fetch = realFetch;
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}
