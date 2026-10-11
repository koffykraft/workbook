// KoffyKraft (C) 2026 T M Thomas. AGPL-3.0 with additional terms (attribution, names): see NOTICE.
// Local weights to kg. Records always store kg, so lots from different countries compare.
// When a kg field is in focus, a row of local units appears under it: type the number in that
// unit (for example 3 quintals), tap the unit, and the field changes to kg.
// Sources: Royal Coffee, coffee bag weights; Sweet Maria's Coffee Library (quintal, fanega).
(function () {
  if (window.KKUNITS) return;
  const UNITS = [
    { u: 'lb', kg: 0.45359237, t: 'pound' },
    { u: 'arroba', kg: 15, t: 'Brazil, 15 kg' },
    { u: 'quintal 46', kg: 46, t: 'Latin America, 100 lb' },
    { u: 'quintal 100', kg: 100, t: 'Ethiopia, 100 kg' },
    { u: 'bag 50', kg: 50, t: 'India, Monsooned Malabar' },
    { u: 'bag 60', kg: 60, t: 'Brazil, India, Africa, Indonesia' },
    { u: 'bag 69', kg: 69, t: 'Central America, Mexico, Peru' },
    { u: 'bag 70', kg: 70, t: 'Colombia' },
    { u: 'fanega', kg: 250, t: 'cherry only, about 250 kg' },
  ];
  const toKg = (v, u) => {
    const x = UNITS.find(a => a.u === u);
    const n = parseFloat(v);
    return x && Number.isFinite(n) ? Math.round(n * x.kg * 100) / 100 : null;
  };
  window.KKUNITS = { UNITS, toKg };

  // which fields hold kg: data-k or data-sk ending in Kg, or the plain kg columns
  const isKg = el =>
    el &&
    el.tagName === 'INPUT' &&
    el.type === 'number' &&
    /(^kg$|Kg$|^cherryIn$)/.test(el.dataset.k || el.dataset.sk || '');
  const css = document.createElement('style');
  css.textContent =
    '.kku{display:flex;flex-wrap:wrap;gap:5px;margin:5px 0 2px;font-size:12px;color:#77716a;align-items:center}.kku button{font:inherit;font-size:12px;border:1px solid #ddd8d0;background:#fff;color:#171512;border-radius:999px;padding:4px 9px;min-height:28px}.kku-done{font-size:12px;color:#5b7a3a;margin-top:3px}';
  (document.head || document.documentElement).appendChild(css);
  let bar = null;
  const drop = () => {
    if (bar) bar.remove();
    bar = null;
  };
  document.addEventListener('focusin', e => {
    const el = e.target;
    if (!isKg(el)) return drop();
    if (bar && bar._for === el) return;
    drop();
    bar = document.createElement('div');
    bar.className = 'kku';
    bar._for = el;
    bar.innerHTML =
      '<span>In another unit? Type it, then tap:</span>' +
      UNITS.map(
        x => '<button type="button" data-u="' + x.u + '" title="' + x.t + '">' + x.u + '</button>'
      ).join('');
    bar.addEventListener('mousedown', ev => ev.preventDefault());
    bar.addEventListener('click', ev => {
      const b = ev.target.closest('button[data-u]');
      if (!b) return;
      const was = el.value,
        kg = toKg(was, b.dataset.u);
      if (kg == null) return;
      el.value = kg;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      drop();
      if (!el.isConnected) return;
      const note = document.createElement('div');
      note.className = 'kku-done';
      note.textContent = was + ' ' + b.dataset.u + ' = ' + kg + ' kg';
      const at = el.closest('.unitwrap') || el;
      at.parentNode.insertBefore(note, at.nextSibling);
      setTimeout(() => note.remove(), 6000);
    });
    const after = el.closest('.unitwrap') || el;
    after.parentNode.insertBefore(bar, after.nextSibling);
  });
  document.addEventListener('focusout', e => {
    if (bar && bar._for === e.target) setTimeout(() => document.activeElement !== e.target && drop(), 150);
  });
})();
