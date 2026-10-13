// KoffyKraft (C) 2026 T M Thomas. AGPL-3.0 with additional terms (attribution, names): see NOTICE.
// The KoffyKraft family of sites, as one line above the footer of every page: the main site and
// each app, with the one you are in shown but not linked. The app's own title still goes home.
(function () {
  var SITES = [
    ['site', 'KoffyKraft', 'https://koffykraft.coffee/'],
    ['roast', 'Roast', 'https://roast.koffykraft.coffee/'],
    ['koko', 'Koko', 'https://koko.koffykraft.coffee/'],
    ['rabr', 'Rabr', 'https://rabr.koffykraft.coffee/'],
    ['buna', 'Buna', 'https://buna.koffykraft.coffee/'],
  ];
  // a ? beside the account button on every page, opening this page's part of the guide
  function help() {
    if (document.querySelector('.kkh-help')) return true;
    var acct = document.querySelector('.kkh-acct');
    if (!acct) return false;
    var page =
      (document.body && document.body.dataset.page) ||
      (location.pathname.split('/').pop() || 'home').replace(/\.html$/, '');
    if (page === 'guide') return true;
    var a = document.createElement('a');
    a.className = 'kkh-help';
    a.href = 'guide.html#' + encodeURIComponent(page);
    a.setAttribute('aria-label', 'Guide to this page');
    a.textContent = '?';
    a.style.cssText =
      'display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;border:1px solid rgba(0,0,0,.15);margin-left:auto;margin-right:8px;flex-shrink:0;font-weight:700;text-decoration:none;color:inherit;background:#fff';
    acct.parentNode.insertBefore(a, acct);
    var wrap = acct.parentNode;
    if (getComputedStyle(wrap).display !== 'flex') wrap.style.display = 'flex';
    return true;
  }
  function draw() {
    // the header may be drawn after this runs, so try again for a moment
    if (!help()) {
      var n = 0,
        t = setInterval(function () {
          if (help() || ++n > 20) clearInterval(t);
        }, 150);
    }
    if (document.querySelector('.kk-family')) return;
    var here = location.hostname.split('.')[0];
    var el = document.createElement('nav');
    el.className = 'kk-family';
    el.setAttribute('aria-label', 'KoffyKraft sites');
    el.innerHTML = SITES.map(function (s) {
      return s[0] === here
        ? '<b aria-current="page">' + s[1] + '</b>'
        : '<a href="' + s[2] + '">' + s[1] + '</a>';
    }).join('<span aria-hidden="true"> · </span>');
    var foot = document.querySelector('#kf, .foot, footer');
    var main = document.querySelector('main') || document.body;
    if (foot && foot.parentNode) foot.parentNode.insertBefore(el, foot);
    else main.appendChild(el);
    if (!document.getElementById('kk-family-css')) {
      var st = document.createElement('style');
      st.id = 'kk-family-css';
      st.textContent =
        '.kk-family{margin:28px 0 6px;padding-top:12px;border-top:1px solid rgba(0,0,0,.08);font-size:13px;text-align:center;color:#7a7368;letter-spacing:.02em}' +
        '.kk-family a{color:inherit;text-decoration:underline;text-underline-offset:3px}.kk-family b{color:#3b342b}' +
        '@media print{.kk-family{display:none}}';
      document.head.appendChild(st);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', draw);
  else draw();
})();
