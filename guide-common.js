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
  const plant = W('crop') === 'rubber' ? 'tree' : 'plant',
    plants = plant + 's';
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
      what: "Products, buyers, suppliers, transporters, units and the app's own lists, so everyone picks the same name instead of typing it their own way. Buyers, suppliers and transporters also keep their details.",
      steps: [
        'Open Account › Library, or pick "Edit this list…" at the bottom of any drop-down.',
        'Add a name once; it appears in every drop-down that uses that list. Edit renames it, Hide takes it off the lists, Delete removes one you added.',
        'A name typed under "Other (type it)" joins the list on its own.',
        'Tap a buyer, supplier or transporter to keep GSTIN, address, phone, bank, UPI and credit days.',
        "Inputs and tools bought: tap an item (urea, a spray, a knife) to see who sells it, which brand, pack and last price. Each purchase you record adds or updates that line, and a supplier's page lists what they sell.",
        'My business (top of the Library): your own name, GSTIN, address, UPI ID and bank, used on payment requests.',
      ],
    },
    {
      id: 'map',
      pages: ['map'],
      title: 'Map',
      open: 'map.html',
      what: 'Outlines and spots on a satellite map, with the trails and rows you have recorded.',
      steps: [
        'Map › pick a ' +
          block.toLowerCase() +
          ' › Mark: tap each corner, then Finish. Area and height are worked out.',
        'Add a spot for a store, shed, water source or gate.',
        'Trails you walk show on the map in the colour of their kind (see Trails below).',
        'Save and share: a map link, KML for Google Earth, GeoJSON, or a printed sheet.',
      ],
    },
    {
      id: 'trails',
      pages: ['trail'],
      title: 'Trails',
      open: 'trail.html',
      what:
        'Walk something with the phone and keep its line: a ' +
        block.toLowerCase() +
        ' walk, a footpath, road, drain, fence or boundary, a working route, or the rows of ' +
        plants +
        '. Add stops with notes and photos on the way. Trails are kept on this phone only, not in your account, so save a backup now and then.',
      steps: [
        'Trails › ● Start a trail. Allow location when the phone asks.',
        'Pick what the trail is (path, road, drain, fence, route…). The kind sets its colour here and on the Map; you can change it later.',
        'Tap ● Start and walk. Keep the screen on and the page open: phones stop giving the location to a web page when the screen goes off. ❚❚ Pause for a break, ● Resume to carry on.',
        'On the way: 📷 Photo here for a picture at that spot, ＋ Stop for a note (a spring, a damaged tree, a gate, a soil pit).',
        'Finish when you are done. Rename it, change the kind, add stops on the map, or edit a stop’s note and photos.',
        'Distance, time and climb show for each trail. Rough GPS fixes (worse than about 50 m) are left out.',
        'Share or save one trail: Trail pack (.zip with photos and a page that opens anywhere), GPX for hiking apps, KML for Google Earth, or GeoJSON.',
        'Back up all trails (.zip) from the Trails list, and keep the file in Drive or Files. Open a trail file brings a pack or backup back, on this phone or a new one.',
      ],
      tips: [
        'To map ' +
          plant +
          ' rows, walk up one row, cross over, walk down the next and so on in one trail; then open Rows › From a trail and give the spacing.',
        'GPS is best in the open and weaker under thick canopy. Stand still a few seconds at corners and row ends.',
        'Clearing the browser’s site data, or uninstalling, removes trails that were never saved as a file.',
      ],
    },
    {
      id: 'rows',
      pages: ['rows'],
      title: 'Rows and ' + plants,
      open: 'rows.html',
      what:
        'Each row of a ' +
        block.toLowerCase() +
        ' as a line on the map, with its ' +
        plants +
        ' placed along it at the spacing you give, numbered and labelled (R3-12), each with its own status and note.',
      steps: [
        'Rows › pick the ' + block.toLowerCase() + '. The first time, add one row in any of four ways:',
        'From a trail: Trails › Record, walk up the first row, turn, down the next, and so on; Stop. Then Rows › From a trail › pick it. Each straight run between the turns is offered as a row: tick the ones that are rows, give the spacing in the row, Make these rows.',
        'Walk a row: stand at the first ' + plant + ', Start, walk to the last, Stop.',
        'Draw a row: tap its start and its end on the satellite map (and any bends).',
        'Copy a row alongside: once one row is right, copy it across the ' +
          block.toLowerCase() +
          ' at the spacing between rows.',
        'Open a row to rename it, give a label prefix, the spacing, where the first ' +
          plant +
          ' stands, the variety and the year planted. Reverse direction if the numbers run the wrong way.',
        'Tap a ' +
          plant +
          ' on the map (zoom in close to see the numbers), or open All ' +
          plants +
          ' in this row, to mark it Healthy, Weak, Sick, Dead, Gap or Replanted with a note.',
        'Kind of row: main crop, intercrop, short-term crop, shade, boundary and so on. Each kind has its own colour on the map; tap a colour under Colours to change it, and add or rename kinds in Library › Row kinds. The ' +
          block.toLowerCase() +
          ' outline shows dashed in the Boundary colour.',
        'Export CSV or GeoJSON, or print the map.',
      ],
      tips: [
        'Phone GPS is good to a few metres, so a dot may sit a little off the real ' +
          plant +
          '; its number along the row is what counts. Stop for a few seconds at each row end while walking.',
        'If the first ' +
          plant +
          ' is not right at the start of the line, set "First ' +
          plant +
          ' from the start".',
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
        "Sale: buyer and product from the lists, quantity, rate; the amount works itself out. A lot can fill it. The buyer's GSTIN and credit days show, and the payment due date fills in.",
        'Dispatch (inside a sale): transporter, vehicle, driver phone, e-way bill, LR number, freight, dispatched and delivered dates.',
        'Open a saved sale › Ask for payment: a message with amount, due date and your bank, a UPI QR the buyer scans, sent by WhatsApp or share.',
        'Receipt: money in from a buyer. Payment: money out; a supplier with a UPI ID gets a Pay by UPI link. Under What was bought, pick the item, brand and quantity; earlier brands and prices from that supplier show as taps.',
        'Summary: payments due and late, totals for each month, what each buyer owes. Export to CSV for the accountant.',
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
