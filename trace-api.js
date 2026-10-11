// KoffyKraft (C) 2026 T M Thomas. AGPL-3.0 with additional terms (attribution, names): see NOTICE.
// Lot passport server: stores signed entries only after checking their hash, link and
// signature with the same rules the public page uses (trace-core.js), runs handoffs between
// users, and stamps each day's hashes into Bitcoin through OpenTimestamps calendars.
import './trace-core.js';
const T = globalThis.KKTRACE;
const KINDS = ['record', 'roast', 'transfer', 'receive', 'cancel', 'note', 'photo'];
const CALS = ['https://a.pool.opentimestamps.org', 'https://b.pool.opentimestamps.org'];
const tok16 = () => {
  const a = new Uint8Array(16);
  crypto.getRandomValues(a);
  return T.hex(a);
};
// Tables are created on first use as well as by migrations/0015_trace.sql, so a deploy works
// even where the deploy token cannot change the database.
const SCHEMA = [
  'CREATE TABLE IF NOT EXISTS trace_names ( user_id TEXT PRIMARY KEY, label TEXT NOT NULL, updated_at TEXT NOT NULL )',
  'CREATE TABLE IF NOT EXISTS trace_keys ( id TEXT PRIMARY KEY, user_id TEXT NOT NULL, jwk TEXT NOT NULL, created_at TEXT NOT NULL )',
  'CREATE INDEX IF NOT EXISTS trace_keys_user ON trace_keys(user_id)',
  'CREATE TABLE IF NOT EXISTS trace_lots ( id TEXT PRIMARY KEY, owner_user_id TEXT NOT NULL, token TEXT NOT NULL UNIQUE, title TEXT NOT NULL, withdrawn INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL )',
  'CREATE INDEX IF NOT EXISTS trace_lots_owner ON trace_lots(owner_user_id)',
  'CREATE TABLE IF NOT EXISTS trace_events ( lot_id TEXT NOT NULL, seq INTEGER NOT NULL, hash TEXT NOT NULL UNIQUE, user_id TEXT NOT NULL, key_id TEXT NOT NULL, kind TEXT NOT NULL, body_json TEXT, sig TEXT, day TEXT NOT NULL, created_at TEXT NOT NULL, PRIMARY KEY (lot_id, seq) )',
  'CREATE INDEX IF NOT EXISTS trace_events_day ON trace_events(day)',
  'CREATE TABLE IF NOT EXISTS trace_transfers ( id TEXT PRIMARY KEY, lot_id TEXT NOT NULL, from_user_id TEXT NOT NULL, to_email TEXT NOT NULL, kg_sent REAL, status TEXT NOT NULL, kg_received REAL, receiver_user_id TEXT, created_at TEXT NOT NULL, received_at TEXT )',
  'CREATE INDEX IF NOT EXISTS trace_transfers_lot ON trace_transfers(lot_id)',
  'CREATE INDEX IF NOT EXISTS trace_transfers_to ON trace_transfers(to_email, status)',
  'CREATE TABLE IF NOT EXISTS trace_anchors ( day TEXT PRIMARY KEY, digest TEXT NOT NULL, count INTEGER NOT NULL, ots_b64 TEXT, calendars TEXT, status TEXT NOT NULL, error TEXT, created_at TEXT NOT NULL )',
  'CREATE TABLE IF NOT EXISTS trace_btc ( day TEXT PRIMARY KEY, blocks TEXT NOT NULL, upgraded_at TEXT NOT NULL )',
];
let READY = null;
const ready = e =>
  READY ||
  (READY = e.DB.batch(SCHEMA.map(s => e.DB.prepare(s))).catch(err => {
    READY = null;
    throw err;
  }));
const qs = n => Array(n).fill('?').join(',');

async function lotView(e, lot) {
  const rows =
    (
      await e.DB.prepare(
        'SELECT seq,hash,user_id,key_id,kind,body_json,sig,day FROM trace_events WHERE lot_id=? ORDER BY seq'
      )
        .bind(lot.id)
        .all()
    ).results || [];
  const party = { [lot.owner_user_id]: 'A' };
  let next = 1;
  for (const x of rows)
    if (!(x.user_id in party)) party[x.user_id] = String.fromCharCode(65 + Math.min(next++, 25));
  const keyIds = [...new Set(rows.map(x => x.key_id))],
    keys = {},
    labels = {};
  if (keyIds.length) {
    const q = await e.DB.prepare(
      'SELECT k.id,k.jwk,n.label,u.display_name FROM trace_keys k LEFT JOIN trace_names n ON n.user_id=k.user_id LEFT JOIN users u ON u.id=k.user_id WHERE k.id IN (' +
        qs(keyIds.length) +
        ')'
    )
      .bind(...keyIds)
      .all();
    for (const k of q.results || []) {
      keys[k.id] = JSON.parse(k.jwk);
      labels[k.id] = k.label || k.display_name || 'KoffyKraft user';
    }
  }
  const days = [...new Set(rows.map(x => x.day))],
    anchors = {};
  if (days.length) {
    const q = await e.DB.prepare(
      'SELECT a.day,a.digest,a.count,a.status,a.created_at,b.blocks FROM trace_anchors a LEFT JOIN trace_btc b ON b.day=a.day WHERE a.day IN (' +
        qs(days.length) +
        ')'
    )
      .bind(...days)
      .all();
    for (const a of q.results || [])
      anchors[a.day] = {
        digest: a.digest,
        count: a.count,
        status: a.status,
        at: a.created_at,
        bitcoin: a.blocks ? JSON.parse(a.blocks) : null,
      };
  }
  return {
    lot: {
      id: lot.id,
      title: lot.title,
      token: lot.token,
      withdrawn: !!lot.withdrawn,
      created_at: lot.created_at,
      updated_at: lot.updated_at,
    },
    events: rows.map(x => ({
      seq: x.seq,
      hash: x.hash,
      sig: x.sig,
      body: x.body_json ? JSON.parse(x.body_json) : null,
      party: party[x.user_id],
      day: x.day,
    })),
    keys,
    labels,
    anchors,
  };
}

// Public, no sign-in: the passport and the daily files anyone can check independently.
export async function tracePublic(r, e, p, H) {
  if (r.method !== 'GET' || !p.startsWith('/api/public/trace')) return null;
  await ready(e);
  let m;
  if ((m = p.match(/^\/api\/public\/trace\/([a-f0-9]{32})$/))) {
    const lot = await e.DB.prepare('SELECT * FROM trace_lots WHERE token=?').bind(m[1]).first();
    if (!lot) return H.j({ error: 'not found' }, 404);
    return H.j(await lotView(e, lot));
  }
  if ((m = p.match(/^\/api\/public\/trace-day\/(\d{4}-\d{2}-\d{2})\/(manifest|ots)$/))) {
    const name = 'koffykraft-trace-' + m[1] + '.txt';
    if (m[2] === 'manifest') {
      const hs = (
        (await e.DB.prepare('SELECT hash FROM trace_events WHERE day=?').bind(m[1]).all()).results || []
      ).map(x => x.hash);
      if (!hs.length) return H.j({ error: 'not found' }, 404);
      return new Response(T.manifest(hs), {
        headers: {
          'content-type': 'text/plain; charset=utf-8',
          'content-disposition': 'attachment; filename="' + name + '"',
          'cache-control': 'no-store',
        },
      });
    }
    const a = await e.DB.prepare("SELECT ots_b64 FROM trace_anchors WHERE day=? AND status='ok'")
      .bind(m[1])
      .first();
    if (!a || !a.ots_b64) return H.j({ error: 'not stamped yet' }, 404);
    return new Response(T.unb64(a.ots_b64), {
      headers: {
        'content-type': 'application/octet-stream',
        'content-disposition': 'attachment; filename="' + name + '.ots"',
        'cache-control': 'no-store',
      },
    });
  }
  return null;
}

export async function traceApi(r, e, p, me, H, isAdmin, ctx) {
  if (!p.startsWith('/api/trace')) return null;
  await ready(e);
  const j = H.j,
    now = new Date().toISOString(),
    em = String(me.email || '').toLowerCase();
  let m;
  const getLot = id => e.DB.prepare('SELECT * FROM trace_lots WHERE id=?').bind(id).first();
  const lotRole = async lot => {
    if (!lot) return null;
    if (lot.owner_user_id === me.id) return 'owner';
    const t = await e.DB.prepare(
      "SELECT status FROM trace_transfers WHERE lot_id=? AND ((receiver_user_id=? AND status='received') OR (to_email=? AND status='sent')) ORDER BY CASE status WHEN 'received' THEN 0 ELSE 1 END LIMIT 1"
    )
      .bind(lot.id, me.id, em)
      .first();
    return t ? (t.status === 'received' ? 'buyer' : 'invited') : null;
  };

  if (p === '/api/trace/me') {
    if (r.method === 'GET') {
      const n = await e.DB.prepare('SELECT label FROM trace_names WHERE user_id=?').bind(me.id).first();
      const k = await e.DB.prepare('SELECT id FROM trace_keys WHERE user_id=?').bind(me.id).all();
      return j({ label: n ? n.label : me.display_name || '', keys: (k.results || []).map(x => x.id) });
    }
    if (r.method === 'PUT') {
      const b = await H.body(r);
      const label = String(b.label || '')
        .trim()
        .slice(0, 80);
      if (!label) return j({ error: 'name required' }, 400);
      await e.DB.prepare(
        'INSERT INTO trace_names(user_id,label,updated_at) VALUES(?,?,?) ON CONFLICT(user_id) DO UPDATE SET label=excluded.label,updated_at=excluded.updated_at'
      )
        .bind(me.id, label, now)
        .run();
      return j({ ok: true });
    }
  }
  if (p === '/api/trace/keys' && r.method === 'POST') {
    const b = await H.body(r);
    if (!T.validJwk(b.jwk)) return j({ error: 'invalid key' }, 400);
    const id = await T.keyId(b.jwk);
    const ex = await e.DB.prepare('SELECT user_id FROM trace_keys WHERE id=?').bind(id).first();
    if (ex && ex.user_id !== me.id) return j({ error: 'key belongs to another account' }, 409);
    if (!ex) {
      const c = await e.DB.prepare('SELECT COUNT(*) AS n FROM trace_keys WHERE user_id=?')
        .bind(me.id)
        .first();
      if (c.n >= 20) return j({ error: 'limit of 20 signing phones' }, 400);
      await e.DB.prepare('INSERT INTO trace_keys(id,user_id,jwk,created_at) VALUES(?,?,?,?)')
        .bind(id, me.id, JSON.stringify(b.jwk), now)
        .run();
    }
    return j({ id });
  }
  if (p === '/api/trace/lots') {
    if (r.method === 'GET') {
      const q = await e.DB.prepare(
        "SELECT l.id,l.title,l.token,l.withdrawn,l.updated_at,CASE WHEN l.owner_user_id=? THEN 'owner' ELSE 'buyer' END AS role,(SELECT COUNT(*) FROM trace_events x WHERE x.lot_id=l.id) AS entries FROM trace_lots l WHERE l.owner_user_id=? OR l.id IN (SELECT lot_id FROM trace_transfers WHERE receiver_user_id=? AND status='received') ORDER BY l.updated_at DESC LIMIT 500"
      )
        .bind(me.id, me.id, me.id)
        .all();
      return j({ items: q.results || [] });
    }
    if (r.method === 'POST') {
      const b = await H.body(r);
      const title = String(b.title || '')
        .trim()
        .slice(0, 140);
      if (!title) return j({ error: 'title required' }, 400);
      const c = await e.DB.prepare('SELECT COUNT(*) AS n FROM trace_lots WHERE owner_user_id=?')
        .bind(me.id)
        .first();
      if (c.n >= 500) return j({ error: 'limit of 500 passports' }, 400);
      const id = crypto.randomUUID(),
        token = tok16();
      await e.DB.prepare(
        'INSERT INTO trace_lots(id,owner_user_id,token,title,withdrawn,created_at,updated_at) VALUES(?,?,?,?,0,?,?)'
      )
        .bind(id, me.id, token, title, now, now)
        .run();
      return j({ id, token }, 201);
    }
  }
  if ((m = p.match(/^\/api\/trace\/lots\/([\w-]+)$/))) {
    const lot = await getLot(m[1]),
      ro = await lotRole(lot);
    if (!ro) return j({ error: 'not found' }, 404);
    if (r.method === 'GET') {
      const v = await lotView(e, lot);
      v.role = ro;
      const t =
        ro === 'owner'
          ? await e.DB.prepare(
              'SELECT id,to_email,kg_sent,status,kg_received,created_at,received_at,from_user_id=? AS mine FROM trace_transfers WHERE lot_id=? ORDER BY created_at'
            )
              .bind(me.id, lot.id)
              .all()
          : await e.DB.prepare(
              'SELECT id,to_email,kg_sent,status,kg_received,created_at,received_at,from_user_id=? AS mine FROM trace_transfers WHERE lot_id=? AND (from_user_id=? OR receiver_user_id=? OR to_email=?) ORDER BY created_at'
            )
              .bind(me.id, lot.id, me.id, me.id, em)
              .all();
      v.transfers = t.results || [];
      return j(v);
    }
    if (r.method === 'DELETE') {
      if (ro !== 'owner') return j({ error: 'only the owner can withdraw a passport' }, 403);
      await e.DB.batch([
        e.DB.prepare('UPDATE trace_events SET body_json=NULL,sig=NULL WHERE lot_id=?').bind(lot.id),
        e.DB.prepare('UPDATE trace_lots SET withdrawn=1,updated_at=? WHERE id=?').bind(now, lot.id),
        e.DB.prepare("UPDATE trace_transfers SET status='cancelled' WHERE lot_id=? AND status='sent'").bind(
          lot.id
        ),
      ]);
      return j({ ok: true });
    }
  }
  if ((m = p.match(/^\/api\/trace\/lots\/([\w-]+)\/events$/)) && r.method === 'POST') {
    const lot = await getLot(m[1]);
    let ro = await lotRole(lot);
    if (!ro) return j({ error: 'not found' }, 404);
    if (lot.withdrawn) return j({ error: 'this passport was withdrawn' }, 400);
    const b = await H.body(r),
      list = Array.isArray(b.events) ? b.events : [],
      to = b.to && typeof b.to === 'object' ? b.to : {};
    if (!list.length || list.length > 60) return j({ error: 'send 1 to 60 entries' }, 400);
    const head = await e.DB.prepare(
      'SELECT seq,hash FROM trace_events WHERE lot_id=? ORDER BY seq DESC LIMIT 1'
    )
      .bind(lot.id)
      .first();
    let seq = head ? head.seq + 1 : 0,
      prev = head ? head.hash : '';
    const mine = {};
    for (const k of (await e.DB.prepare('SELECT id,jwk FROM trace_keys WHERE user_id=?').bind(me.id).all())
      .results || [])
      mine[k.id] = JSON.parse(k.jwk);
    const tr = {};
    for (const t of (await e.DB.prepare('SELECT * FROM trace_transfers WHERE lot_id=?').bind(lot.id).all())
      .results || [])
      tr[t.id] = t;
    const stmts = [],
      mails = [],
      day = now.slice(0, 10);
    for (const it of list) {
      const x = (it && it.body) || {},
        d = x.data;
      if (x.v !== 1 || x.lot !== lot.id) return j({ error: 'entry is not for this passport' }, 400);
      if (x.seq !== seq || x.prev !== prev)
        return j({ error: 'the passport changed while you were working; try again' }, 409);
      if (!KINDS.includes(x.kind)) return j({ error: 'unknown entry kind' }, 400);
      if (!d || typeof d !== 'object' || Array.isArray(d)) return j({ error: 'entry data missing' }, 400);
      if (JSON.stringify(x).length > 40000) return j({ error: 'entry too large' }, 400);
      const at = Date.parse(x.at);
      if (!at || Math.abs(at - Date.now()) > 2 * 864e5)
        return j({ error: 'the phone clock is off by more than two days' }, 400);
      const jwk = mine[x.key];
      if (!jwk) return j({ error: 'this phone is not registered to sign for you' }, 400);
      const hash = await T.hashBody(x);
      if (hash !== it.hash || !(await T.verifySig(jwk, hash, it.sig)))
        return j({ error: 'signature does not match the entry' }, 400);
      if (ro === 'invited' && x.kind !== 'receive') return j({ error: 'confirm the handoff first' }, 403);
      if (x.kind === 'photo' && !/^[a-f0-9]{64}$/.test(String(d.sha || '')))
        return j({ error: 'photo fingerprint missing' }, 400);
      if (x.kind === 'record' && ro !== 'owner')
        return j({ error: 'only the owner adds origin records' }, 403);
      const tid = String(d.tid || '');
      if (x.kind === 'transfer') {
        const kg = +d.kg,
          mail = String(to[tid] || '')
            .trim()
            .toLowerCase();
        if (!/^[\w-]{8,64}$/.test(tid) || tr[tid]) return j({ error: 'bad handoff id' }, 400);
        if (!(kg > 0)) return j({ error: 'weight sent is required' }, 400);
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail)) return j({ error: 'buyer email is required' }, 400);
        if (mail === em) return j({ error: 'you cannot send a lot to yourself' }, 400);
        tr[tid] = { id: tid, status: 'sent', from_user_id: me.id, to_email: mail, kg_sent: kg };
        stmts.push(
          e.DB.prepare(
            "INSERT INTO trace_transfers(id,lot_id,from_user_id,to_email,kg_sent,status,created_at) VALUES(?,?,?,?,?,'sent',?)"
          ).bind(tid, lot.id, me.id, mail, kg, now)
        );
        mails.push(mail);
      }
      if (x.kind === 'receive') {
        const t = tr[tid],
          kg = +d.kg;
        if (!t || t.status !== 'sent' || t.to_email !== em)
          return j({ error: 'no open handoff to you' }, 400);
        if (!(kg > 0)) return j({ error: 'weight received is required' }, 400);
        t.status = 'received';
        ro = 'buyer';
        stmts.push(
          e.DB.prepare(
            "UPDATE trace_transfers SET status='received',kg_received=?,receiver_user_id=?,received_at=? WHERE id=?"
          ).bind(kg, me.id, now, tid)
        );
      }
      if (x.kind === 'cancel') {
        const t = tr[tid];
        if (!t || t.status !== 'sent' || t.from_user_id !== me.id)
          return j({ error: 'no open handoff from you' }, 400);
        t.status = 'cancelled';
        stmts.push(e.DB.prepare("UPDATE trace_transfers SET status='cancelled' WHERE id=?").bind(tid));
      }
      stmts.push(
        e.DB.prepare(
          'INSERT INTO trace_events(lot_id,seq,hash,user_id,key_id,kind,body_json,sig,day,created_at) VALUES(?,?,?,?,?,?,?,?,?,?)'
        ).bind(lot.id, seq, hash, me.id, x.key, x.kind, JSON.stringify(x), it.sig, day, now)
      );
      seq++;
      prev = hash;
    }
    stmts.push(e.DB.prepare('UPDATE trace_lots SET updated_at=? WHERE id=?').bind(now, lot.id));
    try {
      await e.DB.batch(stmts);
    } catch (err) {
      return j({ error: 'the passport changed while you were working; try again' }, 409);
    }
    if (mails.length && H.sendEmail) {
      const base = new URL(r.url).origin,
        from = me.display_name || em.split('@')[0];
      const send = Promise.all(
        mails.map(to2 =>
          H.sendEmail(
            e,
            to2,
            'Coffee lot sent to you: ' + lot.title,
            from +
              ' has sent you a coffee lot through KoffyKraft: ' +
              lot.title +
              '.\n\nSign in with this email address and open ' +
              base +
              "/trace.html to confirm the weight you received. Once confirmed, the lot's passport shows the handoff, and your roasts can be added to it.\n\nPassport: " +
              base +
              '/trace.html#p/' +
              lot.token
          )
        )
      );
      if (ctx && ctx.waitUntil) ctx.waitUntil(send);
      else await send;
    }
    return j({ ok: true, seq: seq - 1, head: prev });
  }
  if (p === '/api/trace/incoming' && r.method === 'GET') {
    const q = await e.DB.prepare(
      "SELECT t.id,t.lot_id,t.kg_sent,t.created_at,l.title,l.token,COALESCE(n.label,u.display_name,'KoffyKraft user') AS sender FROM trace_transfers t JOIN trace_lots l ON l.id=t.lot_id LEFT JOIN trace_names n ON n.user_id=t.from_user_id LEFT JOIN users u ON u.id=t.from_user_id WHERE t.to_email=? AND t.status='sent' AND l.withdrawn=0 ORDER BY t.created_at DESC"
    )
      .bind(em)
      .all();
    return j({ items: q.results || [] });
  }
  if (p === '/api/trace/anchor' && r.method === 'POST') {
    if (!isAdmin) return j({ error: 'not allowed' }, 403);
    return j(await traceAnchor(e));
  }
  return j({ error: 'not found' }, 404);
}

// Stamp every finished day (UTC) that has entries and no stamp yet. Runs daily from the cron.
export async function traceAnchor(e, now = new Date()) {
  await ready(e);
  const today = now.toISOString().slice(0, 10);
  const q = await e.DB.prepare(
    "SELECT day FROM trace_events WHERE day<? AND day NOT IN (SELECT day FROM trace_anchors WHERE status='ok') GROUP BY day ORDER BY day LIMIT 7"
  )
    .bind(today)
    .all();
  const done = [];
  for (const { day } of q.results || []) {
    const hs = (
      (await e.DB.prepare('SELECT hash FROM trace_events WHERE day=?').bind(day).all()).results || []
    ).map(x => x.hash);
    const digest = await T.sha(T.manifest(hs));
    const replies = [],
      cals = [];
    let err = '';
    for (const c of CALS) {
      try {
        const res = await fetch(c + '/digest', {
          method: 'POST',
          headers: {
            accept: 'application/vnd.opentimestamps.v1',
            'user-agent': 'KoffyKraft trace',
            'content-type': 'application/x-www-form-urlencoded',
          },
          body: T.unhex(digest),
        });
        if (res.ok) {
          replies.push(new Uint8Array(await res.arrayBuffer()));
          cals.push(c);
        } else err += c + ' ' + res.status + '; ';
      } catch (x) {
        err += c + ' ' + x.message + '; ';
      }
    }
    const ok = replies.length > 0;
    await e.DB.prepare(
      'INSERT INTO trace_anchors(day,digest,count,ots_b64,calendars,status,error,created_at) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(day) DO UPDATE SET digest=excluded.digest,count=excluded.count,ots_b64=excluded.ots_b64,calendars=excluded.calendars,status=excluded.status,error=excluded.error,created_at=excluded.created_at'
    )
      .bind(
        day,
        digest,
        hs.length,
        ok ? T.b64(T.otsFile(digest, replies)) : null,
        cals.join(' '),
        ok ? 'ok' : 'failed',
        err || null,
        new Date().toISOString()
      )
      .run();
    done.push({ day, count: hs.length, status: ok ? 'ok' : 'failed', error: err || undefined });
  }
  return { anchored: done };
}

// A few hours after stamping, the calendars can give the full path into a Bitcoin block. Swap
// each pending proof for the full one, so the .ots file checks without any calendar.
export async function traceUpgrade(e, fetchFn = fetch, now = new Date()) {
  await ready(e);
  const cut = new Date(now.getTime() - 3 * 3600e3).toISOString();
  const q = await e.DB.prepare(
    "SELECT day,ots_b64 FROM trace_anchors WHERE status='ok' AND ots_b64 IS NOT NULL AND created_at<? AND day NOT IN (SELECT day FROM trace_btc) ORDER BY day LIMIT 7"
  )
    .bind(cut)
    .all();
  const done = [];
  for (const a of q.results || []) {
    try {
      const u = await T.otsUpgrade(T.unb64(a.ots_b64), fetchFn);
      if (!u.changed || !u.bitcoin.length) {
        done.push({ day: a.day, bitcoin: false });
        continue;
      }
      const blocks = [...new Set(u.bitcoin)].sort((x, y) => x - y);
      await e.DB.batch([
        e.DB.prepare('UPDATE trace_anchors SET ots_b64=? WHERE day=?').bind(T.b64(u.file), a.day),
        e.DB.prepare('INSERT OR REPLACE INTO trace_btc(day,blocks,upgraded_at) VALUES(?,?,?)').bind(
          a.day,
          JSON.stringify(blocks),
          now.toISOString()
        ),
      ]);
      done.push({ day: a.day, bitcoin: true, blocks });
    } catch (x) {
      done.push({ day: a.day, bitcoin: false, error: x.message });
    }
  }
  return { upgraded: done };
}
