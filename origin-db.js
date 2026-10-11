// KoffyKraft (C) 2026 T M Thomas. AGPL-3.0 with additional terms (attribution, names): see NOTICE.
// KoffyKraft Origin store: estates, plots, harvests, processing runs and green lots.
// Works offline in IndexedDB; when signed in, syncs to /api/origin (last write wins).
const ORIGIN = (() => {
  const NAME = 'KoffyKraftOrigin', STORE = 'records';
  const TYPES = ['estate', 'plot', 'harvest', 'process', 'green', 'brew', 'cupping', 'tasting'];
  let DBP = null;
  function open() {
    if (DBP) return DBP;
    DBP = new Promise((ok, no) => {
      let r;
      try { r = indexedDB.open(NAME, 1); } catch (e) { no(e); return; }
      r.onupgradeneeded = e => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE)) {
          const s = db.createObjectStore(STORE, { keyPath: 'id' });
          s.createIndex('type', 'type');
        }
      };
      r.onsuccess = () => { const db = r.result; db.onversionchange = () => { db.close(); DBP = null; }; db.onclose = () => { DBP = null; }; ok(db); };
      r.onerror = () => { DBP = null; no(r.error); };
    });
    return DBP;
  }
  async function tx(mode, fn) {
    let db = await open(), t;
    try { t = db.transaction(STORE, mode); } catch (e) { DBP = null; db = await open(); t = db.transaction(STORE, mode); }
    return new Promise((ok, no) => {
      const s = t.objectStore(STORE);
      let out; Promise.resolve(fn(s)).then(v => { out = v; });
      t.oncomplete = () => ok(out); t.onerror = () => no(t.error); t.onabort = () => no(t.error);
    });
  }
  const req = q => new Promise((ok, no) => { q.onsuccess = () => ok(q.result); q.onerror = () => no(q.error); });
  function newId(type) { return type + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8); }
  async function all(type) {
    const rows = await tx('readonly', s => req(type ? s.index('type').getAll(type) : s.getAll()));
    return (rows || []).filter(r => !r.deleted);
  }
  // Several types in one read: { plot: [...], harvest: [...] }
  async function allTypes(types) {
    const rows = await tx('readonly', s => req(s.getAll()));
    const out = {}; (types || TYPES).forEach(t => out[t] = []);
    (rows || []).forEach(r => { if (!r.deleted && out[r.type]) out[r.type].push(r); });
    return out;
  }
  async function get(id) { const r = await tx('readonly', s => req(s.get(id))); return r && !r.deleted ? r : null; }
  async function put(rec) {
    if (!TYPES.includes(rec.type)) throw new Error('unknown record type');
    const now = new Date().toISOString();
    const r = { ...rec, id: rec.id || newId(rec.type), createdAt: rec.createdAt || now, updatedAt: now, dirty: true };
    if (modeOf(r.type) === 'all') r.cloud = true;
    await tx('readwrite', s => req(s.put(r)));
    scheduleSync();
    return r;
  }
  async function remove(id) {
    const r = await tx('readonly', s => req(s.get(id)));
    if (!r) return;
    await tx('readwrite', s => req(s.put({ ...r, deleted: true, updatedAt: new Date().toISOString(), dirty: true })));
    scheduleSync();
  }
  // ---- sync ----
  let timer = null, running = null, listeners = [];
  function onSync(fn) { listeners.push(fn); }
  function emit(state) { listeners.forEach(f => { try { f(state); } catch (e) {} }); }
  function signedIn() { return typeof SYNC !== 'undefined' && SYNC.isAuthenticated(); }
  function modeOf(type) { return typeof PREFS !== 'undefined' ? PREFS.get(PREFS.sectionOf(type)) : 'all'; }
  function scheduleSync() { if (!signedIn()) return; clearTimeout(timer); timer = setTimeout(() => sync().catch(() => {}), 800); }
  async function sync() {
    if (!signedIn() || !navigator.onLine) { emit({ status: signedIn() ? 'offline' : 'local' }); return; }
    if (running) return running;
    running = (async () => {
      emit({ status: 'syncing' });
      const headers = { 'content-type': 'application/json', authorization: 'Bearer ' + SYNC.getToken() };
      const local = await tx('readonly', s => req(s.getAll()));
      const dirty = local.filter(r => r.dirty && r.cloud && modeOf(r.type) !== 'off');
      if (dirty.length) {
        const records = dirty.map(({ dirty: _d, ...r }) => r);
        const resp = await fetch('/api/origin', { method: 'POST', headers, body: JSON.stringify({ records }) });
        if (!resp.ok) throw new Error('push failed ' + resp.status);
        const sent = new Map(dirty.map(r => [r.id, r.updatedAt]));
        await tx('readwrite', async s => {
          for (const [id, at] of sent) {
            const cur = await req(s.get(id));
            if (cur && cur.updatedAt === at) { delete cur.dirty; await req(s.put(cur)); }
          }
        });
      }
      // Pull only what changed on the server since our last pull (server clock), not every record.
      const SK = 'kk_origin_since_' + (localStorage.getItem('kk_user_id') || '');
      const since = localStorage.getItem(SK) || '';
      const resp = await fetch('/api/origin' + (since ? '?since=' + encodeURIComponent(since) : ''), { headers });
      if (!resp.ok) throw new Error('pull failed ' + resp.status);
      const { items, now } = await resp.json();
      let changed = 0;
      if (items && items.length) {
        const mine = new Map(local.map(r => [r.id, r]));
        const put = [];
        for (const remote of items) {
          if (modeOf(remote.type) === 'off') continue;
          const cur = mine.get(remote.id);
          if (!cur || (!cur.dirty && String(remote.updatedAt) > String(cur.updatedAt || ''))) { put.push({ ...remote, cloud: true }); changed++; }
          else if (!cur.cloud) put.push({ ...cur, cloud: true });
        }
        if (put.length) await tx('readwrite', s => { put.forEach(r => s.put(r)); });
      }
      if (now) localStorage.setItem(SK, now);
      emit({ status: 'synced', changed, at: new Date() });
      return changed;
    })().catch(e => { emit({ status: 'error', error: String(e.message || e) }); throw e; }).finally(() => { running = null; });
    return running;
  }
  // Save one record to the cloud, or remove its cloud copy while keeping it on this device.
  async function setCloud(id, on) {
    const r = await tx('readonly', s => req(s.get(id)));
    if (!r) throw new Error('not found');
    if (!signedIn()) throw new Error('Sign in first');
    if (on) {
      await tx('readwrite', s => req(s.put({ ...r, cloud: true, dirty: true })));
      await sync();
    } else {
      const resp = await fetch('/api/origin/' + encodeURIComponent(id), { method: 'DELETE', headers: { authorization: 'Bearer ' + SYNC.getToken() } });
      if (!resp.ok) throw new Error('remove failed ' + resp.status);
      await tx('readwrite', s => req(s.put({ ...r, cloud: false })));
      emit({ status: 'synced', changed: 0, at: new Date() });
    }
  }
  // When a section is switched to "all": mark every record of it for the cloud.
  async function markAll(section) {
    const rows = await tx('readonly', s => req(s.getAll()));
    const pick = rows.filter(r => !r.deleted && !r.cloud && typeof PREFS !== 'undefined' && PREFS.sectionOf(r.type) === section);
    if (pick.length) await tx('readwrite', async s => { for (const r of pick) await req(s.put({ ...r, cloud: true, dirty: true })); });
    if (signedIn()) await sync().catch(() => {});
    return pick.length;
  }
  window.addEventListener('online', () => scheduleSync());
  return { TYPES, all, allTypes, get, put, remove, sync, onSync, newId, setCloud, markAll };
})();
