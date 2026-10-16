// KoffyKraft (C) 2026 T M Thomas. AGPL-3.0 with additional terms (attribution, names): see NOTICE.
// Full PDF of the record on screen: every filled field, every heading, the notes and sums shown,
// repeated rows (logs, readings, people) one line each, and the record's photos. Read from the page
// as it stands, so unsaved edits are included. A "PDF" button joins every Save bar by itself.
// The PDF is written here, text and JPEG photos, no library and nothing sent anywhere.
/* global KKPHOTO, APP, qrcode */
const KKDOC = (() => {
  // ---------- reading the page ----------
  const vis = el => !!(el && el.getClientRects().length);
  const SKIP = 'nav,header,footer,.sticky,script,style,button,summary,[data-noprint],.kkdoc-skip,.sub';
  const CTRL = 'input,select,textarea';
  const fmtDate = (v, time) => {
    const d = new Date(time ? v : v + 'T00:00:00');
    if (isNaN(d)) return v;
    const s = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    return time ? s + ', ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : s;
  };
  function valueOf(c) {
    if ([...c.attributes].some(a => a.name.startsWith('data-ph-'))) return ''; // photo tools
    if (c.tagName === 'SELECT') {
      const o = c.selectedOptions && c.selectedOptions[0];
      return o && c.value !== '' && !/^__/.test(c.value) ? o.text.trim() : '';
    }
    const t = (c.type || '').toLowerCase();
    if (['button', 'submit', 'file', 'hidden', 'reset', 'image', 'range', 'color'].includes(t)) return '';
    if (t === 'checkbox' || t === 'radio') return c.checked ? 'Yes' : '';
    const v = String(c.value || '').trim();
    if (!v) return '';
    if (t === 'date') return fmtDate(v);
    if (t === 'datetime-local') return fmtDate(v, true);
    return v;
  }
  function labelText(l) {
    const k = l.cloneNode(true);
    k.querySelectorAll(CTRL + ',button,.sub,small,a,[data-noprint]').forEach(x => x.remove());
    return k.textContent.replace(/\s+/g, ' ').trim().replace(/[:*]$/, '');
  }
  // a repeated row: an ancestor (close to the field) marked with a numbered data attribute
  function rowOf(el, root) {
    let a = el.parentElement;
    for (let i = 0; a && a !== root && i < 4; i++, a = a.parentElement)
      for (const at of a.attributes) if (/^data-/.test(at.name) && /^\d+$/.test(at.value)) return a;
    return null;
  }
  const NOISE = /^(No one added yet|None yet|Nothing yet|Shrunk on this phone)/;
  // only worked-out sums and warnings; guidance text stays on screen
  const TEXTY = '#sum,#calc,#spore,.warn,.bad';
  function read(root) {
    root = root || document.querySelector('#view') || document.querySelector('main') || document.body;
    const h1 = root.querySelector('h1');
    const doc = { title: h1 ? h1.textContent.trim() : document.title, sections: [] };
    let sec = { title: '', items: [] };
    doc.sections.push(sec);
    const newSec = t => {
      sec = { title: t, items: [] };
      doc.sections.push(sec);
    };
    const rows = new Map();
    const done = new Set();
    const walk = el => {
      for (const c of el.children) {
        if (c.matches(SKIP) || done.has(c)) continue;
        if (!vis(c) && !c.matches('img[data-kkp]')) continue;
        if (c.tagName === 'H1') continue;
        if (c.tagName === 'H2') {
          newSec(c.textContent.trim());
          continue;
        }
        if (/^H[3-6]$/.test(c.tagName)) {
          sec.items.push({ t: 'h', v: c.textContent.trim() });
          continue;
        }
        if (c.matches('img[data-kkp]')) {
          sec.items.push({ t: 'img', id: c.dataset.kkp });
          continue;
        }
        if (c.tagName === 'LABEL' && c.querySelector(CTRL)) {
          const ctl = [...c.querySelectorAll(CTRL)].filter(vis);
          const v = ctl.map(valueOf).filter(Boolean).join(' ');
          const k = labelText(c);
          const row = rowOf(c, root);
          if (row) {
            let r = rows.get(row);
            if (!r) {
              r = { t: 'row', parts: [] };
              rows.set(row, r);
              sec.items.push(r);
            }
            if (v) r.parts.push(k ? k + ' ' + v : v);
          } else if (v && k && v !== doc.title) sec.items.push({ t: 'kv', k, v });
          continue;
        }
        if (c.matches(CTRL)) {
          const v = valueOf(c);
          if (!v) continue;
          const row = rowOf(c, root);
          if (!row && c.tagName !== 'TEXTAREA') continue;
          const k = c.getAttribute('aria-label') || c.getAttribute('placeholder') || '';
          if (row) {
            let r = rows.get(row);
            if (!r) {
              r = { t: 'row', parts: [] };
              rows.set(row, r);
              sec.items.push(r);
            }
            r.parts.push(v);
          } else sec.items.push({ t: 'kv', k: c.tagName === 'TEXTAREA' ? 'Notes' : '', v });
          continue;
        }
        if (c.matches(TEXTY) && !c.querySelector(CTRL + ',button,img[data-kkp],h2,label')) {
          const v = c.innerText.replace(/\n{2,}/g, '\n').trim();
          if (v && !NOISE.test(v)) sec.items.push({ t: 'p', v });
          continue;
        }
        walk(c);
      }
    };
    walk(root);
    return tidy(doc);
  }
  function tidy(doc) {
    doc.sections = doc.sections
      .map(s => {
        const it = s.items.filter(i => i.t !== 'row' || i.parts.length);
        return { ...s, items: it.filter((i, n) => i.t !== 'h' || (it[n + 1] && it[n + 1].t !== 'h')) };
      })
      .filter(s => s.items.length);
    return doc;
  }
  // A page can hand over its record as data instead (window.KKDOC_DATA, async, returning the
  // share-card shape: title, sub, date, chips, rows [[label, value]], sections [{title, rows,
  // photos, series}], notes, photos). Readings become a table, series a small chart.
  function fromData(d) {
    const doc = {
      title: d.title || '',
      sub: [d.kind, d.sub, d.date, ...(d.chips || [])].filter(Boolean).join(' · '),
      purpose: d.purpose || '',
      intro: d.intro || '',
      stats: (d.stats || []).filter(x => x && x[1] !== '' && x[1] != null),
      flags: (d.flags || []).filter(Boolean),
      qr: d.qr || '',
      qrNote: d.qrNote || '',
      hero: d.hero || '',
      footnote: d.footnote || '',
      sections: [],
    };
    const items = (rows, photos, series) => {
      const out = [];
      let rd = null;
      for (const [k, v] of rows || []) {
        if (k === '\u00a7pics' || v == null || v === '' || typeof v === 'object') continue;
        if (k === '\u00a7') {
          out.push({ t: 'h', v: String(v) });
          continue;
        }
        if (k === 'Reading') {
          const m = String(v).split(' \u00b7 ');
          if (!rd) out.push((rd = { t: 'rd', rows: [] }));
          rd.rows.push(
            m.length > 1 && /\d:\d\d/.test(m[0]) ? [m[0], m.slice(1).join(' \u00b7 ')] : ['', String(v)]
          );
          continue;
        }
        rd = null;
        out.push({ t: 'kv', k: String(k), v: String(v) });
      }
      const at = out.findIndex(i => i.t === 'rd');
      (series || []).forEach(sr => {
        if (sr.pts && sr.pts.length > 1) out.splice(at < 0 ? out.length : at, 0, { t: 'chart', ...sr });
      });
      (photos || []).forEach(p => out.push({ t: 'img', id: p.id || p }));
      return out;
    };
    doc.sections.push({ title: '', items: items(d.rows, d.photos) });
    if (d.notes && !d.purpose) doc.sections[0].items.push({ t: 'kv', k: 'Notes', v: d.notes });
    (d.sections || []).forEach(s => {
      const it = [];
      if (s.text) it.push({ t: 'p', v: s.text });
      it.push(...items(s.rows, null, s.series));
      if (s.table && s.table.rows && s.table.rows.length) it.push({ t: 'table', ...s.table });
      if (s.after) it.push({ t: 'p', v: s.after });
      (s.photos || []).forEach(p => it.push({ t: 'img', id: p.id || p }));
      doc.sections.push({ title: s.title, items: it });
    });
    if (d.notes && d.purpose) doc.sections.push({ title: 'Notes', items: [{ t: 'p', v: d.notes }] });
    return tidy(doc);
  }

  // ---------- writing the PDF ----------
  // WinAnsi: Latin-1 as is, and the few curly quotes and dashes that live in 0x80-0x9F
  const W1252 = {
    0x20ac: 0x80,
    0x201a: 0x82,
    0x0192: 0x83,
    0x201e: 0x84,
    0x2026: 0x85,
    0x2020: 0x86,
    0x2021: 0x87,
    0x02c6: 0x88,
    0x2030: 0x89,
    0x0160: 0x8a,
    0x2039: 0x8b,
    0x0152: 0x8c,
    0x017d: 0x8e,
    0x2018: 0x91,
    0x2019: 0x92,
    0x201c: 0x93,
    0x201d: 0x94,
    0x2022: 0x95,
    0x2013: 0x96,
    0x2014: 0x97,
    0x02dc: 0x98,
    0x2122: 0x99,
    0x0161: 0x9a,
    0x203a: 0x9b,
    0x0153: 0x9c,
    0x017e: 0x9e,
    0x0178: 0x9f,
  };
  const ALT = { '→': '->', '←': '<-', '≤': '<=', '≥': '>=', '≈': '~', ' ': ' ', ' ': ' ', ' ': ' ' };
  function ansi(s) {
    let o = '';
    for (const ch of String(s)) {
      if (ALT[ch]) {
        o += ALT[ch];
        continue;
      }
      const c = ch.codePointAt(0);
      if (c === 10 || (c >= 32 && c < 127) || (c >= 0xa0 && c <= 0xff)) o += ch;
      else if (W1252[c]) o += String.fromCharCode(W1252[c]);
      else if (c >= 0x1f000 || (c >= 0x2600 && c <= 0x27bf) || c === 0xfe0f)
        continue; // emoji
      else o += '?';
    }
    return o;
  }
  // widths from the browser's Arial, which shares Helvetica's metrics
  let mctx;
  const MCH = {
    0x80: '€',
    0x85: '…',
    0x91: '‘',
    0x92: '’',
    0x93: '“',
    0x94: '”',
    0x95: '•',
    0x96: '–',
    0x97: '—',
    0x9b: '›',
  };
  function width(s, size, bold) {
    if (!mctx) mctx = document.createElement('canvas').getContext('2d');
    mctx.font = (bold ? 'bold ' : '') + '100px Helvetica, Arial, sans-serif';
    const u = [...s].map(c => MCH[c.charCodeAt(0)] || c).join('');
    return (mctx.measureText(u).width * size) / 100;
  }
  function wrap(s, size, maxW, bold) {
    const out = [];
    for (const para of ansi(s).split('\n')) {
      let line = '';
      for (const w of para.split(/ +/)) {
        const t = line ? line + ' ' + w : w;
        if (width(t, size, bold) <= maxW || !line) {
          if (width(t, size, bold) > maxW && !line) {
            // one long word: break it
            let cut = w;
            while (cut.length > 1 && width(cut, size, bold) > maxW) cut = cut.slice(0, -1);
            out.push(cut);
            line = w.slice(cut.length);
          } else line = t;
        } else {
          out.push(line);
          line = w;
        }
      }
      out.push(line);
    }
    return out;
  }
  const esc = s => s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  const rgb = c => {
    const m = String(c || '').match(/\d+(\.\d+)?/g);
    return m && m.length >= 3
      ? m
          .slice(0, 3)
          .map(x => (x / 255).toFixed(3))
          .join(' ')
      : '0.6 0.42 0.12';
  };
  async function jpeg(id) {
    if (typeof KKPHOTO === 'undefined') return null;
    const u = (await KKPHOTO.url(id, 'f')) || (await KKPHOTO.url(id, 't'));
    if (!u) return null;
    const im = new Image();
    im.src = u;
    await im.decode().catch(() => null);
    if (!im.naturalWidth) return null;
    const k = Math.min(1, 1400 / Math.max(im.naturalWidth, im.naturalHeight));
    const c = document.createElement('canvas');
    c.width = Math.round(im.naturalWidth * k);
    c.height = Math.round(im.naturalHeight * k);
    c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
    const b = atob(c.toDataURL('image/jpeg', 0.85).split(',')[1]);
    const bytes = new Uint8Array(b.length);
    for (let i = 0; i < b.length; i++) bytes[i] = b.charCodeAt(i);
    return { bytes, w: c.width, h: c.height };
  }

  const KKDOC_r1 = v => String(Math.round(v * 10) / 10);
  async function build(doc, opt) {
    opt = opt || {};
    doc = { stats: [], flags: [], ...doc };
    const PW = 595.28,
      PH = 841.89,
      M = 42,
      CW = PW - 2 * M,
      KW = 150;
    const accent = rgb(opt.accent);
    const pages = [];
    let ops, y;
    const imgs = [];
    const page = () => {
      ops = [];
      pages.push(ops);
      y = PH - M;
    };
    const need = h => {
      if (y - h < M + 24) page();
    };
    const text = (x, yy, s, size, bold, col) =>
      ops.push(
        'BT /' +
          (bold ? 'F2' : 'F1') +
          ' ' +
          size +
          ' Tf ' +
          (col || '0.12 0.11 0.1') +
          ' rg ' +
          x.toFixed(2) +
          ' ' +
          yy.toFixed(2) +
          ' Td (' +
          esc(s) +
          ') Tj ET'
      );
    const rule = (yy, col, w) =>
      ops.push(
        (col || '0.85 0.83 0.8') +
          ' RG ' +
          (w || 0.6) +
          ' w ' +
          M +
          ' ' +
          yy.toFixed(2) +
          ' m ' +
          (PW - M) +
          ' ' +
          yy.toFixed(2) +
          ' l S'
      );
    page();
    // heading
    const top = ansi((opt.app || '') + (doc.purpose ? '   |   ' + doc.purpose.toUpperCase() : ''));
    text(M, y - 9, top, 9, true, accent);
    const when = fmtDate(new Date().toISOString(), true);
    text(
      PW - M - width(ansi('Exported ' + when), 9),
      y - 9,
      ansi('Exported ' + when),
      9,
      false,
      '0.45 0.43 0.4'
    );
    y -= 20;
    // the passport QR sits top right; the title wraps beside it
    const QS = 78,
      TW = doc.qr ? CW - QS - 14 : CW,
      yTop = y;
    if (doc.qr && typeof qrcode !== 'undefined') {
      try {
        const q = qrcode(0, 'M');
        q.addData(doc.qr);
        q.make();
        const n = q.getModuleCount(),
          c = QS / n,
          x0 = PW - M - QS;
        let path = '0.1 0.1 0.1 rg';
        for (let r = 0; r < n; r++)
          for (let k = 0; k < n; k++)
            if (q.isDark(r, k))
              path +=
                ' ' +
                (x0 + k * c).toFixed(2) +
                ' ' +
                (yTop - (r + 1) * c).toFixed(2) +
                ' ' +
                (c + 0.05).toFixed(2) +
                ' ' +
                (c + 0.05).toFixed(2) +
                ' re';
        ops.push(path + ' f');
        const qn = wrap(doc.qrNote || 'Scan for the signed record', 7.5, QS + 10);
        qn.forEach((l, i) => text(PW - M - QS, yTop - QS - 10 - i * 9, l, 7.5, false, '0.45 0.43 0.4'));
      } catch (e) {}
    }
    for (const l of wrap(doc.title || 'Record', 22, TW, true)) {
      need(28);
      text(M, y - 20, l, 22, true);
      y -= 27;
    }
    if (opt.sub || doc.sub) {
      for (const l of wrap(opt.sub || doc.sub, 10, TW)) {
        text(M, y - 9, l, 10, false, '0.45 0.43 0.4');
        y -= 13;
      }
    }
    if (doc.intro) {
      y -= 6;
      for (const l of wrap(doc.intro, 11, TW)) {
        text(M, y - 11, l, 11, false, '0.2 0.19 0.18');
        y -= 15;
      }
    }
    if (doc.qr) y = Math.min(y, yTop - QS - 26);
    y -= 4;
    rule(y, accent, 1.2);
    y -= 12;
    const LH = 13.5;
    if (doc.hero) {
      const g = await jpeg(doc.hero);
      if (g) {
        let w = CW,
          h = (g.h / g.w) * w;
        if (h > 250) {
          h = 250;
          w = (g.w / g.h) * h;
        }
        need(h + 10);
        const n = imgs.push({ ...g });
        ops.push(
          'q ' +
            w.toFixed(2) +
            ' 0 0 ' +
            h.toFixed(2) +
            ' ' +
            M +
            ' ' +
            (y - h).toFixed(2) +
            ' cm /Im' +
            n +
            ' Do Q'
        );
        y -= h + 12;
      }
    }
    // key figures as tiles, four to a row
    if (doc.stats.length) {
      const per = Math.min(4, doc.stats.length),
        gap = 8,
        tw = (CW - gap * (per - 1)) / per,
        th = 44;
      for (let i = 0; i < doc.stats.length; i += per) {
        need(th + 8);
        doc.stats.slice(i, i + per).forEach(([k, v], j) => {
          const x = M + j * (tw + gap);
          ops.push(
            '0.965 0.955 0.935 rg ' +
              x.toFixed(2) +
              ' ' +
              (y - th).toFixed(2) +
              ' ' +
              tw.toFixed(2) +
              ' ' +
              th +
              ' re f'
          );
          ops.push(accent + ' rg ' + x.toFixed(2) + ' ' + (y - th).toFixed(2) + ' 2.5 ' + th + ' re f');
          const vv = wrap(String(v), 14, tw - 14, true)[0] || '';
          text(x + 9, y - 20, vv, 14, true);
          text(x + 9, y - 35, wrap(String(k), 8, tw - 14)[0] || '', 8, false, '0.45 0.43 0.4');
        });
        y -= th + 8;
      }
      y -= 4;
    }
    // problems worth knowing, in a tinted box
    if (doc.flags.length) {
      const ls = doc.flags.map(f => wrap(f, 9.5, CW - 26));
      const h = ls.reduce((a, l) => a + l.length * 12.5, 0) + 14;
      need(Math.min(h, 200));
      ops.push('0.99 0.94 0.92 rg ' + M + ' ' + (y - h).toFixed(2) + ' ' + CW + ' ' + h.toFixed(2) + ' re f');
      ops.push('0.71 0.26 0.18 rg ' + M + ' ' + (y - h).toFixed(2) + ' 2.5 ' + h.toFixed(2) + ' re f');
      let yy = y - 7;
      ls.forEach(l =>
        l.forEach((t, i) => {
          if (!i) text(M + 10, yy - 9.5, ansi('!'), 9.5, true, '0.71 0.26 0.18');
          text(M + 20, yy - 9.5, t, 9.5, false, '0.35 0.13 0.09');
          yy -= 12.5;
        })
      );
      y -= h + 10;
    }
    let pics = [];
    const flushPics = async () => {
      if (!pics.length) return;
      const got = (await Promise.all(pics.map(jpeg))).filter(Boolean);
      pics = [];
      const cols = 3,
        gap = 10,
        cw = (CW - gap * (cols - 1)) / cols;
      for (let i = 0; i < got.length; i += cols) {
        const row = got.slice(i, i + cols).map(g => {
          let w = cw,
            h = (g.h / g.w) * w;
          if (h > 170) {
            h = 170;
            w = (g.w / g.h) * h;
          }
          return { ...g, dw: w, dh: h };
        });
        const rh = Math.max(...row.map(r => r.dh));
        need(rh + 8);
        row.forEach((r, j) => {
          const n = imgs.push(r);
          ops.push(
            'q ' +
              r.dw.toFixed(2) +
              ' 0 0 ' +
              r.dh.toFixed(2) +
              ' ' +
              (M + j * (cw + gap)).toFixed(2) +
              ' ' +
              (y - r.dh).toFixed(2) +
              ' cm /Im' +
              n +
              ' Do Q'
          );
        });
        y -= rh + 8;
      }
    };
    for (const s of doc.sections) {
      if (s.title) {
        await flushPics();
        need(40);
        y -= 8;
        text(M, y - 11, ansi(s.title.toUpperCase()), 10.5, true, accent);
        y -= 16;
        rule(y + 2);
        y -= 4;
      }
      for (const it of s.items) {
        if (it.t === 'img') {
          pics.push(it.id);
          continue;
        }
        await flushPics();
        if (it.t === 'h') {
          need(22);
          y -= 4;
          text(M, y - 10, ansi(it.v), 11, true);
          y -= 16;
        } else if (it.t === 'kv') {
          const kl = it.k ? wrap(it.k, 9.5, KW - 8) : [];
          const vl = wrap(it.v, 10, it.k ? CW - KW : CW);
          const n = Math.max(kl.length, vl.length);
          need(Math.min(n, 3) * LH);
          for (let i = 0; i < n; i++) {
            need(LH);
            if (kl[i]) text(M, y - 10, kl[i], 9.5, false, '0.45 0.43 0.4');
            if (vl[i]) text(it.k ? M + KW : M, y - 10, vl[i], 10, false);
            y -= LH;
          }
          y -= 2;
        } else if (it.t === 'rd') {
          // one measure throughout: its name goes in the heading, the numbers alone in the rows
          const one = it.rows.map(r => r[1].match(/^(.+?) (-?[\d.]+)$/));
          const same = one.every(m => m && m[1] === one[0][1]);
          if (same) it.rows = it.rows.map((r, i) => [r[0], one[i][2]]);
          need(LH * 2);
          y -= 2;
          text(M, y - 9, ansi(same ? 'Readings, ' + one[0][1] : 'Readings'), 9, true, '0.45 0.43 0.4');
          y -= LH;
          it.rows.forEach((r, i) => {
            need(LH);
            if (i % 2 === 0)
              ops.push(
                '0.96 0.95 0.93 rg ' + M + ' ' + (y - LH + 2).toFixed(2) + ' ' + CW + ' ' + LH + ' re f'
              );
            text(M + 4, y - 9.5, ansi(r[0]), 9, false, '0.45 0.43 0.4');
            text(M + KW, y - 9.5, wrap(r[1], 9.5, CW - KW)[0] || '', 9.5, false);
            y -= LH;
          });
          y -= 6;
        } else if (it.t === 'chart') {
          const H = 96;
          need(H + 30);
          const xs = it.pts.map(p => p[0]),
            ys = it.pts.map(p => p[1]);
          const x0 = Math.min(...xs),
            x1 = Math.max(...xs);
          const lim = [...(it.lines || []), ...(it.line != null ? [it.line] : [])];
          const oys = (it.also || []).flatMap(a => a.pts.map(p => p[1]));
          let y0 = Math.min(...ys, ...oys, ...lim),
            y1 = Math.max(...ys, ...oys, ...lim);
          if (y1 - y0 < 1) {
            y0 -= 0.5;
            y1 += 0.5;
          }
          const pad = (y1 - y0) * 0.12;
          y0 -= pad;
          y1 += pad;
          const L = M + 34,
            R = PW - M - 4,
            T = y - 16,
            B = T - H;
          text(
            M,
            y - 10,
            ansi(it.label + '  ' + KKDOC_r1(Math.min(...ys)) + ' to ' + KKDOC_r1(Math.max(...ys))),
            9,
            true
          );
          const px = t => L + (x1 > x0 ? ((t - x0) / (x1 - x0)) * (R - L) : (R - L) / 2),
            py = v => B + ((v - y0) / (y1 - y0)) * H;
          ops.push(
            '0.85 0.83 0.8 RG 0.5 w ' + L + ' ' + B.toFixed(2) + ' m ' + R + ' ' + B.toFixed(2) + ' l S'
          );
          ops.push(
            '0.85 0.83 0.8 RG 0.5 w ' + L + ' ' + B.toFixed(2) + ' m ' + L + ' ' + T.toFixed(2) + ' l S'
          );
          text(M, py(y1 - pad) - 3, KKDOC_r1(y1 - pad), 7.5, false, '0.45 0.43 0.4');
          text(M, py(y0 + pad) - 3, KKDOC_r1(y0 + pad), 7.5, false, '0.45 0.43 0.4');
          lim.forEach(v => {
            ops.push(
              '[3 3] 0 d 0.85 0.55 0.1 RG 0.7 w ' +
                L +
                ' ' +
                py(v).toFixed(2) +
                ' m ' +
                R +
                ' ' +
                py(v).toFixed(2) +
                ' l S [] 0 d'
            );
            text(R - width(KKDOC_r1(v), 7) - 1, py(v) + 2, KKDOC_r1(v), 7, false, '0.75 0.45 0.1');
          });
          (it.also || []).forEach(a => {
            const pp = a.pts.filter(p => p[0] >= x0 && p[0] <= x1);
            if (pp.length > 1)
              ops.push(
                '0.62 0.6 0.57 RG 0.9 w ' +
                  pp
                    .map((p, i) => px(p[0]).toFixed(2) + ' ' + py(p[1]).toFixed(2) + (i ? ' l' : ' m'))
                    .join(' ') +
                  ' S'
              );
          });
          if ((it.also || []).length) {
            const lg = ansi(it.label + ' (colour)   ' + it.also.map(a => a.label + ' (grey)').join('   '));
            text(R - width(lg, 7.5), y - 10, lg, 7.5, false, '0.45 0.43 0.4');
          }
          ops.push(
            accent +
              ' RG 1.4 w ' +
              it.pts
                .map((p, i) => px(p[0]).toFixed(2) + ' ' + py(p[1]).toFixed(2) + (i ? ' l' : ' m'))
                .join(' ') +
              ' S'
          );
          it.pts.forEach(p =>
            ops.push(
              accent +
                ' rg ' +
                (px(p[0]) - 1.6).toFixed(2) +
                ' ' +
                (py(p[1]) - 1.6).toFixed(2) +
                ' 3.2 3.2 re f'
            )
          );
          const d0 = fmtDate(new Date(x0).toISOString(), true),
            d1 = fmtDate(new Date(x1).toISOString(), true);
          text(L, B - 10, ansi(d0), 7.5, false, '0.45 0.43 0.4');
          text(R - width(ansi(d1), 7.5), B - 10, ansi(d1), 7.5, false, '0.45 0.43 0.4');
          y = B - 20;
        } else if (it.t === 'table') {
          const n = it.head.length,
            w = it.w || it.head.map(() => 1),
            tot = w.reduce((a, b) => a + b, 0),
            cw = w.map(v => (v / tot) * CW),
            xs = cw.map((_, i) => M + cw.slice(0, i).reduce((a, b) => a + b, 0));
          const head = () => {
            need(LH + 4);
            it.head.forEach((h, i) =>
              text(xs[i] + 4, y - 9.5, wrap(h, 8, cw[i] - 6, true)[0] || '', 8, true, '0.45 0.43 0.4')
            );
            y -= LH;
            rule(y + 2);
          };
          head();
          it.rows.forEach((r, ri) => {
            const cells = r.map((c, i) => wrap(String(c == null ? '' : c), 9, cw[i] - 8));
            const h = Math.max(1, ...cells.map(c => c.length)) * 11.5 + 3;
            if (y - h < M + 24) {
              page();
              head();
            }
            if (ri % 2 === 1)
              ops.push(
                '0.965 0.955 0.935 rg ' +
                  M +
                  ' ' +
                  (y - h).toFixed(2) +
                  ' ' +
                  CW +
                  ' ' +
                  h.toFixed(2) +
                  ' re f'
              );
            const hot = it.mark && it.mark(r);
            cells.forEach((c, i) =>
              c.forEach((l, j) =>
                text(
                  xs[i] + 4,
                  y - 9.5 - j * 11.5,
                  l,
                  9,
                  hot && i === it.markCol,
                  hot && i === it.markCol ? '0.71 0.26 0.18' : ''
                )
              )
            );
            y -= h;
          });
          y -= 8;
        } else if (it.t === 'row') {
          const ls = wrap(it.parts.join('  ·  '), 9.5, CW - 12);
          ls.forEach((l, i) => {
            need(LH);
            if (!i) text(M, y - 10, ansi('•'), 9.5, false, accent);
            text(M + 12, y - 10, l, 9.5, false);
            y -= LH - 1;
          });
          y -= 3;
        } else if (it.t === 'p') {
          for (const l of wrap(it.v, 9.5, CW)) {
            need(LH);
            text(M, y - 10, l, 9.5, false, '0.25 0.24 0.22');
            y -= LH - 1;
          }
          y -= 5;
        }
      }
    }
    await flushPics();
    if (doc.footnote) {
      y -= 6;
      need(30);
      rule(y);
      y -= 4;
      for (const l of wrap(doc.footnote, 8, CW)) {
        need(11);
        text(M, y - 8, l, 8, false, '0.45 0.43 0.4');
        y -= 10.5;
      }
    }
    // footers
    const foot = ansi(opt.foot || location.host);
    pages.forEach((o, i) => {
      ops = o;
      rule(M + 4);
      text(M, M - 8, foot, 8, false, '0.45 0.43 0.4');
      const pn = 'Page ' + (i + 1) + ' of ' + pages.length;
      text(PW - M - width(pn, 8), M - 8, pn, 8, false, '0.45 0.43 0.4');
    });

    // assemble
    const chunks = [];
    let len = 0;
    const offs = [];
    const put = x => {
      const b = typeof x === 'string' ? Uint8Array.from(x, c => c.charCodeAt(0) & 255) : x;
      chunks.push(b);
      len += b.length;
    };
    const obj = (n, body) => {
      offs[n] = len;
      put(n + ' 0 obj\n');
      if (Array.isArray(body)) body.forEach(put);
      else put(body);
      put('\nendobj\n');
    };
    put('%PDF-1.4\n%\xe2\xe3\xcf\xd3\n');
    const nImg = imgs.length;
    const first = 5 + nImg; // page objects start here: page, content, page, content…
    const kids = pages.map((_, i) => first + i * 2 + ' 0 R').join(' ');
    obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
    obj(2, '<< /Type /Pages /Count ' + pages.length + ' /Kids [' + kids + '] >>');
    obj(3, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
    obj(4, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
    imgs.forEach((g, i) =>
      obj(5 + i, [
        '<< /Type /XObject /Subtype /Image /Width ' +
          g.w +
          ' /Height ' +
          g.h +
          ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' +
          g.bytes.length +
          ' >>\nstream\n',
        g.bytes,
        '\nendstream',
      ])
    );
    const xo = nImg
      ? ' /XObject << ' + imgs.map((_, i) => '/Im' + (i + 1) + ' ' + (5 + i) + ' 0 R').join(' ') + ' >>'
      : '';
    pages.forEach((o, i) => {
      const n = first + i * 2;
      obj(
        n,
        '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' +
          PW +
          ' ' +
          PH +
          '] /Resources << /Font << /F1 3 0 R /F2 4 0 R >>' +
          xo +
          ' >> /Contents ' +
          (n + 1) +
          ' 0 R >>'
      );
      const s = o.join('\n');
      obj(n + 1, '<< /Length ' + s.length + ' >>\nstream\n' + s + '\nendstream');
    });
    const total = first + pages.length * 2;
    const xref = len;
    let x = 'xref\n0 ' + total + '\n0000000000 65535 f \n';
    for (let i = 1; i < total; i++) x += String(offs[i]).padStart(10, '0') + ' 00000 n \n';
    put(
      x +
        'trailer\n<< /Size ' +
        total +
        ' /Root 1 0 R /Info << /Title (' +
        esc(ansi(doc.title || '')) +
        ') /Producer (KoffyKraft) >> >>\nstartxref\n' +
        xref +
        '\n%%EOF\n'
    );
    return new Blob(chunks, { type: 'application/pdf' });
  }

  async function deliver(blob, name) {
    const file = new File([blob], name, { type: 'application/pdf' });
    try {
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: name });
        return;
      }
    } catch (e) {
      if (e && e.name === 'AbortError') return;
    }
    const u = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = u;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(u), 60000);
  }

  // who the PDF is for, when the page offers more than one design (window.KKDOC_VIEWS)
  function choose() {
    const V = window.KKDOC_VIEWS;
    if (!Array.isArray(V) || !V.length) return Promise.resolve(null);
    return new Promise(res => {
      const bg = document.createElement('div');
      bg.style.cssText =
        'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9999;display:flex;align-items:flex-end;justify-content:center';
      const box = document.createElement('div');
      box.style.cssText =
        'background:var(--bg,#fff);color:inherit;width:100%;max-width:520px;border-radius:16px 16px 0 0;padding:16px 16px 22px;box-shadow:0 -4px 20px rgba(0,0,0,.2)';
      box.innerHTML =
        '<b style="font-size:17px">Who is this PDF for?</b>' +
        V.map(
          v =>
            '<button type="button" data-v="' +
            v.key +
            '" style="display:block;width:100%;text-align:left;margin-top:10px;padding:12px 14px;border-radius:12px;border:1px solid rgba(0,0,0,.15);background:transparent;color:inherit;font:inherit"><b>' +
            v.label +
            '</b><div style="font-size:13px;opacity:.75;margin-top:2px">' +
            v.desc +
            '</div></button>'
        ).join('') +
        '<button type="button" data-v="" style="margin-top:12px;padding:10px 14px;border-radius:12px;border:0;background:transparent;color:inherit;font:inherit;opacity:.7">Cancel</button>';
      bg.appendChild(box);
      document.body.appendChild(bg);
      bg.onclick = e => {
        const b = e.target.closest('[data-v]');
        if (!b && e.target !== bg) return;
        bg.remove();
        res(b ? b.dataset.v || false : false);
      };
    });
  }
  async function exportPage(btn) {
    const view = await choose();
    if (view === false) return;
    const t = btn && btn.textContent;
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Making PDF…';
    }
    try {
      const dd = typeof window.KKDOC_DATA === 'function' ? await window.KKDOC_DATA(view) : null;
      const doc = dd ? fromData(dd) : read();
      const app = (typeof APP !== 'undefined' && APP.name) || document.title.split(/[·|]/).pop().trim();
      const save = document.getElementById('save');
      const blob = await build(doc, {
        app,
        accent: save ? getComputedStyle(save).backgroundColor : '',
      });
      const vw = (window.KKDOC_VIEWS || []).find(v => v.key === view);
      const name =
        (doc.title || 'record') +
        (vw ? ' ' + vw.label : '')
          .replace(/[^\w\- ]+/g, '')
          .trim()
          .replace(/\s+/g, '-')
          .slice(0, 60) +
        '-' +
        new Date().toISOString().slice(0, 10) +
        '.pdf';
      await deliver(blob, name);
    } catch (e) {
      alert('Could not make the PDF: ' + (e && e.message ? e.message : e));
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = t;
      }
    }
  }

  // add a PDF button beside every Save
  function attach() {
    const s = document.getElementById('save');
    if (!s || s.parentElement.querySelector('.kkdoc-btn')) return;
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn kkdoc-btn';
    b.textContent = 'PDF';
    b.title = 'Full PDF of everything on this page';
    b.onclick = e => {
      e.preventDefault();
      exportPage(b);
    };
    s.insertAdjacentElement('afterend', b);
  }
  if (typeof document !== 'undefined' && typeof MutationObserver !== 'undefined') {
    const go = () => {
      attach();
      new MutationObserver(attach).observe(document.body, { childList: true, subtree: true });
    };
    if (document.body) go();
    else document.addEventListener('DOMContentLoaded', go);
  }
  return { read, fromData, build, exportPage, ansi };
})();
