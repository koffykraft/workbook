// KoffyKraft (C) 2026 T M Thomas. AGPL-3.0 with additional terms (attribution, names): see NOTICE.
// Roast's own sections of the user guide, drawn from the Contents list (contents.js) so the guide
// and Contents never disagree. Each Contents group becomes one section with its features listed.
window.KK_LEARN = true;
window.KK_GUIDE_APP = new Promise(done => {
  const make = () =>
    (window.KK_CONTENTS || [])
      .filter(g => g[0] !== 'data' && g[0] !== 'estate')
      .map(([id, title, what, items]) => {
        const pages = [
          ...new Set(
            (items || [])
              .map(i =>
                String(i[3] || '')
                  .split(/[#?]/)[0]
                  .replace(/\.html$/, '')
              )
              .filter(Boolean)
          ),
        ];
        return {
          id: 'kk-' + id,
          title,
          what,
          items,
          pages,
          open: (items && items[0] && String(items[0][3] || '').split('#')[0]) || '',
          learn: id === 'learn' ? '' : 'learn.html',
        };
      });
  if (window.KK_CONTENTS) return done(make());
  const s = document.createElement('script');
  s.src = 'contents.js';
  s.onload = () => done(make());
  s.onerror = () => done([]);
  document.head.appendChild(s);
});
