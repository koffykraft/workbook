// KoffyKraft (C) 2026 T M Thomas. AGPL-3.0 with additional terms (attribution, names): see NOTICE.
const CACHE = 'koffykraft-roastbooks-125aae59e7';
const HASHES = {"account.html":"2dc24bf9d526","app.config.js":"1ae3981dbbd7","app.css":"7237975351c2","app.js":"4e0042838a1c","apple-touch-icon.png":"d87f97772b48","brew.html":"9746a3d81228","brewkb.js":"37bdbdfcca5d","capture.html":"da3fa2acbe98","cloud-ui.js":"a534c3db4d2c","colour.html":"5d891c571dcc","colour.js":"f3fd5adecd8a","contents.html":"4a06ffaa2768","contents.js":"0a9b63f79030","crop.html":"2f44d9778290","cup.html":"cd3bf1aa0753","data.html":"28463ed9df31","export.js":"c64472bce6fc","favicon-32.png":"1e903424a0d0","feedback.js":"187a644e7fe8","fieldlog-api.js":"437152610375","fieldlog.html":"1c31c3c5c98c","fieldlog.module.json":"6e053fb30717","guide-app.js":"83f604c152ce","guide-common.js":"e1430186a4ba","guide.html":"f1facd90ed81","home.html":"7b14372c1b5b","howto.js":"d7555b79b3bf","i18n.js":"c85674a2cb85","icon-192.png":"00d04c9086a1","icon-512.png":"3bf7f915abac","icon-maskable-512.png":"0d51b9035020","index.html":"cf01e3e7ee9f","jobs-api.js":"eef36018d5b9","jobs.html":"698fa14b6a13","jobs.module.json":"7fb09ad0cc2a","journey.html":"b55a3de1ff73","kk-app.json":"0af66b7dd638","kk-base.js":"db30acdffcc5","kk-crew.js":"7d24d8d91ed3","kk-doc.js":"cd710b6ef41e","kk-family.js":"1ad50c6d8347","kk-modules.js":"1c80bbabb28c","kk-photos.js":"f597d5ec85fc","kk-probe.js":"9cb6a7249f66","kk-reply.js":"cfffb103e75b","kk-social.js":"e5df2a70c771","kk-units.js":"94afab752091","kk.css":"0ccc47037efc","koffykraft-db.js":"1489e6bef0be","koffykraft-icon.svg":"e279eb71bfdb","koffykraft-logo-mark.png":"6f31a49e5809","koffykraft-wordmark.png":"55f58ac004ee","land-api.js":"98a5f9a7357b","land.html":"d43d41522e2f","land.module.json":"12c6621b8f18","learn.html":"1e4988a76fcd","ledger-api.js":"ec0c86162f07","ledger.html":"320c1377f8b0","ledger.module.json":"6f9c49d0d2d0","library.html":"97f35bbf877f","license.html":"0291cb53f437","map.html":"ef33c51ddfab","methods.html":"5d9e3a4a18b5","ocr.html":"345ad33fd47e","origin-db.js":"ee4f6698a959","origin.html":"56aef80d9186","package-lock.json":"05eaa81380fb","package.json":"8bcd5d0f569f","photos-api.js":"e7aab3e3dada","places.js":"a1e2ae67665b","prefs.js":"937b54a0d0ee","privacy.html":"b8600c1234de","process-run.html":"2acc508bd6f0","process.html":"3b216a313468","profile.html":"5fe599d928b3","pv.js":"6a17044259fd","qrcode.js":"648f1bfa751c","rehydration.html":"655bb768f73a","roast-graph.html":"9b7a14496702","roast-timer-v14.html":"1bba70aef3b5","roastbook.html":"cd6443b29764","roastbooks.html":"23661509a283","roasts.html":"ff09d1368ab7","rows.html":"fd434ead0b83","share.html":"749dc3d52d23","sharecard.js":"4353d2a0758a","snap.js":"86854ac9f7a8","stats.html":"b671463984a2","sync.js":"e10957a027f9","tap.js":"9fa65790b33b","team-api.js":"34f8317fea1f","team.html":"9429933a2482","team.module.json":"a5f03a6f9404","terms.html":"6aa41b2f8658","trace-api.js":"a74c2683802b","trace-core.js":"a376e57d4fef","trace.html":"88843584cbfc","trail.html":"831272360a3e","varieties.js":"e49634d6f7d3","water.html":"54e8f211c6ae","weather-api.js":"947dc8ca2a95","weather-core.js":"dd2a7e0e2fa3","weather.html":"46edac1b46a3","weather.module.json":"ad7495775889","worker.js":"a5718878382c","manifest.webmanifest":"66001d2465e7","LICENSE":"d8a6cc31abc1","lang/ml.js":"78d14e1deed9","lang/kn.js":"a235239b317c","lang/ta.js":"07750d59a33a","lang/es.js":"88fd9221fc39","lang/pt.js":"7cff01ea5242"};
const CORE = [
  './app.config.js',
  './app.js',
  './app.css',
  './places.js',
  './weather.html',
  './weather-core.js',
  './fieldlog.html',
  './team.html',
  './jobs.html',
  './ledger.html',
  './land.html',
  './roastbooks.html',
  './koffykraft-wordmark.png',
  './koffykraft-db.js',
  './roastbook.html',
  './roast-timer-v14.html',
  './roast-graph.html',
  './roasts.html',
  './capture.html',
  './ocr.html',
  './data.html',
  './manifest.webmanifest',
  './koffykraft-icon.svg',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './origin.html',
  './origin-db.js',
  './cup.html',
  './kk.css',
  './prefs.js',
  './cloud-ui.js',
  './water.html',
  './license.html',
  './LICENSE',
  './pv.js',
  './kk-family.js',
  './kk-reply.js',
  './guide.html',
  './guide-common.js',
  './guide-app.js',
  './library.html',
  './learn.html',
  './varieties.js',
  './colour.js',
  './brewkb.js',
  './methods.html',
  './crop.html',
  './map.html',
  './trail.html',
  './rows.html',
  './tap.js',
  './home.html',
  './contents.html',
  './contents.js',
  './journey.html',
  './feedback.js',
  './export.js',
  './share.html',
  './profile.html',
  './snap.js',
  './i18n.js',
  './lang/ml.js',
  './lang/kn.js',
  './lang/ta.js',
  './lang/es.js',
  './lang/pt.js',
  './howto.js',
  './sharecard.js',
  './kk-photos.js',
  './kk-doc.js',
  './kk-social.js',
  './kk-crew.js',
  './kk-base.js',
  './kk-units.js',
  './kk-probe.js',
  './colour.html',
  './trace.html',
  './trace-core.js',
  './qrcode.js',
];
// Cloudflare may answer page.html with a redirect to /page; a redirected answer cannot be handed to
// a page load, so copy it into a plain one.
async function clean(r) {
  if (!r || !r.redirected) return r;
  const b = await r.blob();
  return new Response(b, { status: r.status, statusText: r.statusText, headers: r.headers });
}
// Install: save every file of this build. A file whose contents match the copy already on this
// phone (same hash in the last build) is copied across, not downloaded again, so a deploy that
// changes two files costs the phone two downloads, not the whole app. Four at a time, so the page
// being used is not starved of network while this runs. A file that fails is fetched later on use.
async function installAll(H) {
  const c = await caches.open(CACHE);
  const prefix = CACHE.replace(/-[^-]+$/, '');
  let old = null,
    oldH = {};
  for (const k of await caches.keys()) {
    if (k === CACHE || !k.startsWith(prefix)) continue;
    const oc = await caches.open(k);
    const m = await oc.match('/__kk_hashes');
    if (m) {
      old = oc;
      oldH = await m.json().catch(() => ({}));
      break;
    }
  }
  const todo = CORE.slice();
  const one = async u => {
    const key = u.replace(/^\.\//, '');
    if (old && H[key] && oldH[key] === H[key]) {
      const hit = await old.match(u);
      if (hit) return c.put(u, hit);
    }
    const r = await fetch(new Request(u, { cache: 'reload' }))
      .then(clean)
      .catch(() => null);
    if (r && r.ok) await c.put(u, r);
  };
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      while (todo.length) await one(todo.shift()).catch(() => {});
    })
  );
  await c.put(
    '/__kk_hashes',
    new Response(JSON.stringify(H), { headers: { 'content-type': 'application/json' } })
  );
}
self.addEventListener('install', e => e.waitUntil(installAll(HASHES).then(() => self.skipWaiting())));
self.addEventListener('activate', e =>
  e.waitUntil(
    caches
      .keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  )
);
// Saved copy first. Within one build every file is fixed, so pages open from this phone at once,
// without waiting on a slow network. A new build changes this file (its cache name), so the phone
// installs the new copy in the background and the page offers to reload ("A new version is ready").
// API calls and other sites are never touched here.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const u = new URL(req.url);
  if (u.origin !== location.origin || u.pathname.startsWith('/api/')) return;
  const nav = req.mode === 'navigate';
  e.respondWith(
    (async () => {
      const c = await caches.open(CACHE);
      const p = u.pathname;
      const keys = nav
        ? [p, p.endsWith('/') ? p + 'index.html' : p.endsWith('.html') ? p : p + '.html']
        : [req];
      for (const k of keys) {
        const hit = await c.match(k, { ignoreSearch: true });
        if (hit) return hit;
      }
      const r = await fetch(req)
        .then(clean)
        .catch(() => null);
      if (r && r.ok && r.type !== 'opaque') await c.put(nav ? u.origin + p : req, r.clone());
      if (r) return r;
      return (nav && ((await c.match('./home.html')) || (await c.match('./index.html')))) || Response.error();
    })()
  );
});
