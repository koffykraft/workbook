// KoffyKraft (C) 2026 T M Thomas. AGPL-3.0 with additional terms (attribution, names): see NOTICE.
// KoffyKraft tap feedback: every tap shows a ripple where the finger landed,
// and the tapped button dips for a moment, so you know the tap registered.
(function () {
  if (window.__kkTap) return;
  window.__kkTap = true;
  const css =
    '*{-webkit-tap-highlight-color:transparent}' +
    '.kk-press{transform:scale(.96)!important;filter:brightness(.9);transition:transform .07s ease,filter .07s ease!important}' +
    '.kk-rip{position:fixed;z-index:2147483646;pointer-events:none;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;background:rgba(141,88,59,.28);box-shadow:0 0 0 2px rgba(141,88,59,.35);transform:scale(.3);opacity:1;animation:kkrip .38s ease-out forwards}' +
    '@keyframes kkrip{to{transform:scale(1.6);opacity:0}}' +
    '@media (prefers-reduced-motion:reduce){.kk-rip{animation:kkripr .3s linear forwards;transform:scale(1)}@keyframes kkripr{to{opacity:0}}.kk-press{transform:none!important}}';
  const st = document.createElement('style');
  st.textContent = css;
  (document.head || document.documentElement).appendChild(st);
  // iOS only applies :active styles when a touch listener exists
  document.addEventListener('touchstart', function () {}, { passive: true });
  const SEL =
    'button,a[href],[role=button],summary,label,select,.chip,.btn,.tile,.ntile,.card[onclick],[onclick],[data-go],[data-dg],[data-ts],[data-lv],[data-rl],[data-l],[data-sp],input[type=checkbox],input[type=radio],input[type=range]';
  let pressed = null,
    since = 0;
  function release() {
    const el = pressed;
    if (!el) return;
    pressed = null;
    const wait = Math.max(0, 110 - (Date.now() - since));
    setTimeout(() => el.classList.remove('kk-press'), wait);
  }
  document.addEventListener(
    'pointerdown',
    function (e) {
      if (e.button > 0) return;
      const t = e.target instanceof Element ? e.target : null;
      if (!t) return;
      const el = t.closest(SEL);
      const onMap = t.closest('.leaflet-container');
      if (!el && !onMap) return;
      if (el && (el.disabled || el.getAttribute('aria-disabled') === 'true')) return;
      const r = document.createElement('span');
      r.className = 'kk-rip';
      r.style.left = e.clientX + 'px';
      r.style.top = e.clientY + 'px';
      document.body.appendChild(r);
      setTimeout(() => r.remove(), 450);
      if (el && !/^(INPUT|SELECT)$/.test(el.tagName) && !el.closest('.leaflet-container')) {
        release();
        pressed = el;
        since = Date.now();
        el.classList.add('kk-press');
        try {
          navigator.vibrate && navigator.vibrate(8);
        } catch (x) {}
      }
    },
    { capture: true, passive: true }
  );
  ['pointerup', 'pointercancel', 'pointerleave', 'scroll'].forEach(ev =>
    document.addEventListener(ev, release, { capture: true, passive: true })
  );
})();
// New version notice: when a newer copy of the app arrives, a small bar at the bottom of any page
// offers to reload; the Account page (App version card) offers it too.
(function () {
  if (!('serviceWorker' in navigator) || window.__kkUpd) return;
  window.__kkUpd = true;
  const had = !!navigator.serviceWorker.controller;
  function mark() {
    try {
      localStorage.setItem('kk_update_ready', '1');
    } catch (e) {}
    window.dispatchEvent(new Event('kk-update'));
    bar();
  }
  function bar() {
    if (document.getElementById('kk-upd-bar') || !document.body) return;
    const b = document.createElement('div');
    b.id = 'kk-upd-bar';
    b.setAttribute('role', 'status');
    b.style.cssText =
      'position:fixed;left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom));z-index:9999;display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:14px;background:#1d1512;color:#fff;font:15px system-ui,sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.25)';
    b.innerHTML =
      '<span style="flex:1">A new version is ready.</span><button type="button" style="border:0;border-radius:999px;padding:8px 14px;font:inherit;font-weight:600;background:#fff;color:#1d1512">Update</button><button type="button" aria-label="Later" style="border:0;background:none;color:#fff;font-size:20px;padding:0 4px">×</button>';
    const [go, later] = b.querySelectorAll('button');
    go.onclick = () => {
      try {
        localStorage.removeItem('kk_update_ready');
      } catch (e) {}
      location.reload();
    };
    later.onclick = () => b.remove();
    document.body.appendChild(b);
  }
  navigator.serviceWorker.addEventListener('message', e => {
    if (e.data && e.data.kk === 'updated') mark();
  });
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (had) mark();
  });
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .getRegistration()
      .then(r => r && r.update())
      .catch(() => {});
  });
})();
