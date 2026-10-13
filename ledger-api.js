// KoffyKraft (C) 2026 T M Thomas. AGPL-3.0 with additional terms (attribution, names): see NOTICE.
// Ledger module, server side: sales, receipts (money in) and payments (money out) in one table.
// What a buyer owes = their sales less their receipts. Kept simple on purpose; it is a farm
// record, not an accounting system, so reconcile with your books before relying on a balance.
export const NAME = 'ledger';
export const SQL = [
  'CREATE TABLE IF NOT EXISTS ledger (id TEXT PRIMARY KEY, owner_user_id TEXT NOT NULL, kind TEXT NOT NULL, day TEXT NOT NULL, party TEXT, product TEXT, qty REAL, unit TEXT, rate REAL, tax_pct REAL, amount REAL NOT NULL, mode TEXT, category TEXT, ref TEXT, sale_id TEXT, notes TEXT, updated_at TEXT NOT NULL, deleted INTEGER NOT NULL DEFAULT 0)',
  'CREATE INDEX IF NOT EXISTS idx_ledger_owner ON ledger(owner_user_id, day)',
  // more about an entry (due date, dispatch: transporter, vehicle, e-way bill, freight), as JSON
  // beside it so new details need no change to the ledger table
  'CREATE TABLE IF NOT EXISTS ledger_extra (id TEXT PRIMARY KEY, owner_user_id TEXT NOT NULL, data_json TEXT NOT NULL)',
];
const EXTRA = [
  'brand',
  'due',
  'transporter',
  'vehicle',
  'driver',
  'ewayBill',
  'lr',
  'freight',
  'freightBy',
  'dispatched',
  'delivered',
  'deliverTo',
];
const KINDS = ['sale', 'receipt', 'payment'];
const DAY = /^\d{4}-\d{2}-\d{2}$/;
const num = v => (v == null || v === '' || !Number.isFinite(+v) ? null : +v);
const s = (v, n) => String(v == null ? '' : v).slice(0, n || 200);
const r2 = v => Math.round(v * 100) / 100;
// a sale's amount: quantity times rate plus tax, unless an amount was typed
export function saleAmount(b) {
  const q = num(b.qty),
    r = num(b.rate);
  if (q != null && r != null) return r2(q * r * (1 + (num(b.tax_pct) || 0) / 100));
  return r2(num(b.amount) || 0);
}
export async function api(r, e, p, me, H) {
  const { j, body, url } = H;
  if (r.method === 'GET' && p === '/api/ledger') {
    const from = DAY.test(url.searchParams.get('from')) ? url.searchParams.get('from') : '0000-00-00',
      to = DAY.test(url.searchParams.get('to')) ? url.searchParams.get('to') : '9999-12-31';
    const q = await e.DB.prepare(
      'SELECT l.*, x.data_json AS extra_json FROM ledger l LEFT JOIN ledger_extra x ON x.id=l.id AND x.owner_user_id=l.owner_user_id WHERE l.owner_user_id=? AND l.deleted=0 AND l.day>=? AND l.day<=? ORDER BY l.day DESC, l.updated_at DESC LIMIT 5000'
    )
      .bind(me.id, from, to)
      .all();
    return j({
      items: (q.results || []).map(({ extra_json, ...x }) => {
        let extra = {};
        try {
          extra = JSON.parse(extra_json || '{}');
        } catch {}
        return { ...extra, ...x };
      }),
    });
  }
  // what each buyer owes, over all time
  if (r.method === 'GET' && p === '/api/ledger/owed') {
    const q = await e.DB.prepare(
      "SELECT party, SUM(CASE WHEN kind='sale' THEN amount ELSE 0 END) AS sold, SUM(CASE WHEN kind='receipt' THEN amount ELSE 0 END) AS received, MAX(day) AS last FROM ledger WHERE owner_user_id=? AND deleted=0 AND kind IN ('sale','receipt') AND COALESCE(party,'')<>'' GROUP BY party ORDER BY party"
    )
      .bind(me.id)
      .all();
    return j({ items: (q.results || []).map(x => ({ ...x, owed: r2((x.sold || 0) - (x.received || 0)) })) });
  }
  if (r.method === 'POST' && p === '/api/ledger') {
    const b = await body(r);
    const id = s(b.id, 80);
    if (!id || !KINDS.includes(b.kind) || !DAY.test(b.day))
      return j({ error: 'kind and date required' }, 400);
    const amount = b.kind === 'sale' ? saleAmount(b) : r2(Math.abs(num(b.amount) || 0));
    if (!amount) return j({ error: 'amount required' }, 400);
    const old = await e.DB.prepare('SELECT owner_user_id FROM ledger WHERE id=?').bind(id).first();
    if (old && old.owner_user_id !== me.id) return j({ error: 'not yours' }, 403);
    const n = await e.DB.prepare('SELECT COUNT(*) AS n FROM ledger WHERE owner_user_id=?')
      .bind(me.id)
      .first();
    if (!old && n.n >= 50000) return j({ error: 'ledger is full' }, 400);
    await e.DB.prepare(
      'INSERT INTO ledger(id,owner_user_id,kind,day,party,product,qty,unit,rate,tax_pct,amount,mode,category,ref,sale_id,notes,updated_at,deleted) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,0) ON CONFLICT(id) DO UPDATE SET kind=excluded.kind,day=excluded.day,party=excluded.party,product=excluded.product,qty=excluded.qty,unit=excluded.unit,rate=excluded.rate,tax_pct=excluded.tax_pct,amount=excluded.amount,mode=excluded.mode,category=excluded.category,ref=excluded.ref,sale_id=excluded.sale_id,notes=excluded.notes,updated_at=excluded.updated_at,deleted=0'
    )
      .bind(
        id,
        me.id,
        b.kind,
        b.day,
        s(b.party, 120).trim(),
        s(b.product, 80),
        num(b.qty),
        s(b.unit, 20),
        num(b.rate),
        num(b.tax_pct),
        amount,
        s(b.mode, 40),
        s(b.category, 60),
        s(b.ref, 80),
        s(b.sale_id, 80),
        s(b.notes, 1000),
        new Date().toISOString()
      )
      .run();
    const extra = {};
    for (const k of EXTRA) if (b[k] != null && b[k] !== '') extra[k] = s(b[k], 120);
    await e.DB.prepare(
      'INSERT INTO ledger_extra(id,owner_user_id,data_json) VALUES(?,?,?) ON CONFLICT(id) DO UPDATE SET data_json=excluded.data_json'
    )
      .bind(id, me.id, JSON.stringify(extra))
      .run();
    return j({ ok: true, id, amount });
  }
  if (r.method === 'DELETE' && p.startsWith('/api/ledger/')) {
    await e.DB.prepare('UPDATE ledger SET deleted=1, updated_at=? WHERE id=? AND owner_user_id=?')
      .bind(new Date().toISOString(), decodeURIComponent(p.split('/').pop()), me.id)
      .run();
    return j({ ok: true });
  }
  return null;
}
export async function stats(e) {
  const q = await e.DB.prepare('SELECT kind, COUNT(*) AS n FROM ledger WHERE deleted=0 GROUP BY kind').all();
  const o = { sale: 'Sales', receipt: 'Receipts', payment: 'Payments' };
  return Object.fromEntries((q.results || []).map(x => [o[x.kind] || x.kind, x.n]));
}
