// KoffyKraft (C) 2026 T M Thomas. AGPL-3.0 with additional terms (attribution, names): see NOTICE.
// Generated from kk-app.json by scripts/kk-modules.mjs. Edit kk-app.json, not this file.
const APP = {
  name: 'KoffyKraft',
  short: 'KoffyKraft',
  by: '',
  about: 'Coffee from plant to cup.',
  color: '#8d583b',
  bg: '#f7f5f0',
  feedbackTo: 'info@koffykraft.coffee',
  account: 'profile.html',
  placesPage: 'origin',
  syncRecords: false,
  places: {
    farm: 'estate',
    block: 'plot',
    parent: 'estateId',
  },
  words: {
    farm: 'Estate',
    farms: 'Estates',
    block: 'Plot',
    blocks: 'Plots',
    crop: 'coffee',
  },
  nav: [
    ['origin', 'Origin'],
    ['roast-timer-v14', 'Timer'],
    ['roast-graph', 'Graph'],
    ['roasts', 'Roastbook'],
    ['cup', 'Cup'],
    ['account', 'Account'],
  ],
  moduleNav: 'subnav',
  moduleParent: 'origin',
  subnav: [
    ['origin', 'Records'],
    ['weather', 'Weather'],
    ['fieldlog', 'Field log'],
    ['team', 'Team'],
    ['jobs', 'Jobs'],
  ],
  modules: ['weather', 'fieldlog', 'team', 'jobs'],
  settings: {
    weather: {
      source: 'openmeteo',
      rainyDayMm: 2.5,
      firstYears: 2,
    },
    fieldlog: {
      nutrientKinds: [
        'Fertiliser',
        'Manure or compost',
        'Lime or dolomite',
        'Foliar spray',
        'Bio-input',
        'Other',
      ],
      products: [
        'Urea 46-0-0',
        'DAP 18-46-0',
        'MOP 0-0-60',
        'SSP 0-16-0',
        'Rock phosphate 0-18-0',
        'NPK 17-17-17',
        'NPK 10-26-26',
        'Factamfos 20-20-0',
        'Ammonium sulphate 21-0-0',
        'Farmyard manure',
        'Compost',
        'Vermicompost',
        'Neem cake',
        'Dolomite',
        'Agricultural lime',
      ],
      units: ['kg', 'g', 't', 'bag 50 kg', 'l', 'ml'],
      waterKinds: ['Blossom irrigation', 'Backing irrigation', 'Summer irrigation', 'Fertigation', 'Other'],
      waterMethods: ['Sprinkler', 'Drip', 'Hose or basin', 'Flood', 'Other'],
      healthIssues: [
        'White stem borer',
        'Coffee berry borer',
        'Shot hole borer',
        'Mealybug',
        'Green scale',
        'Leaf rust',
        'Black rot',
        'Root disease',
        'Nematodes',
        'Nutrient deficiency',
        'Drought stress',
        'Waterlogging',
        'Weeds',
        'Animal damage',
        'Other',
      ],
      severity: ['Low', 'Medium', 'High'],
    },
    team: {
      currency: '₹',
      roles: ['Picker', 'Worker', 'Supervisor', 'Writer', 'Driver', 'Watchman', 'Other'],
      weeklyOff: [0],
      halfDay: 0.5,
      leaveKinds: [
        {
          name: 'Paid leave',
          pay: 1,
        },
        {
          name: 'Sick leave',
          pay: 1,
        },
        {
          name: 'Unpaid leave',
          pay: 0,
        },
      ],
    },
    jobs: {
      kinds: [
        {
          name: 'Picking',
          unit: 'kg',
          basis: 'unit',
        },
        {
          name: 'Gleaning',
          unit: 'kg',
          basis: 'unit',
        },
        {
          name: 'Weeding',
          unit: 'day',
          basis: 'day',
        },
        {
          name: 'Pruning',
          unit: 'plant',
          basis: 'unit',
        },
        {
          name: 'Handling (desuckering)',
          unit: 'day',
          basis: 'day',
        },
        {
          name: 'Shade regulation',
          unit: 'day',
          basis: 'day',
        },
        {
          name: 'Spraying',
          unit: 'tank',
          basis: 'unit',
        },
        {
          name: 'Manuring',
          unit: 'plant',
          basis: 'unit',
        },
        {
          name: 'Liming',
          unit: 'day',
          basis: 'day',
        },
        {
          name: 'Pulping and drying',
          unit: 'day',
          basis: 'day',
        },
        {
          name: 'Other',
          unit: '',
          basis: 'fixed',
        },
      ],
    },
  },
  navOn: {
    weather: 'origin',
    fieldlog: 'origin',
    team: 'origin',
    jobs: 'origin',
  },
  mods: [
    {
      name: 'weather',
      page: 'weather',
      label: 'Weather',
      blurb:
        "Daily rain and temperature for each farm from Open-Meteo or NASA POWER, or from your own station's file. Kept in your account and topped up every night.",
    },
    {
      name: 'fieldlog',
      page: 'fieldlog',
      label: 'Field log',
      blurb:
        'What went on each block: fertiliser, manure and lime with the nutrients they carry, watering, and pests, disease and plant health.',
    },
    {
      name: 'team',
      page: 'team',
      label: 'Team',
      blurb:
        'Workers, the daily muster with a GPS check, leave and holidays, advances, and the monthly register with wages.',
    },
    {
      name: 'jobs',
      page: 'jobs',
      label: 'Jobs',
      blurb:
        'Field work by place and day: who did it, how much, and at what rate. Piece work feeds the Team wages.',
    },
  ],
  types: ['estate', 'plot'],
  db: '',
};
if (typeof document !== 'undefined') {
  document.documentElement.style.setProperty('--app', APP.color);
  document.documentElement.style.setProperty('--bg', APP.bg);
}
