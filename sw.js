// KoffyKraft (C) 2026 T M Thomas. AGPL-3.0 with additional terms (attribution, names): see NOTICE.
const CACHE = 'koffykraft-roastbooks-cda1895afb';
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
// Install: save every file of this build. A file that fails is skipped, not fatal; it is fetched
// and saved the first time a page asks for it.
self.addEventListener('install', e =>
  e.waitUntil(
    caches
      .open(CACHE)
      .then(c =>
        Promise.all(
          CORE.map(u =>
            fetch(new Request(u, { cache: 'reload' }))
              .then(clean)
              .then(r => r && r.ok && c.put(u, r))
              .catch(() => {})
          )
        )
      )
      .then(() => self.skipWaiting())
  )
);
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
