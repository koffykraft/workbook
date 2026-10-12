// KoffyKraft (C) 2026 T M Thomas. AGPL-3.0 with additional terms (attribution, names): see NOTICE.
// The KoffyKraft family of sites, as one line above the footer of every page: the main site and
// each app, with the one you are in shown but not linked. The app's own title still goes home.
(function () {
  var SITES = [
    ['site', 'KoffyKraft', 'https://koffykraft.coffee/'],
    ['roast', 'Roast', 'https://roast.koffykraft.coffee/'],
    ['koko', 'Koko', 'https://koko.koffykraft.coffee/'],
    ['rabr', 'RABR', 'https://rabr.koffykraft.coffee/'],
  ];
  function draw() {
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
