// KoffyKraft (C) 2026 T M Thomas. AGPL-3.0 with additional terms (attribution, names): see NOTICE.
// Languages for overviews and explanations only. Labels, fields, buttons, numbers and tips stay
// in English, so a translation can never break how a page works.
//
// To add a language: copy lang/ml.js to lang/<code>.js, translate the right-hand side of each
// line, and add the code and its own name to LANGS below. The English text is the key: if a
// page's English changes, that line simply shows in English until the translation is updated.
(function () {
  if (window.KKI18N) return;
  const LANGS = { en: 'English', ml: 'മലയാളം' };
  let lang = 'en';
  try {
    lang = localStorage.getItem('kk_lang') || 'en';
  } catch (e) {}
  if (!LANGS[lang]) lang = 'en';
  window.KKI18N = { lang, LANGS };

  // the picker, next to the account button in the header
  function picker() {
    const top = document.querySelector('.kkh-top');
    if (!top || top.querySelector('.kk-lang')) return;
    const s = document.createElement('select');
    s.className = 'kk-lang';
    s.setAttribute('aria-label', 'Language for explanations');
    s.innerHTML = Object.entries(LANGS)
      .map(([k, v]) => '<option value="' + k + '"' + (k === lang ? ' selected' : '') + '>' + v + '</option>')
      .join('');
    s.onchange = () => {
      try {
        localStorage.setItem('kk_lang', s.value);
      } catch (e) {}
      location.reload();
    };
    const acct = top.querySelector('.kkh-acct');
    let wrap = top.querySelector('.kkh-right');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.className = 'kkh-right';
      if (acct) {
        top.insertBefore(wrap, acct);
        wrap.appendChild(acct);
      } else top.appendChild(wrap);
    }
    wrap.insertBefore(s, wrap.firstChild);
  }
  const css = document.createElement('style');
  css.textContent =
    '.kkh-right{display:flex;align-items:center;gap:8px}.kk-lang{width:auto!important;min-height:36px;font:inherit;font-size:14px!important;border:1px solid #ddd8d0;border-radius:999px;background:#fff;color:#171512;padding:6px 26px 6px 12px;-webkit-appearance:none;appearance:none;background-image:linear-gradient(45deg,transparent 50%,#77716a 50%),linear-gradient(135deg,#77716a 50%,transparent 50%);background-position:calc(100% - 14px) 52%,calc(100% - 9px) 52%;background-size:5px 5px;background-repeat:no-repeat}' +
    '[lang=ml]{font-family:"Noto Sans Malayalam","Malayalam Sangam MN","Manjari",-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif;line-height:1.65;letter-spacing:0}h1 [lang]{font-size:.82em;line-height:1.3;display:inline-block}@media(max-width:360px){.kk-lang{padding:6px 22px 6px 9px;font-size:13px!important}}';
  (document.head || document.documentElement).appendChild(css);

  let dict = null;
  const norm = s => s.replace(/\s+/g, ' ').trim();
  function swap(node) {
    if (!dict) return;
    const w = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, {
      acceptNode: n =>
        n.parentElement &&
        !n.parentElement.closest('script,style,textarea,input,select,option,[contenteditable],[data-no-i18n]')
          ? 1
          : 2,
    });
    const hits = [];
    let n;
    while ((n = w.nextNode())) {
      const k = norm(n.nodeValue);
      if (k.length > 12 && dict[k]) hits.push([n, dict[k]]);
    }
    for (const [t, v] of hits) {
      const lead = t.nodeValue.match(/^\s*/)[0],
        trail = t.nodeValue.match(/\s*$/)[0];
      const span = document.createElement('span');
      span.lang = lang;
      span.title = norm(t.nodeValue);
      span.textContent = lead + v + trail;
      t.parentNode.replaceChild(span, t);
    }
  }
  function start() {
    picker();
    if (lang === 'en') return;
    const sc = document.createElement('script');
    sc.src = 'lang/' + lang + '.js';
    sc.onload = () => {
      const src = (window.KK_LANG || {})[lang] || {};
      dict = {};
      for (const k in src) dict[norm(k)] = src[k];
      swap(document.body);
      new MutationObserver(ms => {
        for (const m of ms)
          for (const a of m.addedNodes) {
            if (a.nodeType === 1 && !a.closest('[lang=' + lang + ']')) swap(a);
            else if (a.nodeType === 3 && a.parentElement) swap(a.parentElement);
          }
      }).observe(document.body, { childList: true, subtree: true });
    };
    document.head.appendChild(sc);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
