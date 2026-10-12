// KoffyKraft (C) 2026 T M Thomas. AGPL-3.0 with additional terms (attribution, names): see NOTICE.
// Land and dues module, server side. One table for three kinds of record: 'land' (survey number,
// ownership, title papers), 'due' (land tax and other dues paid, with the next due date) and
// 'licence' (registrations and licences with their renewal date). Details live in data_json;
// the next due date is a column so the "due soon" list is one query.
export const NAME = 'land';
export const SQL = [
  'CREATE TABLE IF NOT EXISTS land_records (id TEXT PRIMARY KEY, owner_user_id TEXT NOT NULL, kind TEXT NOT NULL, title TEXT, place_id TEXT, next_due TEXT, data_json TEXT NOT NULL, updated_at TEXT NOT NULL, deleted INTEGER NOT NULL DEFAULT 0)',
  'CREATE INDEX IF NOT EXISTS idx_land_owner ON land_records(owner_user_id, kind)',
  'CREATE INDEX IF NOT EXISTS idx_land_due ON land_records(owner_user_id, next_due)',
];
const KINDS = ['land', 'due', 'licence'];
const DAY = /^\d{4}-\d{2}-\d{2}$/;
const s = (v, n) => String(v == null ? '' : v).slice(0, n || 200);
export async function api(r, e, p, me, H) {
  const { j, body, url } = H;
  if (r.method === 'GET' && p === '/api/land') {
    const kind = url.searchParams.get('kind') || '';
    const q = await e.DB.prepare(
      "SELECT * FROM land_records WHERE owner_user_id=? AND deleted=0 AND (?='' OR kind=?) ORDER BY COALESCE(next_due,'9999'), title LIMIT 3000"
    )
      .bind(me.id, kind, kind)
      .all();
    return j({
      items: (q.results || []).map(x => ({
        ...JSON.parse(x.data_json || '{}'),
        id: x.id,
        kind: x.kind,
        title: x.title,
        place_id: x.place_id,
        next_due: x.next_due,
        updated_at: x.updated_at,
      })),
    });
  }
  if (r.method === 'POST' && p === '/api/land') {
    const b = await body(r);
    const id = s(b.id, 80);
    if (!id || !KINDS.includes(b.kind) || !String(b.title || '').trim())
      return j({ error: 'kind and title required' }, 400);
    const { id: _i, kind, title, place_id, next_due, ...data } = b;
    const js = JSON.stringify(data);
    if (js.length > 20000) return j({ error: 'record too large' }, 400);
    const old = await e.DB.prepare('SELECT owner_user_id FROM land_records WHERE id=?').bind(id).first();
    if (old && old.owner_user_id !== me.id) return j({ error: 'not yours' }, 403);
    await e.DB.prepare(
      'INSERT INTO land_records(id,owner_user_id,kind,title,place_id,next_due,data_json,updated_at,deleted) VALUES(?,?,?,?,?,?,?,?,0) ON CONFLICT(id) DO UPDATE SET kind=excluded.kind,title=excluded.title,place_id=excluded.place_id,next_due=excluded.next_due,data_json=excluded.data_json,updated_at=excluded.updated_at,deleted=0'
    )
      .bind(
        id,
        me.id,
        kind,
        s(title, 160).trim(),
        s(place_id, 80),
        DAY.test(next_due) ? next_due : null,
        js,
        new Date().toISOString()
      )
      .run();
    return j({ ok: true, id });
  }
  if (r.method === 'DELETE' && p.startsWith('/api/land/')) {
    await e.DB.prepare('UPDATE land_records SET deleted=1, updated_at=? WHERE id=? AND owner_user_id=?')
      .bind(new Date().toISOString(), decodeURIComponent(p.split('/').pop()), me.id)
      .run();
    return j({ ok: true });
  }
  return null;
}
export async function stats(e) {
  const q = await e.DB.prepare(
    'SELECT kind, COUNT(*) AS n FROM land_records WHERE deleted=0 GROUP BY kind'
  ).all();
  const o = { land: 'Land records', due: 'Dues', licence: 'Licences' };
  return Object.fromEntries((q.results || []).map(x => [o[x.kind] || x.kind, x.n]));
}
