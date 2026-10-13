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
      else if (
        (d.lib || (d.list && d.list.length)) &&
        d.t !== 'number' &&
        d.t !== 'date' &&
        d.pick !== false
      ) {
        // a pick list that phones show as a proper list, with "Other" for anything not on it
        input = pickHtml(d.k, d.lib ? LIB.get(d.lib, d.list || []) : d.list, v, d.lib);
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
      return (
        '<label' +
        cls +
        '>' +
        esc(d.l) +
        (d.req ? ' <em style="color:var(--bad)">*</em>' : '') +
        input +
        '</label>'
      );
    })
    .join('');
}
// A drop-down for a list, with "Other (type it)" and, for library lists, a way to the list itself.
// The value lives in the text box after the select (data-k), so forms read it like any input.
function pickHtml(k, list, v, lib) {
  v = v ?? '';
  const known = list.map(String).includes(String(v));
  const other = v !== '' && !known;
  return (
    '<select data-pick="' +
    esc(k) +
    '"' +
    (lib ? ' data-lib="' + esc(lib) + '"' : '') +
    '><option value=""></option>' +
    list
      .map(o => '<option' + (String(o) === String(v) ? ' selected' : '') + '>' + esc(o) + '</option>')
      .join('') +
    '<option value="__other"' +
    (other ? ' selected' : '') +
    '>Other (type it)</option>' +
    (lib ? '<option value="__lib">Edit this list…</option>' : '') +
    '</select>' +
    '<input data-k="' +
    esc(k) +
    '" type="text" placeholder="Type it' +
    (lib ? '; it joins the list' : '') +
    '" style="margin-top:6px' +
    (other ? '' : ';display:none') +
    '" value="' +
    esc(v) +
    '">'
  );
}
// set a pick list from code (a lot filling a sale, say): the box gets the value, the list follows
function setPick(k, v) {
  const box = document.querySelector('[data-k="' + k + '"]');
  if (!box) return;
  box.value = v;
  const sel = box.previousElementSibling;
  if (sel && sel.dataset && sel.dataset.pick != null) {
    const has = [...sel.options].some(o => o.value === v || o.text === v);
    sel.value = has ? v : v ? '__other' : '';
    box.style.display = has || !v ? 'none' : '';
  }
}
// The library: named lists (products, buyers, suppliers, units and so on) that every page offers as
// drop-downs, so staff pick the same name each time instead of typing it their own way. The app's
// lists come from app.json (settings.library and the module settings); the owner adds, hides and
// renames on library.html, and anything typed under "Other" joins the list. Kept as records of type
// 'lib', so the lists follow the account to every phone.
const LIB = (() => {
  let own = [];
  const lower = x => String(x).trim().toLowerCase();
  const settings = () => (APP.settings && APP.settings.library) || {};
  // where each list starts when the app does not set it
  const FALLBACK = {
    products: () => SET('ledger').products || SET('rubber').products || [],
    units: () => SET('ledger').units || [],
    // things bought: fertilisers and sprays from the field log, and the app's store items
    inputs: () => [
      ...(SET('fieldlog').products || []),
      ...(SET('rubber').stockItems || [])
        .map(i => (Array.isArray(i) ? i[0] : i.name))
        .filter(x => x && x !== 'Other'),
    ],
  };
  const LABELS = {
    products: 'Products',
    buyers: 'Buyers',
    suppliers: 'Suppliers and payees',
    transporters: 'Transporters',
    inputs: 'Inputs and tools bought',
    units: 'Units',
  };
  function names() {
    const n = new Set([...Object.keys(LABELS), ...Object.keys(settings())]);
    own.forEach(o => n.add(o.list));
    return [...n];
  }
  const label = n => (settings()._labels || {})[n] || LABELS[n] || n.charAt(0).toUpperCase() + n.slice(1);
  function base(n) {
    const b = settings()[n];
    return Array.isArray(b) ? b : FALLBACK[n] ? FALLBACK[n]() : [];
  }
  // the list as offered: the app's, then the owner's own, then extra (such as names used before)
  function get(n, extra) {
    const off = new Set(own.filter(o => o.list === n && o.off).map(o => lower(o.name)));
    const out = [],
      seen = new Set();
    const add = x => {
      if (x == null || String(x).trim() === '') return;
      const k = lower(x);
      if (seen.has(k) || off.has(k)) return;
      seen.add(k);
      out.push(String(x).trim());
    };
    base(n).forEach(add);
    own.filter(o => o.list === n && !o.off).forEach(o => add(o.name));
    (extra || []).slice().sort().forEach(add);
    return out;
  }
  async function load() {
    if (typeof ORIGIN === 'undefined' || !(ORIGIN.TYPES || APP.types || []).includes('lib')) return own;
    try {
      own = (await ORIGIN.all('lib')).filter(o => o.list && o.name);
    } catch (e) {}
    return own;
  }
  async function learn(n, name) {
    name = String(name || '').trim();
    if (!name || typeof ORIGIN === 'undefined' || !(ORIGIN.TYPES || APP.types || []).includes('lib')) return;
    const k = lower(name);
    const had = own.find(o => o.list === n && lower(o.name) === k);
    if (had && !had.off) return;
    if (!had && base(n).some(x => lower(x) === k)) return;
    const r = await ORIGIN.put(had ? { ...had, off: false } : { type: 'lib', list: n, name });
    own = own.filter(o => o.id !== r.id).concat(r);
  }
  async function hide(n, name, off) {
    const k = lower(name);
    const had = own.find(o => o.list === n && lower(o.name) === k);
    const r = await ORIGIN.put(had ? { ...had, off } : { type: 'lib', list: n, name, off });
    own = own.filter(o => o.id !== r.id).concat(r);
  }
  // remove one of the owner's own entries for good (the app's own can only be hidden)
  async function remove(n, name) {
    const k = lower(name);
    if (base(n).some(x => lower(x) === k)) return hide(n, name, true);
    for (const o of own.filter(o => o.list === n && lower(o.name) === k)) await ORIGIN.remove(o.id);
    own = own.filter(o => !(o.list === n && lower(o.name) === k));
  }
  const isBase = (n, name) => base(n).some(x => lower(x) === lower(name));
  // who sells an item: [{ supplier, brand, pack, price, last }], newest first; one row per
  // supplier and brand, so different suppliers can sell different brands of the same thing
  function sources(n, item) {
    return (info(n, item).sources || [])
      .slice()
      .sort((a, b) => String(b.last || '').localeCompare(String(a.last || '')));
  }
  async function addSource(n, item, src) {
    if (!item || !src || !src.supplier) return;
    const cur = info(n, item);
    const list = (cur.sources || []).filter(
      x => !(lower(x.supplier) === lower(src.supplier) && lower(x.brand || '') === lower(src.brand || ''))
    );
    list.push({ ...src });
    await setInfo(n, item, { ...cur, sources: list.slice(-30) });
  }
  // a new name for an entry: the owner's own entry is changed; one of the app's is hidden and the
  // new name added in its place
  async function rename(n, old, name) {
    name = String(name || '').trim();
    if (!name) return;
    const k = lower(old);
    const mine = own.find(o => o.list === n && lower(o.name) === k && !o.off);
    if (mine && !base(n).some(x => lower(x) === k)) {
      const r = await ORIGIN.put({ ...mine, name });
      own = own.filter(o => o.id !== r.id).concat(r);
      return;
    }
    await hide(n, old, true);
    await learn(n, name);
  }
  // details kept with a name: GSTIN, address, phone, bank, UPI, credit days for a buyer or supplier
  function info(n, name) {
    const k = lower(name || '');
    const r = own.find(o => o.list === n && lower(o.name) === k);
    return (r && r.info) || {};
  }
  async function setInfo(n, name, data) {
    const k = lower(name);
    const had = own.find(o => o.list === n && lower(o.name) === k);
    const r = await ORIGIN.put(had ? { ...had, info: data } : { type: 'lib', list: n, name, info: data });
    own = own.filter(o => o.id !== r.id).concat(r);
  }
  // the owner's own business details (for bills and payment requests), kept as one library entry
  const me = () => info('_business', 'me');
  const setMe = data => setInfo('_business', 'me', data);
  const pick = (k, n, v, extra) => pickHtml(k, get(n, extra), v, n);
  return {
    load,
    get,
    learn,
    hide,
    rename,
    pick,
    names: () => names().filter(x => x[0] !== '_'),
    label,
    base,
    info,
    setInfo,
    remove,
    isBase,
    sources,
    addSource,
    me,
    setMe,
    own: () => own,
  };
})();
// pick lists: the choice goes into the text box beside it, which holds the value
document.addEventListener('change', e => {
  const t = e.target;
  // a name typed under "Other" in a library list joins the list
  if (t && t.dataset && t.dataset.k && t.previousElementSibling && t.previousElementSibling.dataset) {
    const lib = t.previousElementSibling.dataset.lib;
    if (lib && t.value.trim()) LIB.learn(lib, t.value);
  }
  const sel = t;
  if (!sel || !sel.dataset || sel.dataset.pick == null) return;
  const box = sel.nextElementSibling;
  if (!box) return;
  if (sel.value === '__lib') {
    location.href = 'library.html#' + encodeURIComponent(sel.dataset.lib);
    return;
  }
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
