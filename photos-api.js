// KoffyKraft (C) 2026 T M Thomas. AGPL-3.0 with additional terms (attribution, names): see NOTICE.
// Photos on records, server side. Each photo is kept twice, already shrunk on the phone: a small
// thumbnail for cards and lists, and a larger view opened on tap. Only the owner can read them.
// The original stays on the phone; the record keeps its fingerprint (SHA-256).
const MAX_T = 90e3; // thumbnail, base64 characters
const MAX_F = 1.2e6; // larger view, base64 characters (about 900 KB of JPEG)
const QUOTA = 150e6; // per account, base64 characters (about 110 MB of photos)
const B64 = /^[A-Za-z0-9+/]+={0,2}$/;
let READY = null;
const ready = e =>
  (READY ||= e.DB.batch(
    [
      'CREATE TABLE IF NOT EXISTS kk_photos (id TEXT NOT NULL, size TEXT NOT NULL, owner_user_id TEXT NOT NULL, rec_id TEXT, data TEXT NOT NULL, bytes INTEGER NOT NULL, created_at TEXT NOT NULL, PRIMARY KEY (id, size))',
      'CREATE INDEX IF NOT EXISTS idx_kk_photos_owner ON kk_photos(owner_user_id)',
    ].map(s => e.DB.prepare(s))
  ).catch(err => {
    READY = null;
    throw err;
  }));
const b64bytes = s => {
  const b = atob(s),
    a = new Uint8Array(b.length);
  for (let i = 0; i < b.length; i++) a[i] = b.charCodeAt(i);
  return a;
};
export async function api(r, e, p, me, j) {
  if (p !== '/api/photos' && !p.startsWith('/api/photos/')) return null;
  await ready(e);
  if (p === '/api/photos' && r.method === 'GET') {
    const u = await e.DB.prepare(
      'SELECT COALESCE(SUM(bytes),0) AS n, COUNT(*) AS c FROM kk_photos WHERE owner_user_id=?'
    )
      .bind(me.id)
      .first();
    return j({ used: u.n, photos: Math.round(u.c / 2), quota: QUOTA });
  }
  if (p === '/api/photos' && r.method === 'POST') {
    let b = {};
    try {
      b = await r.json();
    } catch {}
    const id = String(b.id || '');
    if (!/^[\w-]{6,80}$/.test(id)) return j({ error: 'photo id missing' }, 400);
    const t = String(b.thumb || ''),
      f = String(b.full || '');
    if (!B64.test(t) || !B64.test(f)) return j({ error: 'photo data missing' }, 400);
    if (t.length > MAX_T || f.length > MAX_F)
      return j({ error: 'photo too large; choose a smaller size' }, 413);
    const old = await e.DB.prepare('SELECT owner_user_id FROM kk_photos WHERE id=? LIMIT 1').bind(id).first();
    if (old && old.owner_user_id !== me.id) return j({ error: 'not yours' }, 403);
    if (!old) {
      const u = await e.DB.prepare('SELECT COALESCE(SUM(bytes),0) AS n FROM kk_photos WHERE owner_user_id=?')
        .bind(me.id)
        .first();
      if (u.n + t.length + f.length > QUOTA)
        return j({ error: 'photo space is full (about 110 MB). Remove old photos or use Small.' }, 413);
    }
    const now = new Date().toISOString(),
      rec = String(b.rec || '').slice(0, 80);
    const put = (size, data) =>
      e.DB.prepare(
        'INSERT INTO kk_photos (id, size, owner_user_id, rec_id, data, bytes, created_at) VALUES (?,?,?,?,?,?,?) ON CONFLICT(id, size) DO UPDATE SET data=excluded.data, bytes=excluded.bytes, rec_id=excluded.rec_id'
      ).bind(id, size, me.id, rec, data, data.length, now);
    await e.DB.batch([put('t', t), put('f', f)]);
    return j({ ok: true, id });
  }
  const id = decodeURIComponent(p.slice('/api/photos/'.length));
  if (r.method === 'GET') {
    const size = new URL(r.url).searchParams.get('s') === 'f' ? 'f' : 't';
    const x = await e.DB.prepare('SELECT data FROM kk_photos WHERE id=? AND size=? AND owner_user_id=?')
      .bind(id, size, me.id)
      .first();
    if (!x) return j({ error: 'not found' }, 404);
    return new Response(b64bytes(x.data), {
      headers: { 'content-type': 'image/jpeg', 'cache-control': 'private, max-age=31536000, immutable' },
    });
  }
  if (r.method === 'DELETE') {
    await e.DB.prepare('DELETE FROM kk_photos WHERE id=? AND owner_user_id=?').bind(id, me.id).run();
    return j({ ok: true });
  }
  return j({ error: 'not found' }, 404);
}
