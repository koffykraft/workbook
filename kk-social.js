// KoffyKraft (C) 2026 T M Thomas. AGPL-3.0 with additional terms (attribution, names): see NOTICE.
// Images for Instagram and Facebook, drawn from the record itself. Three looks, each built on
// something real from the work, never on decoration:
//   plate     the record's own curve drawn large, like a plate in a field journal
//   specimen  the record's photo turned to halftone ink, with a museum-style specimen label
//   figure    one number that matters, set huge in outline, with the ledger beneath
// Post 1080 x 1350 (4:5) or Story 1080 x 1920 (9:16). A page offers it by setting
// window.KKSOCIAL_DATA = async () => ({ kicker, code, title, line, facts:[[k,v]], series:{pts,
// label, lines}, photo, hero:{v, unit, label}, maker, url, date }). Drawn here; nothing is sent.
/* global KKPHOTO */
const KKSOCIAL = (() => {
  const SERIF =
    '"Didot","Bodoni 72","Bodoni MT","Baskerville","Libre Baskerville",Georgia,"Times New Roman",serif';
  const MONO = '"Menlo","SF Mono","Courier New",ui-monospace,monospace';
  const PAPER = '#ece5d7',
    INK = '#1b1712',
    RED = '#b4432f';
  // a small seeded random, so the same record always draws the same grain
  const rnd = seed => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const seedOf = s =>
    [...String(s || 'kk')].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 2147483647, 7) || 7;

  function grain(x, W, H, seed, dark) {
    const r = rnd(seed);
    x.save();
    for (let i = 0; i < (W * H) / 260; i++) {
      x.globalAlpha = 0.04 + r() * 0.07;
      x.fillStyle = dark ? (r() > 0.5 ? '#fff' : '#000') : r() > 0.3 ? '#5a4a36' : '#fff';
      const s = r() * 2.2 + 0.4;
      x.fillRect(r() * W, r() * H, s, s);
    }
    x.restore();
  }
  function marks(x, W, H, col) {
    x.save();
    x.strokeStyle = col;
    x.globalAlpha = 0.45;
    x.lineWidth = 1.5;
    for (const [cx, cy] of [
      [34, 34],
      [W - 34, 34],
      [34, H - 34],
      [W - 34, H - 34],
    ]) {
      x.beginPath();
      x.arc(cx, cy, 9, 0, Math.PI * 2);
      x.moveTo(cx - 16, cy);
      x.lineTo(cx + 16, cy);
      x.moveTo(cx, cy - 16);
      x.lineTo(cx, cy + 16);
      x.stroke();
    }
    x.restore();
  }
  function lines(x, text, maxW) {
    const out = [];
    for (const para of String(text || '').split('\n')) {
      let l = '';
      for (const w of para.split(/\s+/)) {
        const t = l ? l + ' ' + w : w;
        if (x.measureText(t).width > maxW && l) {
          out.push(l);
          l = w;
        } else l = t;
      }
      if (l) out.push(l);
    }
    return out;
  }
  // biggest serif size (up to max) that fits the text in n lines
  function fit(x, text, maxW, max, min, n, weight) {
    for (let s = max; s >= min; s -= 4) {
      x.font = (weight || '') + ' ' + s + 'px ' + SERIF;
      const l = lines(x, text, maxW);
      if (l.length <= n) return { s, l };
    }
    x.font = (weight || '') + ' ' + min + 'px ' + SERIF;
    return { s: min, l: lines(x, text, maxW).slice(0, n) };
  }
  const caps = (x, t, X, Y, size, col, align, spacing) => {
    x.save();
    x.font = size + 'px ' + MONO;
    x.fillStyle = col;
    x.textAlign = align || 'left';
    if ('letterSpacing' in x) x.letterSpacing = (spacing == null ? 0.18 : spacing) * size + 'px';
    x.fillText(String(t).toUpperCase(), X, Y);
    x.restore();
  };
  const r1 = v => String(Math.round(v * 10) / 10);
  const mmss = ms => Math.floor(ms / 60000) + ':' + String(Math.floor((ms % 60000) / 1000)).padStart(2, '0');
  const when = t => {
    const d = new Date(t);
    return isNaN(d)
      ? ''
      : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) +
          ' ' +
          d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };
  async function photoImg(id) {
    if (!id || typeof KKPHOTO === 'undefined') return null;
    const u = (await KKPHOTO.url(id, 'f')) || (await KKPHOTO.url(id, 't'));
    if (!u) return null;
    const im = new Image();
    im.src = u;
    await im.decode().catch(() => null);
    return im.naturalWidth ? im : null;
  }
  // the curve, edge to edge, with the readings marked and the peak called out
  function curve(x, s, X0, X1, Y0, Y1, col, accent, labels) {
    const pts = (s.pts || []).filter(p => isFinite(p[0]) && isFinite(p[1])).sort((a, b) => a[0] - b[0]);
    if (pts.length < 2) return false;
    const lim = s.lines || [];
    let lo = Math.min(...pts.map(p => p[1]), ...lim),
      hi = Math.max(...pts.map(p => p[1]), ...lim);
    if (hi - lo < 1) {
      hi += 0.5;
      lo -= 0.5;
    }
    const pad = (hi - lo) * 0.18;
    lo -= pad;
    hi += pad;
    const t0 = pts[0][0],
      t1 = pts[pts.length - 1][0];
    const px = t => X0 + ((t - t0) / (t1 - t0 || 1)) * (X1 - X0),
      py = v => Y1 - ((v - lo) / (hi - lo)) * (Y1 - Y0);
    x.save();
    lim.forEach(v => {
      x.strokeStyle = accent;
      x.lineWidth = 2;
      x.setLineDash([3, 9]);
      x.beginPath();
      x.moveTo(0, py(v));
      x.lineTo(x.canvas.width, py(v));
      x.stroke();
      x.setLineDash([]);
      if (labels) caps(x, r1(v) + (s.unit || '°'), x.canvas.width - 40, py(v) - 10, 20, accent, 'right');
    });
    (s.events || []).forEach(ev => {
      if (!isFinite(ev.t) || ev.t < t0 || ev.t > t1) return;
      const X = px(ev.t);
      x.strokeStyle = accent;
      x.lineWidth = 2;
      x.setLineDash([2, 7]);
      x.beginPath();
      x.moveTo(X, Y0 - 10);
      x.lineTo(X, Y1 + 10);
      x.stroke();
      x.setLineDash([]);
      if (labels) {
        x.save();
        x.translate(Math.min(X - 10, x.canvas.width - 50), Y1 - 6);
        x.rotate(-Math.PI / 2);
        caps(x, ev.label + (s.elapsed ? ' ' + mmss(ev.t - t0) : ''), 0, 0, 18, accent, 'left', 0.12);
        x.restore();
      }
    });
    x.strokeStyle = col;
    x.lineWidth = 7;
    x.lineJoin = 'round';
    x.lineCap = 'round';
    x.beginPath();
    pts.forEach((p, i) => (i ? x.lineTo(px(p[0]), py(p[1])) : x.moveTo(px(p[0]), py(p[1]))));
    x.stroke();
    // a tick under every reading, like a hand-kept log
    x.lineWidth = 2;
    pts.forEach(p => {
      x.beginPath();
      x.moveTo(px(p[0]), Y1 + 18);
      x.lineTo(px(p[0]), Y1 + 34);
      x.stroke();
    });
    if (labels) {
      const pk = pts.reduce((a, b) => (b[1] > a[1] ? b : a));
      const X = px(pk[0]),
        Y = py(pk[1]);
      x.fillStyle = col;
      x.beginPath();
      x.arc(X, Y, 11, 0, Math.PI * 2);
      x.fill();
      x.lineWidth = 2;
      x.beginPath();
      x.moveTo(X, Y - 16);
      x.lineTo(X, Y0 - 34);
      x.stroke();
      caps(
        x,
        'peak ' + r1(pk[1]) + (s.unit || ' °C'),
        Math.min(Math.max(X, 150), x.canvas.width - 150),
        Y0 - 46,
        22,
        col,
        'center'
      );
      const lab = t => (s.elapsed ? mmss(t - t0) : when(t));
      caps(x, lab(t0), Math.max(X0, 72), Y1 + 66, 18, col, 'left', 0.08);
      caps(x, lab(t1), Math.min(X1, x.canvas.width - 72), Y1 + 66, 18, col, 'right', 0.08);
      caps(
        x,
        (s.label || '') + ' · ' + pts.length + ' readings',
        x.canvas.width / 2,
        Y1 + 66,
        18,
        col,
        'center',
        0.08
      );
    }
    x.restore();
    return true;
  }
  function ledger(x, facts, X, Y, W, col, sub) {
    const f = facts.filter(a => a && a[1] !== '' && a[1] != null).slice(0, 4);
    if (!f.length) return 0;
    const cw = W / f.length;
    x.save();
    x.strokeStyle = col;
    x.globalAlpha = 1;
    x.lineWidth = 1.5;
    x.beginPath();
    x.moveTo(X, Y);
    x.lineTo(X + W, Y);
    x.stroke();
    f.forEach(([k, v], i) => {
      const cx = X + i * cw;
      if (i) {
        x.beginPath();
        x.moveTo(cx, Y);
        x.lineTo(cx, Y + 118);
        x.stroke();
      }
      caps(x, k, cx + (i ? 18 : 0), Y + 34, 17, sub, 'left', 0.14);
      const one = fit(x, String(v), cw - 30, 52, 30, 1);
      x.font = one.s + 'px ' + SERIF;
      x.fillStyle = col;
      if (x.measureText(String(v)).width <= cw - 30) x.fillText(String(v), cx + (i ? 18 : 0), Y + 92);
      else {
        x.font = '26px ' + SERIF;
        lines(x, String(v), cw - 30)
          .slice(0, 2)
          .forEach((l, j) => x.fillText(l, cx + (i ? 18 : 0), Y + 74 + j * 30));
      }
    });
    x.restore();
    return 130;
  }

  // ---------- look 1: plate ----------
  async function plate(d, W, H, accent) {
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const x = c.getContext('2d');
    x.fillStyle = PAPER;
    x.fillRect(0, 0, W, H);
    grain(x, W, H, seedOf(d.code), false);
    marks(x, W, H, INK);
    const M = 72;
    caps(x, d.kicker || '', M, 104, 22, INK);
    caps(x, d.code || '', W - M, 104, 22, INK, 'right');
    x.fillStyle = INK;
    x.fillRect(M, 124, W - 2 * M, 2);
    const story = H > 1500;
    const ledTop = H - (story ? 330 : 250);
    const t = fit(x, d.title || '', W - 2 * M, story ? 150 : 112, 60, 2, '600');
    x.font = 'italic ' + (story ? 40 : 34) + 'px ' + SERIF;
    const ll = d.line ? lines(x, d.line, W - 2 * M - 60).slice(0, story ? 3 : 2) : [];
    const lh = story ? 54 : 46;
    const blockH = t.l.length * t.s * 0.92 + ll.length * lh + 10;
    const blockTop = ledTop - (story ? 70 : 50) - blockH;
    const cy0 = story ? 330 : 230,
      cy1 = blockTop - (story ? 150 : 110);
    const drew = d.series && curve(x, d.series, -10, W - 70, cy0, cy1, INK, RED, true);
    if (!drew && (d.profile || []).length) {
      // a taste profile: five ruled cells per quality, inked to the score, like a tasting sheet
      const rows = d.profile.slice(0, 6),
        rh = Math.min(110, (cy1 - cy0) / rows.length),
        cw = (W - 2 * M - 300) / 5;
      rows.forEach(([k, v], i) => {
        const y = cy0 + 20 + i * rh;
        caps(x, k, M, y + rh * 0.45, 22, INK);
        for (let j = 0; j < 5; j++) {
          const X = M + 300 + j * cw;
          x.strokeStyle = INK;
          x.lineWidth = 2;
          x.strokeRect(X + 4, y + 8, cw - 8, rh * 0.5);
          if (j < v) {
            x.fillStyle = j === v - 1 ? accent : INK;
            x.fillRect(X + 4, y + 8, cw - 8, rh * 0.5);
          }
        }
      });
    } else if (!drew && d.hero) {
      x.save();
      x.font = 'italic ' + (story ? 420 : 340) + 'px ' + SERIF;
      x.fillStyle = INK;
      x.fillText(String(d.hero.v), M - 10, cy1 - 40);
      const hw = x.measureText(String(d.hero.v)).width;
      x.font = 'italic 64px ' + SERIF;
      x.fillStyle = accent;
      x.fillText(d.hero.unit || '', M + hw + 6, cy1 - 40 - (story ? 260 : 210));
      x.restore();
      caps(x, d.hero.label || '', M, cy1 + 10, 22, INK);
    }
    // title set low, heavy and tight; the sentence in italic beneath
    let y = blockTop;
    x.fillStyle = INK;
    x.font = '600 ' + t.s + 'px ' + SERIF;
    t.l.forEach(l => {
      y += t.s * 0.92;
      x.fillText(l, M - 4, y);
    });
    x.font = 'italic ' + (story ? 40 : 34) + 'px ' + SERIF;
    x.fillStyle = '#3d342a';
    y += 8;
    ll.forEach(l => {
      y += lh;
      x.fillText(l, M, y);
    });
    ledger(x, d.facts || [], M, ledTop, W - 2 * M, INK, '#6b5d4c');
    caps(x, [d.maker, d.url].filter(Boolean).join('  ·  '), M, H - 74, 18, '#6b5d4c', 'left', 0.1);
    caps(x, d.date || '', W - M, H - 74, 18, '#6b5d4c', 'right', 0.1);
    return c;
  }

  // ---------- look 2: specimen ----------
  async function specimen(d, W, H, accent) {
    const im = await photoImg(d.photo);
    if (!im) return null;
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const x = c.getContext('2d');
    x.fillStyle = PAPER;
    x.fillRect(0, 0, W, H);
    const story = H > 1500;
    const PH = Math.round(H * (story ? 0.68 : 0.7));
    // sample the photo, cover-cropped, then draw it back as dots on a 45° screen
    const s = document.createElement('canvas');
    const cell = 13;
    s.width = Math.ceil(W / 4);
    s.height = Math.ceil(PH / 4);
    const sx = s.getContext('2d');
    const k = Math.max(s.width / im.naturalWidth, s.height / im.naturalHeight);
    sx.drawImage(
      im,
      (s.width - im.naturalWidth * k) / 2,
      (s.height - im.naturalHeight * k) / 2,
      im.naturalWidth * k,
      im.naturalHeight * k
    );
    const px = sx.getImageData(0, 0, s.width, s.height).data;
    const lum = (X, Y) => {
      const i =
        (Math.min(s.height - 1, Math.max(0, Math.round(Y / 4))) * s.width +
          Math.min(s.width - 1, Math.max(0, Math.round(X / 4)))) *
        4;
      return (0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2]) / 255;
    };
    x.save();
    x.beginPath();
    x.rect(0, 0, W, PH);
    x.clip();
    x.fillStyle = INK;
    const a = Math.PI / 4,
      ca = Math.cos(a),
      sa = Math.sin(a);
    const R = Math.hypot(W, PH);
    for (let u = -R; u < R; u += cell)
      for (let v = -R; v < R; v += cell) {
        const X = u * ca - v * sa + W / 2,
          Y = u * sa + v * ca + PH / 2;
        if (X < -cell || Y < -cell || X > W + cell || Y > PH + cell) continue;
        const dark = 1 - lum(X, Y);
        const r = Math.sqrt(dark) * cell * 0.62;
        if (r < 0.6) continue;
        x.beginPath();
        x.arc(X, Y, r, 0, Math.PI * 2);
        x.fill();
      }
    x.restore();
    grain(x, W, H, seedOf(d.code), false);
    // the specimen label, a little askew, pinned over the edge of the picture
    const LW = W - 150,
      facts = (d.facts || []).filter(f => f && f[1] !== '' && f[1] != null).slice(0, 4);
    x.font = '600 76px ' + SERIF;
    const tl = fit(x, d.title || '', LW - 80, 84, 52, 2, '600');
    const LH = 120 + tl.l.length * tl.s + facts.length * 46 + 70;
    const LX = 64,
      LY = Math.min(PH - 120, H - LH - 120);
    x.save();
    x.translate(LX, LY);
    x.rotate(-0.018);
    x.fillStyle = '#f6f1e6';
    x.shadowColor = 'rgba(0,0,0,.18)';
    x.shadowBlur = 24;
    x.shadowOffsetY = 8;
    x.fillRect(0, 0, LW, LH);
    x.shadowColor = 'transparent';
    x.strokeStyle = INK;
    x.lineWidth = 3;
    x.strokeRect(14, 14, LW - 28, LH - 28);
    x.lineWidth = 1;
    x.strokeRect(22, 22, LW - 44, LH - 44);
    caps(x, 'specimen · ' + (d.kicker || ''), 48, 70, 19, INK);
    let y = 84;
    x.fillStyle = INK;
    x.font = '600 ' + tl.s + 'px ' + SERIF;
    tl.l.forEach(l => {
      y += tl.s * 0.95;
      x.fillText(l, 46, y);
    });
    y += 26;
    x.fillRect(48, y, LW - 96, 1.5);
    facts.forEach(([kk, v]) => {
      y += 46;
      x.font = '22px ' + MONO;
      x.fillStyle = '#6b5d4c';
      const key = String(kk).toUpperCase();
      x.fillText(key, 48, y);
      x.fillStyle = INK;
      x.textAlign = 'right';
      x.fillText(String(v), LW - 48, y);
      x.textAlign = 'left';
      // dot leaders between the two
      const a0 = 48 + x.measureText(key).width + 14,
        a1 = LW - 48 - x.measureText(String(v)).width - 14;
      x.fillStyle = '#9c8f7c';
      for (let q = a0; q < a1; q += 12) x.fillRect(q, y - 6, 2.5, 2.5);
    });
    x.restore();
    // a small stamp in the brand colour with the code, set vertically
    x.save();
    x.translate(W - 70, PH - 40);
    x.rotate(-Math.PI / 2);
    x.fillStyle = accent;
    x.fillRect(0, -36, 300, 56);
    caps(x, d.code || '', 150, 2, 22, '#fff', 'center');
    x.restore();
    if (d.line) {
      x.font = 'italic ' + (story ? 38 : 32) + 'px ' + SERIF;
      x.fillStyle = '#3d342a';
      let yy = LY + LH + 70;
      lines(x, d.line, W - 160)
        .slice(0, story ? 4 : 2)
        .forEach(l => {
          if (yy < H - 120) x.fillText(l, 72, yy);
          yy += story ? 52 : 44;
        });
    }
    caps(x, [d.maker, d.url].filter(Boolean).join('  ·  '), 72, H - 64, 18, '#6b5d4c', 'left', 0.1);
    caps(x, d.date || '', W - 72, H - 64, 18, '#6b5d4c', 'right', 0.1);
    return c;
  }

  // ---------- look 3: figure ----------
  async function figure(d, W, H, accent) {
    if (!d.hero || d.hero.v == null || d.hero.v === '') return null;
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const x = c.getContext('2d');
    const G = '#15120e',
      P = '#efe8da';
    x.fillStyle = G;
    x.fillRect(0, 0, W, H);
    grain(x, W, H, seedOf(d.code), true);
    const story = H > 1500;
    const M = 72;
    caps(x, d.kicker || '', M, 104, 22, P);
    caps(x, d.code || '', W - M, 104, 22, P, 'right');
    // the number, outlined and too big for the page
    const num = String(d.hero.v);
    let fs = story ? 640 : 520;
    x.font = '600 ' + fs + 'px ' + SERIF;
    while (x.measureText(num).width > W * 1.05 && fs > 200) {
      fs -= 20;
      x.font = '600 ' + fs + 'px ' + SERIF;
    }
    const by = story ? 760 : 600;
    x.save();
    x.strokeStyle = P;
    x.lineWidth = 3;
    x.strokeText(num, -18, by);
    x.restore();
    const nw = x.measureText(num).width;
    x.font = 'italic 64px ' + SERIF;
    x.fillStyle = accent;
    x.fillText(d.hero.unit || '', Math.min(nw - 6, W - 180), by - fs * 0.62);
    caps(x, d.hero.label || '', M, by + 56, 22, P);
    // the curve, thin, in the brand colour, across the foot of the number
    if (d.series)
      curve(
        x,
        { ...d.series, lines: [] },
        M,
        W - M,
        by + 90,
        by + (story ? 290 : 210),
        accent,
        accent,
        false
      );
    const ledTop = H - (story ? 330 : 240);
    const t = fit(x, d.title || '', W - 2 * M, story ? 110 : 92, 56, 2, '600');
    x.font = 'italic ' + (story ? 38 : 32) + 'px ' + SERIF;
    const nl = d.line ? Math.min(2, lines(x, d.line, W - 2 * M).length) : 0;
    const blockH = t.l.length * t.s * 0.95 + nl * (story ? 52 : 44) + 10;
    let y = Math.min(by + (story ? 420 : 300), ledTop - 46 - blockH);
    x.fillStyle = P;
    x.font = '600 ' + t.s + 'px ' + SERIF;
    t.l.forEach(l => {
      y += t.s * 0.95;
      x.fillText(l, M, y);
    });
    if (d.line) {
      y += 10;
      x.font = 'italic ' + (story ? 38 : 32) + 'px ' + SERIF;
      x.fillStyle = '#b9ae9b';
      lines(x, d.line, W - 2 * M)
        .slice(0, 2)
        .forEach(l => {
          y += story ? 52 : 44;
          x.fillText(l, M, y);
        });
    }
    ledger(x, d.facts || [], M, ledTop, W - 2 * M, P, '#9c917f');
    caps(x, [d.maker, d.url].filter(Boolean).join('  ·  '), M, H - 64, 18, '#9c917f', 'left', 0.1);
    caps(x, d.date || '', W - M, H - 64, 18, '#9c917f', 'right', 0.1);
    return c;
  }

  const LOOKS = [
    ['plate', 'Plate', plate],
    ['specimen', 'Specimen', specimen],
    ['figure', 'Figure', figure],
  ];
  async function render(d, look, size, accent) {
    const H = size === 'story' ? 1920 : 1350;
    if (!accent || /rgba\([^)]*,\s*0\)/.test(accent) || accent === 'transparent') accent = '#8d583b';
    const f = (LOOKS.find(l => l[0] === look) || LOOKS[0])[2];
    return f(d, 1080, H, accent || '#8d583b');
  }
  async function share(canvas, name) {
    const blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', 0.93));
    const file = new File([blob], name + '.jpg', { type: 'image/jpeg' });
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
    a.download = name + '.jpg';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(u), 60000);
  }
  // the sheet: post or story, then the three looks drawn live; tap one to share it
  async function open(accent) {
    const d = await window.KKSOCIAL_DATA();
    if (!d) return;
    let size = 'post';
    const bg = document.createElement('div');
    bg.style.cssText =
      'position:fixed;inset:0;background:rgba(10,8,6,.82);z-index:9999;overflow:auto;padding:18px 14px 40px;color:#efe8da';
    document.body.appendChild(bg);
    const draw = async () => {
      bg.innerHTML =
        '<div style="max-width:560px;margin:0 auto"><div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:17px">Image for Instagram or Facebook</b><button data-x style="background:none;border:0;color:inherit;font-size:26px">×</button></div>' +
        '<div style="display:flex;gap:8px;margin:12px 0">' +
        [
          ['post', 'Post 4:5'],
          ['story', 'Story 9:16'],
        ]
          .map(
            ([k, l]) =>
              '<button data-size="' +
              k +
              '" style="flex:1;padding:10px;border-radius:10px;border:1px solid rgba(255,255,255,.3);font:inherit;' +
              (k === size ? 'background:#efe8da;color:#15120e' : 'background:transparent;color:inherit') +
              '">' +
              l +
              '</button>'
          )
          .join('') +
        '</div><div style="font-size:13px;opacity:.7;margin-bottom:8px">Tap a design to save or share it.</div><div id="kks" style="display:grid;grid-template-columns:1fr 1fr;gap:10px"></div></div>';
      const box = bg.querySelector('#kks');
      for (const [k, l] of LOOKS) {
        const cv = await render(d, k, size, accent);
        if (!cv) continue;
        const u = cv.toDataURL('image/jpeg', 0.7);
        const el = document.createElement('button');
        el.style.cssText = 'padding:0;border:0;background:none;color:inherit;font:inherit;text-align:left';
        el.innerHTML =
          '<img src="' +
          u +
          '" style="width:100%;border-radius:6px;display:block"><div style="font-size:13px;margin-top:4px">' +
          l +
          '</div>';
        el.onclick = () =>
          share(cv, (d.code || d.title || 'koffykraft').replace(/[^\w-]+/g, '-') + '-' + k + '-' + size);
        box.appendChild(el);
      }
    };
    bg.onclick = e => {
      if (e.target.closest('[data-x]')) bg.remove();
      const b = e.target.closest('[data-size]');
      if (b) {
        size = b.dataset.size;
        draw();
      }
    };
    draw();
  }
  return { render, open, LOOKS };
})();
