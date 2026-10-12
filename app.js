// KoffyKraft (C) 2026 T M Thomas. AGPL-3.0 with additional terms (attribution, names): see NOTICE.
// Header, footer and helpers every page uses. Names, colours and the menu come from APP
// (app.config.js, made from app.json), so one copy serves every app built from the shell.
/* global APP, SYNC, ORIGIN */
function appHeader(on) {
  const h = document.getElementById('kh');
  if (!h) return;
  // a module page may sit under a main menu entry (APP.navOn) with its own second row (APP.subnav)
  const main = (APP.navOn && APP.navOn[on]) || on;
  const sub = (APP.subnav || []).some(([k]) => k === on) ? APP.subnav : null;
  const links = (list, cur) =>
    list
      .map(
        ([k, l]) =>
          '<a href="' + k + '.html"' + (k === cur ? ' aria-current="page"' : '') + '>' + esc(l) + '</a>'
      )
      .join('');
  h.className = 'kkh';
  h.innerHTML =
    '<div class="kkh-top"><a class="kkh-brand" href="home.html">' +
    esc(APP.short) +
    (APP.by ? '<small>' + esc(APP.by) + '</small>' : '') +
    '</a><a class="kkh-acct" href="' +
    esc(APP.account || 'account.html') +
    '" aria-label="Account">👤</a></div><nav class="kkh-nav" aria-label="Main">' +
    links(APP.nav, main) +
    '</nav>' +
    (sub ? '<nav class="kkh-nav kkh-subnav" aria-label="Section">' + links(sub, on) + '</nav>' : '');
}
// Sync the app's own records when the page opens, unless the app manages that itself.
function recordsSync() {
  if (APP.syncRecords === false || typeof ORIGIN === 'undefined') return Promise.resolve(0);
  return ORIGIN.sync().catch(() => 0);
}
function appFoot() {
  const f = document.getElementById('kf');
  if (!f) return;
  f.className = 'foot';
  f.innerHTML =
    'Made with <a href="https://roast.koffykraft.coffee">KoffyKraft</a> · free and open source · © T M Thomas · <a href="license.html">Licence</a> · <a href="privacy.html">Privacy</a> · <a href="terms.html">Terms</a>';
}
function toast(t) {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = t;
  el.classList.add('show');
  clearTimeout(el._h);
  el._h = setTimeout(() => el.classList.remove('show'), 2200);
}
const fmtDate = d => {
  if (!d) return '';
  const x = new Date(String(d).length === 10 ? d + 'T00:00' : d);
  return isNaN(x)
    ? String(d)
    : x.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};
// Local date as YYYY-MM-DD (not UTC, so late evening in India is still today).
const today = (d = new Date()) => {
  const x = new Date(d);
  x.setMinutes(x.getMinutes() - x.getTimezoneOffset());
  return x.toISOString().slice(0, 10);
};
const addDays = (day, n) => {
  const x = new Date(day + 'T00:00');
  x.setDate(x.getDate() + n);
  return today(x);
};
const uid = p => (p || 'x') + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
// Save rows as a CSV file that opens in Excel or Google Sheets. cols: [[key or function, heading]]
function saveCsv(name, rows, cols) {
  const cell = v => {
    const t = v == null ? '' : Array.isArray(v) ? v.join('; ') : String(v);
    return /[",\n]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t;
  };
  const lines = [cols.map(c => cell(c[1])).join(',')].concat(
    rows.map(r => cols.map(([k]) => cell(typeof k === 'function' ? k(r) : r[k])).join(','))
  );
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['﻿' + lines.join('\n')], { type: 'text/csv' }));
  a.download = name + '-' + today() + '.csv';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => (URL.revokeObjectURL(a.href), a.remove()), 4000);
  toast('Saved ' + a.download);
}
// Read a CSV file into rows of objects keyed by lower-case header. Handles quotes and ; or , or tab.
function parseCsv(text) {
  text = String(text || '').replace(/^﻿/, '');
  const first = text.split(/\r?\n/)[0] || '';
  const sep = [',', ';', '\t'].sort((a, b) => first.split(b).length - first.split(a).length)[0];
  const rows = [];
  let row = [],
    cell = '',
    q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') (cell += '"'), i++;
      else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === sep) row.push(cell), (cell = '');
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cell), rows.push(row), (row = []), (cell = '');
    } else cell += c;
  }
  if (cell || row.length) row.push(cell), rows.push(row);
  const head = (rows.shift() || []).map(h => h.trim().toLowerCase());
  return rows
    .filter(r => r.some(x => String(x).trim()))
    .map(r => Object.fromEntries(head.map((h, i) => [h, (r[i] || '').trim()])));
}
// Distance in metres between two points (haversine).
function metres(a, b) {
  const R = 6371000,
    rad = x => (x * Math.PI) / 180;
  const dLa = rad(b.lat - a.lat),
    dLo = rad(b.lng - a.lng);
  const h = Math.sin(dLa / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLo / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}
// One GPS reading, or null if refused or too slow.
function gpsNow(ms = 12000) {
  return new Promise(ok => {
    if (!navigator.geolocation) return ok(null);
    navigator.geolocation.getCurrentPosition(
      p =>
        ok({
          lat: +p.coords.latitude.toFixed(6),
          lng: +p.coords.longitude.toFixed(6),
          acc: Math.round(p.coords.accuracy),
        }),
      () => ok(null),
      { enableHighAccuracy: true, timeout: ms, maximumAge: 30000 }
    );
  });
}
// Talking to the server from module pages. Reads keep a copy on the phone for offline viewing;
// writes made offline wait in an outbox and go out when the phone is back online. Every write
// carries its own id, so sending one twice does no harm.
const API = (() => {
  const OUT = 'kk_outbox';
  const head = () => ({
    'content-type': 'application/json',
    authorization: 'Bearer ' + (typeof SYNC !== 'undefined' ? SYNC.getToken() : ''),
  });
  const box = () => {
    try {
      return JSON.parse(localStorage.getItem(OUT) || '[]');
    } catch (e) {
      return [];
    }
  };
  const keep = b => {
    try {
      localStorage.setItem(OUT, JSON.stringify(b));
    } catch (e) {}
  };
  async function get(path) {
    const key = 'kkc:' + path;
    try {
      const r = await fetch(path, { headers: head() });
      const d = await r.json();
      if (!r.ok) throw Object.assign(new Error(d.error || 'failed ' + r.status), { status: r.status });
      try {
        localStorage.setItem(key, JSON.stringify(d));
      } catch (e) {}
      return d;
    } catch (e) {
      if (e.status) throw e;
      const c = localStorage.getItem(key);
      if (c) return { ...JSON.parse(c), offline: true };
      throw e;
    }
  }
  async function send(method, path, body) {
    try {
      const r = await fetch(path, { method, headers: head(), body: body ? JSON.stringify(body) : undefined });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw Object.assign(new Error(d.error || 'failed ' + r.status), { status: r.status });
      return d;
    } catch (e) {
      if (e.status) throw e;
      keep([...box(), { method, path, body, at: Date.now() }]);
      return { queued: true };
    }
  }
  let flushing = null;
  function flush() {
    if (flushing || !navigator.onLine || !box().length) return flushing || Promise.resolve(0);
    flushing = (async () => {
      let n = 0;
      for (const it of box()) {
        try {
          const r = await fetch(it.path, {
            method: it.method,
            headers: head(),
            body: it.body ? JSON.stringify(it.body) : undefined,
          });
          // server trouble or signed out: keep it for later. Other refusals (bad data) are dropped.
          if (r.status >= 500 || r.status === 401) break;
        } catch (e) {
          break;
        }
        keep(box().filter(x => x.at !== it.at || x.path !== it.path));
        n++;
      }
      if (n) window.dispatchEvent(new CustomEvent('kk-flushed', { detail: n }));
      return n;
    })().finally(() => (flushing = null));
    return flushing;
  }
  window.addEventListener('online', flush);
  setTimeout(flush, 1500);
  // writes still waiting in the outbox for one path, so lists can show them straight away
  const pending = path =>
    box()
      .filter(x => x.method === 'POST' && x.path === path)
      .map(x => ({ ...x.body, pending: true }));
  return {
    get,
    send,
    post: (p, b) => send('POST', p, b),
    del: p => send('DELETE', p),
    flush,
    pending,
    waiting: () => box().length,
  };
})();
// Module pages need an account: show a sign-in card instead when there is none.
function needAccount(box, what) {
  if (typeof SYNC !== 'undefined' && SYNC.isAuthenticated()) return false;
  box.innerHTML =
    '<div class="card"><b>Sign in to use ' +
    esc(what) +
    '</b><div class="mini">These records are kept in your account so every phone you sign in on sees the same list. Entries made while offline are sent when the phone is back online.</div><div class="row" style="margin-top:8px"><a class="btn app" href="account.html">Sign in</a></div></div>';
  return true;
}
// Form fields from a list of definitions, so apps can add their own fields from app.json.
// def: { k, l, t: 'text'|'number'|'date'|'select'|'area', opts, ph, full, list }
function fieldsHtml(defs, rec) {
  return (defs || [])
    .map(d => {
      const v = rec[d.k] ?? '';
      const cls = d.full || d.t === 'area' ? ' class="full"' : '';
      const ph = d.ph ? ' placeholder="' + esc(d.ph) + '"' : '';
      let input;
      if (d.t === 'select')
        input =
          '<select data-k="' +
          esc(d.k) +
          '"><option value=""></option>' +
          (d.opts || [])
            .map(o => '<option' + (String(o) === String(v) ? ' selected' : '') + '>' + esc(o) + '</option>')
            .join('') +
          (v && !(d.opts || []).map(String).includes(String(v))
            ? '<option selected>' + esc(v) + '</option>'
            : '') +
          '</select>';
      else if (d.t === 'area')
        input = '<textarea data-k="' + esc(d.k) + '"' + ph + '>' + esc(v) + '</textarea>';
      else if (d.list && d.list.length && d.t !== 'number' && d.t !== 'date' && d.pick !== false) {
        // a pick list that phones show as a proper list, with "Other" for anything not on it
        const known = d.list.map(String).includes(String(v));
        const other = v !== '' && !known;
        input =
          '<select data-pick="' +
          esc(d.k) +
          '"><option value=""></option>' +
          d.list
            .map(o => '<option' + (String(o) === String(v) ? ' selected' : '') + '>' + esc(o) + '</option>')
            .join('') +
          '<option value="__other"' +
          (other ? ' selected' : '') +
          '>Other (type it)</option></select>' +
          '<input data-k="' +
          esc(d.k) +
          '" type="text" placeholder="Type it" style="margin-top:6px' +
          (other ? '' : ';display:none') +
          '" value="' +
          esc(v) +
          '">';
      } else
        input =
          '<input data-k="' +
          esc(d.k) +
          '" type="' +
          (d.t === 'number' ? 'number' : d.t === 'date' ? 'date' : 'text') +
          '"' +
          (d.t === 'number' ? ' step="any" inputmode="decimal"' : '') +
          (d.list ? ' list="dl-' + esc(d.k) + '"' : '') +
          ph +
          ' value="' +
          esc(v) +
          '">' +
          (d.list
            ? '<datalist id="dl-' +
              esc(d.k) +
              '">' +
              d.list.map(o => '<option value="' + esc(o) + '">').join('') +
              '</datalist>'
            : '');
      return '<label' + cls + '>' + esc(d.l) + input + '</label>';
    })
    .join('');
}
// pick lists from fieldsHtml: the choice goes into the text box beside it, which holds the value
document.addEventListener('change', e => {
  const sel = e.target;
  if (!sel || !sel.dataset || sel.dataset.pick == null) return;
  const box = sel.nextElementSibling;
  if (!box) return;
  if (sel.value === '__other') {
    box.style.display = '';
    box.value = '';
    box.focus();
  } else {
    box.style.display = 'none';
    box.value = sel.value;
  }
  box.dispatchEvent(new Event('input', { bubbles: true }));
});
const SET = name => (APP.settings && APP.settings[name]) || {};
const W = k => (APP.words && APP.words[k]) || k;
document.addEventListener('DOMContentLoaded', () => {
  if (!document.title.startsWith(APP.short)) document.title = APP.short + ' ' + document.title;
  appHeader(document.body.dataset.page || '');
  appFoot();
});
if ('serviceWorker' in navigator && !/^(localhost|127\.)/.test(location.hostname))
  navigator.serviceWorker.register('sw.js').catch(() => {});
