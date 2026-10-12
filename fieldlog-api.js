// KoffyKraft (C) 2026 T M Thomas. AGPL-3.0 with additional terms (attribution, names): see NOTICE.
// Field log module, server side: one table of dated entries per place. kind is 'nutrient', 'water'
// or 'health'; the details of each kind live in data_json, so new fields need no schema change.
export const NAME = 'fieldlog';
export const SQL = [
  'CREATE TABLE IF NOT EXISTS fieldlog (id TEXT PRIMARY KEY, owner_user_id TEXT NOT NULL, place_id TEXT, place_name TEXT, kind TEXT NOT NULL, day TEXT NOT NULL, data_json TEXT NOT NULL, updated_at TEXT NOT NULL, deleted INTEGER NOT NULL DEFAULT 0)',
  'CREATE INDEX IF NOT EXISTS idx_fieldlog_owner ON fieldlog(owner_user_id, kind, day)',
];
const KINDS = ['nutrient', 'water', 'health'];
const DAY = /^\d{4}-\d{2}-\d{2}$/;
export async function api(r, e, p, me, H) {
  const { j, body, url } = H;
  if (r.method === 'GET' && p === '/api/fieldlog') {
    const kind = url.searchParams.get('kind') || '',
      from = DAY.test(url.searchParams.get('from')) ? url.searchParams.get('from') : '0000-00-00',
      to = DAY.test(url.searchParams.get('to')) ? url.searchParams.get('to') : '9999-12-31';
    const q = await e.DB.prepare(
      "SELECT id,place_id,place_name,kind,day,data_json,updated_at FROM fieldlog WHERE owner_user_id=? AND deleted=0 AND (?='' OR kind=?) AND day>=? AND day<=? ORDER BY day DESC LIMIT 5000"
    )
      .bind(me.id, kind, kind, from, to)
      .all();
    return j({
      items: (q.results || []).map(x => ({
        ...JSON.parse(x.data_json || '{}'),
        id: x.id,
        place_id: x.place_id,
        place_name: x.place_name,
        kind: x.kind,
        day: x.day,
        updated_at: x.updated_at,
      })),
    });
  }
  if (r.method === 'POST' && p === '/api/fieldlog') {
    const b = await body(r);
    const id = String(b.id || '').slice(0, 80);
    if (!id || !KINDS.includes(b.kind) || !DAY.test(b.day))
      return j({ error: 'id, kind and date required' }, 400);
    const { id: _i, kind, day, place_id, place_name, ...data } = b;
    const js = JSON.stringify(data);
    if (js.length > 20000) return j({ error: 'entry too large' }, 400);
    const own = await e.DB.prepare('SELECT owner_user_id FROM fieldlog WHERE id=?').bind(id).first();
    if (own && own.owner_user_id !== me.id) return j({ error: 'not yours' }, 403);
    const n = await e.DB.prepare('SELECT COUNT(*) AS n FROM fieldlog WHERE owner_user_id=?')
      .bind(me.id)
      .first();
    if (!own && n.n >= 20000) return j({ error: 'field log is full' }, 400);
    await e.DB.prepare(
      'INSERT INTO fieldlog(id,owner_user_id,place_id,place_name,kind,day,data_json,updated_at,deleted) VALUES(?,?,?,?,?,?,?,?,0) ON CONFLICT(id) DO UPDATE SET place_id=excluded.place_id,place_name=excluded.place_name,kind=excluded.kind,day=excluded.day,data_json=excluded.data_json,updated_at=excluded.updated_at,deleted=0'
    )
      .bind(
        id,
        me.id,
        String(place_id || '').slice(0, 80),
        String(place_name || '').slice(0, 160),
        kind,
        day,
        js,
        new Date().toISOString()
      )
      .run();
    return j({ ok: true, id });
  }
  if (r.method === 'DELETE' && p.startsWith('/api/fieldlog/')) {
    const id = decodeURIComponent(p.split('/').pop());
    await e.DB.prepare('UPDATE fieldlog SET deleted=1, updated_at=? WHERE id=? AND owner_user_id=?')
      .bind(new Date().toISOString(), id, me.id)
      .run();
    return j({ ok: true });
  }
  return null;
}
export async function stats(e) {
  const q = await e.DB.prepare(
    'SELECT kind, COUNT(*) AS n FROM fieldlog WHERE deleted=0 GROUP BY kind'
  ).all();
  const o = { nutrient: 'Nutrient entries', water: 'Watering entries', health: 'Plant health entries' };
  return Object.fromEntries((q.results || []).map(x => [o[x.kind] || x.kind, x.n]));
}
