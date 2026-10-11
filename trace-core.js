// KoffyKraft (C) 2026 T M Thomas. AGPL-3.0 with additional terms (attribution, names): see NOTICE.
// Lot passport core: the same code runs in the browser, on the server and in the tests, so
// anyone can check a passport with exactly the rules used to make it.
//
// Each entry ("event") has a body: {v, lot, seq, prev, kind, at, key, data}.
//  - hash = SHA-256 of the body written in a fixed key order (canon), as hex.
//  - prev = hash of the entry before it in the same lot ("" for the first), so changing any
//    entry breaks every later link.
//  - sig  = ECDSA P-256 signature of the hash by the phone that wrote it (WebCrypto).
// Once a day all new hashes are listed, one per line, in a text file ("manifest"); the SHA-256
// of that file is stamped into Bitcoin through OpenTimestamps. Only hashes go public.
(function (G) {
  if (G.KKTRACE) return;
  const enc = new TextEncoder();
  const hex = b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
  const unhex = h => new Uint8Array((String(h).match(/../g) || []).map(x => parseInt(x, 16)));
  const b64 = b => {
    let s = '';
    for (const x of new Uint8Array(b)) s += String.fromCharCode(x);
    return btoa(s);
  };
  const unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
  const b64u = b => b64(b).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const unb64u = s => {
    s = String(s).replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    return unb64(s);
  };

  // Deterministic JSON: object keys sorted, undefined dropped, non-finite numbers as null.
  function canon(v) {
    if (v === null || v === undefined) return 'null';
    if (typeof v === 'number') return isFinite(v) ? JSON.stringify(v) : 'null';
    if (typeof v !== 'object') return JSON.stringify(v);
    if (Array.isArray(v)) return '[' + v.map(canon).join(',') + ']';
    return (
      '{' +
      Object.keys(v)
        .filter(k => v[k] !== undefined && typeof v[k] !== 'function')
        .sort()
        .map(k => JSON.stringify(k) + ':' + canon(v[k]))
        .join(',') +
      '}'
    );
  }
  async function sha(s) {
    return hex(await crypto.subtle.digest('SHA-256', typeof s === 'string' ? enc.encode(s) : s));
  }
  const BODY = ['v', 'lot', 'seq', 'prev', 'kind', 'at', 'key', 'data'];
  const pick = b => {
    const o = {};
    for (const k of BODY) o[k] = b[k];
    return o;
  };
  const hashBody = b => sha(canon(pick(b)));

  const ALG = { name: 'ECDSA', namedCurve: 'P-256' },
    SIG = { name: 'ECDSA', hash: 'SHA-256' };
  const pubOnly = j => ({ kty: j.kty, crv: j.crv, x: j.x, y: j.y });
  const keyId = async jwk => (await sha(canon(pubOnly(jwk)))).slice(0, 16);
  const importPub = jwk =>
    crypto.subtle.importKey('jwk', { ...pubOnly(jwk), ext: true }, ALG, true, ['verify']);
  async function newKey() {
    const k = await crypto.subtle.generateKey(ALG, false, ['sign', 'verify']);
    const jwk = pubOnly(await crypto.subtle.exportKey('jwk', k.publicKey));
    return { priv: k.privateKey, jwk, id: await keyId(jwk) };
  }
  const sign = async (priv, hash) => b64u(await crypto.subtle.sign(SIG, priv, enc.encode(hash)));
  async function verifySig(jwk, hash, sig) {
    try {
      return await crypto.subtle.verify(SIG, await importPub(jwk), unb64u(sig), enc.encode(hash));
    } catch (e) {
      return false;
    }
  }
  function validJwk(j) {
    return (
      !!j &&
      j.kty === 'EC' &&
      j.crv === 'P-256' &&
      /^[\w-]{43}$/.test(j.x || '') &&
      /^[\w-]{43}$/.test(j.y || '')
    );
  }

  // Sign a run of new entries after the given head. items: [{kind, data}]
  async function signRun(lot, head, key, items) {
    let seq = head.seq,
      prev = head.hash;
    const out = [];
    for (const it of items) {
      const body = {
        v: 1,
        lot,
        seq,
        prev,
        kind: it.kind,
        at: new Date().toISOString(),
        key: key.id,
        data: it.data,
      };
      const hash = await hashBody(body);
      out.push({ body, hash, sig: await sign(key.priv, hash) });
      prev = hash;
      seq++;
    }
    return out;
  }

  // Check a whole lot. events: [{hash, sig, body}] in order (body null = withdrawn); keys: {id: jwk}
  async function verifyChain(events, keys) {
    const out = [];
    let prev = '';
    for (let i = 0; i < events.length; i++) {
      const ev = events[i],
        b = ev.body;
      if (!b) {
        out.push({ withdrawn: true, ok: false });
        prev = ev.hash;
        continue;
      }
      const hashOk = (await hashBody(b)) === ev.hash;
      const linkOk = b.seq === i && b.prev === prev;
      const k = keys && keys[b.key];
      const sigOk = !!k && (await verifySig(k, ev.hash, ev.sig));
      out.push({ hashOk, linkOk, sigOk, ok: hashOk && linkOk && sigOk });
      prev = ev.hash;
    }
    return out;
  }

  // ---- daily public record ----
  const manifest = hashes => [...hashes].sort().join('\n') + '\n';
  // OpenTimestamps proof file for a digest, from one or more calendar replies (raw bytes).
  const OTS_MAGIC = '\x00OpenTimestamps\x00\x00Proof\x00\xbf\x89\xe2\xe8\x84\xe8\x92\x94';
  function otsFile(digestHex, replies) {
    const rs = (replies || []).filter(r => r && r.length && r[0] !== 0xff);
    const parts = [
      Uint8Array.from(OTS_MAGIC, c => c.charCodeAt(0)),
      Uint8Array.of(0x01, 0x08),
      unhex(digestHex),
    ];
    rs.forEach((r, i) => {
      if (i < rs.length - 1) parts.push(Uint8Array.of(0xff));
      parts.push(r);
    });
    const out = new Uint8Array(parts.reduce((a, p) => a + p.length, 0));
    let o = 0;
    for (const p of parts) {
      out.set(p, o);
      o += p.length;
    }
    return out;
  }

  // ---- weight check ----
  // Every party (A = the lot's owner, B, C... = buyers in order) may not send or roast more
  // than they hold. The owner holds the green weight; a buyer holds what they confirmed.
  function balance(events) {
    const n = x =>
      typeof x === 'number' && isFinite(x) ? x : x != null && x !== '' && isFinite(+x) ? +x : null;
    const rec = {},
      roasts = {},
      sent = {},
      got = {},
      cancelled = new Set();
    for (const ev of events) {
      const b = ev.body;
      if (!b) continue;
      const d = b.data || {},
        who = ev.party || 'A';
      if (b.kind === 'record') rec[d.rtype + ':' + d.rid] = d;
      if (b.kind === 'roast') roasts[d.rid] = { kg: n(d.kg && d.kg.green), who };
      if (b.kind === 'transfer') sent[d.tid] = { kg: n(d.kg), who };
      if (b.kind === 'receive') got[d.tid] = { kg: n(d.kg), who };
      if (b.kind === 'cancel') cancelled.add(d.tid);
    }
    const W = [],
      r2 = x => Math.round(x * 100) / 100,
      sum = a => a.reduce((s, x) => s + (x || 0), 0);
    const recs = Object.values(rec);
    const cherry = sum(recs.filter(d => d.rtype === 'harvest').map(d => n(d.kg && d.kg.cherry)));
    const greenRec = recs.find(d => d.rtype === 'green'),
      green = greenRec ? n(greenRec.kg && greenRec.kg.green) : null;
    const procRec = recs.find(d => d.rtype === 'process'),
      out = procRec ? n(procRec.kg && procRec.kg.out) : null;
    if (green && cherry && green > cherry)
      W.push(
        'Green weight (' + r2(green) + ' kg) is more than the cherry harvested (' + r2(cherry) + ' kg).'
      );
    if (green && out && green > out * 1.02)
      W.push('Green weight (' + r2(green) + ' kg) is more than the processing output (' + r2(out) + ' kg).');
    const parties = {};
    const P = w => parties[w] || (parties[w] = { held: 0, sent: 0, roasted: 0 });
    P('A').held = green || 0;
    for (const [tid, t] of Object.entries(sent)) {
      if (cancelled.has(tid)) continue;
      P(t.who).sent += t.kg || 0;
      const g = got[tid];
      if (g) {
        P(g.who).held += g.kg || 0;
        if (t.kg != null && g.kg != null && g.kg > t.kg * 1.01)
          W.push('Party ' + g.who + ' confirmed ' + r2(g.kg) + ' kg but only ' + r2(t.kg) + ' kg was sent.');
      }
    }
    for (const r of Object.values(roasts)) P(r.who).roasted += r.kg || 0;
    for (const [w, p] of Object.entries(parties)) {
      const used = p.sent + p.roasted;
      if ((w !== 'A' || green) && used > p.held * 1.01 + 0.001)
        W.push('Party ' + w + ' sent and roasted ' + r2(used) + ' kg but held only ' + r2(p.held) + ' kg.');
    }
    return { warnings: W, cherry: cherry || null, green, out, parties };
  }

  G.KKTRACE = {
    canon,
    sha,
    hex,
    unhex,
    b64,
    unb64,
    hashBody,
    keyId,
    newKey,
    sign,
    verifySig,
    validJwk,
    signRun,
    verifyChain,
    manifest,
    otsFile,
    balance,
  };
})(globalThis);
