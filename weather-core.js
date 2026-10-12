// KoffyKraft (C) 2026 T M Thomas. AGPL-3.0 with additional terms (attribution, names): see NOTICE.
// Weather sources, shared by the page (which fetches from the phone, so the free services see the
// farmer's own connection) and the Worker (nightly top-up). Every source returns the same rows:
// { day: 'YYYY-MM-DD', rain, tmin, tmax, rh, et0 } with null where a value is missing.
(function () {
  const SOURCES = {
    openmeteo: {
      label: 'Open-Meteo (about 10 km grid, back to 1940)',
      credit:
        'Weather data by <a href="https://open-meteo.com/" target="_blank" rel="noopener">Open-Meteo.com</a> (CC BY 4.0), from ERA5 and national weather models. The free service is for non-commercial use.',
    },
    nasapower: {
      label: 'NASA POWER (about 50 km grid, back to 1981)',
      credit:
        'Weather data from the <a href="https://power.larc.nasa.gov/" target="_blank" rel="noopener">NASA Langley Research Center POWER Project</a>, funded through the NASA Earth Science Applied Science Program.',
    },
    file: { label: 'My own file (station, IMD or other)', credit: 'From a file you brought in.' },
  };
  const iso = d => new Date(d).toISOString().slice(0, 10);
  const n = v =>
    v == null || v === '' || +v <= -990 || !Number.isFinite(+v) ? null : Math.round(+v * 10) / 10;
  const DAILY =
    'precipitation_sum,temperature_2m_max,temperature_2m_min,relative_humidity_2m_mean,et0_fao_evapotranspiration';
  function omRows(d) {
    const x = (d && d.daily) || {};
    return (x.time || []).map((day, i) => ({
      day,
      rain: n((x.precipitation_sum || [])[i]),
      tmax: n((x.temperature_2m_max || [])[i]),
      tmin: n((x.temperature_2m_min || [])[i]),
      rh: n((x.relative_humidity_2m_mean || [])[i]),
      et0: n((x.et0_fao_evapotranspiration || [])[i]),
    }));
  }
  async function getJson(f, url) {
    const r = await f(url);
    const d = await r.json().catch(() => ({}));
    if (!r.ok || d.error) throw new Error(d.reason || d.message || 'weather service said ' + r.status);
    return d;
  }
  // Open-Meteo: the archive lags about five days, so the latest days come from the forecast
  // service, which also keeps the past three months.
  async function openmeteo(f, lat, lng, from, to) {
    const now = new Date();
    const recent = iso(new Date(now.getTime() - 85 * 864e5));
    const rows = new Map();
    const loc = 'latitude=' + lat + '&longitude=' + lng + '&daily=' + DAILY + '&timezone=auto';
    if (from < recent) {
      const end = to < recent ? to : iso(new Date(now.getTime() - 6 * 864e5));
      const d = await getJson(
        f,
        'https://archive-api.open-meteo.com/v1/archive?' + loc + '&start_date=' + from + '&end_date=' + end
      );
      omRows(d).forEach(r => rows.set(r.day, r));
    }
    if (to >= recent) {
      const d = await getJson(
        f,
        'https://api.open-meteo.com/v1/forecast?' + loc + '&past_days=92&forecast_days=1'
      );
      omRows(d)
        .filter(r => r.day >= from && r.day <= to && r.rain != null)
        .forEach(r => rows.set(r.day, r));
    }
    return [...rows.values()].filter(r => r.day >= from && r.day <= to);
  }
  async function nasapower(f, lat, lng, from, to) {
    const d = await getJson(
      f,
      'https://power.larc.nasa.gov/api/temporal/daily/point?parameters=PRECTOTCORR,T2M_MAX,T2M_MIN,RH2M&community=AG&format=JSON&latitude=' +
        lat +
        '&longitude=' +
        lng +
        '&start=' +
        from.replace(/-/g, '') +
        '&end=' +
        to.replace(/-/g, '')
    );
    const P = (d.properties && d.properties.parameter) || {};
    return Object.keys(P.PRECTOTCORR || {})
      .sort()
      .map(k => ({
        day: k.slice(0, 4) + '-' + k.slice(4, 6) + '-' + k.slice(6, 8),
        rain: n(P.PRECTOTCORR[k]),
        tmax: n((P.T2M_MAX || {})[k]),
        tmin: n((P.T2M_MIN || {})[k]),
        rh: n((P.RH2M || {})[k]),
        et0: null,
      }))
      .filter(r => r.rain != null || r.tmax != null);
  }
  async function fetchDays(source, lat, lng, from, to, f) {
    f = f || fetch.bind(globalThis);
    if (!Number.isFinite(+lat) || !Number.isFinite(+lng)) throw new Error('This place has no GPS point');
    if (source === 'nasapower') return nasapower(f, +lat, +lng, from, to);
    return openmeteo(f, +lat, +lng, from, to);
  }
  // Rows from a station or IMD file: finds the date, rain and temperature columns by their names.
  const PICK = {
    day: /^(date|day|time|obs.*date|datetime)/,
    rain: /(rain|precip|ppt|rf\b|rainfall)/,
    tmax: /(t.?max|max.*temp|temp.*max|maximum)/,
    tmin: /(t.?min|min.*temp|temp.*min|minimum)/,
    rh: /(rh|humid)/,
    et0: /(et0|eto|evapo)/,
  };
  function toDay(v) {
    v = String(v || '').trim();
    let m;
    if ((m = v.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/)))
      return m[1] + '-' + m[2].padStart(2, '0') + '-' + m[3].padStart(2, '0');
    if ((m = v.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/)))
      return m[3] + '-' + m[2].padStart(2, '0') + '-' + m[1].padStart(2, '0'); // day first, as in India
    if ((m = v.match(/^(\d{4})(\d{2})(\d{2})$/))) return m[1] + '-' + m[2] + '-' + m[3];
    return '';
  }
  function fromTable(rows) {
    if (!rows.length) return { rows: [], cols: {} };
    const keys = Object.keys(rows[0]);
    const cols = {};
    for (const [k, re] of Object.entries(PICK))
      cols[k] = keys.find(h => re.test(h) && !Object.values(cols).includes(h)) || '';
    const out = rows
      .map(r => ({
        day: toDay(r[cols.day]),
        rain: n(r[cols.rain]),
        tmax: n(r[cols.tmax]),
        tmin: n(r[cols.tmin]),
        rh: n(r[cols.rh]),
        et0: n(r[cols.et0]),
      }))
      .filter(r => /^\d{4}-\d{2}-\d{2}$/.test(r.day));
    return { rows: out, cols };
  }
  globalThis.WXCORE = { SOURCES, fetchDays, fromTable, toDay };
})();
