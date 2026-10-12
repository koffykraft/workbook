// KoffyKraft (C) 2026 T M Thomas. AGPL-3.0 with additional terms (attribution, names): see NOTICE.
// Jobs module, server side: a job is one kind of field work on one place and day, with a line per
// worker (quantity and amount). Lines are kept in their own table so the Team module can add piece
// work to the month's wages; only jobs marked done are paid.
export const NAME = 'jobs';
export const SQL = [
  "CREATE TABLE IF NOT EXISTS jobs (id TEXT PRIMARY KEY, owner_user_id TEXT NOT NULL, day TEXT NOT NULL, kind TEXT NOT NULL, place_id TEXT, place_name TEXT, status TEXT NOT NULL DEFAULT 'Done', unit TEXT, basis TEXT, rate REAL, qty REAL, amount REAL, data_json TEXT, updated_at TEXT NOT NULL, deleted INTEGER NOT NULL DEFAULT 0)",
  'CREATE INDEX IF NOT EXISTS idx_jobs_owner ON jobs(owner_user_id, day)',
  'CREATE TABLE IF NOT EXISTS job_lines (job_id TEXT NOT NULL, owner_user_id TEXT NOT NULL, worker_id TEXT NOT NULL, day TEXT NOT NULL, qty REAL, amount REAL, done INTEGER NOT NULL DEFAULT 1, PRIMARY KEY (job_id, worker_id))',
  'CREATE INDEX IF NOT EXISTS idx_job_lines_owner ON job_lines(owner_user_id, day)',
];
const DAY = /^\d{4}-\d{2}-\d{2}$/;
const num = v => (v == null || v === '' || !Number.isFinite(+v) ? null : +v);
const s = (v, n) => String(v == null ? '' : v).slice(0, n || 200);
// amount for one line: per unit, per day (qty is days) or a fixed sum shared by the line's own amount
export function lineAmount(basis, rate, l) {
  if (basis === 'fixed') return num(l.amount) || 0;
  return Math.round((num(l.qty) || 0) * (num(rate) || 0) * 100) / 100;
}
export async function api(r, e, p, me, H) {
  const { j, body, url } = H;
  if (r.method === 'GET' && p === '/api/jobs') {
    const from = DAY.test(url.searchParams.get('from')) ? url.searchParams.get('from') : '0000-00-00',
      to = DAY.test(url.searchParams.get('to')) ? url.searchParams.get('to') : '9999-12-31';
    const q = await e.DB.prepare(
      'SELECT * FROM jobs WHERE owner_user_id=? AND deleted=0 AND day>=? AND day<=? ORDER BY day DESC LIMIT 3000'
    )
      .bind(me.id, from, to)
      .all();
    return j({
      items: (q.results || []).map(x => ({ ...JSON.parse(x.data_json || '{}'), ...x, data_json: undefined })),
    });
  }
  if (r.method === 'POST' && p === '/api/jobs') {
    const b = await body(r);
    const id = s(b.id, 80);
    if (!id || !DAY.test(b.day) || !String(b.kind || '').trim())
      return j({ error: 'date and kind required' }, 400);
    const old = await e.DB.prepare('SELECT owner_user_id FROM jobs WHERE id=?').bind(id).first();
    if (old && old.owner_user_id !== me.id) return j({ error: 'not yours' }, 403);
    const basis = ['unit', 'day', 'fixed'].includes(b.basis) ? b.basis : 'unit';
    const done = b.status === 'Planned' ? 0 : 1;
    // only this account's workers can be paid
    const ids = (Array.isArray(b.lines) ? b.lines : [])
      .map(l => s(l.worker_id, 80))
      .filter(Boolean)
      .slice(0, 500);
    const own = new Set();
    for (let i = 0; i < ids.length; i += 90) {
      const part = ids.slice(i, i + 90);
      const q = await e.DB.prepare(
        'SELECT id FROM team_workers WHERE owner_user_id=? AND id IN (' + part.map(() => '?').join(',') + ')'
      )
        .bind(me.id, ...part)
        .all();
      (q.results || []).forEach(x => own.add(x.id));
    }
    const lines = (b.lines || [])
      .filter(l => own.has(s(l.worker_id, 80)))
      .map(l => ({ worker_id: s(l.worker_id, 80), qty: num(l.qty), amount: lineAmount(basis, b.rate, l) }));
    const qty = lines.reduce((a, l) => a + (l.qty || 0), 0) || num(b.qty);
    const amount = lines.reduce((a, l) => a + (l.amount || 0), 0);
    const data = JSON.stringify({ lines, notes: s(b.notes, 1000), inputs: s(b.inputs, 300) });
    const stmts = [
      e.DB.prepare(
        'INSERT INTO jobs(id,owner_user_id,day,kind,place_id,place_name,status,unit,basis,rate,qty,amount,data_json,updated_at,deleted) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,0) ON CONFLICT(id) DO UPDATE SET day=excluded.day,kind=excluded.kind,place_id=excluded.place_id,place_name=excluded.place_name,status=excluded.status,unit=excluded.unit,basis=excluded.basis,rate=excluded.rate,qty=excluded.qty,amount=excluded.amount,data_json=excluded.data_json,updated_at=excluded.updated_at,deleted=0'
      ).bind(
        id,
        me.id,
        b.day,
        s(b.kind, 60),
        s(b.place_id, 80),
        s(b.place_name, 160),
        done ? 'Done' : 'Planned',
        s(b.unit, 20),
        basis,
        num(b.rate),
        qty,
        amount,
        data,
        new Date().toISOString()
      ),
      e.DB.prepare('DELETE FROM job_lines WHERE job_id=? AND owner_user_id=?').bind(id, me.id),
      ...lines.map(l =>
        e.DB.prepare(
          'INSERT INTO job_lines(job_id,owner_user_id,worker_id,day,qty,amount,done) VALUES(?,?,?,?,?,?,?)'
        ).bind(id, me.id, l.worker_id, b.day, l.qty, l.amount, done)
      ),
    ];
    await e.DB.batch(stmts);
    return j({ ok: true, id, qty, amount });
  }
  if (r.method === 'DELETE' && p.startsWith('/api/jobs/')) {
    const id = decodeURIComponent(p.split('/').pop());
    await e.DB.batch([
      e.DB.prepare('UPDATE jobs SET deleted=1, updated_at=? WHERE id=? AND owner_user_id=?').bind(
        new Date().toISOString(),
        id,
        me.id
      ),
      e.DB.prepare('DELETE FROM job_lines WHERE job_id=? AND owner_user_id=?').bind(id, me.id),
    ]);
    return j({ ok: true });
  }
  return null;
}
export async function stats(e) {
  const a = await e.DB.prepare(
    "SELECT COUNT(*) AS n, SUM(day>=date('now','-30 days')) AS d30 FROM jobs WHERE deleted=0"
  ).first();
  return { Jobs: a.n || 0, 'In 30 days': a.d30 || 0 };
}
