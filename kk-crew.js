// KoffyKraft (C) 2026 T M Thomas. AGPL-3.0 with additional terms (attribution, names): see NOTICE.
// People and hours on a record: who worked on it, at which task, from when to when. One person can
// have several rows in a day (picking first, sorting later); others can join part way. Recorded only:
// wages still come from the muster and jobs. The Team page lists every row of a day.
// Use: KKCREW.mount(element, () => record, dayString). Rows live in record.crew.
const KKCREW = (() => {
  const h = s =>
    String(s == null ? '' : s).replace(
      /[&<>"']/g,
      c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
    );
  const DEF = [
    'Picking',
    'Sorting',
    'Floating',
    'Pulping',
    'Fermentation',
    'Washing',
    'Drying',
    'Turning',
    'Hulling',
    'Grading',
    'Packing',
    'Other',
  ];
  const tasks = () => {
    try {
      const k = ((APP.settings || {}).jobs || {}).kinds || [];
      const n = k.map(x => x.name).filter(Boolean);
      return n.length ? n : DEF;
    } catch (e) {
      return DEF;
    }
  };
  const auth = () => ({
    authorization: 'Bearer ' + (typeof SYNC !== 'undefined' && SYNC.getToken ? SYNC.getToken() || '' : ''),
  });
  const KEY = 'kk_crew_people';
  let people = null;
  async function names() {
    if (people) return people;
    try {
      people = JSON.parse(localStorage.getItem(KEY) || '[]');
    } catch (e) {
      people = [];
    }
    try {
      const r = await fetch('/api/team/workers', { headers: auth() });
      if (r.ok) {
        const d = await r.json();
        people = (d.items || []).filter(w => w.active).map(w => w.name);
        try {
          localStorage.setItem(KEY, JSON.stringify(people));
        } catch (e) {}
      }
    } catch (e) {}
    return people;
  }
  const mins = t => {
    const m = /^(\d{1,2}):(\d{2})$/.exec(t || '');
    return m ? +m[1] * 60 + +m[2] : null;
  };
  const hrs = x => {
    const a = mins(x.start),
      b = mins(x.end);
    return a != null && b != null && b > a ? (b - a) / 60 : null;
  };
  const r1 = v => Math.round(v * 10) / 10;
  const now = () => {
    const d = new Date();
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  };
  // overlapping rows of the same person on the same day
  function clashes(rows) {
    const bad = new Set();
    rows.forEach((a, i) =>
      rows.forEach((b, j) => {
        if (j <= i || !a.who || a.who !== b.who || (a.day || '') !== (b.day || '')) return;
        const a0 = mins(a.start),
          a1 = mins(a.end),
          b0 = mins(b.start),
          b1 = mins(b.end);
        if ([a0, a1, b0, b1].some(v => v == null)) return;
        if (a0 < b1 && b0 < a1) bad.add(i).add(j);
      })
    );
    return bad;
  }
  // "3 people · 9.5 h (Picking 6 h, Sorting 3.5 h)"
  function summary(rec) {
    const rows = (rec && rec.crew) || [];
    if (!rows.length) return '';
    const who = new Set(rows.map(x => x.who).filter(Boolean));
    const by = {};
    let tot = 0;
    rows.forEach(x => {
      const v = hrs(x);
      if (v == null) return;
      tot += v;
      by[x.task || 'Other'] = (by[x.task || 'Other'] || 0) + v;
    });
    const parts = Object.entries(by).map(([k, v]) => k + ' ' + r1(v) + ' h');
    return (
      who.size +
      (who.size === 1 ? ' person' : ' people') +
      (tot ? ' · ' + r1(tot) + ' h' : '') +
      (parts.length > 1 ? ' (' + parts.join(', ') + ')' : parts.length ? ' (' + Object.keys(by)[0] + ')' : '')
    );
  }
  function mount(el, get, day) {
    if (!el) return;
    const T = tasks();
    const draw = async () => {
      const r = get(),
        rows = (r.crew = r.crew || []);
      const ppl = await names();
      const bad = clashes(rows);
      el.innerHTML =
        '<datalist id="dl-crew">' +
        [...new Set([...ppl, ...rows.map(x => x.who)])]
          .filter(Boolean)
          .map(n => '<option value="' + h(n) + '">')
          .join('') +
        '</datalist>' +
        (rows.length
          ? rows
              .map(
                (x, i) =>
                  '<div class="row" style="gap:6px;margin:4px 0;flex-wrap:wrap;align-items:center' +
                  (bad.has(i) ? ';outline:2px solid #c0573f;border-radius:8px;padding:2px' : '') +
                  '"><input data-cr="who" data-cr-i="' +
                  i +
                  '" list="dl-crew" value="' +
                  h(x.who) +
                  '" placeholder="who" style="flex:2;min-width:110px"><select data-cr="task" data-cr-i="' +
                  i +
                  '" style="flex:2;min-width:110px">' +
                  [...new Set([...T, x.task].filter(Boolean))]
                    .map(t => '<option' + (t === x.task ? ' selected' : '') + '>' + h(t) + '</option>')
                    .join('') +
                  '</select><input data-cr="start" data-cr-i="' +
                  i +
                  '" type="time" value="' +
                  h(x.start) +
                  '" style="flex:1;min-width:88px"><input data-cr="end" data-cr-i="' +
                  i +
                  '" type="time" value="' +
                  h(x.end) +
                  '" style="flex:1;min-width:88px"><span class="mini" data-cr-h="' +
                  i +
                  '" style="min-width:40px">' +
                  (hrs(x) != null ? r1(hrs(x)) + ' h' : '') +
                  '</span><button type="button" class="btn small" data-cr-rm="' +
                  i +
                  '" aria-label="Remove">✕</button></div>'
              )
              .join('')
          : '<div class="mini">No one added yet.</div>') +
        (bad.size
          ? '<div class="mini" style="color:#c0573f">Times overlap for the same person: check the outlined rows.</div>'
          : '') +
        '<div class="row" style="gap:6px;margin-top:6px;flex-wrap:wrap;align-items:center"><button type="button" class="btn small" data-cr-add>＋ Person</button><span class="mini" data-cr-sum>' +
        h(summary(r)) +
        '</span></div>';
      el.querySelectorAll('[data-cr]').forEach(inp => {
        const ev = inp.tagName === 'SELECT' ? 'change' : 'input';
        inp.addEventListener(ev, e => {
          e.stopPropagation();
          const row = get().crew[+inp.dataset.crI];
          row[inp.dataset.cr] = inp.value.trim();
          const hh = el.querySelector('[data-cr-h="' + inp.dataset.crI + '"]');
          if (hh) hh.textContent = hrs(row) != null ? r1(hrs(row)) + ' h' : '';
          el.querySelector('[data-cr-sum]').textContent = summary(get());
        });
        if (inp.dataset.cr !== 'who') inp.addEventListener('change', () => draw());
        else inp.addEventListener('change', () => clashes(get().crew).size && draw());
      });
      el.querySelectorAll('[data-cr-rm]').forEach(
        b =>
          (b.onclick = () => {
            get().crew.splice(+b.dataset.crRm, 1);
            draw();
          })
      );
      el.querySelector('[data-cr-add]').onclick = () => {
        const rows = get().crew,
          last = rows[rows.length - 1] || {};
        rows.push({
          who: '',
          task: last.task || T[0],
          start: last.start || now(),
          end: '',
          day: (typeof day === 'function' ? day() : day) || new Date().toISOString().slice(0, 10),
        });
        draw().then(() => {
          const w = el.querySelectorAll('[data-cr="who"]');
          w[w.length - 1].focus({ preventScroll: true });
        });
      };
    };
    return draw();
  }
  return { mount, summary, hrs, tasks };
})();
