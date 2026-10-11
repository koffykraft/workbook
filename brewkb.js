// KoffyKraft brewing knowledge. Guides, not guarantees.
// Findings are credited where they come from a study; everything else is common practice and says so.
// Studies: Frost, Ristenpart and Guinard, J. Food Science 85 (2020) "Effects of brew strength, brew yield, and roast
// on the sensory quality of drip brewed coffee"; Guinard et al., J. Food Science (2023), the new Coffee Brewing
// Control Chart; Cameron, Hendon, Foster et al., Matter 2 (2020) 631-648 "Systematically improving espresso";
// Cordoba et al., Scientific Reports (2019); National Coffee Association, Cold Brew toolkit (2018).
(function(){
const S={
 F:{t:'Frost, Ristenpart and Guinard, J. Food Science (2020)',u:'https://scholar.google.com/scholar?q=Effects+of+brew+strength+brew+yield+and+roast+on+the+sensory+quality+of+drip+brewed+coffee'},
 G:{t:'Guinard et al., J. Food Science (2023), new Brewing Control Chart',u:'https://scholar.google.com/scholar?q=Guinard+2023+Coffee+Brewing+Control+Chart+consumer'},
 C:{t:'Cameron, Hendon, Foster et al., Matter (2020)',u:'https://scholar.google.com/scholar?q=Systematically+Improving+Espresso+Insights+from+Mathematical+Modeling+and+Experiment'},
 K:{t:'Cordoba et al., Scientific Reports (2019)',u:'https://scholar.google.com/scholar?q=Cordoba+2019+cold+brew+coffee+grind+size+steeping+time+sensory'},
 N:{t:'National Coffee Association, Cold Brew toolkit (2018)',u:'https://www.ncausa.org'},
 M:{t:'Moccamaster: SCA certified brewers and the Golden Cup standard',u:'https://us.moccamaster.com/blogs/blog/certified-by-the-sca-moccamaster-and-the-golden-cup-standard'},
 B:{t:'Five Senses Coffee: Batch brew fundamentals',u:'https://fivesenses.com.au/blogs/news/batch-brew-fundamentals'},
 R:{t:'Scott Rao: Bed depth, why it matters (2025)',u:'https://www.scottrao.com/blog/2025/11/11/bed-depth-why-it-matters'},
 P:{t:'Common practice',u:''}
};
// Level: 1 basic, 2 intermediate, 3 advanced. Each tip: [level, text, source]
const FAM={
 drip:{n:'Drip and filter',d:'Hot water passes through or sits with ground coffee, then a filter separates it. Pour-over, immersion and batch brewers all belong here. The brew control chart and its targets were made for this family.',
  levers:'Ratio sets strength. Grind, time, temperature and stirring set extraction.',
  tips:[
   [1,'Start near 1 g coffee to 15 to 17 g water (about 60 to 65 g per litre).','P'],
   [1,'Sour or thin: grind a little finer. Bitter or drying: grind a little coarser. Change one thing at a time.','P'],
   [1,'Use water just off the boil, about 90 to 96 °C. Cooler for dark roasts.','P'],
   [2,'Strength and extraction are two separate dials. More water per gram makes it weaker; finer grind or longer contact extracts more.','P'],
   [2,'In tasting studies, sweetness was highest at lower strength (about 1.0% TDS). Higher strength brought more bitterness, drying and a longer finish.','F'],
   [2,'Roast level changed the cup more than extraction did. Darker roasts tasted more bitter, ashy and smoky; lighter roasts kept fruit, citrus and sweetness.','F'],
   [2,'Light roasts tasted more sour at every strength, and got sour faster as strength rose.','F'],
   [3,'Measure TDS with a refractometer. Extraction % = TDS % × beverage g ÷ coffee g.','P'],
   [3,'Higher extraction raised bitterness, ash, rubber, earthy notes, dark chocolate and finish. Very low extraction also lost citrus, dried fruit and sweetness.','F'],
   [3,'The 2023 chart replaces the old fixed box with taste regions and g/L ratio lines. Plot your brews in Cup to see where they sit.','G'],
   [3,'Agitation, bypass (water that skips the bed) and fines all move extraction without changing the grind number.','P']],
  src:['F','G','P']},
 esp:{n:'Espresso',d:'Hot water is forced through a packed bed (the puck) at high pressure, about 9 bar on most machines. Small and concentrated, so filter targets do not apply.',
  levers:'Grind moves extraction. Grams out (yield) moves strength. Dose sets the bed size.',
  tips:[
   [1,'Weigh coffee in and drink out. A common start: 18 g in, 36 g out (1:2), in about 25 to 30 seconds.','P'],
   [1,'Sour: grind finer or let the shot run longer. Bitter: grind coarser or stop the shot a little sooner.','P'],
   [1,'Bitter and sour in the same sip, most noticeable as it cools: the puck is extracting unevenly. Try coarser, not finer, and distribute evenly before tamping.','C'],
   [2,'Grinding finer raises extraction only up to a point. Past it, fines clog parts of the puck, extraction falls and shots vary.','C'],
   [2,'Find your finest even grind: go finer step by step until shots start to vary or taste muddled, then go back one step. Then adjust strength with grams out, not grind.','C'],
   [2,'Less coffee, coarser grind: a café study cut the dose from 20 g to 15 g for the same 40 g out, ground much coarser, kept or raised extraction and got steadier shots. Shots ran about 14 s, a little weaker, with a different taste.','C'],
   [2,'Two shots with the same extraction can taste different. Numbers guide, taste decides.','C'],
   [3,'The usual 20 to 30 s time rule may push baristas into the clogging zone. Treat time as a result, not a target.','C'],
   [3,'If your machine lets you set pressure, try about 6 bar. In the study, 9 bar clogged at fine grinds, and lower pressure extracted more at the same grind.','C'],
   [3,'Blending a big-dose, low-extraction shot with a small-dose, high-extraction shot came close to the complex taste of a slightly clogged shot, with less variation. The authors call it one for the very keen.','C'],
   [3,'Espresso TDS commonly sits around 8 to 12%. Measure the whole shot, stirred.','P']],
  src:['C','P']},
 moka:{n:'Moka pot',d:'Steam pressure from the lower chamber pushes water up through the coffee. Lower pressure than espresso, stronger than filter.',
  levers:'Grind, heat and when you take it off the heat.',
  tips:[[1,'Fill the basket level. Do not tamp.','P'],[1,'Start with hot water in the base so the coffee does not cook while the pot heats.','P'],[1,'Take it off the heat at the first sputter and cool the base under the tap.','P'],[2,'Bitter or burnt: lower heat or grind a little coarser. Sour and weak: grind a little finer.','P'],[3,'A paper disc on the top filter plate gives a cleaner cup.','P']],src:['P']},
 trad:{n:'Traditional',d:'Brewers with their own customs: South Indian filter, Turkish cezve, Vietnamese phin, Napoletana. Strong by design and often served with milk or sugar.',
  levers:'Powder fineness, packing, heat and time.',
  tips:[[1,'Judge by the drink as served (with milk or sugar if that is how you drink it).','P'],[2,'Finer powder or firmer packing extracts more; coarser or looser extracts less.','P']],src:['P']},
 cold:{n:'Cold',d:'Cold or room-temperature water and a long contact time. Different flavour from hot coffee, lower in perceived acidity.',
  levers:'Steep time first, then grind and ratio.',
  tips:[[1,'Start about 1:12, coarse like French press, about 14 hours at room temperature, then filter.','K'],[1,'Refrigerate once filtered. Do not seal and keep at room temperature.','N'],[2,'In a 2019 study, the coarse 14 hour brew scored highest. 22 hours was stronger but scored lower.','K'],[2,'A warm kitchen extracts faster. Taste from about 12 hours, or steep in the fridge for longer.','P']],src:['K','N','P']}
};
// Methods: id, name, family, filter, starting point, notes [level,text,src]
const M=[
 ['v60','V60','drip','paper','15 g : 250 g, medium-fine, 92 to 96 °C, about 3:00',[[1,'Cone with one large hole: flow depends mostly on your grind and pouring.','P'],[2,'Fast and responsive. Small grind changes show up quickly.','P']]],
 ['kalita','Kalita Wave','drip','paper','15 g : 250 g, medium, about 3:30',[[1,'Flat bed and three small holes: more forgiving of uneven pouring.','P']]],
 ['origami','Origami','drip','paper','15 g : 250 g, medium-fine, about 3:00',[[1,'Takes cone or wave filters. Cone runs faster, wave is more forgiving.','P']]],
 ['chemex','Chemex','drip','paper','30 g : 500 g, medium-coarse, about 4:30',[[1,'Thick paper gives a very clean, light-bodied cup.','P'],[2,'Grind coarser than V60 or it chokes and over-extracts.','P']]],
 ['kono','Kono','drip','paper','15 g : 240 g, medium-fine, about 3:00',[[1,'Ribs only near the tip, so it drains slower than a V60. Pour gently.','P']]],
 ['melitta','Melitta','drip','paper','15 g : 250 g, medium, about 4:00',[[1,'Wedge shape with small holes: slow and forgiving.','P']]],
 ['april','April brewer','drip','paper','13 g : 200 g, medium, about 2:30',[[1,'Flat bottom built for few pours and an even bed.','P']]],
 ['orea','Orea','drip','paper','15 g : 250 g, medium-fine, about 2:30',[[1,'Fast-draining flat brewer. Grind a little finer than you would for a Kalita.','P']]],
 ['beehouse','Bee House','drip','paper','15 g : 250 g, medium, about 3:30',[[1,'Wedge with small holes: forgiving and steady.','P']]],
 ['hoop','Ceado Hoop','drip','paper','15 g : 250 g, medium, about 3:00',[[1,'A ring spreads water evenly; pour it all in at once.','P']]],
 ['pulsar','Pulsar','drip','paper','20 g : 320 g, medium-fine, about 3:30',[[1,'Valve and shower screen let you steep then drain, with little bypass.','P']]],
 ['nel','Nel drip (cloth)','drip','cloth','25 g : 250 g, medium-coarse, slow pour, about 4:00',[[1,'Flannel cloth: rich yet clean. Keep it wet and chilled between uses; never dry it or use soap.','P']]],
 ['batch','Batch brewer','drip','paper','60 g per litre (55 to 65), medium-coarse, 4 to 8 min contact, water about 92 to 96 °C',[
  [1,'Weigh coffee and water. Start at 60 g per litre: 120 g for 2 L. Weak: go to 65. Too strong: go to 55.','B'],
  [1,'Sour or thin: grind finer. Bitter or drying: grind coarser. Keep the ratio the same while you change the grind.','B'],
  [1,'Rinse the paper with hot water first, and check the brewer and basket sit level so water spreads evenly.','B'],
  [1,'Serve within about an hour. Stir the pot or airpot once after brewing: the first and last coffee out differ in strength.','B'],
  [2,'SCA certified brewers keep water at 92 to 96 °C, finish a full batch in 4 to 8 minutes of contact, and hold the coffee at 80 to 85 °C without boiling it.','M'],
  [2,'Bigger batches need a coarser grind. Total contact for a 2 L batch is about 5:30 to 6:30.','B'],
  [2,'Aim for a coffee bed 3 to 5 cm deep. Small batches in a big basket make a shallow bed that channels and tastes drying; use a smaller basket or a half-batch setting.','R'],
  [3,'Test the brewer: run a cycle with no coffee and weigh what comes out, to check it delivers the water you think it does.','B'],
  [3,'Clean the basket, shower head and pot daily. Old coffee oils taste stale and murky in the next batch.','B']]],
 ['moccamaster','Moccamaster','drip','paper','About 62 g per litre (1:16), medium-coarse, 4 to 6 min',[
  [1,'Fill the tank with cold or room-temperature water to the line for your batch; the machine heats it. 31 g for 0.5 L, 62 g for 1 L, 78 g for 1.25 L is a common start.','P'],
  [1,'All current Moccamaster models are SCA certified: they heat water to the brewing range and finish in the certified time.','M'],
  [2,'Bloom: close the drip-stop, switch on, and when the basket is about half full switch off and stir gently. Then open the drip-stop and switch on again.','P'],
  [2,'Brewing less than a full tank: use the half-carafe setting on models that have it, and grind slightly finer, since a shallow bed drains faster.','P'],
  [3,'If a full tank runs over about 6 minutes the grind is likely too fine; under about 4, too coarse.','P']]],
 ['iced','Japanese iced pour-over','drip','paper','20 g : 200 g hot water over 120 g ice',[[1,'Brew hot and stronger straight onto ice so it chills without tasting diluted.','P']]],
 ['aeropress','AeroPress','drip','paper','15 g : 230 g, medium-fine, about 2:00',[[1,'Steep then press through paper. Very flexible: almost any recipe works.','P'],[2,'Inverted or upright, keep one way while you dial in.','P']]],
 ['press','French press','drip','metal','30 g : 500 g, coarse, 4:00',[[1,'Metal mesh lets oils and fine particles through: full body, some sediment.','P'],[1,'Break the crust, skim the foam, wait a few minutes, then plunge gently and pour slowly.','P']]],
 ['clever','Clever dripper','drip','paper','15 g : 250 g, medium, steep 2:00 then drain',[[1,'Steep with the valve shut, then set it on the cup to drain through paper.','P']]],
 ['switch','Hario Switch','drip','paper','15 g : 250 g, medium-fine, about 3:00',[[1,'V60 cone with a valve: brew as immersion, pour-over or a mix.','P']]],
 ['steepshot','SteepShot','drip','metal','15 g : 150 g, medium-fine, about 1:00',[[1,'Sealed shaker for a short immersion. Shake gently and release.','P']]],
 ['espro','Espro press','drip','metal','18 g : 300 g, medium-coarse, 4:00',[[1,'Press with two fine filters: cleaner than a standard French press.','P']]],
 ['tricolate','Tricolate','drip','paper','15 g : 250 g, fine, about 3:30',[[1,'All water goes in at once with no bypass, so it takes a much finer grind.','P']]],
 ['siphon','Siphon','drip','cloth','20 g : 300 g, medium, steep about 1:00',[[1,'Vapour pushes water up to steep the coffee; cooling pulls it back down through cloth.','P'],[2,'Stir gently and keep the heat steady during the steep.','P']]],
 ['espresso','Espresso','esp','metal','18 g in, 36 g out, about 25 to 30 s',[]],
 ['lever','Lever espresso','esp','metal','16 to 18 g in, 1:2, about 30 to 35 s',[[1,'A spring sets the pressure, which falls as the shot runs.','P']]],
 ['moka','Moka pot','moka','metal','Basket full and level, medium heat',[]],
 ['coldbrew','Cold brew','cold','varies','1:12, coarse, about 14 hours',[]],
 ['colddrip','Cold drip (Kyoto)','cold','paper','About 1 drop per second, several hours',[[1,'Ice water drips slowly through the bed. Drip rate is the main lever.','P']]],
 ['nitro','Nitro cold brew','cold','varies','Cold brew, then nitrogen from a keg',[[1,'Nitrogen gives a creamy, foamy texture. Needs a keg and food-safe handling.','N']]],
 ['southindian','South Indian filter','trad','metal','2 to 3 tbsp powder, packed lightly, hot water, 15 to 20 min',[[1,'Decoction drips slowly into the lower chamber. Mixed with hot milk and sugar, then poured between tumbler and dabarah to froth.','P'],[2,'Chicory blends drip slower and taste heavier. Adjust powder and packing first.','P']]],
 ['turkish','Turkish / ibrik','trad','none','7 g per cup, powder-fine, add sugar before heating',[[1,'Heat slowly until the foam rises, do not boil. Let the grounds settle before drinking.','P']]],
 ['phin','Vietnamese phin','trad','metal','20 g, medium-coarse, bloom 30 s then fill',[[1,'Gravity filter with a press plate. Often dark robusta with condensed milk.','P']]],
 ['napoletana','Napoletana','trad','metal','4-cup pot, medium grind',[[1,'Heat the water in the bottom, then flip the pot so it drips through the coffee.','P']]],
 ['other','Other','drip','unknown','Note your recipe and change one thing at a time',[]]
];
const METHODS=M.map(([id,n,f,fl,start,notes])=>({id,n,f,fl,start,notes}));
const byName={};METHODS.forEach(m=>byName[m.n]=m);
// Topics
const T=[
 ['strength','Strength and extraction','drip',[[1,'Strength is how concentrated the cup is (TDS %). Extraction is how much of the coffee dissolved (%).','P'],[1,'Ratio moves strength. Grind, time, heat and stirring move extraction.','P'],[2,'Sweetness was highest at lower strength; higher strength raised bitterness and drying.','F'],[3,'Extraction % = TDS % × beverage g ÷ coffee g. The chart in Cup plots your brews.','P']]],
 ['roast','Roast level and brewing','',[[1,'Darker roasts extract faster and taste more bitter. Use cooler water or a coarser grind.','P'],[2,'Darker roasts: more bitter, ashy, smoky, woody, dark chocolate and body. Lighter roasts: more fruit, citrus and sweetness.','F'],[2,'Light roasts sour faster as strength rises. Raise strength in small steps.','F'],[3,'Roast separated coffees more than extraction did. Some flavours cannot be brewed away; change the roast.','F']]],
 ['uneven','Uneven extraction and channels','',[[1,'Bitter and sour in the same cup often means some coffee extracted too much and some too little.','P'],[1,'Drip: pour evenly and keep the bed flat. Espresso: distribute evenly and tamp level.','P'],[2,'Espresso: grinding too fine clogs parts of the puck. Extraction falls and shots vary. Go coarser.','C'],[3,'A refractometer gives an average. Part of a clogged puck may be far over-extracted while part stays dry.','C']]],
 ['taste','From taste to cause','',[[1,'Use the taste list in Cup dial-in: pick what stands out and see likely causes for your method.','P']]],
 ['water','Water','',[[1,'Use clean, filtered water without off smells.','P'],[2,'Alkalinity (buffer) softens acidity. Lower buffer lets acidity show. Mix your own on the Water page.','P']]],
 ['cold','Cold brew safety','cold',[[1,'Cold brew never meets near-boiling water. Clean equipment, refrigerate, and date it.','N'],[1,'Do not seal and store at room temperature.','N']]]
];
const TOPICS=T.map(([id,n,f,tips])=>({id,n,f,tips}));
const WORDS=[
 ['tds','TDS','Total dissolved solids: how strong the brew is, as a %.'],
 ['ey','Extraction','How much of the dry coffee ended up in the cup, as a %.'],
 ['ratio','Ratio','Water to coffee by weight. 1:16 means 16 g water per 1 g coffee. For espresso, grams out per gram in.'],
 ['gl','g/L','Grams of coffee per litre of water. 62 g/L is about 1:16.'],
 ['bloom','Bloom','A small first pour that lets gas escape before the main pour.'],
 ['agitation','Agitation','Stirring, swirling or pouring hard. Raises extraction.'],
 ['bypass','Bypass','Water that runs past the coffee bed without passing through it.'],
 ['fines','Fines','Very small particles from grinding. Add body and bitterness; can clog filters and pucks.'],
 ['channel','Channel','A path where water rushes through the bed, leaving other parts under-extracted.'],
 ['drawdown','Drawdown','The time for the last water to drain from a pour-over.'],
 ['puck','Puck','The packed bed of coffee in an espresso basket.'],
 ['dose','Dose','Dry coffee used, in grams.'],
 ['yield','Yield','Drink out, in grams. Used mainly for espresso.'],
 ['preinf','Pre-infusion','Wetting the espresso puck at low pressure before full pressure.'],
 ['crema','Crema','The foam on espresso, from gas and oils. Not a reliable sign of taste.'],
 ['refrac','Refractometer','A meter that reads TDS from a drop of coffee.'],
 ['decoction','Decoction','The strong brew from a South Indian filter, mixed with milk.'],
 ['immersion','Immersion','Coffee and water sit together for the whole brew, then separate.'],
 ['percolation','Percolation','Water flows through the bed and out, as in pour-over.']
];
// What you taste -> likely causes, by family. [id,label,{drip,esp,other}]
const TASTE=[
 ['sour','Sour, sharp',{drip:[['Under-extracted. Grind a little finer or brew a little longer.','P'],['With a light roast, also brew a little weaker: light roasts sour faster as strength rises.','F']],esp:[['Under-extracted. Grind a little finer or let the shot run longer.','P']],other:[['Often under-extracted. Extract a little more.','P']]}],
 ['bitter','Bitter',{drip:[['Over-extracted or too strong. Grind a little coarser, or use more water.','F'],['With a dark roast, much of the bitterness comes from the roast itself.','F']],esp:[['Grind a little coarser or stop the shot a little sooner.','P'],['With a dark roast, try cooler water.','P']],other:[['Extract a little less or use less coffee.','P']]}],
 ['both','Sour and bitter together',{drip:[['Uneven extraction. Pour evenly, keep the bed flat, and check for a grind with many fines.','P']],esp:[['Uneven flow through the puck. If grinding very fine, try coarser, not finer. Distribute evenly.','C']],other:[['Uneven extraction. Check grind and how evenly water meets the coffee.','P']]}],
 ['dry','Drying, astringent',{drip:[['Drying rose with strength. Brew a little weaker first.','F'],['Then check extraction is not too high.','F']],esp:[['Grind a little coarser. Check for channels.','P']],other:[['Use a little less coffee or extract less.','P']]}],
 ['thin','Thin, watery',{drip:[['Too weak. Use less water for the same coffee.','P']],esp:[['Too weak. Stop the shot sooner or add a little more coffee.','P']],other:[['Use a little more coffee.','P']]}],
 ['ash','Ashy, rubbery, earthy, burnt',{drip:[['These rose with higher extraction and darker roast. Extract less.','F'],['If the roast is dark, this is likely the roast, not the brew.','F']],esp:[['Extract less, or try a lighter roast.','F']],other:[['Extract less, or try a lighter roast.','F']]}],
 ['flat','Flat, dull',{drip:[['Could be weak, stale, or very hard water. Check rest days, strength and water.','P']],esp:[['Could be stale or extracted unevenly. Check rest days and grind.','P']],other:[['Check freshness and water.','P']]}],
 ['muddy','Muddy, harsh',{drip:[['Fines or channels. Sift fines, pour gently, or use paper.','P']],esp:[['Clogging or channels. Go coarser and distribute evenly.','C']],other:[['Let it settle, or filter through paper.','P']]}]
];
function famOf(name){const m=byName[name];return m?m.f:'drip'}
function famKey(name){const f=famOf(name);return f==='drip'?'drip':f==='esp'?'esp':'other'}
window.KK_BREW={S,FAM,METHODS,byName,TOPICS,WORDS,TASTE,famOf,famKey};
})();
