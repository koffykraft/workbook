// KoffyKraft (C) 2026 T M Thomas. AGPL-3.0 with additional terms (attribution, names): see NOTICE.
// Team module, server side: workers, the daily muster (one mark per worker per day, with the
// phone's GPS at the moment it was saved), leave, holidays, advances and bonuses, and the monthly
// register with wages. Adapted for farms from the TAGRO attendance system (koffykraft/tagro-attendance):
// same rules of evidence (a changed mark keeps the old one in the audit log, with a reason).
export const NAME = 'team';
export const SQL = [
  "CREATE TABLE IF NOT EXISTS team_workers (id TEXT PRIMARY KEY, owner_user_id TEXT NOT NULL, name TEXT NOT NULL, code TEXT, phone TEXT, role TEXT, place_id TEXT, pay_type TEXT NOT NULL DEFAULT 'daily', rate REAL, ot_rate REAL, joined TEXT, left_on TEXT, active INTEGER NOT NULL DEFAULT 1, notes TEXT, updated_at TEXT NOT NULL)",
  'CREATE INDEX IF NOT EXISTS idx_team_workers_owner ON team_workers(owner_user_id, active)',
  'CREATE TABLE IF NOT EXISTS team_days (owner_user_id TEXT NOT NULL, day TEXT NOT NULL, worker_id TEXT NOT NULL, status TEXT NOT NULL, place_id TEXT, place_name TEXT, ot_hours REAL, note TEXT, gps_lat REAL, gps_lng REAL, gps_acc REAL, dist_m REAL, inside INTEGER, marked_at TEXT NOT NULL, PRIMARY KEY (owner_user_id, day, worker_id))',
  'CREATE TABLE IF NOT EXISTS team_leave (id TEXT PRIMARY KEY, owner_user_id TEXT NOT NULL, worker_id TEXT NOT NULL, from_day TEXT NOT NULL, to_day TEXT NOT NULL, kind TEXT NOT NULL, pay REAL NOT NULL DEFAULT 1, note TEXT)',
  'CREATE INDEX IF NOT EXISTS idx_team_leave_owner ON team_leave(owner_user_id, from_day)',
  'CREATE TABLE IF NOT EXISTS team_holidays (owner_user_id TEXT NOT NULL, day TEXT NOT NULL, name TEXT, paid INTEGER NOT NULL DEFAULT 1, PRIMARY KEY (owner_user_id, day))',
  'CREATE TABLE IF NOT EXISTS team_items (id TEXT PRIMARY KEY, owner_user_id TEXT NOT NULL, worker_id TEXT NOT NULL, month TEXT NOT NULL, kind TEXT NOT NULL, amount REAL NOT NULL, note TEXT)',
  'CREATE INDEX IF NOT EXISTS idx_team_items_owner ON team_items(owner_user_id, month)',
  // more about each worker (address, emergency contact, how wages are paid, skills, task), kept as
  // JSON beside the worker so new details need no change to the workers table
  'CREATE TABLE IF NOT EXISTS team_worker_info (id TEXT PRIMARY KEY, owner_user_id TEXT NOT NULL, data_json TEXT NOT NULL)',
  'CREATE TABLE IF NOT EXISTS team_audit (id TEXT PRIMARY KEY, owner_user_id TEXT NOT NULL, at TEXT NOT NULL, what TEXT NOT NULL, before_json TEXT, after_json TEXT, reason TEXT)',
];
const DAY = /^\d{4}-\d{2}-\d{2}$/,
  MONTH = /^\d{4}-\d{2}$/;
const STATUS = ['P', 'H', 'A', 'L', 'O'];
const INFO_KEYS = [
  'address',
  'emergencyName',
  'emergencyPhone',
  'paidBy',
  'payTo',
  'skills',
  'task',
  'taskTrees',
  'languages',
  'idNote',
]; // present, half day, absent, on leave, off
const num = v => (v == null || v === '' || !Number.isFinite(+v) ? null : +v);
const s = (v, n) => String(v == null ? '' : v).slice(0, n || 200);
function metres(a, b) {
  const R = 6371000,
    rad = x => (x * Math.PI) / 180;
  const h =
    Math.sin(rad(b.lat - a.lat) / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lng - a.lng) / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}
const monthDays = m => {
  const [y, mo] = m.split('-').map(Number);
  return [...Array(new Date(y, mo, 0).getDate())].map((_, i) => m + '-' + String(i + 1).padStart(2, '0'));
};
const dow = d => new Date(d + 'T00:00:00Z').getUTCDay();
async function tableExists(e, name) {
  return !!(await e.DB.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?")
    .bind(name)
    .first());
}
// The month's register and wages, worked out fresh from the marks every time (nothing pre-baked).
export async function month(e, owner, m, set) {
  const days = monthDays(m);
  const off = new Set((set && set.weeklyOff) || [0]);
  const half = (set && set.halfDay) ?? 0.5;
  const [W, D, L, Hd, I] = await Promise.all([
    e.DB.prepare('SELECT * FROM team_workers WHERE owner_user_id=? ORDER BY active DESC, name')
      .bind(owner)
      .all(),
    e.DB.prepare('SELECT * FROM team_days WHERE owner_user_id=? AND day>=? AND day<=?')
      .bind(owner, days[0], days[days.length - 1])
      .all(),
    e.DB.prepare('SELECT * FROM team_leave WHERE owner_user_id=? AND from_day<=? AND to_day>=?')
      .bind(owner, days[days.length - 1], days[0])
      .all(),
    e.DB.prepare('SELECT * FROM team_holidays WHERE owner_user_id=? AND day>=? AND day<=?')
      .bind(owner, days[0], days[days.length - 1])
      .all(),
    e.DB.prepare('SELECT * FROM team_items WHERE owner_user_id=? AND month=?').bind(owner, m).all(),
  ]);
  let piece = [];
  if (await tableExists(e, 'job_lines'))
    piece =
      (
        await e.DB.prepare(
          'SELECT worker_id, SUM(amount) AS amount, SUM(qty) AS qty FROM job_lines WHERE owner_user_id=? AND day>=? AND day<=? AND done=1 GROUP BY worker_id'
        )
          .bind(owner, days[0], days[days.length - 1])
          .all()
      ).results || [];
  const hol = new Map((Hd.results || []).map(h => [h.day, h]));
  const scheduled = days.filter(d => !off.has(dow(d)) && !hol.has(d));
  const marks = D.results || [];
  const rows = (W.results || [])
    .filter(w => w.active || marks.some(x => x.worker_id === w.id))
    .map(w => {
      const mine = new Map(marks.filter(x => x.worker_id === w.id).map(x => [x.day, x]));
      const leave = (L.results || []).filter(l => l.worker_id === w.id);
      const c = { P: 0, H: 0, A: 0, L: 0, O: 0, paidLeave: 0, paidHol: 0, ot: 0, outside: 0 };
      const grid = {};
      for (const d of days) {
        if ((w.joined && d < w.joined) || (w.left_on && d > w.left_on)) continue;
        const k = mine.get(d);
        const lv = leave.find(l => l.from_day <= d && l.to_day >= d);
        let st = k ? k.status : lv ? 'L' : '';
        if (st) grid[d] = st;
        if (k) {
          c.ot += k.ot_hours || 0;
          if (k.inside === 0) c.outside++;
        }
        if (st === 'L') c.paidLeave += lv ? lv.pay : 1;
        if (st && c[st] != null) c[st]++;
        if (!st && hol.has(d) && hol.get(d).paid && !off.has(dow(d))) c.paidHol++;
      }
      const payable = c.P + c.H * half + c.paidLeave + c.paidHol;
      let base = 0;
      if (w.pay_type === 'daily') base = (w.rate || 0) * payable;
      else if (w.pay_type === 'hourly') base = (w.rate || 0) * c.ot;
      else if (w.pay_type === 'monthly')
        base = scheduled.length
          ? ((w.rate || 0) * Math.min(payable, scheduled.length)) / scheduled.length
          : 0;
      // for hourly workers the muster's hours box holds the hours worked, not overtime
      const ot = w.pay_type === 'hourly' ? 0 : (w.ot_rate || 0) * c.ot;
      const pc = piece.find(p => p.worker_id === w.id) || { amount: 0, qty: 0 };
      const items = (I.results || []).filter(i => i.worker_id === w.id);
      const plus = items
        .filter(i => i.kind === 'Bonus' || i.kind === 'Other')
        .reduce((a, i) => a + i.amount, 0);
      const minus = items
        .filter(i => i.kind === 'Advance' || i.kind === 'Deduction')
        .reduce((a, i) => a + i.amount, 0);
      const r2 = v => Math.round(v * 100) / 100;
      return {
        id: w.id,
        name: w.name,
        code: w.code,
        role: w.role,
        pay_type: w.pay_type,
        rate: w.rate,
        ...c,
        payable: r2(payable),
        base: r2(base),
        ot_pay: r2(ot),
        piece: r2(pc.amount || 0),
        plus: r2(plus),
        minus: r2(minus),
        net: r2(base + ot + (pc.amount || 0) + plus - minus),
        grid,
      };
    });
  return { month: m, days, scheduled: scheduled.length, holidays: Hd.results || [], rows };
}
export async function api(r, e, p, me, H) {
  const { j, body, url, CONFIG } = H;
  const set = (CONFIG.settings || {}).team || {};
  const audit = (what, before, after, reason) =>
    e.DB.prepare(
      'INSERT INTO team_audit(id,owner_user_id,at,what,before_json,after_json,reason) VALUES(?,?,?,?,?,?,?)'
    ).bind(
      crypto.randomUUID(),
      me.id,
      new Date().toISOString(),
      what,
      before ? JSON.stringify(before) : null,
      after ? JSON.stringify(after) : null,
      s(reason, 300)
    );
  // ---- workers ----
  if (r.method === 'GET' && p === '/api/team/workers') {
    const q = await e.DB.prepare(
      'SELECT w.*, i.data_json AS info_json FROM team_workers w LEFT JOIN team_worker_info i ON i.id=w.id AND i.owner_user_id=w.owner_user_id WHERE w.owner_user_id=? ORDER BY w.active DESC, w.name'
    )
      .bind(me.id)
      .all();
    return j({
      items: (q.results || []).map(({ info_json, ...w }) => {
        let info = {};
        try {
          info = JSON.parse(info_json || '{}');
        } catch {}
        return { ...w, info };
      }),
    });
  }
  if (r.method === 'POST' && p === '/api/team/workers') {
    const b = await body(r);
    const id = s(b.id, 80);
    if (!id || !String(b.name || '').trim()) return j({ error: 'name required' }, 400);
    const old = await e.DB.prepare('SELECT * FROM team_workers WHERE id=?').bind(id).first();
    if (old && old.owner_user_id !== me.id) return j({ error: 'not yours' }, 403);
    const n = await e.DB.prepare('SELECT COUNT(*) AS n FROM team_workers WHERE owner_user_id=?')
      .bind(me.id)
      .first();
    if (!old && n.n >= 2000) return j({ error: 'too many workers' }, 400);
    const row = {
      name: s(b.name, 120).trim(),
      code: s(b.code, 30),
      phone: s(b.phone, 30),
      role: s(b.role, 60),
      place_id: s(b.place_id, 80),
      pay_type: ['daily', 'monthly', 'hourly', 'piece'].includes(b.pay_type) ? b.pay_type : 'daily',
      rate: num(b.rate),
      ot_rate: num(b.ot_rate),
      joined: DAY.test(b.joined) ? b.joined : null,
      left_on: DAY.test(b.left_on) ? b.left_on : null,
      active: b.active === false || b.active === 0 || b.active === '0' ? 0 : 1,
      notes: s(b.notes, 1000),
    };
    const stmts = [
      e.DB.prepare(
        'INSERT INTO team_workers(id,owner_user_id,name,code,phone,role,place_id,pay_type,rate,ot_rate,joined,left_on,active,notes,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,code=excluded.code,phone=excluded.phone,role=excluded.role,place_id=excluded.place_id,pay_type=excluded.pay_type,rate=excluded.rate,ot_rate=excluded.ot_rate,joined=excluded.joined,left_on=excluded.left_on,active=excluded.active,notes=excluded.notes,updated_at=excluded.updated_at'
      ).bind(id, me.id, ...Object.values(row), new Date().toISOString()),
    ];
    if (b.info && typeof b.info === 'object') {
      const info = {};
      for (const k of INFO_KEYS) if (b.info[k] != null && b.info[k] !== '') info[k] = s(b.info[k], 300);
      stmts.push(
        e.DB.prepare(
          'INSERT INTO team_worker_info(id,owner_user_id,data_json) VALUES(?,?,?) ON CONFLICT(id) DO UPDATE SET data_json=excluded.data_json'
        ).bind(id, me.id, JSON.stringify(info))
      );
    }
    // a change of pay is kept in the audit log
    if (old && (old.rate !== row.rate || old.pay_type !== row.pay_type))
      stmts.push(
        audit(
          'pay ' + row.name,
          { pay_type: old.pay_type, rate: old.rate },
          { pay_type: row.pay_type, rate: row.rate },
          b.reason
        )
      );
    await e.DB.batch(stmts);
    return j({ ok: true, id });
  }
  // ---- the daily muster ----
  if (r.method === 'GET' && p === '/api/team/day') {
    const day = url.searchParams.get('day');
    if (!DAY.test(day)) return j({ error: 'day required' }, 400);
    const [d, l, h] = await Promise.all([
      e.DB.prepare('SELECT * FROM team_days WHERE owner_user_id=? AND day=?').bind(me.id, day).all(),
      e.DB.prepare('SELECT * FROM team_leave WHERE owner_user_id=? AND from_day<=? AND to_day>=?')
        .bind(me.id, day, day)
        .all(),
      e.DB.prepare('SELECT * FROM team_holidays WHERE owner_user_id=? AND day=?').bind(me.id, day).first(),
    ]);
    return j({ day, marks: d.results || [], leave: l.results || [], holiday: h || null });
  }
  if (r.method === 'POST' && p === '/api/team/day') {
    const b = await body(r);
    if (!DAY.test(b.day)) return j({ error: 'day required' }, 400);
    const marks = (Array.isArray(b.marks) ? b.marks : [])
      .filter(m => m && m.worker_id && STATUS.includes(m.status))
      .slice(0, 2000);
    const g =
      b.gps && num(b.gps.lat) != null && num(b.gps.lng) != null
        ? { lat: +b.gps.lat, lng: +b.gps.lng, acc: num(b.gps.acc) }
        : null;
    const pt =
      b.place_pt && num(b.place_pt.lat) != null && num(b.place_pt.lng) != null
        ? { lat: +b.place_pt.lat, lng: +b.place_pt.lng, radius: num(b.place_pt.radius) || 300 }
        : null;
    const dist = g && pt ? metres(g, pt) : null;
    // inside when the reading, allowing for its own accuracy, reaches the place's circle
    const inside = dist == null ? null : dist - Math.min(g.acc || 0, 200) <= pt.radius ? 1 : 0;
    const ids = marks.map(m => s(m.worker_id, 80));
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
    const before = new Map(
      (
        (
          await e.DB.prepare('SELECT * FROM team_days WHERE owner_user_id=? AND day=?')
            .bind(me.id, b.day)
            .all()
        ).results || []
      ).map(x => [x.worker_id, x])
    );
    const at = new Date().toISOString();
    const stmts = [];
    for (const m of marks) {
      const wid = s(m.worker_id, 80);
      if (!own.has(wid)) continue;
      const old = before.get(wid);
      if (
        old &&
        old.status === m.status &&
        (old.ot_hours || null) === num(m.ot_hours) &&
        (old.note || '') === s(m.note, 200)
      )
        continue;
      if (old && old.status !== m.status)
        stmts.push(
          audit(
            'mark ' + b.day,
            { worker_id: wid, status: old.status, at: old.marked_at },
            { worker_id: wid, status: m.status },
            b.reason
          )
        );
      stmts.push(
        e.DB.prepare(
          'INSERT INTO team_days(owner_user_id,day,worker_id,status,place_id,place_name,ot_hours,note,gps_lat,gps_lng,gps_acc,dist_m,inside,marked_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(owner_user_id,day,worker_id) DO UPDATE SET status=excluded.status,place_id=excluded.place_id,place_name=excluded.place_name,ot_hours=excluded.ot_hours,note=excluded.note,gps_lat=excluded.gps_lat,gps_lng=excluded.gps_lng,gps_acc=excluded.gps_acc,dist_m=excluded.dist_m,inside=excluded.inside,marked_at=excluded.marked_at'
        ).bind(
          me.id,
          b.day,
          wid,
          m.status,
          s(b.place_id, 80),
          s(b.place_name, 160),
          num(m.ot_hours),
          s(m.note, 200),
          g && g.lat,
          g && g.lng,
          g && g.acc,
          dist,
          inside,
          at
        )
      );
    }
    for (let i = 0; i < stmts.length; i += 100) await e.DB.batch(stmts.slice(i, i + 100));
    return j({ saved: stmts.length, dist_m: dist, inside });
  }
  // ---- leave, holidays, advances and bonuses ----
  if (r.method === 'GET' && p === '/api/team/leave') {
    const q = await e.DB.prepare(
      'SELECT * FROM team_leave WHERE owner_user_id=? ORDER BY from_day DESC LIMIT 1000'
    )
      .bind(me.id)
      .all();
    return j({ items: q.results || [] });
  }
  if (r.method === 'POST' && p === '/api/team/leave') {
    const b = await body(r);
    if (!b.id || !b.worker_id || !DAY.test(b.from_day) || !DAY.test(b.to_day) || b.to_day < b.from_day)
      return j({ error: 'worker and dates required' }, 400);
    const w = await e.DB.prepare('SELECT id FROM team_workers WHERE id=? AND owner_user_id=?')
      .bind(s(b.worker_id, 80), me.id)
      .first();
    if (!w) return j({ error: 'unknown worker' }, 404);
    await e.DB.prepare(
      'INSERT INTO team_leave(id,owner_user_id,worker_id,from_day,to_day,kind,pay,note) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET worker_id=excluded.worker_id,from_day=excluded.from_day,to_day=excluded.to_day,kind=excluded.kind,pay=excluded.pay,note=excluded.note WHERE team_leave.owner_user_id=excluded.owner_user_id'
    )
      .bind(
        s(b.id, 80),
        me.id,
        w.id,
        b.from_day,
        b.to_day,
        s(b.kind, 40) || 'Leave',
        Math.max(0, Math.min(1, num(b.pay) ?? 1)),
        s(b.note, 300)
      )
      .run();
    return j({ ok: true });
  }
  if (r.method === 'DELETE' && p.startsWith('/api/team/leave/')) {
    await e.DB.prepare('DELETE FROM team_leave WHERE id=? AND owner_user_id=?')
      .bind(decodeURIComponent(p.split('/').pop()), me.id)
      .run();
    return j({ ok: true });
  }
  if (r.method === 'GET' && p === '/api/team/holidays') {
    const q = await e.DB.prepare(
      'SELECT * FROM team_holidays WHERE owner_user_id=? ORDER BY day DESC LIMIT 500'
    )
      .bind(me.id)
      .all();
    return j({ items: q.results || [] });
  }
  if (r.method === 'POST' && p === '/api/team/holidays') {
    const b = await body(r);
    if (!DAY.test(b.day)) return j({ error: 'date required' }, 400);
    await e.DB.prepare(
      'INSERT INTO team_holidays(owner_user_id,day,name,paid) VALUES(?,?,?,?) ON CONFLICT(owner_user_id,day) DO UPDATE SET name=excluded.name,paid=excluded.paid'
    )
      .bind(me.id, b.day, s(b.name, 80), b.paid === false ? 0 : 1)
      .run();
    return j({ ok: true });
  }
  if (r.method === 'DELETE' && p.startsWith('/api/team/holidays/')) {
    await e.DB.prepare('DELETE FROM team_holidays WHERE owner_user_id=? AND day=?')
      .bind(me.id, decodeURIComponent(p.split('/').pop()))
      .run();
    return j({ ok: true });
  }
  if (r.method === 'GET' && p === '/api/team/items') {
    const m = url.searchParams.get('month');
    const q = await e.DB.prepare(
      "SELECT * FROM team_items WHERE owner_user_id=? AND (?='' OR month=?) ORDER BY month DESC LIMIT 2000"
    )
      .bind(me.id, m || '', m || '')
      .all();
    return j({ items: q.results || [] });
  }
  if (r.method === 'POST' && p === '/api/team/items') {
    const b = await body(r);
    const kinds = ['Advance', 'Deduction', 'Bonus', 'Other'];
    if (!b.id || !b.worker_id || !MONTH.test(b.month) || !kinds.includes(b.kind) || num(b.amount) == null)
      return j({ error: 'worker, month, kind and amount required' }, 400);
    const w = await e.DB.prepare('SELECT id FROM team_workers WHERE id=? AND owner_user_id=?')
      .bind(s(b.worker_id, 80), me.id)
      .first();
    if (!w) return j({ error: 'unknown worker' }, 404);
    await e.DB.prepare(
      'INSERT INTO team_items(id,owner_user_id,worker_id,month,kind,amount,note) VALUES(?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET worker_id=excluded.worker_id,month=excluded.month,kind=excluded.kind,amount=excluded.amount,note=excluded.note WHERE team_items.owner_user_id=excluded.owner_user_id'
    )
      .bind(s(b.id, 80), me.id, w.id, b.month, b.kind, Math.abs(num(b.amount)), s(b.note, 300))
      .run();
    return j({ ok: true });
  }
  if (r.method === 'DELETE' && p.startsWith('/api/team/items/')) {
    await e.DB.prepare('DELETE FROM team_items WHERE id=? AND owner_user_id=?')
      .bind(decodeURIComponent(p.split('/').pop()), me.id)
      .run();
    return j({ ok: true });
  }
  // ---- the month ----
  if (r.method === 'GET' && p === '/api/team/month') {
    const m = url.searchParams.get('month');
    if (!MONTH.test(m || '')) return j({ error: 'month required' }, 400);
    return j(await month(e, me.id, m, set));
  }
  if (r.method === 'GET' && p === '/api/team/audit') {
    const q = await e.DB.prepare(
      'SELECT at,what,before_json,after_json,reason FROM team_audit WHERE owner_user_id=? ORDER BY at DESC LIMIT 300'
    )
      .bind(me.id)
      .all();
    return j({ items: q.results || [] });
  }
  return null;
}
export async function stats(e) {
  const w = await e.DB.prepare('SELECT COUNT(*) AS n, SUM(active) AS active FROM team_workers').first();
  const d = await e.DB.prepare(
    "SELECT COUNT(*) AS n FROM team_days WHERE day>=date('now','-30 days')"
  ).first();
  return { Workers: w.n || 0, Active: w.active || 0, 'Marks in 30 days': d.n || 0 };
}
