// KoffyKraft (C) 2026 T M Thomas. AGPL-3.0 with additional terms (attribution, names): see NOTICE.
// Weather module, server side. Keeps daily weather per place in D1. The page usually fetches the
// days itself (from the phone) and sends them here; the nightly job tops up the last few days for
// places with "keep up to date" on, so the record grows even when nobody opens the page.
import './weather-core.js';
const WX = globalThis.WXCORE;
export const NAME = 'weather';
export const SQL = [
  "CREATE TABLE IF NOT EXISTS weather_sites (id TEXT NOT NULL, owner_user_id TEXT NOT NULL, name TEXT, lat REAL, lng REAL, source TEXT NOT NULL DEFAULT 'openmeteo', auto INTEGER NOT NULL DEFAULT 1, last_fetch TEXT, last_error TEXT, PRIMARY KEY (owner_user_id, id))",
  'CREATE TABLE IF NOT EXISTS weather_days (owner_user_id TEXT NOT NULL, site_id TEXT NOT NULL, day TEXT NOT NULL, rain REAL, tmin REAL, tmax REAL, rh REAL, et0 REAL, source TEXT, PRIMARY KEY (owner_user_id, site_id, day))',
];
const DAY = /^\d{4}-\d{2}-\d{2}$/;
const num = v => (v == null || v === '' || !Number.isFinite(+v) ? null : +v);
const ymd = d => new Date(d).toISOString().slice(0, 10);
async function save(e, owner, site, rows, source) {
  const ok = rows.filter(r => r && DAY.test(r.day)).slice(0, 4000);
  const stmts = ok.map(r =>
    e.DB.prepare(
      'INSERT INTO weather_days(owner_user_id,site_id,day,rain,tmin,tmax,rh,et0,source) VALUES(?,?,?,?,?,?,?,?,?) ON CONFLICT(owner_user_id,site_id,day) DO UPDATE SET rain=excluded.rain,tmin=excluded.tmin,tmax=excluded.tmax,rh=excluded.rh,et0=excluded.et0,source=excluded.source'
    ).bind(
      owner,
      site,
      r.day,
      num(r.rain),
      num(r.tmin),
      num(r.tmax),
      num(r.rh),
      num(r.et0),
      String(source || '').slice(0, 20)
    )
  );
  for (let i = 0; i < stmts.length; i += 100) await e.DB.batch(stmts.slice(i, i + 100));
  return ok.length;
}
export async function api(r, e, p, me, H) {
  const { j, body } = H;
  if (r.method === 'GET' && p === '/api/weather/sites') {
    const q = await e.DB.prepare(
      'SELECT s.*, (SELECT MIN(day) FROM weather_days d WHERE d.owner_user_id=s.owner_user_id AND d.site_id=s.id) AS first_day, (SELECT MAX(day) FROM weather_days d WHERE d.owner_user_id=s.owner_user_id AND d.site_id=s.id) AS last_day, (SELECT COUNT(*) FROM weather_days d WHERE d.owner_user_id=s.owner_user_id AND d.site_id=s.id) AS days FROM weather_sites s WHERE s.owner_user_id=? ORDER BY name'
    )
      .bind(me.id)
      .all();
    return j({ items: q.results || [] });
  }
  if (r.method === 'POST' && p === '/api/weather/sites') {
    const b = await body(r);
    const id = String(b.id || '').slice(0, 80);
    if (!id) return j({ error: 'place required' }, 400);
    const src = ['openmeteo', 'nasapower', 'file'].includes(b.source) ? b.source : 'openmeteo';
    await e.DB.prepare(
      'INSERT INTO weather_sites(id,owner_user_id,name,lat,lng,source,auto) VALUES(?,?,?,?,?,?,?) ON CONFLICT(owner_user_id,id) DO UPDATE SET name=excluded.name,lat=excluded.lat,lng=excluded.lng,source=excluded.source,auto=excluded.auto'
    )
      .bind(
        id,
        me.id,
        String(b.name || '').slice(0, 120),
        num(b.lat),
        num(b.lng),
        src,
        b.auto === false ? 0 : 1
      )
      .run();
    return j({ ok: true });
  }
  if (r.method === 'DELETE' && p.startsWith('/api/weather/sites/')) {
    const id = decodeURIComponent(p.split('/').pop());
    await e.DB.batch([
      e.DB.prepare('DELETE FROM weather_days WHERE owner_user_id=? AND site_id=?').bind(me.id, id),
      e.DB.prepare('DELETE FROM weather_sites WHERE owner_user_id=? AND id=?').bind(me.id, id),
    ]);
    return j({ ok: true });
  }
  // days fetched by the phone, or read from a station file
  if (r.method === 'POST' && p === '/api/weather/days') {
    const b = await body(r);
    const site = String(b.site || '').slice(0, 80);
    const own = await e.DB.prepare('SELECT id FROM weather_sites WHERE owner_user_id=? AND id=?')
      .bind(me.id, site)
      .first();
    if (!own) return j({ error: 'add the place first' }, 404);
    const n = await save(e, me.id, site, Array.isArray(b.rows) ? b.rows : [], b.source);
    await e.DB.prepare(
      "UPDATE weather_sites SET last_fetch=datetime('now'), last_error=NULL WHERE owner_user_id=? AND id=?"
    )
      .bind(me.id, site)
      .run();
    return j({ saved: n });
  }
  // the server fetches instead of the phone (used when the phone cannot reach the service)
  if (r.method === 'POST' && p === '/api/weather/fetch') {
    const b = await body(r);
    const s = await e.DB.prepare('SELECT * FROM weather_sites WHERE owner_user_id=? AND id=?')
      .bind(me.id, String(b.site || ''))
      .first();
    if (!s) return j({ error: 'add the place first' }, 404);
    const from = DAY.test(b.from) ? b.from : ymd(Date.now() - 30 * 864e5),
      to = DAY.test(b.to) ? b.to : ymd(Date.now() - 864e5);
    if (from > to || (new Date(to) - new Date(from)) / 864e5 > 1100)
      return j({ error: 'up to three years at a time' }, 400);
    try {
      const rows = await WX.fetchDays(s.source === 'file' ? 'openmeteo' : s.source, s.lat, s.lng, from, to);
      const n = await save(e, me.id, s.id, rows, s.source === 'file' ? 'openmeteo' : s.source);
      await e.DB.prepare(
        "UPDATE weather_sites SET last_fetch=datetime('now'), last_error=NULL WHERE owner_user_id=? AND id=?"
      )
        .bind(me.id, s.id)
        .run();
      return j({ saved: n });
    } catch (err) {
      return j({ error: String(err.message || err).slice(0, 200) }, 502);
    }
  }
  if (r.method === 'GET' && p === '/api/weather/days') {
    const u = H.url;
    const site = String(u.searchParams.get('site') || ''),
      from = DAY.test(u.searchParams.get('from')) ? u.searchParams.get('from') : '0000-00-00',
      to = DAY.test(u.searchParams.get('to')) ? u.searchParams.get('to') : '9999-12-31';
    const q = await e.DB.prepare(
      'SELECT day,rain,tmin,tmax,rh,et0,source FROM weather_days WHERE owner_user_id=? AND site_id=? AND day>=? AND day<=? ORDER BY day LIMIT 4000'
    )
      .bind(me.id, site, from, to)
      .all();
    return j({ items: q.results || [] });
  }
  return null;
}
// Nightly: the last ten days for every place with "keep up to date" on. Failures are noted on the
// place (the page then fetches from the phone), never retried in a loop.
export async function cron(e) {
  const q = await e.DB.prepare(
    "SELECT * FROM weather_sites WHERE auto=1 AND source IN ('openmeteo','nasapower') AND lat IS NOT NULL AND lng IS NOT NULL ORDER BY COALESCE(last_fetch,'') LIMIT 100"
  ).all();
  const to = ymd(Date.now() - 864e5),
    from = ymd(Date.now() - 10 * 864e5);
  for (const s of q.results || []) {
    try {
      const rows = await WX.fetchDays(s.source, s.lat, s.lng, from, to);
      await save(e, s.owner_user_id, s.id, rows, s.source);
      await e.DB.prepare(
        "UPDATE weather_sites SET last_fetch=datetime('now'), last_error=NULL WHERE owner_user_id=? AND id=?"
      )
        .bind(s.owner_user_id, s.id)
        .run();
    } catch (err) {
      await e.DB.prepare('UPDATE weather_sites SET last_error=? WHERE owner_user_id=? AND id=?')
        .bind(String(err.message || err).slice(0, 200), s.owner_user_id, s.id)
        .run();
    }
  }
}
export async function stats(e) {
  const a = await e.DB.prepare(
    'SELECT COUNT(*) AS n, SUM(auto) AS auto, SUM(last_error IS NOT NULL) AS failing FROM weather_sites'
  ).first();
  const d = await e.DB.prepare('SELECT COUNT(*) AS n FROM weather_days').first();
  return {
    Places: a.n || 0,
    'Kept up to date': a.auto || 0,
    'Last update failed': a.failing || 0,
    'Days stored': d.n || 0,
  };
}
