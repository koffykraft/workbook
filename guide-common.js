// KoffyKraft (C) 2026 T M Thomas. AGPL-3.0 with additional terms (attribution, names): see NOTICE.
// The user guide, shared part: what works the same in every KoffyKraft app. Each app adds its own
// sections in guide-app.js. A section shows only when its module is in the app.
// Section: { id, title, need (module name, optional), open (page to open), what, steps[], tips[] }
/* global APP */
(function () {
  const W = k => (APP.words && APP.words[k]) || k;
  const farm = W('farm'),
    farms = W('farms'),
    block = W('block'),
    blocks = W('blocks');
  const placesPage = (APP.placesPage || 'places') + '.html';
  const accountPage = APP.account || 'account.html';
  window.KK_GUIDE_COMMON = [
    {
      id: 'start',
      pages: ['home', 'index'],
      title: 'Start here',
      open: 'home.html',
      what: 'The app runs in your phone browser and keeps working without a signal. Records stay on the phone until you sign in; then they follow your account to every phone you use.',
      steps: [
        'Open the app address in Chrome or Safari.',
        'Add it to the home screen: Share › Add to Home Screen on iPhone, or the ⋮ menu › Add to home screen on Android. It then opens like an app.',
        'Start on Home: each tile opens one part of the app. The menu across the top has the main pages; some have a second row.',
        'Tap the ? beside the page name on any page to come back to the right part of this guide.',
      ],
      tips: [
        'Nothing is lost when the signal drops: entries made offline wait on the phone and go out when it is back online.',
      ],
    },
    {
      id: 'account',
      pages: ['account', 'profile', 'data'],
      title: 'Sign in and sync',
      open: accountPage,
      what: 'One account per farm or business. Sign in on every phone that should see the same records.',
      steps: [
        'Open the account page (the round person button at the top right).',
        'Type your email and tap Send code. Type the code from the email.',
        'Records already on the phone are sent to your account, and records from your other phones come in.',
        'To have staff enter records for you, sign in on their phone with the same account.',
      ],
      tips: [
        '"Waiting to send" beside an entry means the phone has not been online since; it goes on its own.',
        'Sign out on a phone you no longer use.',
      ],
    },
    {
      id: 'places',
      pages: ['places', 'origin', 'farm'],
      title: farms + ' and ' + blocks.toLowerCase(),
      open: placesPage,
      what:
        'Each ' +
        farm.toLowerCase() +
        ' and its ' +
        blocks.toLowerCase() +
        ', with area, GPS point and the details that matter for the crop. Every other page picks from this list.',
      steps: [
        'Add the ' + farm.toLowerCase() + ' first: name, area, GPS point (tap 📍 standing there).',
        'Add each ' + block.toLowerCase() + ' under it. Fields marked * are needed.',
        'Mark the outline on the Map for an exact area and for buyers who ask where the crop grew.',
      ],
      tips: [
        'In drop-downs each ' +
          farm.toLowerCase() +
          ' shows first as "Whole …", then its ' +
          blocks.toLowerCase() +
          '.',
      ],
    },
    {
      id: 'library',
      title: 'Library: the drop-down lists',
      open: 'library.html',
      what: "Products, buyers, suppliers, units and the app's own lists, so everyone picks the same name instead of typing it their own way.",
      steps: [
        'Open Account › Library, or pick "Edit this list…" at the bottom of any drop-down.',
        'Add a name once; it appears in every drop-down that uses that list.',
        'Hide a name that is no longer used. To rename, add the new name and hide the old one.',
        'A name typed under "Other (type it)" joins the list on its own.',
      ],
    },
    {
      id: 'map',
      pages: ['trail'],
      title: 'Map and trails',
      open: 'map.html',
      what: 'Outlines and spots on a satellite map, and paths, roads and routes walked with the phone.',
      steps: [
        'Map › pick a ' +
          block.toLowerCase() +
          ' › Mark: tap each corner, then Finish. Area and height are worked out.',
        'Add a spot for a store, shed, water source or gate.',
        'Trails › Record, choose the kind (road, footpath, drain, route), walk it, Stop. Trails show on the map.',
        'Save and share: a map link, KML for Google Earth, GeoJSON, or a printed sheet.',
      ],
    },
    {
      id: 'weather',
      title: 'Weather',
      need: 'weather',
      open: 'weather.html',
      what: 'Daily rain and temperature for each place with a GPS point, from free weather services, kept year after year.',
      steps: [
        'Weather › pick a place › Get the weather. Choose how far back.',
        'Leave "keep up to date" on and the last days are added every night.',
        'Have your own rain gauge or station file? Bring it in as a file.',
      ],
    },
    {
      id: 'fieldlog',
      title: 'Field log',
      need: 'fieldlog',
      open: 'fieldlog.html',
      what:
        'What went on each ' +
        block.toLowerCase() +
        ' and when: nutrients, watering, plant health and work done.',
      steps: [
        'Pick the tab: Nutrients, Watering, Plant health or Work done › ＋ New entry.',
        'Choose the place and the date, fill what you know, Save.',
        'For a disease or damage, tap 📍 Use my location under the tree so it shows on the Map.',
        'Each tab shows a summary for the year: nutrients per hectare, watering, trees lost, jobs done.',
      ],
    },
    {
      id: 'team',
      title: 'Team and wages',
      need: 'team',
      open: 'team.html',
      what: "Workers and their details, the daily muster with a GPS check, leave, advances and the month's wages.",
      steps: [
        'Workers › ＋ Worker: name, role, pay (by the day, month, hour or piece) and the rate. More details holds address, emergency contact, how wages are paid, skills and task.',
        "Muster each day: tap P, H, A, L or O for each worker and Save. The phone's GPS is kept with it.",
        'Hourly workers: put the hours in "Hours, overtime and notes".',
        'Month and wages: days, overtime, piece work from Jobs, advances and the net pay, ready to print.',
      ],
      tips: ['A changed mark or pay rate asks for a reason and keeps the old one in the log.'],
    },
    {
      id: 'jobs',
      title: 'Jobs and piece rates',
      need: 'jobs',
      open: 'jobs.html',
      what: "Field work by place and day: who did it, how much and at what rate. Jobs done add to the month's wages.",
      steps: [
        '＋ New job: date, kind of work, place.',
        'Paid by quantity, days, hours or a fixed sum; the rate last used for that work fills in.',
        "Put each worker's quantity, Save. Mark it done to send it to wages.",
      ],
    },
    {
      id: 'ledger',
      title: 'Sales and money',
      need: 'ledger',
      open: 'ledger.html',
      what: 'The sales sheet, money received and money paid out, and what each buyer still owes.',
      steps: [
        'Sale: buyer and product from the lists, quantity, rate; the amount works itself out. A lot can fill it.',
        'Receipt: money in from a buyer. Payment: money out, with what it was for.',
        'Summary: totals for the month and what each buyer owes. Export to CSV for the accountant.',
      ],
    },
    {
      id: 'land',
      title: 'Land and dues',
      need: 'land',
      open: 'land.html',
      what: 'Land records, taxes and dues with the next due date, and licences with their renewal dates.',
      steps: [
        'Add each land record: survey number, area, ownership, documents.',
        'Add dues (land tax, insurance, loan) with the next due date; Record payment when paid.',
        'Due soon lists what falls due in the next two months.',
      ],
    },
    {
      id: 'data',
      title: 'Your data',
      open: accountPage,
      what: 'Your records are yours: save them, move them, or delete them.',
      steps: [
        'Account › Save all records (.json) keeps a full copy you can store in Drive or Files.',
        'Open a saved file on Account to restore it on any phone.',
        'Most lists have Export CSV for Excel or Google Sheets.',
      ],
    },
  ];
})();
