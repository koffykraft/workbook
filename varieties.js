// KoffyKraft (C) 2026 T M Thomas. AGPL-3.0 with additional terms (attribution, names): see NOTICE.
// Coffee variety reference. Facts only, written for KoffyKraft, with sources credited.
// IN  = Central Coffee Research Institute (CCRI, Coffee Board of India) releases, as listed by
//       TNAU Agritech Portal and Counter Culture Coffee, "India's Arabica Coffee Varieties".
// WCR = World Coffee Research, Arabica Coffee Varieties catalog (2019), varieties.worldcoffeeresearch.org
// Traits from WCR are its ratings under ideal conditions. alt: altitude band where WCR rates the variety best
// (L = low and up, M = medium and up, H = high).
const VARIETY_SRC = {
  WCRR: {
    name: '',
    links: [
      [
        'World Coffee Research, Robusta varieties catalog',
        'https://varieties.worldcoffeeresearch.org/robusta/varieties',
      ],
      [
        'World Coffee Research, Arabica + Robusta catalog (PDF)',
        'https://cdn2.assets-servd.host/worldcoffee-research/production/pdf/catalogEnglish/Combined/complete-1769602232.pdf',
      ],
    ],
  },
  INC: {
    name: '',
    links: [
      [
        'Incaper and Embrapa, Vitória Incaper 8142 technical sheet',
        'https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/909443/1/Conilonvitoria.pdf',
      ],
    ],
  },
  SUC: {
    name: '',
    links: [['Sucafina, coffee varieties glossary', 'https://sucafina.com/na/About/glossary']],
  },
  RC: {
    name: '',
    links: [
      [
        'Royal Coffee, Indonesian coffee cultivars and varieties',
        'https://royalcoffee.com/indonesian-coffee-cultivars-and-varieties/',
      ],
    ],
  },
  KEW: {
    name: '',
    links: [
      [
        'Davis et al., Nature Plants (2025), via Daily Coffee News',
        'https://dailycoffeenews.com/2025/08/21/study-says-liberica-and-excelsa-are-separate-species-with-implications-for-cultivation/',
      ],
      ['Sucafina, coffee varieties glossary', 'https://sucafina.com/na/About/glossary'],
    ],
  },
  IN: {
    name: 'CCRI releases (Coffee Board of India), as listed by:',
    links: [
      [
        'TNAU Agritech Portal',
        'https://agritech.tnau.ac.in/horticulture/horti_plantation%20crops_coffee.html',
      ],
      [
        'Counter Culture Coffee',
        'https://counterculturecoffee.com/blogs/counter-culture-coffee/india-s-arabica-coffee-varieties',
      ],
      [
        'Agriculture Institute (robusta)',
        'https://agriculture.institute/crop-production-technology/understanding-coffee-varieties-india',
      ],
    ],
  },
  WCR: {
    name: '',
    links: [
      [
        'World Coffee Research, Arabica Coffee Varieties (2019)',
        'https://varieties.worldcoffeeresearch.org/',
      ],
    ],
  },
};
const KK_VARIETIES = [
  // India, arabica
  {
    n: 'Kents',
    a: 'Kent',
    sp: 'Arabica',
    s: 'IN',
    line: 'Old Indian selection',
    t: 'Parent of S.795 and Sln 6. WCR DNA work links it to Bourbon-related varieties.',
  },
  {
    n: 'Sln 1 (S.288)',
    sp: 'Arabica',
    s: 'IN',
    line: 'Selection from S.26, a natural arabica x liberica cross',
    t: 'Rust resistant (races 1 and 2). First CCRI release, 1936-37.',
  },
  {
    n: 'Sln 3 (S.795)',
    a: 'SLN 795 (S795)|S795|S.795|Selection 795|Sln 795|Lini S|Linie S|Jember|S 795',
    sp: 'Arabica',
    s: 'IN',
    line: 'S.288 x Kents',
    t: 'Rust resistant (races 1 and 2). Bold beans, high A grade. Released 1945-46.',
  },
  { n: 'Sln 4 (Cioccie)', sp: 'Arabica', s: 'IN', line: 'Ethiopian pure line selections' },
  { n: 'Sln 5A', sp: 'Arabica', s: 'IN', line: 'Devamachy x S.881', t: 'Arabica x robusta background.' },
  {
    n: 'Sln 5B',
    a: 'SLN 5B',
    sp: 'Arabica',
    s: 'IN',
    line: 'Devamachy x S.333',
    t: 'Arabica x robusta background.',
  },
  {
    n: 'Sln 6 (S.2828)',
    a: 'Sln 6|S.2828',
    sp: 'Arabica',
    s: 'IN',
    line: 'S.274 (robusta) x Kents',
    t: "High A grade. Rwanda's RAB C15 is a selection of it (WCR).",
  },
  { n: 'Sln 7', sp: 'Arabica', s: 'IN', line: 'From San Ramon', t: 'Dwarf habit.' },
  { n: 'Sln 7.3', sp: 'Arabica', s: 'IN', line: 'S.2498 x Hibrido de Timor' },
  { n: 'Sln 8', sp: 'Arabica', s: 'IN', line: 'Pure line of Hibrido de Timor', t: 'Strong rust resistance.' },
  {
    n: 'Sln 9',
    a: 'SLN 9|Selection 9',
    sp: 'Arabica',
    s: 'IN',
    line: 'Hibrido de Timor (Sln 8) x Tafarikela',
    t: 'Drought hardy. Known for cup quality.',
  },
  {
    n: 'Sln 10',
    sp: 'Arabica',
    s: 'IN',
    line: 'Caturra x (S.795 x Hibrido de Timor)',
    t: 'Rust resistant. Parentage is reported differently by some sources.',
  },
  {
    n: 'Sln 11',
    sp: 'Arabica',
    s: 'IN',
    line: 'C. liberica x C. eugenioides progeny',
    t: 'Field rust resistance and drought hardiness.',
  },
  {
    n: 'Sln 12 (Cauvery)',
    a: 'Cauvery (Catimor)|Cauvery|Catimor India',
    sp: 'Arabica',
    s: 'IN',
    line: 'Caturra x Hibrido de Timor (Catimor)',
    t: 'Dwarf, for close planting. High yield. Released 1985.',
  },
  {
    n: 'Sln 13 (Chandragiri)',
    a: 'Chandragiri|Sln 13|SLN 13',
    sp: 'Arabica',
    s: 'IN',
    line: 'Villa Sarchi x Hibrido de Timor (Sarchimor)',
    t: 'Fairly rust resistant. Widely planted now. Released 2007.',
  },
  { n: 'San Ramon', sp: 'Arabica', s: 'IN', line: 'Short internode arabica', t: 'Dwarf.' },
  { n: 'Hawaiian Red Caturra (HRC)', sp: 'Arabica', s: 'IN', line: 'Caturra type' },
  // India, robusta
  {
    n: 'S.274 (Sln 1R)',
    a: 'Robusta SLN 274|S274|Sln 274',
    sp: 'Robusta',
    s: 'IN',
    line: 'Selected mother plants S.274 and S.270',
    t: 'Vigorous, large trees. Plant together with S.270 (cross pollination).',
  },
  { n: 'S.270', sp: 'Robusta', s: 'IN', line: 'Selected mother plant', t: 'Partner clone for S.274.' },
  {
    n: 'CxR',
    a: 'Robusta CxR',
    sp: 'Robusta',
    s: 'IN',
    line: 'C. congensis x C. canephora',
    t: 'Compact, for close planting. Bold beans, low acidity.',
  },
  { n: 'Sln 3R', sp: 'Robusta', s: 'IN', line: 'CCRI robusta selection' },
  // World, Bourbon and Typica related (WCR)
  {
    n: 'Typica',
    sp: 'Arabica',
    s: 'WCR',
    line: 'Typica',
    st: 'Tall',
    q: 'Very good',
    y: 'Low',
    rust: 'Susceptible',
    alt: 'H',
  },
  {
    n: 'Bourbon',
    sp: 'Arabica',
    s: 'WCR',
    line: 'Bourbon',
    st: 'Tall',
    q: 'Very good',
    y: 'Medium',
    rust: 'Susceptible',
    alt: 'H',
  },
  {
    n: 'Caturra',
    sp: 'Arabica',
    s: 'WCR',
    line: 'Natural mutation of Bourbon',
    st: 'Dwarf',
    q: 'Good',
    y: 'Good',
    rust: 'Susceptible',
    alt: 'H',
  },
  {
    n: 'Villa Sarchi',
    sp: 'Arabica',
    s: 'WCR',
    line: 'Natural mutation of Bourbon',
    st: 'Dwarf',
    q: 'Good',
    y: 'Good',
    rust: 'Susceptible',
    alt: 'M',
  },
  {
    n: 'Pacas',
    sp: 'Arabica',
    s: 'WCR',
    line: 'Natural mutation of Bourbon',
    st: 'Dwarf',
    q: 'Good',
    y: 'Good',
    rust: 'Susceptible',
    alt: 'H',
  },
  {
    n: 'SL28',
    sp: 'Arabica',
    s: 'WCR',
    line: 'Selection of Tanganyika Drought Resistant, Bourbon-like',
    st: 'Tall',
    q: 'Exceptional',
    y: 'Very high',
    rust: 'Susceptible',
    alt: 'M',
  },
  {
    n: 'SL34',
    sp: 'Arabica',
    s: 'WCR',
    line: 'Typica-like',
    st: 'Tall',
    q: 'Exceptional',
    y: 'High',
    rust: 'Susceptible',
    alt: 'M',
  },
  {
    n: 'KP423',
    sp: 'Arabica',
    s: 'WCR',
    line: 'Selection of Kent (an Indian variety), Bourbon-like',
    st: 'Tall',
    q: 'Low',
    y: 'High',
    rust: 'Tolerant',
    alt: 'M',
  },
  {
    n: 'Maragogipe',
    sp: 'Arabica',
    s: 'WCR',
    line: 'Natural mutation of Typica',
    st: 'Tall',
    q: 'Very good',
    y: 'Low',
    rust: 'Susceptible',
    alt: 'H',
    t: 'Very large beans.',
  },
  {
    n: 'Mundo Novo',
    sp: 'Arabica',
    s: 'WCR',
    line: 'Typica x Bourbon',
    st: 'Tall',
    q: 'Good',
    y: 'High',
    rust: 'Susceptible',
    alt: 'H',
  },
  {
    n: 'Catuai',
    sp: 'Arabica',
    s: 'WCR',
    line: 'Mundo Novo x Caturra',
    st: 'Dwarf',
    q: 'Good',
    y: 'Good',
    rust: 'Susceptible',
    alt: 'H',
  },
  {
    n: 'Pacamara',
    sp: 'Arabica',
    s: 'WCR',
    line: 'Pacas x Maragogipe',
    st: 'Dwarf',
    q: 'Exceptional',
    y: 'Good',
    rust: 'Susceptible',
    alt: 'H',
    t: 'Very large beans.',
  },
  {
    n: 'Geisha (Panama)',
    a: 'Gesha|Geisha',
    sp: 'Arabica',
    s: 'WCR',
    line: 'Ethiopian landrace',
    st: 'Tall',
    q: 'Exceptional',
    y: 'Medium',
    rust: 'Tolerant',
    alt: 'H',
  },
  {
    n: 'Java',
    sp: 'Arabica',
    s: 'WCR',
    line: 'Ethiopian landrace',
    st: 'Tall',
    q: 'Very good',
    y: 'Medium',
    rust: 'Tolerant',
    alt: 'H',
    t: 'Tolerant to coffee berry disease.',
  },
  // World, introgressed (Timor Hybrid) (WCR)
  {
    n: 'Catimor 129',
    sp: 'Arabica',
    s: 'WCR',
    line: 'Catimor line from Colombia (Caturra x Timor Hybrid 1343)',
    st: 'Dwarf',
    q: 'Good',
    y: 'Very high',
    rust: 'Resistant',
    alt: 'L',
  },
  {
    n: 'Costa Rica 95',
    sp: 'Arabica',
    s: 'WCR',
    t: 'Its rust resistance has broken down in Costa Rica.',
    line: 'Timor Hybrid 832/1 x Caturra (Catimor)',
    st: 'Dwarf',
    q: 'Low',
    y: 'High',
    rust: 'Susceptible',
    alt: 'L',
  },
  {
    n: 'Marsellesa',
    sp: 'Arabica',
    s: 'WCR',
    line: 'Timor Hybrid 832/2 x Villa Sarchi (Sarchimor)',
    st: 'Dwarf',
    q: 'Good',
    y: 'High',
    rust: 'Resistant',
    alt: 'L',
  },
  {
    n: 'Parainema',
    sp: 'Arabica',
    s: 'WCR',
    line: 'Sarchimor (T5296 selection)',
    st: 'Dwarf',
    q: 'Good',
    y: 'Good',
    rust: 'Resistant',
    alt: 'L',
    t: 'Nematode tolerant.',
  },
  {
    n: 'Obata',
    sp: 'Arabica',
    s: 'WCR',
    line: 'Timor Hybrid 832/2 x Villa Sarchi (Sarchimor)',
    st: 'Dwarf',
    q: 'Good',
    y: 'High',
    rust: 'Resistant',
    alt: 'L',
  },
  {
    n: 'Ruiru 11',
    sp: 'Arabica',
    s: 'WCR',
    line: 'Composite: Catimor x multi-cross selections',
    st: 'Dwarf',
    q: 'Good',
    y: 'Very high',
    rust: 'Tolerant',
    alt: 'L',
    t: 'Resistant to coffee berry disease.',
  },
  {
    n: 'Batian',
    sp: 'Arabica',
    s: 'WCR',
    line: 'Composite with SL28, SL34, Rume Sudan, N39, K7, SL4 and Timor Hybrid parentage',
    st: 'Tall',
    q: 'Very good',
    y: 'High',
    rust: 'Tolerant',
    alt: 'L',
  },
  {
    n: 'Centroamericano (H1)',
    sp: 'Arabica',
    s: 'WCR',
    line: 'T5296 x Rume Sudan (F1 hybrid)',
    st: 'Dwarf',
    q: 'Very good',
    y: 'Very high',
    rust: 'Resistant',
    alt: 'L',
  },
  {
    n: 'Starmaya',
    sp: 'Arabica',
    s: 'WCR',
    line: 'Marsellesa x Ethiopian/Sudanese wild accession (F1 hybrid)',
    st: 'Dwarf',
    q: 'Very good',
    y: 'High',
    rust: 'Resistant',
    alt: 'M',
  },
  // World, more from the WCR Arabica catalogue (2019): East Africa, Central and South America
  {
    n: 'Bourbon Mayaguez 139',
    a: 'BM139|BM 139',
    sp: 'Arabica',
    s: 'WCR',
    line: 'Bourbon-related, Rwanda Agriculture Board',
    st: 'Tall',
    q: 'Very good',
    y: 'High',
    rust: 'Susceptible',
    alt: 'M',
    t: 'Common in Rwanda and Burundi. Vigorous and productive. Susceptible to coffee berry disease.',
  },
  {
    n: 'Bourbon Mayaguez 71',
    a: 'BM71|BM 71',
    sp: 'Arabica',
    s: 'WCR',
    line: 'Bourbon-related, Rwanda Agriculture Board',
    st: 'Tall',
    q: 'Good',
    y: 'Medium',
    rust: 'Susceptible',
    alt: 'M',
    t: 'Rwanda and Burundi. Suited to medium altitudes; susceptible to the main diseases.',
  },
  {
    n: 'Jackson 2/1257',
    a: 'Jackson',
    sp: 'Arabica',
    s: 'WCR',
    line: 'Selection of Jackson, Bourbon-related',
    st: 'Tall',
    q: 'Good',
    y: 'High',
    rust: 'Susceptible',
    alt: 'M',
    t: 'Rwanda and Burundi. Very vigorous and productive.',
  },
  {
    n: 'K7',
    sp: 'Arabica',
    s: 'WCR',
    line: 'Selected from French Mission, Bourbon-related',
    st: 'Tall',
    q: 'Good',
    y: 'High',
    rust: 'Tolerant',
    alt: 'L',
    t: 'Kenya and Tanzania. Tolerant to rust and coffee berry disease, so it suits lower altitudes where rust is common. Selected in Kenya in 1936.',
  },
  {
    n: 'Tekisic',
    a: 'Improved Bourbon',
    sp: 'Arabica',
    s: 'WCR',
    line: 'Selection of Bourbon',
    st: 'Tall',
    q: 'Very good',
    y: 'Medium',
    rust: 'Susceptible',
    alt: 'H',
    t: 'El Salvador. Chosen for cup quality at the highest altitudes. Ripens early.',
  },
  {
    n: 'Venecia',
    sp: 'Arabica',
    s: 'WCR',
    line: 'Natural mutation of Bourbon',
    st: 'Dwarf',
    q: 'Good',
    y: 'Good',
    rust: 'Susceptible',
    alt: 'M',
    t: 'Costa Rica. Late harvest in the dry season suits rainy zones. Very susceptible to rust.',
  },
  {
    n: 'Harar Rwanda',
    a: 'Harrar|Harar|Harraghe',
    sp: 'Arabica',
    s: 'WCR',
    line: 'Typica-related, brought to Rwanda in 1956',
    st: 'Tall',
    q: 'Very good',
    y: 'High',
    rust: 'Susceptible',
    alt: 'M',
    t: 'The Harar found in Rwanda, no longer recommended there because its productive life is short. Many coffees share the name Harar and are not the same plant.',
  },
  {
    n: 'Mibirizi',
    sp: 'Arabica',
    s: 'WCR',
    line: 'Likely Typica-related',
    st: 'Tall',
    q: 'Exceptional',
    y: 'Good',
    rust: 'Susceptible',
    alt: 'H',
    t: 'Rwanda and Burundi smallholders. Drought tolerant and copes with little care, but susceptible to the main diseases.',
  },
  {
    n: 'Nyasaland',
    a: 'Bugisu Local|Nyasa',
    sp: 'Arabica',
    s: 'WCR',
    line: 'Likely Typica-related',
    st: 'Tall',
    q: 'Good',
    y: 'Good',
    rust: 'Susceptible',
    alt: 'M',
    t: 'Preferred by smallholders in Uganda. Needs few inputs and copes with hard conditions.',
  },
  {
    n: 'Pache',
    sp: 'Arabica',
    s: 'WCR',
    line: 'Natural mutation of Typica',
    st: 'Dwarf',
    q: 'Good',
    y: 'Medium',
    rust: 'Susceptible',
    alt: 'H',
    t: 'Best above 1200 m with under 2,500 mm of rain a year; above 1400 m in Peru.',
  },
  {
    n: 'Pop3303/21',
    sp: 'Arabica',
    s: 'WCR',
    line: 'Selection of Blue Mountain Jamaica in Rwanda, Typica-related',
    st: 'Tall',
    q: 'Good',
    y: 'High',
    rust: 'Resistant',
    alt: 'M',
    t: 'Rwanda. Drought tolerant, tolerant to coffee berry disease. Prone to die-back.',
  },
  {
    n: 'SL14',
    sp: 'Arabica',
    s: 'WCR',
    line: 'Typica-related, Scott Agricultural Laboratories',
    st: 'Tall',
    q: 'Good',
    y: 'High',
    rust: 'Susceptible',
    alt: 'M',
    t: 'Kenya and Uganda. Drought and cold tolerant, low nutrition needs.',
  },
  {
    n: 'Anacafe 14',
    sp: 'Arabica',
    s: 'WCR',
    line: '(Timor Hybrid 832/1 x Caturra) x Pacamara',
    st: 'Dwarf',
    q: 'Good',
    y: 'High',
    rust: 'Resistant',
    alt: 'M',
    t: 'Guatemala. Drought tolerant. Not uniform: seedlings differ from the parent.',
  },
  {
    n: 'Catisic',
    sp: 'Arabica',
    s: 'WCR',
    line: 'Timor Hybrid 832/1 x Caturra (Catimor)',
    st: 'Dwarf',
    q: 'Very low',
    y: 'High',
    rust: 'Resistant',
    alt: 'L',
    t: 'For the warmest zones and acidic soils. Susceptible to ojo de gallo leaf spot.',
  },
  {
    n: 'Fronton',
    sp: 'Arabica',
    s: 'WCR',
    line: 'Timor Hybrid x Caturra (Catimor)',
    st: 'Dwarf',
    q: 'Good',
    y: 'Good',
    rust: 'Resistant',
    alt: 'L',
    t: 'Puerto Rico. Early production; low and medium altitudes.',
  },
  {
    n: 'IHCAFE 90',
    sp: 'Arabica',
    s: 'WCR',
    line: 'Timor Hybrid 832/1 x Caturra (Catimor)',
    st: 'Dwarf',
    q: 'Very low',
    y: 'High',
    rust: 'Susceptible',
    alt: 'L',
    t: 'Honduras. Its rust resistance has been overcome there. Needs heavy feeding; very susceptible to ojo de gallo.',
  },
  {
    n: 'Lempira',
    sp: 'Arabica',
    s: 'WCR',
    line: 'Timor Hybrid 832/1 x Caturra (Catimor)',
    st: 'Dwarf',
    q: 'Low',
    y: 'High',
    rust: 'Susceptible',
    alt: 'L',
    t: 'Honduras. Its rust resistance has been overcome there. Warm zones and acidic soils.',
  },
  {
    n: 'Oro Azteca',
    sp: 'Arabica',
    s: 'WCR',
    line: 'Timor Hybrid 832/1 x Caturra (Catimor)',
    st: 'Dwarf',
    q: 'Good',
    y: 'High',
    rust: 'Resistant',
    alt: 'L',
    t: 'Warm zones, acidic and aluminium-rich soils. Susceptible to ojo de gallo.',
  },
  {
    n: 'T5175',
    sp: 'Arabica',
    s: 'WCR',
    line: 'Timor Hybrid 832/1 x Caturra (Catimor)',
    st: 'Dwarf',
    q: 'Very low',
    y: 'High',
    rust: 'Resistant',
    alt: 'L',
    t: 'Lowest altitudes, heavy feeding. Not uniform.',
  },
  {
    n: 'T8667',
    sp: 'Arabica',
    s: 'WCR',
    line: 'Timor Hybrid 832/1 x Caturra (Catimor)',
    st: 'Dwarf',
    q: 'Low',
    y: 'High',
    rust: 'Resistant',
    alt: 'L',
    t: 'Warm zones and acidic soils. Recommended at 800 to 1400 m in Peru.',
  },
  {
    n: 'Cuscatleco',
    sp: 'Arabica',
    s: 'WCR',
    line: 'Selection of T5296 (Sarchimor)',
    st: 'Dwarf',
    q: 'Good',
    y: 'Good',
    rust: 'Resistant',
    alt: 'L',
    t: 'Medium altitudes. Resists the root-knot nematode Meloidogyne exigua, not Pratylenchus.',
  },
  {
    n: 'IAPAR 59',
    sp: 'Arabica',
    s: 'WCR',
    line: 'Timor Hybrid 832/2 x Villa Sarchi (Sarchimor)',
    st: 'Dwarf',
    q: 'Low',
    y: 'Good',
    rust: 'Resistant',
    alt: 'L',
    t: 'Brazil. Resists Meloidogyne exigua nematodes.',
  },
  {
    n: 'Limani',
    sp: 'Arabica',
    s: 'WCR',
    line: 'Timor Hybrid 832/2 x Villa Sarchi (Sarchimor)',
    st: 'Dwarf',
    q: 'Good',
    y: 'Good',
    rust: 'Resistant',
    alt: 'L',
    t: 'Puerto Rico. True Limani is hard to find; plants sold under the name often differ from it.',
  },
  {
    n: 'T5296',
    sp: 'Arabica',
    s: 'WCR',
    line: 'Timor Hybrid 832/2 x Villa Sarchi (Sarchimor)',
    st: 'Dwarf',
    q: 'Good',
    y: 'Good',
    rust: 'Resistant',
    alt: 'L',
    t: 'Not uniform. Parent of Parainema, Cuscatleco and several F1 hybrids.',
  },
  {
    n: 'RAB C15',
    sp: 'Arabica',
    s: 'WCR',
    line: 'Selection of the Indian Sln 6 (Kents x robusta)',
    st: 'Tall',
    q: 'Very good',
    y: 'Very high',
    rust: 'Resistant',
    alt: 'M',
    t: 'Rwanda. Resistant to rust and coffee berry disease. An Indian variety, reselected in Africa.',
  },
  {
    n: 'Evaluna',
    a: 'EC18',
    sp: 'Arabica',
    s: 'WCR',
    line: 'Naryelis (Catimor) x Ethiopian accession ET06 (F1 hybrid)',
    st: 'Dwarf',
    q: 'Very good',
    y: 'High',
    rust: 'Susceptible',
    alt: 'H',
    t: 'F1 hybrid: plant only clones from trusted nurseries, as seeds do not breed true. Needs careful feeding while roots establish.',
  },
  {
    n: 'Milenio',
    a: 'H10',
    sp: 'Arabica',
    s: 'WCR',
    line: 'T5296 x Rume Sudan (F1 hybrid)',
    st: 'Dwarf',
    q: 'Very good',
    y: 'Very high',
    rust: 'Resistant',
    alt: 'M',
    t: 'F1 hybrid for healthy soils; suits agroforestry. Plant clones only.',
  },
  {
    n: 'Mundo Maya',
    a: 'EC16',
    sp: 'Arabica',
    s: 'WCR',
    line: 'T5296 x Ethiopian accession ET01 (F1 hybrid)',
    st: 'Dwarf',
    q: 'Very good',
    y: 'High',
    rust: 'Resistant',
    alt: 'M',
    t: 'F1 hybrid; also resists some nematodes. Plant clones only.',
  },
  {
    n: 'Nayarita',
    a: 'EC19',
    sp: 'Arabica',
    s: 'WCR',
    line: 'Naryelis x Ethiopian accession ET26 (F1 hybrid)',
    st: 'Dwarf',
    q: 'Very good',
    y: 'High',
    rust: 'Susceptible',
    alt: 'H',
    t: 'F1 hybrid for high altitudes. Plant clones only.',
  },
  {
    n: 'Casiopea',
    sp: 'Arabica',
    s: 'WCR',
    line: 'Caturra x Ethiopian accession ET41 (F1 hybrid)',
    st: 'Dwarf',
    q: 'Exceptional',
    y: 'High',
    rust: 'Susceptible',
    alt: 'H',
    t: 'F1 hybrid with no Timor Hybrid parentage. Plant clones only.',
  },
  {
    n: 'H3',
    sp: 'Arabica',
    s: 'WCR',
    line: 'Caturra x Ethiopian accession E531 (F1 hybrid)',
    st: 'Dwarf',
    q: 'Very good',
    y: 'High',
    rust: 'Susceptible',
    alt: 'H',
    t: 'F1 hybrid with no Timor Hybrid parentage. Plant clones only.',
  },
  {
    n: 'Ethiopian landrace (heirloom)',
    a: 'Heirloom|Ethiopian heirloom|Landrace|Ethiopian landrace',
    sp: 'Arabica',
    s: 'WCR',
    line: 'Local populations from the forests and gardens of Ethiopia, where arabica began',
    t: 'Hundreds of distinct local types, often sold together as "heirloom". Generally very high cup quality and lower yields.',
  },
  // More from the WCR Arabica + Robusta catalog (2026), facts in KoffyKraft's words
  {
    n: 'BPL10',
    sp: 'Arabica',
    s: 'WCR',
    line: 'Typica related',
    st: 'Tall',
    q: 'Very good',
    y: 'Medium',
    rust: 'Resistant',
    alt: 'H',
    t: 'Indonesian selection from ICCRI, grown on a small scale in Java. Large beans, strong growth. Suits agroforestry; Pratylenchus nematodes can attack it.',
  },
  {
    n: 'Caripe',
    sp: 'Arabica',
    s: 'WCR',
    line: 'Typica selection',
    st: 'Tall',
    q: 'Very good',
    y: 'Medium',
    rust: 'Susceptible',
    alt: 'M',
    t: 'Selected in Monagas, Venezuela (Gustavo Buonafina Parra). Large beans. Best at medium to high altitude.',
  },
  {
    n: 'Catigua MG2',
    a: 'Catiguá MG2',
    sp: 'Arabica',
    s: 'WCR',
    line: 'Catuai x Timor Hybrid',
    st: 'Dwarf',
    q: 'Very good',
    y: 'High',
    rust: 'Resistant',
    alt: 'H',
    t: 'Brazilian line (EMBRAPA). Ripens late; beans a little below average size.',
  },
  {
    n: 'EC15',
    sp: 'Arabica',
    s: 'WCR',
    line: 'F1 hybrid, Catimor x ET26 (not introgressed)',
    st: 'Dwarf',
    q: 'Very good',
    y: 'High',
    rust: 'Susceptible',
    alt: 'M',
    t: 'CIRAD and ECOM hybrid. Must be grown from clones, not seed. Large beans, suits agroforestry. Medium to high altitude.',
  },
  {
    n: 'Esperanza',
    a: 'Esperanza L4A5',
    sp: 'Arabica',
    s: 'WCR',
    line: 'F1 hybrid, T5296 x ET25 (introgressed)',
    st: 'Dwarf',
    q: 'Very good',
    y: 'Very high',
    rust: 'Resistant',
    alt: 'M',
    t: 'Central American F1 hybrid (CIRAD, CATIE, ICAFE, IHCAFE, PROCAFE, ANACAFE). Large beans. Grows from low to high altitude.',
  },
  {
    n: 'IPR 103',
    a: 'IAPAR 103',
    sp: 'Arabica',
    s: 'WCR',
    line: 'Catuai x Icatu',
    st: 'Dwarf',
    q: 'Very good',
    y: 'High',
    rust: 'Resistant',
    alt: 'M',
    t: 'Brazilian line. Ripens very late. Copes with heat, drought and poor soil.',
  },
  {
    n: 'IPR 107',
    a: 'IAPAR 107',
    sp: 'Arabica',
    s: 'WCR',
    line: 'Iapar 59 x Mundo Novo',
    st: 'Dwarf',
    q: 'Very good',
    y: 'High',
    rust: 'Resistant',
    alt: 'M',
    t: 'Brazilian line (IDR-Paraná). Ripens early; large beans. Good for machine picking. Medium to high altitude.',
  },
  {
    n: 'Monte Claro',
    sp: 'Arabica',
    s: 'WCR',
    line: 'Timor Hybrid 832/2 x Villa Sarchi CIFC 971/11',
    st: 'Dwarf',
    q: 'Very good',
    y: 'High',
    rust: 'Tolerant',
    alt: 'M',
    t: 'Venezuelan line (INIA). Very large beans, tolerates nematodes, grows well in medium shade.',
  },
  {
    n: 'Paraiso',
    a: 'Paraíso|Paraiso MG H 419-1',
    sp: 'Arabica',
    s: 'WCR',
    line: 'Catuai x Timor Hybrid',
    st: 'Dwarf',
    q: 'Good',
    y: 'Medium',
    rust: 'Tolerant',
    alt: 'M',
    t: 'Brazilian line from Minas Gerais (EPAMIG and UFV). Large beans.',
  },
  {
    n: 'S4808',
    a: 'Sln S4808',
    sp: 'Arabica',
    s: 'WCR',
    line: 'Catuai x Timor Hybrid',
    st: 'Dwarf',
    q: 'Good',
    y: 'High',
    rust: 'Resistant',
    alt: 'L',
    t: 'Indian line (Central Coffee Research Institute), not yet released for farms. Large beans. Low to medium altitude.',
  },
  // Ethiopia, Latin America (importer references)
  {
    n: '74110',
    sp: 'Arabica',
    s: 'SUC',
    line: 'Selection by Jimma Agricultural Research Center, Ethiopia, 1979',
    t: 'Ethiopia. Resistant to coffee berry disease, high yield. Short, compact trees with small leaves and cherries.',
  },
  {
    n: '74112',
    sp: 'Arabica',
    s: 'SUC',
    line: 'Selection by Jimma Agricultural Research Center from the Metu-Bishari forest',
    t: 'Ethiopia. Chosen for coffee berry disease resistance and yield.',
  },
  {
    n: 'Rume Sudan',
    a: 'Sudan Rume',
    sp: 'Arabica',
    s: 'SUC',
    line: 'Old landrace from the Boma plateau, South Sudan',
    t: 'Low yield, but more resistant to rust and coffee berry disease than Bourbon or Typica. Prized for cup quality; a parent of Milenio and Centroamericano.',
  },
  {
    n: 'Castillo',
    sp: 'Arabica',
    s: 'SUC',
    line: 'Released by Cenicafé, Colombia, 2005',
    t: 'Colombia. High yield and rust resistance; a dwarf plant for dense planting.',
  },
  {
    n: 'Tabi',
    sp: 'Arabica',
    s: 'SUC',
    line: 'Typica, Bourbon and Timor Hybrid (Cenicafé, 2002)',
    t: 'Colombia. Tall and rust resistant with good cup quality; up to 3,000 trees per hectare at high altitude.',
  },
  {
    n: 'Sidra',
    sp: 'Arabica',
    s: 'SUC',
    line: 'Reported Typica x Bourbon',
    t: 'Ecuador. Looks like Bourbon; high yield, good bean size and strong cup potential.',
  },
  {
    n: 'Pink Bourbon',
    sp: 'Arabica',
    s: 'SUC',
    line: 'Likely from Ethiopian landraces; not a true Bourbon',
    t: 'Huila, Colombia. High cup potential; some farmers see more disease resistance than in nearby Bourbon.',
  },
  {
    n: 'Laurina',
    a: 'Bourbon Pointu',
    sp: 'Arabica',
    s: 'SUC',
    line: 'Near-identical to Bourbon, found on Réunion in the early 1800s',
    t: 'Smaller, egg-shaped cherries allow denser planting. Lower in caffeine.',
  },
  {
    n: 'Arara',
    sp: 'Arabica',
    s: 'SUC',
    line: 'Yellow Catuai x Obata',
    t: 'Brazil. Strong rust resistance, compact trees, large beans.',
  },
  {
    n: 'Catucai',
    sp: 'Arabica',
    s: 'SUC',
    line: 'Natural cross of Icatu and Catuai, selected in 1988',
    t: 'Brazil. Productive, rust resistant and ripens evenly; needs good feeding and water.',
  },
  // Indonesia (Royal Coffee, Indonesian cultivars)
  {
    n: 'Sigarar Utang',
    sp: 'Arabica',
    s: 'RC',
    line: 'Likely Typica x Timor Hybrid; close to Ateng',
    t: 'North Sumatra (Lintong, Humbang Hasundutan). Matures fast and yields well; the name means "payer of debts".',
  },
  {
    n: 'Ateng',
    a: 'Ateng Super',
    sp: 'Arabica',
    s: 'RC',
    line: 'Catimor',
    t: 'Indonesia, mostly at lower altitudes. Short, easy to pick and disease resistant; not known for cup quality.',
  },
  {
    n: 'Gayo 1',
    a: 'Gayo Satu',
    sp: 'Arabica',
    s: 'RC',
    line: 'Timor Hybrid selection, now mixed with local types',
    t: 'Gayo highlands, Aceh, Sumatra.',
  },
  {
    n: 'Gayo 2',
    a: 'Gayo Dua',
    sp: 'Arabica',
    s: 'RC',
    line: 'Timor Hybrid x Bourbon (some say S.795)',
    t: 'Aceh, Sumatra. Variable, because it spread by seed.',
  },
  {
    n: 'Andungsari',
    a: 'Andung Sari',
    sp: 'Arabica',
    s: 'RC',
    line: 'Dwarf Catimor, selected by ICCRI in East Java',
    t: 'Indonesia. Selected 1982, released 1999. Wants full sun and high inputs; susceptible to leaf rust.',
  },
  {
    n: 'Abyssinia',
    a: 'AB3|Java Abyssinia',
    sp: 'Arabica',
    s: 'RC',
    line: 'Ethiopian, brought to Java in 1928',
    t: 'Java, Indonesia. Looks like Typica; selections AB1 to AB7 were released. The Java variety descends from it.',
  },
  {
    n: 'Kartika',
    sp: 'Arabica',
    s: 'RC',
    line: 'Catuai',
    t: 'Indonesia since 1987. Can reach high quality, but very susceptible to rust and needs high inputs.',
  },
  {
    n: 'Timor Hybrid (Tim Tim)',
    a: 'Tim Tim|Hibrido de Timor|HdT|Timor Hybrid',
    sp: 'Arabica',
    s: 'RC',
    line: 'Natural arabica x robusta cross found on Timor',
    t: 'The source of rust resistance in Catimor and Sarchimor varieties. Now found mostly in their parentage.',
  },
  // Robusta: World Coffee Research, Arabica + Robusta Varieties catalog (2026), facts in KoffyKraft's words
  {
    n: 'BP 534',
    sp: 'Robusta',
    s: 'WCRR',
    line: 'Congo group; Individual selection labeled 6 from a Congolensis population.',
    st: 'Tall',
    rust: 'Resistant',
    t: 'Indonesia. Clone from ICCRI. Suits agroforestry, grown under shade trees. Large beans (screen above 17). Ripens average. About 21% cherry to green. Breeder trials: 1700 to 2200 kg green per ha. Best at about 400 to 900 m. Plant with other clones to set fruit.',
  },
  {
    n: 'BP 936',
    sp: 'Robusta',
    s: 'WCRR',
    line: 'Congo group; SA 164-11 x BP 42',
    st: 'Tall',
    rust: 'Resistant',
    t: 'Indonesia. Clone from ICCRI. Suits agroforestry, grown under shade trees. Large beans (screen above 17). Ripens average. About 20% cherry to green. Breeder trials: 1600 to 2200 kg green per ha. Best at about 400 to 900 m. Plant with other clones to set fruit.',
  },
  {
    n: 'BP 939',
    sp: 'Robusta',
    s: 'WCRR',
    line: 'Congo group; BP 42 x SA 1366',
    st: 'Tall',
    rust: 'Resistant',
    t: 'Indonesia. Clone from ICCRI. Suits agroforestry, grown under shade trees. Large beans (screen above 17). Ripens average. About 21% cherry to green. Breeder trials: 1400 to 1900 kg green per ha. Best at about 400 to 900 m. Plant with other clones to set fruit.',
  },
  {
    n: 'BRS 1216',
    sp: 'Robusta',
    s: 'WCRR',
    line: 'Guinea x Congo group; Robusta 1675 x Encapa 03',
    st: 'Dwarf',
    rust: 'Resistant',
    t: 'Brazil. Polyclonal variety (several clones) from EMBRAPA. Resistant to nematodes. Shaped for machine harvesting. Medium beans (screen 15-16). Ripens average. About 25% cherry to green. Breeder trials: 7200 kg green per ha. 79 points on the SCA scale.',
  },
  {
    n: 'BRS 2299',
    sp: 'Robusta',
    s: 'WCRR',
    line: 'Guinea x Congo group',
    st: 'Dwarf',
    rust: 'Resistant',
    t: 'Brazil. Polyclonal variety (several clones) from EMBRAPA. Shaped for machine harvesting. Medium beans (screen 15-16). Ripens average. About 25% cherry to green. Breeder trials: 6600 kg green per ha. 70 points on the SCA scale.',
  },
  {
    n: 'BRS 2314',
    sp: 'Robusta',
    s: 'WCRR',
    line: 'Guinea x Congo group; Robusta 640 X Encapa 03',
    st: 'Dwarf',
    rust: 'Resistant',
    t: 'Brazil. Polyclonal variety (several clones) from EMBRAPA. Small beans (screen 14 or below). Ripens late. About 25% cherry to green. Breeder trials: 6600 kg green per ha.',
  },
  {
    n: 'BRS 2336',
    sp: 'Robusta',
    s: 'WCRR',
    line: 'Guinea x Congo group',
    st: 'Dwarf',
    rust: 'Resistant',
    t: 'Brazil. Polyclonal variety (several clones) from EMBRAPA. Medium beans (screen 15-16). Ripens late. About 25% cherry to green. Breeder trials: 7200 kg green per ha. 75 points on the SCA scale.',
  },
  {
    n: 'BRS 2357',
    sp: 'Robusta',
    s: 'WCRR',
    line: 'Guinea x Congo group',
    st: 'Dwarf',
    rust: 'Susceptible',
    t: 'Brazil. Polyclonal variety (several clones) from EMBRAPA. Medium beans (screen 15-16). Ripens late. About 25% cherry to green. Breeder trials: 6000 kg green per ha. 70 points on the SCA scale.',
  },
  {
    n: 'BRS 3137',
    sp: 'Robusta',
    s: 'WCRR',
    line: 'Guinea x Congo group',
    st: 'Dwarf',
    rust: 'Tolerant',
    t: 'Brazil. Polyclonal variety (several clones) from EMBRAPA. Small beans (screen 14 or below). Ripens early. About 25% cherry to green. Breeder trials: 6600 kg green per ha. 70 points on the SCA scale. Plant with other clones to set fruit.',
  },
  {
    n: 'BRS 3193',
    sp: 'Robusta',
    s: 'WCRR',
    line: 'Guinea x Congo group',
    st: 'Dwarf',
    rust: 'Tolerant',
    t: 'Brazil. Polyclonal variety (several clones) from EMBRAPA. Small beans (screen 14 or below). Ripens early. About 25% cherry to green. Breeder trials: 6000 kg green per ha. Plant with other clones to set fruit.',
  },
  {
    n: 'BRS 3210',
    sp: 'Robusta',
    s: 'WCRR',
    line: 'Guinea x Congo group',
    st: 'Tall',
    rust: 'Resistant',
    t: 'Brazil. Polyclonal variety (several clones) from EMBRAPA. Medium beans (screen 15-16). Ripens late. About 25% cherry to green. Breeder trials: 7200 kg green per ha.',
  },
  {
    n: 'BRS 3213',
    sp: 'Robusta',
    s: 'WCRR',
    line: 'Guinea x Congo group',
    st: 'Tall',
    rust: 'Resistant',
    t: 'Brazil. Polyclonal variety (several clones) from EMBRAPA. Medium beans (screen 15-16). Ripens late. About 25% cherry to green. Breeder trials: 7200 kg green per ha.',
  },
  {
    n: 'BRS 3220',
    sp: 'Robusta',
    s: 'WCRR',
    line: 'Guinea x Congo group',
    st: 'Tall',
    rust: 'Resistant',
    t: 'Brazil. Polyclonal variety (several clones) from EMBRAPA. Medium beans (screen 15-16). Ripens late. About 25% cherry to green. Breeder trials: 6600 kg green per ha.',
  },
  {
    n: 'INIFAP 00-24',
    sp: 'Robusta',
    s: 'WCRR',
    line: 'Guinea group',
    st: 'Dwarf',
    rust: 'Tolerant',
    t: 'Mexico. Clone from Nestlé Research and INIFAP. Medium beans (screen 15-16). Ripens average. Plant with other clones to set fruit.',
  },
  {
    n: 'INIFAP 00-28',
    sp: 'Robusta',
    s: 'WCRR',
    line: 'Congo group',
    st: 'Tall',
    rust: 'Tolerant',
    t: 'Mexico. Clone from Nestlé Research and INIFAP. Medium beans (screen 15-16). Ripens late. Plant with other clones to set fruit.',
  },
  {
    n: 'INIFAP 95-9',
    sp: 'Robusta',
    s: 'WCRR',
    line: 'Congo group',
    st: 'Tall',
    rust: 'Tolerant',
    t: 'Mexico. Clone from INMECAFE. Large beans (screen above 17). Ripens average. Plant with other clones to set fruit.',
  },
  {
    n: 'INIFAP 97-14',
    sp: 'Robusta',
    s: 'WCRR',
    line: 'Congo group',
    st: 'Tall',
    rust: 'Tolerant',
    t: 'Mexico. Clone from Nestlé Research and INIFAP. Medium beans (screen 15-16). Ripens very late. Plant with other clones to set fruit.',
  },
  {
    n: 'INIFAP 97-15',
    sp: 'Robusta',
    s: 'WCRR',
    line: 'Guinea group',
    st: 'Tall',
    t: 'Mexico. Clone from Nestlé Research and INIFAP. Medium beans (screen 15-16). Ripens average. Plant with other clones to set fruit.',
  },
  {
    n: 'NARO-Kituza Robusta 1',
    sp: 'Robusta',
    s: 'WCRR',
    a: 'KR1',
    line: 'Uganda group; Hybrid clone of natural cross-pollination',
    st: 'Tall',
    rust: 'Resistant',
    t: 'Uganda. Clone from NACORI. Resistant to coffee wilt disease and red blister disease. Medium beans (screen 15-16). Ripens late. About 20% cherry to green. Breeder trials: 2800 kg green per ha. 81 points on the SCA scale. Plant with other clones to set fruit.',
  },
  {
    n: 'NARO-Kituza Robusta 10',
    sp: 'Robusta',
    s: 'WCRR',
    a: 'KR10',
    line: 'Uganda group; Hybrid clone of natural cross-pollination',
    st: 'Tall',
    rust: 'Resistant',
    t: 'Uganda. Clone from NACORI. Resistant to coffee wilt disease and red blister disease. Medium beans (screen 15-16). Ripens late. About 20% cherry to green. Breeder trials: 4800 kg green per ha. 80 points on the SCA scale. Plant with other clones to set fruit.',
  },
  {
    n: 'NARO-Kituza Robusta 2',
    sp: 'Robusta',
    s: 'WCRR',
    a: 'KR2',
    line: 'Uganda group; Hybrid clone of natural cross-pollination',
    st: 'Tall',
    rust: 'Resistant',
    t: 'Uganda. Clone from NACORI. Resistant to coffee wilt disease and red blister disease. Medium beans (screen 15-16). Ripens late. About 20% cherry to green. Breeder trials: 2600 kg green per ha. 82 points on the SCA scale. Plant with other clones to set fruit.',
  },
  {
    n: 'NARO-Kituza Robusta 3',
    sp: 'Robusta',
    s: 'WCRR',
    a: 'KR3',
    line: 'Uganda group; Hybrid clone of natural cross-pollination',
    st: 'Tall',
    rust: 'Resistant',
    t: 'Uganda. Clone from NACORI. Resistant to coffee wilt disease and red blister disease. Medium beans (screen 15-16). Ripens late. About 20% cherry to green. Breeder trials: 4900 kg green per ha. 78 points on the SCA scale. Plant with other clones to set fruit.',
  },
  {
    n: 'NARO-Kituza Robusta 4',
    sp: 'Robusta',
    s: 'WCRR',
    a: 'KR4',
    line: 'Uganda group; Hybrid clone of natural cross-pollination',
    st: 'Tall',
    rust: 'Resistant',
    t: 'Uganda. Clone from NACORI. Resistant to coffee wilt disease and red blister disease. Medium beans (screen 15-16). Ripens early. About 20% cherry to green. Breeder trials: 2300 kg green per ha. 81 points on the SCA scale. Plant with other clones to set fruit.',
  },
  {
    n: 'NARO-Kituza Robusta 5',
    sp: 'Robusta',
    s: 'WCRR',
    a: 'KR5',
    line: 'Uganda group; Hybrid clone of natural cross-pollination',
    st: 'Tall',
    rust: 'Resistant',
    t: 'Uganda. Clone from NACORI. Resistant to coffee wilt disease and red blister disease. Medium beans (screen 15-16). Ripens late. About 20% cherry to green. Breeder trials: 2860 kg green per ha. 76 points on the SCA scale. Plant with other clones to set fruit.',
  },
  {
    n: 'NARO-Kituza Robusta 6',
    sp: 'Robusta',
    s: 'WCRR',
    a: 'KR6',
    line: 'Uganda group; Hybrid clone of natural cross-pollination',
    st: 'Tall',
    rust: 'Resistant',
    t: 'Uganda. Clone from NACORI. Resistant to coffee wilt disease and red blister disease. Medium beans (screen 15-16). Ripens late. About 20% cherry to green. Breeder trials: 2650 kg green per ha. 70 points on the SCA scale. Plant with other clones to set fruit.',
  },
  {
    n: 'NARO-Kituza Robusta 7',
    sp: 'Robusta',
    s: 'WCRR',
    a: 'KR7',
    line: 'Uganda group; Hybrid clone of natural cross-pollination',
    st: 'Tall',
    rust: 'Tolerant',
    t: 'Uganda. Clone from NACORI. Resistant to coffee wilt disease and red blister disease. Medium beans (screen 15-16). Ripens late. About 20% cherry to green. Breeder trials: 3000 kg green per ha. 76 points on the SCA scale. Plant with other clones to set fruit.',
  },
  {
    n: 'NARO-Kituza Robusta 8',
    sp: 'Robusta',
    s: 'WCRR',
    a: 'KR8',
    line: 'Uganda group; Hybrid clone of natural cross-pollination',
    st: 'Tall',
    rust: 'Tolerant',
    t: 'Uganda. Clone from NACORI. Resistant to coffee wilt disease and red blister disease. Medium beans (screen 15-16). Ripens early. About 20% cherry to green. Breeder trials: 3100 kg green per ha. 79 points on the SCA scale. Plant with other clones to set fruit.',
  },
  {
    n: 'NARO-Kituza Robusta 9',
    sp: 'Robusta',
    s: 'WCRR',
    a: 'KR9',
    line: 'Uganda group; Hybrid clone of natural cross-pollination',
    st: 'Tall',
    rust: 'Tolerant',
    t: 'Uganda. Clone from NACORI. Resistant to coffee wilt disease and red blister disease. Medium beans (screen 15-16). Ripens late. About 20% cherry to green. Breeder trials: 3900 kg green per ha. 79 points on the SCA scale. Plant with other clones to set fruit.',
  },
  {
    n: 'Perdenia',
    a: 'Old Robusta',
    sp: 'Robusta',
    s: 'WCRR',
    line: 'Congo group',
    st: 'Tall',
    rust: 'Tolerant',
    t: 'India. Clone from CCRI. Small beans (screen 14 or below). Ripens late. About 25% cherry to green. Breeder trials: 1500 to 3000 kg green per ha. Plant with other clones to set fruit.',
  },
  {
    n: 'Roubi 1',
    sp: 'Robusta',
    s: 'WCRR',
    line: 'Robusta',
    rust: 'Resistant',
    t: 'Mexico, The Philippines. Clone from Nestlé Research. Medium beans (screen 15-16). About 18-21% cherry to green. Plant with other clones to set fruit.',
  },
  {
    n: 'Roubi 10',
    sp: 'Robusta',
    s: 'WCRR',
    line: 'Robusta',
    rust: 'Resistant',
    t: 'Nicaragua. Clone from Nestlé Research. Medium beans (screen 15-16). About 18-21% cherry to green. Plant with other clones to set fruit.',
  },
  {
    n: 'Roubi 2',
    sp: 'Robusta',
    s: 'WCRR',
    line: 'Robusta',
    rust: 'Resistant',
    t: 'Mexico, The Philippines. Clone from Nestlé Research. Large beans (screen above 17). About 18-21% cherry to green. Plant with other clones to set fruit.',
  },
  {
    n: 'Roubi 4',
    sp: 'Robusta',
    s: 'WCRR',
    line: 'Robusta',
    rust: 'Resistant',
    t: 'Thailand. Clone from Nestlé Research. Large beans (screen above 17). About 18-21% cherry to green. Plant with other clones to set fruit.',
  },
  {
    n: 'Roubi 5',
    sp: 'Robusta',
    s: 'WCRR',
    line: 'Robusta',
    rust: 'Resistant',
    t: 'Thailand. Clone from Nestlé Research. Large beans (screen above 17). About 18-21% cherry to green. Plant with other clones to set fruit.',
  },
  {
    n: 'Roubi 6',
    sp: 'Robusta',
    s: 'WCRR',
    line: 'Robusta',
    rust: 'Resistant',
    t: 'Nicaragua. Clone from Nestlé Research. Medium beans (screen 15-16). About 18-21% cherry to green. Plant with other clones to set fruit.',
  },
  {
    n: 'Roubi 7',
    sp: 'Robusta',
    s: 'WCRR',
    line: 'Robusta',
    rust: 'Resistant',
    t: 'Nicaragua. Clone from Nestlé Research. Small beans (screen 14 or below). About 18-21% cherry to green. Plant with other clones to set fruit.',
  },
  {
    n: 'Roubi 8',
    sp: 'Robusta',
    s: 'WCRR',
    line: 'Robusta',
    rust: 'Resistant',
    t: 'Nicaragua. Clone from Nestlé Research. Medium beans (screen 15-16). About 18-21% cherry to green. Plant with other clones to set fruit.',
  },
  {
    n: 'Roubi 9',
    sp: 'Robusta',
    s: 'WCRR',
    line: 'Robusta',
    rust: 'Resistant',
    t: 'Nicaragua. Clone from Nestlé Research. Small beans (screen 14 or below). About 18-21% cherry to green. Plant with other clones to set fruit.',
  },
  {
    n: 'SA 237',
    sp: 'Robusta',
    s: 'WCRR',
    line: "Congo group; The genetic composition of this clone is close to the 'R' group of robusta species.",
    st: 'Tall',
    rust: 'Resistant',
    t: 'Indonesia. Clone from ICCRI. Suits agroforestry, grown under shade trees. Large beans (screen above 17). Ripens average. Breeder trials: 800 to 2100 kg green per ha. Best at about 400 to 900 m. Plant with other clones to set fruit.',
  },
  {
    n: 'Sln.2R',
    sp: 'Robusta',
    s: 'WCRR',
    a: 'Sln 2R|Balehonnur Robustas',
    line: 'Guinea x Coffea congensis group; Coffea congensis x Coffea canephora',
    t: 'India. Polyclonal variety (several clones) from CCRI. Large beans (screen above 17). Breeder trials: 1500 to 3000 kg green per ha.',
  },
  {
    n: 'Sln.3R',
    sp: 'Robusta',
    s: 'WCRR',
    a: 'Sln 3R|CxR type',
    line: 'Guinea x Coffea congensis group; Coffea congensis x Coffea canephora and recurrent back cross to Robusta. Selection from BC2.',
    st: 'Dwarf',
    rust: 'Tolerant',
    t: 'India. Polyclonal variety (several clones) from CCRI. Large beans (screen above 17). Ripens average. About 20% cherry to green. Breeder trials: 1500 to 2500 kg green per ha.',
  },
  {
    n: 'TR11',
    sp: 'Robusta',
    s: 'WCRR',
    line: 'Congo group',
    st: 'Tall',
    rust: 'Tolerant',
    t: 'Vietnam. Clone from WASI. Medium beans (screen 15-16). Ripens late. About 24% cherry to green. Breeder trials: 5000 to 6000 kg green per ha. Plant with other clones to set fruit.',
  },
  {
    n: 'TR4',
    sp: 'Robusta',
    s: 'WCRR',
    line: 'Congo group',
    st: 'Dwarf',
    rust: 'Tolerant',
    t: 'Vietnam. Clone from WASI. Medium beans (screen 15-16). Ripens average. About 24% cherry to green. Breeder trials: 5000 to 7000 kg green per ha. Plant with other clones to set fruit.',
  },
  {
    n: 'TR9',
    sp: 'Robusta',
    s: 'WCRR',
    line: 'Congo group',
    st: 'Dwarf',
    rust: 'Tolerant',
    t: 'Vietnam. Clone from WASI. Large beans (screen above 17). Ripens late. About 23% cherry to green. Breeder trials: 5000 to 6000 kg green per ha. Plant with other clones to set fruit.',
  },
  {
    n: 'TRS1',
    sp: 'Robusta',
    s: 'WCRR',
    line: 'Congo group; Parent clones: TR4, TR9, TR11, TR12',
    st: 'Dwarf',
    rust: 'Tolerant',
    t: 'Vietnam. Polyclonal variety (several clones) from WASI. Medium beans (screen 15-16). Ripens average. About 22% cherry to green. Breeder trials: 4000 to 5000 kg green per ha.',
  },
  {
    n: 'Xanh lun',
    sp: 'Robusta',
    s: 'WCRR',
    line: 'Congo group',
    st: 'Dwarf',
    rust: 'Tolerant',
    t: 'Vietnam. Clone from farmers, approved by WASI. Relatively drought tolerant. Large beans (screen above 17). Ripens late. About 23% cherry to green. Breeder trials: 5000 to 6000 kg green per ha. Best at about 500 to 800 m. Plant with other clones to set fruit.',
  },
  // Brazilian conilon (Incaper)
  {
    n: 'Vitória Incaper 8142',
    a: 'Vitoria Incaper 8142|Conilon Vitória',
    sp: 'Robusta',
    s: 'INC',
    line: 'Conilon (Coffea canephora), 13 clones grown together, Espírito Santo, Brazil',
    rust: 'Tolerant',
    t: 'Brazilian conilon. Moderately resistant to rust, tolerant of drought. Even ripening from May to July by clone. About 70 bags of green per ha over 8 harvests without irrigation; over 90% of beans on screen 13 or larger.',
  },
  // Other species
  {
    n: 'Nemaya',
    sp: 'Robusta',
    s: 'WCR',
    line: 'C. canephora T3561 x T3751, a rootstock',
    t: 'Graft any arabica onto it to resist nematodes. Grafting onto robusta rootstock does not change cup quality.',
  },
  {
    n: 'Liberica',
    sp: 'Liberica',
    s: 'KEW',
    line: 'Coffea liberica, a separate species from West Africa',
    t: 'Tall trees, up to 17 m, with thick-skinned cherries; more rust resistant than arabica. First grown commercially in the Philippines; now reviving in Malaysia, Indonesia and Fiji.',
  },
  {
    n: 'Excelsa',
    a: 'Coffea dewevrei',
    sp: 'Excelsa',
    s: 'KEW',
    line: 'Coffea dewevrei, treated as its own species since 2025',
    t: 'Rising in India, Vietnam, Indonesia, Uganda and South Sudan. Crops under more heat and longer dry spells than robusta.',
  },
];
// India sits at about 8 to 15 degrees N: WCR bands for 5-15 N are low 700-900 m, medium 900-1300 m, high above 1300 m.
const ALT_IN = { L: 'from 700 m (low) up', M: 'from 900 m (medium) up', H: 'above 1300 m (high)' };
// WCR bands by distance from the equator: within 5 degrees, 5 to 15 degrees (India, Central America), beyond 15.
const ALT_ALL = {
  L: '1000 to 1600 m near the equator, 700 to 1300 m at 5 to 15 degrees, 400 to 1000 m beyond 15 degrees',
  M: 'above 1200 m near the equator, above 900 m at 5 to 15 degrees, above 700 m beyond 15 degrees',
  H: 'above 1600 m near the equator, above 1300 m at 5 to 15 degrees, above 1000 m beyond 15 degrees',
};
function varietyFind(name) {
  const k = String(name || '')
    .trim()
    .toLowerCase();
  if (!k) return null;
  return (
    KK_VARIETIES.find(v => v.a && v.a.toLowerCase().split('|').includes(k)) ||
    KK_VARIETIES.find(v => v.n.toLowerCase() === k) ||
    KK_VARIETIES.find(
      v =>
        v.n.toLowerCase().replace(/\s*\(.*\)/, '') === k ||
        (v.n.match(/\(([^)]+)\)/) || [])[1]?.toLowerCase() === k
    ) ||
    null
  );
}
function varietyHtml(name) {
  const v = varietyFind(name);
  if (!v) return '';
  const e = s =>
    String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const tags = [
    v.sp,
    v.st,
    v.q ? 'Quality ' + v.q.toLowerCase() : '',
    v.y ? 'Yield ' + v.y.toLowerCase() : '',
    v.rust ? 'Rust ' + v.rust.toLowerCase() : '',
  ].filter(Boolean);
  const src = VARIETY_SRC[v.s];
  return (
    '<b>' +
    e(v.n) +
    '</b> · ' +
    e(v.line) +
    '<br>' +
    tags.map(e).join(' · ') +
    (v.t ? '<br>' + e(v.t) : '') +
    (v.alt ? '<br>Best altitude: ' + ALT_ALL[v.alt] + '. India sits at 8 to 15 degrees N.' : '') +
    '<div style="font-size:11px;color:var(--muted);margin-top:4px">Sources: ' +
    (src.name ? e(src.name) + ' ' : '') +
    src.links
      .map(
        ([n, u]) =>
          '<a href="' +
          u +
          '" target="_blank" rel="noopener" style="color:var(--coffee);display:inline-block;margin:2px 10px 2px 0">' +
          e(n) +
          '</a>'
      )
      .join('') +
    '</div>'
  );
}
function varietyDatalist() {
  if (document.getElementById('varieties')) return;
  const d = document.createElement('datalist');
  d.id = 'varieties';
  d.innerHTML = KK_VARIETIES.map(v => '<option value="' + v.n.replace(/"/g, '&quot;') + '">').join('');
  document.body.appendChild(d);
}
// Variety picker: a bottom sheet with search, filtered by species. iPhone does not show datalists as a dropdown.
// Coffee words, explained plainly for newcomers. KoffyKraft's own wording, checked against the WCR catalogue and Coffee Board of India usage.
const COFFEE_WORDS = [
  [
    'Plant names',
    'Species',
    'The big family split. Arabica (Coffea arabica) and robusta (Coffea canephora) are different species, like a lemon and an orange. Liberica and excelsa are others.',
  ],
  [
    'Plant names',
    'Variety',
    'A group of plants inside one species that share traits and pass them on through seed. Typica, SL28 and Chandragiri are varieties of arabica.',
  ],
  [
    'Plant names',
    'Cultivar',
    'A variety that people chose and keep growing on purpose. In coffee it means much the same as variety.',
  ],
  [
    'Plant names',
    'Varietal',
    'A describing word: "a varietal coffee" is made from one variety. Many people use it to mean variety itself; specialists prefer "variety" for the plant.',
  ],
  [
    'Plant names',
    'Selection (Sln)',
    "How the Coffee Board's research institute (CCRI) names the varieties it releases in India, numbered in order: Sln 9, Sln 12 (Cauvery), Sln 13 (Chandragiri). Each was bred or picked, then tested for years before release.",
  ],
  [
    'Plant names',
    'Line, pure line',
    'The offspring of one plant, grown on for generations until the seedlings come out the same as the parent.',
  ],
  [
    'Plant names',
    'Clone',
    'Plants grown from cuttings or grafts of one mother plant, so they are genetically identical to it. Common with robusta. Robusta clones are planted in pairs or groups because a robusta flower needs pollen from a different plant, which is why S.274 is planted with S.270.',
  ],
  [
    'Plant names',
    'Landrace',
    'An old local population that grew in one place for generations without formal breeding. Ethiopia has hundreds. Geisha came from one.',
  ],
  [
    'Breeding',
    'Mutation',
    'A natural change that appears in one plant and is then kept. Caturra is a short (dwarf) mutation of Bourbon. Maragogipe, with its giant beans, is a mutation of Typica.',
  ],
  [
    'Breeding',
    'Hybrid, cross',
    'A plant bred from two different parents, for example Mundo Novo from Typica and Bourbon.',
  ],
  [
    'Breeding',
    'F1 hybrid',
    'The first generation of a cross. Strong and productive, but seed from it does not come out the same, so new plants are made by cloning or tissue culture. Centroamericano is one.',
  ],
  [
    'Breeding',
    'Interspecific hybrid',
    "A cross between two species. The Timor Hybrid is a natural arabica and robusta cross. India's S.26 was a natural arabica and liberica cross.",
  ],
  [
    'Breeding',
    'Introgressed',
    'An arabica that carries a small piece of another species, usually from robusta through the Timor Hybrid, most often to resist leaf rust.',
  ],
  [
    'Breeding',
    'Catimor, Sarchimor',
    'Families of introgressed arabica. Catimor is Caturra crossed with Timor Hybrid (Cauvery is one). Sarchimor is Villa Sarchi crossed with Timor Hybrid (Chandragiri is one).',
  ],
  [
    'Breeding',
    'Composite',
    'A variety made by mixing several related lines, so the field is a little varied on purpose. Ruiru 11 and Batian are composites.',
  ],
  [
    'Breeding',
    'Tetraploid, diploid',
    'How many sets of chromosomes a plant has. Arabica has four, robusta has two. That difference is why the two cross only rarely.',
  ],
  [
    'In the field',
    'Tall, dwarf (compact)',
    'Plant height and spacing between branches. Dwarf plants fit closer planting and are easier to pick.',
  ],
  [
    'In the field',
    'Coffee leaf rust',
    "A fungus that spots and strips the leaves, weakening the plant. It has many strains, so a variety's resistance can break down when a new strain arrives.",
  ],
  [
    'In the field',
    'Coffee berry disease (CBD)',
    'A fungus that rots green cherries, found in Africa. It is why some African varieties list CBD resistance.',
  ],
  [
    'In the field',
    'Peaberry (PB)',
    'A cherry with one round bean instead of the usual two flat ones. Sorted and sold separately.',
  ],
  [
    'Indian trade terms',
    'Plantation',
    'Washed arabica, sold as parchment. Traded as Arabica Plantation (A, AA, PB grades).',
  ],
  ['Indian trade terms', 'Cherry', 'Natural (dried in the fruit) coffee. Arabica Cherry and Robusta Cherry.'],
  ['Indian trade terms', 'Robusta Parchment', 'Washed robusta.'],
  [
    'Indian trade terms',
    'Monsooned Malabar',
    'Natural arabica or robusta held in open warehouses on the Malabar coast through the monsoon. The beans swell and pale, and the cup turns low in acidity and heavy in body.',
  ],
  // Around the world: Sweet Maria's Coffee Library and My Coffee Explorer glossaries
  [
    'Processing words around the world',
    'Beneficio',
    'The Latin American name for a wet mill, where cherry is pulped, fermented and dried. In Rwanda and much of Africa the same place is a washing station; in Kenya it is a coffee factory.',
  ],
  [
    'Processing words around the world',
    'Pergamino',
    'Spanish for parchment: green coffee still inside its thin papery shell, before it is hulled at the dry mill.',
  ],
  [
    'Processing words around the world',
    'Cereja descascada',
    "Brazil's name for pulped natural, also called semi-washed: the skin is taken off by machine and the beans dry with some or all of the sticky mucilage still on.",
  ],
  [
    'Processing words around the world',
    'Giling basah (wet-hulled)',
    "Indonesia's own process, mainly in Sumatra. Pulped coffee is dried only briefly and sold at 40 to 50% moisture; the processor dries it to 25 to 35%, strips the parchment while still damp, then dries the bare bean to 11 to 14%.",
  ],
  [
    'Processing words around the world',
    'Gabah',
    'Indonesian: coffee barely dried after pulping, sold to a collector.',
  ],
  [
    'Processing words around the world',
    'Asalan',
    'Indonesian (North Sumatra, Aceh): hulled, dried green coffee ready to sell to an exporter.',
  ],
  [
    'Processing words around the world',
    'Kopi labu',
    'Indonesian, "pumpkin coffee": the soft, swollen bean just after wet-hulling.',
  ],
  [
    'Processing words around the world',
    'Washing station, coffee factory',
    'East African names for a wet mill: washing station in Rwanda and nearby, coffee factory in Kenya.',
  ],
  // Export grades: Cafe Imports, Common Coffee Grades chart. Screen sizes are in 64ths of an inch.
  [
    'Export grades',
    'Screen size',
    'Beans are sorted through holes measured in 64ths of an inch: screen 17 means beans that stay on a 17/64 inch hole. Many grades below are set by screen.',
  ],
  [
    'Export grades',
    'AA, AB, PB (Kenya, Tanzania, Burundi)',
    'Grades by bean size. Kenya AA is screen 17 to 18, AB 15 to 16; Tanzania AA is 18, AB 15 to 17; Burundi AA 18, AB 16, C 14. PB is peaberry.',
  ],
  [
    'Export grades',
    'Supremo, Excelso (Colombia)',
    'Colombian grades by size: Supremo screen 17, Excelso screen 15.',
  ],
  [
    'Export grades',
    'SHB, SHG, HB, HG, CS (Central America)',
    'Grades by growing altitude. SHB is strictly hard bean, SHG strictly high grown. Costa Rica SHB from 1200 m; El Salvador, Honduras and Nicaragua SHG from 1200 m, HG 900 to 1200 m, CS (central standard) 500 to 900 m; Guatemala SHB 1600 to 1700 m, FHB 1500 to 1600 m, HB 1350 to 1500 m.',
  ],
  [
    'Export grades',
    'NY 2/3, NY 3/4 (Brazil)',
    'Brazilian grades by defect count (the New York system) with screen size: NY 2/3 is screen 17 to 18, NY 3/4 screen 14 to 16. Santos is the port name, often part of the grade.',
  ],
  [
    'Export grades',
    'Grade 1, 2, 3 (Ethiopia)',
    'Ethiopian washed grades by defects in a sample: Grade 1 has 0 to 3, Grade 2 4 to 12, Grade 3 13 to 25.',
  ],
  [
    'Export grades',
    'Grade 1, 2 (Sumatra, Sulawesi)',
    'Indonesian grades by defects per 300 g sample: Grade 1 up to 11, Grade 2 12 to 25.',
  ],
  [
    'Export grades',
    'Blue Mountain 1, 2, 3 (Jamaica)',
    'Jamaican grades by size with at most 3% defects: No. 1 screen 17 to 18, No. 2 screen 16, No. 3 screen 15.',
  ],
  [
    'Export grades',
    'A, X, A/X (Papua New Guinea)',
    'PNG grades: A is screen 17 with up to 20 defects; X is mixed size; A/X is mixed with up to 10 defects.',
  ],
  [
    'Export grades',
    'Extra Fancy, Fancy, Prime (Hawaii)',
    'Kona grades: Extra Fancy screen 19 with up to 10 defects per lb, Fancy screen 18 with 16, Prime up to 25 defects.',
  ],
  // Bags and units: Royal Coffee, coffee bag weights; Sweet Maria's for fanega
  [
    'Bags and units',
    'Export bag',
    "Green coffee ships in bags whose weight depends on the country: 60 kg from Brazil, Ethiopia, Kenya, India, Indonesia, Uganda and most of Africa; 69 kg from most of Central America, Mexico and Peru; 70 kg from Colombia; 50 kg for India's Monsooned Malabar; 100 lb from Hawaii. 46 kg bags are a common alternative.",
  ],
  [
    'Bags and units',
    'Quintal',
    'In much of Latin America about 100 lb (46 kg), usually of parchment. In Ethiopia a quintal is 100 kg.',
  ],
  [
    'Bags and units',
    'Fanega',
    'A Latin American measure of coffee cherry, about 250 kg. Used for fruit only, not processed coffee.',
  ],
];
function openVarieties(input, species) {
  const browse = !input;
  const e = s =>
    String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  if (!document.getElementById('vpStyle')) {
    const st = document.createElement('style');
    st.id = 'vpStyle';
    st.textContent =
      '.vp[hidden]{display:none!important}.vp{position:fixed;inset:0;background:rgba(23,21,18,.45);z-index:60;display:flex;align-items:flex-end;justify-content:center}.vp-b{background:#f7f5f0;width:min(680px,100%);height:86vh;height:86dvh;border-radius:18px 18px 0 0;display:flex;flex-direction:column;padding:14px 14px calc(10px + env(safe-area-inset-bottom))}.vp-h{display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:17px}.vp-f{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0}.vp-f button{font:inherit;font-size:13px;border:1px solid #ddd8d0;background:#fff;border-radius:999px;padding:7px 12px;cursor:pointer}.vp-f button.on{background:#171512;color:#fff;border-color:#171512}.vp-l{overflow:auto;flex:1}.vp-g{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#8d583b;margin:12px 0 6px}.vp-i{display:block;width:100%;text-align:left;font:inherit;background:#fff;border:1px solid #ddd8d0;border-radius:12px;padding:10px 12px;margin:0 0 6px;cursor:pointer;color:#171512;touch-action:manipulation}.vp-i b{font-size:15px}.vp-i small{display:block;color:#77716a;font-size:12px;margin-top:2px}.vp-i.on{border:2px solid #171512}.vp-x{font:inherit;border:1px solid #ddd8d0;background:#fff;border-radius:999px;padding:8px 14px;cursor:pointer}';
    document.head.appendChild(st);
  }
  let sh = document.getElementById('vpSheet');
  if (!sh) {
    sh = document.createElement('div');
    sh.id = 'vpSheet';
    sh.className = 'vp';
    document.body.appendChild(sh);
    let down = false;
    sh.addEventListener('pointerdown', ev => {
      down = ev.target === sh;
    });
    sh.addEventListener('click', ev => {
      if (down && ev.target === sh) close();
      down = false;
    });
  }
  let sp = /robusta/i.test(species || '') ? 'Robusta' : /arabica/i.test(species || '') ? 'Arabica' : 'All',
    q = '',
    view = 'list';
  function close() {
    sh.hidden = true;
    document.body.style.overflow = '';
  }
  function pick(n) {
    if (browse) {
      const l = sh.querySelector('.vp-l');
      const card = varietyHtml(n);
      if (card) {
        l.innerHTML =
          '<button type="button" class="vp-x" id="vpBack" style="margin:6px 0 10px">‹ All varieties</button><div style="background:#fff;border:1px solid #ddd8d0;border-radius:12px;padding:12px;line-height:1.5;font-size:14px">' +
          card +
          '</div>';
        l.scrollTop = 0;
        document.getElementById('vpBack').onclick = render;
      }
      return;
    }
    input.value = n;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    close();
  }
  function render() {
    if (view === 'words') return renderWords();
    const cur = browse
      ? ''
      : String(input.value || '')
          .trim()
          .toLowerCase();
    const ql = q.toLowerCase();
    const list = KK_VARIETIES.filter(
      v =>
        (sp === 'All' || v.sp === sp) &&
        (!ql || (v.n + ' ' + (v.a || '') + ' ' + (v.line || '')).toLowerCase().includes(ql))
    );
    const item = v =>
      '<button type="button" class="vp-i' +
      (v.n.toLowerCase() === cur ? ' on' : '') +
      '" data-vn="' +
      e(v.n) +
      '"><b>' +
      e(v.n) +
      '</b><small>' +
      e(v.line || '') +
      (v.rust ? ' · rust ' + e(v.rust.toLowerCase()) : '') +
      '</small></button>';
    const ind = list.filter(v => v.s === 'IN'),
      wld = list.filter(v => v.s !== 'IN');
    sh.innerHTML =
      '<div class="vp-b" role="dialog" aria-label="Choose variety"><div class="vp-h"><b>' +
      (browse ? 'Coffee varieties' : 'Variety') +
      '</b><button type="button" class="vp-x" id="vpClose">Close</button></div><input id="vpQ" placeholder="Search, or type a variety not listed" value="' +
      e(q) +
      '" style="margin-top:10px;font-size:16px;padding:11px 12px;border:1px solid #ddd8d0;border-radius:11px;width:100%">' +
      (browse
        ? '<div class="vp-f" style="margin-bottom:0"><button type="button" class="on">Varieties</button><button type="button" id="vpWords">Words explained</button></div>'
        : '') +
      '<div class="vp-f">' +
      ['All', 'Arabica', 'Robusta', 'Liberica', 'Excelsa']
        .map(
          x =>
            '<button type="button" data-vs="' +
            x +
            '" class="' +
            (sp === x ? 'on' : '') +
            '">' +
            x +
            '</button>'
        )
        .join('') +
      '</div><div class="vp-l">' +
      (!browse && q && !KK_VARIETIES.some(v => v.n.toLowerCase() === ql)
        ? '<button type="button" class="vp-i" data-vn="' +
          e(q) +
          '"><b>Use “' +
          e(q) +
          '”</b><small>Not in the list. Saved as you typed it.</small></button>'
        : '') +
      (ind.length ? '<div class="vp-g">India (CCRI)</div>' + ind.map(item).join('') : '') +
      (wld.length ? '<div class="vp-g">World (WCR catalogue)</div>' + wld.map(item).join('') : '') +
      (!list.length && !q ? '<div style="color:#77716a">No varieties for this filter.</div>' : '') +
      '</div></div>';
    sh.querySelectorAll('[data-vn]').forEach(b => (b.onclick = () => pick(b.dataset.vn)));
    sh.querySelectorAll('[data-vs]').forEach(
      b =>
        (b.onclick = () => {
          sp = b.dataset.vs;
          render();
        })
    );
    const vw = document.getElementById('vpWords');
    if (vw)
      vw.onclick = () => {
        view = 'words';
        render();
      };
    document.getElementById('vpClose').onclick = close;
    const qi = document.getElementById('vpQ');
    qi.oninput = () => {
      q = qi.value;
      const pos = qi.selectionStart;
      render();
      const n = document.getElementById('vpQ');
      n.focus();
      try {
        n.setSelectionRange(pos, pos);
      } catch (x) {}
    };
  }
  function renderWords() {
    const ql = q.toLowerCase();
    const list = COFFEE_WORDS.filter(([g, t, d]) => !ql || (t + ' ' + d).toLowerCase().includes(ql));
    const groups = [...new Set(list.map(x => x[0]))];
    sh.innerHTML =
      '<div class="vp-b" role="dialog" aria-label="Coffee words explained"><div class="vp-h"><b>Coffee words</b><button type="button" class="vp-x" id="vpClose">Close</button></div><input id="vpQ" placeholder="Search a word" value="' +
      e(q) +
      '" style="margin-top:10px;font-size:16px;padding:11px 12px;border:1px solid #ddd8d0;border-radius:11px;width:100%"><div class="vp-f"><button type="button" id="vpList">Varieties</button><button type="button" class="on">Words explained</button></div><div class="vp-l">' +
      '<div style="font-size:13px;color:#77716a;line-height:1.5;margin:4px 0 8px">The words people use about coffee plants, processing, grades and bags, in plain language. Browse the varieties to see them in use.</div>' +
      groups
        .map(
          g =>
            '<div class="vp-g">' +
            e(g) +
            '</div>' +
            list
              .filter(x => x[0] === g)
              .map(
                ([, t, d]) =>
                  '<div class="vp-i" style="cursor:default"><b>' +
                  e(t) +
                  '</b><small style="font-size:13.5px;line-height:1.5;color:#3d3833">' +
                  e(d) +
                  '</small></div>'
              )
              .join('')
        )
        .join('') +
      (!list.length ? '<div style="color:#77716a">No match.</div>' : '') +
      '<div style="font-size:11.5px;color:#77716a;margin:10px 0">Written by KoffyKraft in plain words, checked against the <a href="https://varieties.worldcoffeeresearch.org/" target="_blank" rel="noopener" style="color:#8d583b">World Coffee Research catalogue</a> and <a href="https://coffeeboard.gov.in/" target="_blank" rel="noopener" style="color:#8d583b">Coffee Board of India</a> usage. Regional words from the <a href="https://library.sweetmarias.com/glossary/beneficio/" target="_blank" rel="noopener" style="color:#8d583b">Sweet Maria\'s Coffee Library</a> and <a href="https://mycoffeeexplorer.com/glossary/pulped-natural" target="_blank" rel="noopener" style="color:#8d583b">My Coffee Explorer</a>; grades from the <a href="https://dev-cdn.cafeimports.com/images/Common-Coffee-Grades-Chart.pdf" target="_blank" rel="noopener" style="color:#8d583b">Cafe Imports grades chart</a>; bag weights from <a href="https://cdn.royalcoffee.com/wp-content/uploads/2020/08/14100208/CoffeeWeights_FINAL.pdf" target="_blank" rel="noopener" style="color:#8d583b">Royal Coffee</a>. Grades vary by exporter and year: check the contract.</div></div></div>';
    document.getElementById('vpClose').onclick = close;
    document.getElementById('vpList').onclick = () => {
      view = 'list';
      q = '';
      render();
    };
    const qi = document.getElementById('vpQ');
    qi.oninput = () => {
      q = qi.value;
      const pos = qi.selectionStart;
      renderWords();
      const n = document.getElementById('vpQ');
      n.focus();
      try {
        n.setSelectionRange(pos, pos);
      } catch (x) {}
    };
  }
  sh.hidden = false;
  document.body.style.overflow = 'hidden';
  render();
}
window.addEventListener('hashchange', () => {
  const sh = document.getElementById('vpSheet');
  if (sh && !sh.hidden) {
    sh.hidden = true;
    document.body.style.overflow = '';
  }
});
