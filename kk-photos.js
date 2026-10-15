// KoffyKraft (C) 2026 T M Thomas. AGPL-3.0 with additional terms (attribution, names): see NOTICE.
// Photos on records. Each photo is shrunk on this phone to two sizes: a thumbnail for cards and
// lists, and a larger view opened on tap (Small, Standard or Large, chosen here and remembered).
// Both are kept on this phone and sent to your account so other phones see them. The original is
// not uploaded; the record keeps its fingerprint (SHA-256) so an original sent later can be checked.
// Use: KKPHOTO.mount(element, () => record). Photos live in record.photos. A photo ticked
// 'On passport' (pub) is shown on the public passport once the record is sealed.
const KKPHOTO = (() => {
  const SIZES = { S: [1024, 'Small'], M: [1600, 'Standard'], L: [2400, 'Large'] };
  const MAX = 6;
  const PREF = 'kk_photo_size';
  const h = s =>
    String(s == null ? '' : s).replace(
      /[&<>"']/g,
      c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
    );
  const say = t => (typeof toast === 'function' ? toast(t) : alert(t));
  const pref = () => {
    try {
      return SIZES[localStorage.getItem(PREF)] ? localStorage.getItem(PREF) : 'M';
    } catch (e) {
      return 'M';
    }
  };
  const setPref = v => {
    try {
      localStorage.setItem(PREF, v);
    } catch (e) {}
  };
  const auth = () => ({
    authorization: 'Bearer ' + (typeof SYNC !== 'undefined' && SYNC.getToken ? SYNC.getToken() || '' : ''),
  });
  // ---- this phone's copy (IndexedDB) ----
  let dbp = null;
  const db = () =>
    (dbp ||= new Promise((ok, no) => {
      const q = indexedDB.open('KKPhotos', 1);
      q.onupgradeneeded = () => q.result.createObjectStore('p', { keyPath: 'id' });
      q.onsuccess = () => ok(q.result);
      q.onerror = () => no(q.error);
    }));
  const tx = async (mode, fn) => {
    const d = await db();
    return new Promise((ok, no) => {
      const t = d.transaction('p', mode),
        r = fn(t.objectStore('p'));
      t.oncomplete = () => ok(r && r.result);
      t.onerror = () => no(t.error);
    });
  };
  const local = id => tx('readonly', s => s.get(id)).catch(() => null);
  const keep = o => tx('readwrite', s => s.put(o)).catch(() => null);
  const drop = id => tx('readwrite', s => s.delete(id)).catch(() => null);
  const pending = () =>
    tx('readonly', s => s.getAll())
      .then(a => (a || []).filter(x => x.up === false))
      .catch(() => []);
  // ---- shrinking ----
  async function shrink(file, max, q) {
    const bm = await createImageBitmap(file);
    const k = Math.min(1, max / Math.max(bm.width, bm.height));
    const c = document.createElement('canvas');
    c.width = Math.round(bm.width * k);
    c.height = Math.round(bm.height * k);
    c.getContext('2d').drawImage(bm, 0, 0, c.width, c.height);
    const blob = await new Promise(ok => c.toBlob(ok, 'image/jpeg', q));
    return { blob, w: c.width, h: c.height };
  }
  const b64 = blob =>
    new Promise(ok => {
      const r = new FileReader();
      r.onload = () => ok(String(r.result).split(',')[1] || '');
      r.readAsDataURL(blob);
    });
  async function sha(file) {
    try {
      const d = await crypto.subtle.digest('SHA-256', await file.arrayBuffer());
      return [...new Uint8Array(d)].map(x => x.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      return '';
    }
  }
  // ---- sending to the account ----
  async function upload(o) {
    const r = await fetch('/api/photos', {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...auth() },
      body: JSON.stringify({ id: o.id, rec: o.rec, thumb: await b64(o.t), full: await b64(o.f) }),
    });
    if (r.ok) {
      await keep({ ...o, up: true });
      return true;
    }
    const d = await r.json().catch(() => ({}));
    if (r.status === 413) say(d.error || 'Photo too large');
    return false;
  }
  let flushing = null;
  function flush() {
    if (flushing || !navigator.onLine) return flushing || Promise.resolve(0);
    return (flushing = (async () => {
      let n = 0;
      for (const o of await pending()) {
        try {
          if (await upload(o)) n++;
          else break;
        } catch (e) {
          break;
        }
      }
      return n;
    })().finally(() => (flushing = null)));
  }
  addEventListener('online', () => flush());
  setTimeout(flush, 2500);
  // ---- reading ----
  const urls = {};
  async function blobOf(id, size) {
    const o = await local(id);
    if (o && o[size]) return o[size];
    try {
      const r = await fetch('/api/photos/' + encodeURIComponent(id) + '?s=' + size, { headers: auth() });
      if (!r.ok) return null;
      const b = await r.blob();
      await keep({ ...(o || { id, up: true }), [size]: b });
      return b;
    } catch (e) {
      return null;
    }
  }
  async function url(id, size) {
    const k = id + size;
    if (urls[k]) return urls[k];
    const b = await blobOf(id, size);
    return b ? (urls[k] = URL.createObjectURL(b)) : '';
  }
  // fill every <img data-kkp="id"> under root with its thumbnail
  function hydrate(root) {
    (root || document).querySelectorAll('img[data-kkp]:not([src])').forEach(async im => {
      const u = await url(im.dataset.kkp, 't');
      if (u) im.src = u;
      else im.alt = 'Photo not on this phone yet';
    });
  }
  // images for a card or PDF: the larger view, as loaded <img> elements
  async function images(photos, n) {
    const out = [];
    for (const p of (photos || []).slice(0, n || 2)) {
      const u = (await url(p.id, 'f')) || (await url(p.id, 't'));
      if (!u) continue;
      const im = new Image();
      im.src = u;
      await im.decode().catch(() => null);
      if (im.naturalWidth) out.push(im);
    }
    return out;
  }
  // ---- full view ----
  async function view(p, onRemove) {
    const o = document.createElement('div');
    o.style.cssText =
      'position:fixed;inset:0;z-index:9999;background:rgba(10,8,6,.92);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px;gap:10px';
    o.innerHTML =
      '<img style="max-width:100%;max-height:78vh;border-radius:8px;object-fit:contain" alt=""><div style="color:#eee;font-size:14px;text-align:center">' +
      h(p.cap || '') +
      (p.w ? ' <span style="opacity:.6">' + p.w + ' × ' + p.h + '</span>' : '') +
      '</div><div style="display:flex;gap:8px">' +
      (onRemove ? '<button type="button" class="btn danger" data-x="rm">Remove</button>' : '') +
      '<button type="button" class="btn" data-x="close">Close</button></div>';
    document.body.appendChild(o);
    o.querySelector('img').src = (await url(p.id, 'f')) || (await url(p.id, 't'));
    o.onclick = e => {
      const x = e.target.dataset.x;
      if (x === 'rm' && confirm('Remove this photo?')) onRemove();
      if (x === 'rm' || x === 'close' || e.target === o) o.remove();
    };
  }
  // ---- the editor on a record ----
  function mount(el, get) {
    if (!el) return;
    const draw = () => {
      const r = get(),
        ps = r.photos || [];
      el.innerHTML =
        '<div style="display:flex;flex-wrap:wrap;gap:8px;margin:6px 0">' +
        ps
          .map(
            (p, i) =>
              '<div style="width:96px"><img data-kkp="' +
              h(p.id) +
              '" data-ph-i="' +
              i +
              '" style="width:96px;height:96px;object-fit:cover;border-radius:8px;background:#eee;display:block;cursor:pointer" alt=""><input data-ph-cap="' +
              i +
              '" value="' +
              h(p.cap || '') +
              '" placeholder="caption" maxlength="120" style="width:96px;font-size:12px;padding:4px;margin-top:4px;box-sizing:border-box"><label class="mini" style="display:flex;gap:4px;align-items:center;margin-top:2px"><input type="checkbox" data-ph-pub="' +
              i +
              '"' +
              (p.pub ? ' checked' : '') +
              ' style="width:16px;height:16px"> On passport</label></div>'
          )
          .join('') +
        '</div>' +
        (ps.length < MAX
          ? '<div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center"><label class="btn small" style="cursor:pointer">📷 Take a photo<input type="file" accept="image/*" capture="environment" hidden data-ph-add></label><label class="btn small" style="cursor:pointer">🖼 From gallery<input type="file" accept="image/*" multiple hidden data-ph-add></label><label class="mini" style="display:flex;gap:4px;align-items:center">Size<select data-ph-size style="width:auto;padding:4px">' +
            Object.entries(SIZES)
              .map(
                ([k, [px, l]]) =>
                  '<option value="' +
                  k +
                  '"' +
                  (k === pref() ? ' selected' : '') +
                  '>' +
                  l +
                  ' (' +
                  px +
                  ' px)</option>'
              )
              .join('') +
            '</select></label></div>'
          : '<div class="mini">Up to ' + MAX + ' photos on one record.</div>') +
        '<div class="mini" style="margin-top:4px">Shrunk on this phone, kept with your records. Tap a photo to see it large. Tick On passport to show it publicly when you seal the passport.</div>';
      hydrate(el);
      el.querySelectorAll('img[data-ph-i]').forEach(
        im =>
          (im.onclick = () => {
            const i = +im.dataset.phI;
            view(get().photos[i], () => {
              const p = get().photos.splice(i, 1)[0];
              drop(p.id);
              fetch('/api/photos/' + encodeURIComponent(p.id), { method: 'DELETE', headers: auth() }).catch(
                () => {}
              );
              draw();
              el.dispatchEvent(new Event('input', { bubbles: true }));
            });
          })
      );
      el.querySelectorAll('[data-ph-cap]').forEach(
        x => (x.oninput = e => (e.stopPropagation(), (get().photos[+x.dataset.phCap].cap = x.value.trim())))
      );
      el.querySelectorAll('[data-ph-pub]').forEach(
        x =>
          (x.onchange = e => {
            e.stopPropagation();
            get().photos[+x.dataset.phPub].pub = x.checked;
            el.dispatchEvent(new Event('input', { bubbles: true }));
          })
      );
      const sz = el.querySelector('[data-ph-size]');
      if (sz) sz.onchange = e => (e.stopPropagation(), setPref(sz.value));
      el.querySelectorAll('[data-ph-add]').forEach(
        inp =>
          (inp.onchange = async e => {
            e.stopPropagation();
            const files = [...inp.files];
            const r = get();
            r.photos = r.photos || [];
            const room = MAX - r.photos.length;
            if (files.length > room)
              say('Only ' + room + ' more photo' + (room === 1 ? '' : 's') + ' fit on this record');
            for (const f of files.slice(0, room)) {
              try {
                const [px] = SIZES[pref()];
                let q = 0.82,
                  big = await shrink(f, px, q);
                // keep the larger view under what the account accepts (about 880 KB)
                while (big.blob.size > 880e3 && q > 0.5) big = await shrink(f, px, (q -= 0.1));
                const th = await shrink(f, 320, 0.7);
                const id = 'ph-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
                await keep({ id, rec: r.id || '', t: th.blob, f: big.blob, up: false });
                r.photos.push({
                  id,
                  cap: '',
                  w: big.w,
                  h: big.h,
                  size: pref(),
                  sha: await sha(f),
                  at: new Date().toISOString(),
                });
              } catch (err) {
                say('Could not read that photo');
              }
            }
            draw();
            el.dispatchEvent(new Event('input', { bubbles: true }));
            flush();
          })
      );
    };
    draw();
  }
  // a small row of thumbnails for lists (call hydrate after inserting)
  const strip = (photos, n) =>
    (photos || [])
      .slice(0, n || 3)
      .map(
        p =>
          '<img data-kkp="' +
          h(p.id) +
          '" style="width:44px;height:44px;object-fit:cover;border-radius:6px;margin-right:4px" alt="">'
      )
      .join('');
  // before sealing a passport: send any waiting photos, then mark the chosen ones (pub) as public
  // and the others as private. Returns the photos that are public now.
  async function publish(photos) {
    await flush();
    const out = [];
    for (const p of photos || []) {
      try {
        const r = await fetch('/api/photos/' + encodeURIComponent(p.id) + '/public', {
          method: 'POST',
          headers: { 'content-type': 'application/json', ...auth() },
          body: JSON.stringify({ on: !!p.pub }),
        });
        if (r.ok && p.pub) out.push(p);
      } catch (e) {}
    }
    return out;
  }
  // what a passport card holds for its public photos: id, caption and the original's fingerprint
  const sealed = photos =>
    (photos || []).filter(p => p.pub).map(p => ({ id: p.id, cap: p.cap || '', sha: p.sha || '' }));
  return { mount, hydrate, images, strip, flush, view, url, publish, sealed };
})();
