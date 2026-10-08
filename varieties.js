// Coffee variety reference. Facts only, written for KoffyKraft, with sources credited.
// IN  = Central Coffee Research Institute (CCRI, Coffee Board of India) releases, as listed by
//       TNAU Agritech Portal and Counter Culture Coffee, "India's Arabica Coffee Varieties".
// WCR = World Coffee Research, Arabica Coffee Varieties catalog (2019), varieties.worldcoffeeresearch.org
// Traits from WCR are its ratings under ideal conditions. alt: altitude band where WCR rates the variety best
// (L = low and up, M = medium and up, H = high).
const VARIETY_SRC={
 IN:{name:'CCRI releases (Coffee Board of India), as listed by:',links:[['TNAU Agritech Portal','https://agritech.tnau.ac.in/horticulture/horti_plantation%20crops_coffee.html'],['Counter Culture Coffee','https://counterculturecoffee.com/blogs/counter-culture-coffee/india-s-arabica-coffee-varieties'],['Agriculture Institute (robusta)','https://agriculture.institute/crop-production-technology/understanding-coffee-varieties-india']]},
 WCR:{name:'',links:[['World Coffee Research, Arabica Coffee Varieties (2019)','https://varieties.worldcoffeeresearch.org/']]}
};
const KK_VARIETIES=[
 // India, arabica
 {n:'Kents',a:'Kent',sp:'Arabica',s:'IN',line:'Old Indian selection',t:'Parent of S.795 and Sln 6. WCR DNA work links it to Bourbon-related varieties.'},
 {n:'Sln 1 (S.288)',sp:'Arabica',s:'IN',line:'Selection from S.26, a natural arabica x liberica cross',t:'Rust resistant (races 1 and 2). First CCRI release, 1936-37.'},
 {n:'Sln 3 (S.795)',a:'SLN 795 (S795)|S795|S.795|Selection 795|Sln 795',sp:'Arabica',s:'IN',line:'S.288 x Kents',t:'Rust resistant (races 1 and 2). Bold beans, high A grade. Released 1945-46.'},
 {n:'Sln 4 (Cioccie)',sp:'Arabica',s:'IN',line:'Ethiopian pure line selections'},
 {n:'Sln 5A',sp:'Arabica',s:'IN',line:'Devamachy x S.881',t:'Arabica x robusta background.'},
 {n:'Sln 5B',a:'SLN 5B',sp:'Arabica',s:'IN',line:'Devamachy x S.333',t:'Arabica x robusta background.'},
 {n:'Sln 6 (S.2828)',a:'Sln 6|S.2828',sp:'Arabica',s:'IN',line:'S.274 (robusta) x Kents',t:'High A grade. Rwanda\'s RAB C15 is a selection of it (WCR).'},
 {n:'Sln 7',sp:'Arabica',s:'IN',line:'From San Ramon',t:'Dwarf habit.'},
 {n:'Sln 7.3',sp:'Arabica',s:'IN',line:'S.2498 x Hibrido de Timor'},
 {n:'Sln 8',sp:'Arabica',s:'IN',line:'Pure line of Hibrido de Timor',t:'Strong rust resistance.'},
 {n:'Sln 9',a:'SLN 9|Selection 9',sp:'Arabica',s:'IN',line:'Hibrido de Timor (Sln 8) x Tafarikela',t:'Drought hardy. Known for cup quality.'},
 {n:'Sln 10',sp:'Arabica',s:'IN',line:'Caturra x (S.795 x Hibrido de Timor)',t:'Rust resistant. Parentage is reported differently by some sources.'},
 {n:'Sln 11',sp:'Arabica',s:'IN',line:'C. liberica x C. eugenioides progeny',t:'Field rust resistance and drought hardiness.'},
 {n:'Sln 12 (Cauvery)',a:'Cauvery (Catimor)|Cauvery|Catimor India',sp:'Arabica',s:'IN',line:'Caturra x Hibrido de Timor (Catimor)',t:'Dwarf, for close planting. High yield. Released 1985.'},
 {n:'Sln 13 (Chandragiri)',a:'Chandragiri|Sln 13|SLN 13',sp:'Arabica',s:'IN',line:'Villa Sarchi x Hibrido de Timor (Sarchimor)',t:'Fairly rust resistant. Widely planted now. Released 2007.'},
 {n:'San Ramon',sp:'Arabica',s:'IN',line:'Short internode arabica',t:'Dwarf.'},
 {n:'Hawaiian Red Caturra (HRC)',sp:'Arabica',s:'IN',line:'Caturra type'},
 // India, robusta
 {n:'S.274 (Sln 1R)',a:'Robusta SLN 274|S274|Sln 274',sp:'Robusta',s:'IN',line:'Selected mother plants S.274 and S.270',t:'Vigorous, large trees. Plant together with S.270 (cross pollination).'},
 {n:'S.270',sp:'Robusta',s:'IN',line:'Selected mother plant',t:'Partner clone for S.274.'},
 {n:'CxR',a:'Robusta CxR',sp:'Robusta',s:'IN',line:'C. congensis x C. canephora',t:'Compact, for close planting. Bold beans, low acidity.'},
 {n:'Sln 3R',sp:'Robusta',s:'IN',line:'CCRI robusta selection'},
 // World, Bourbon and Typica related (WCR)
 {n:'Typica',sp:'Arabica',s:'WCR',line:'Typica',st:'Tall',q:'Very good',y:'Low',rust:'Susceptible',alt:'H'},
 {n:'Bourbon',sp:'Arabica',s:'WCR',line:'Bourbon',st:'Tall',q:'Very good',y:'Medium',rust:'Susceptible',alt:'H'},
 {n:'Caturra',sp:'Arabica',s:'WCR',line:'Natural mutation of Bourbon',st:'Dwarf',q:'Good',y:'Good',rust:'Susceptible',alt:'H'},
 {n:'Villa Sarchi',sp:'Arabica',s:'WCR',line:'Natural mutation of Bourbon',st:'Dwarf',q:'Good',y:'Good',rust:'Susceptible',alt:'M'},
 {n:'Pacas',sp:'Arabica',s:'WCR',line:'Natural mutation of Bourbon',st:'Dwarf',q:'Good',y:'Good',rust:'Susceptible',alt:'H'},
 {n:'SL28',sp:'Arabica',s:'WCR',line:'Selection of Tanganyika Drought Resistant, Bourbon-like',st:'Tall',q:'Exceptional',y:'Very high',rust:'Susceptible',alt:'M'},
 {n:'SL34',sp:'Arabica',s:'WCR',line:'Typica-like',st:'Tall',q:'Exceptional',y:'High',rust:'Susceptible',alt:'M'},
 {n:'KP423',sp:'Arabica',s:'WCR',line:'Selection of Kent (an Indian variety), Bourbon-like',st:'Tall',q:'Low',y:'High',rust:'Tolerant',alt:'M'},
 {n:'Maragogipe',sp:'Arabica',s:'WCR',line:'Natural mutation of Typica',st:'Tall',q:'Very good',y:'Low',rust:'Susceptible',alt:'H',t:'Very large beans.'},
 {n:'Mundo Novo',sp:'Arabica',s:'WCR',line:'Typica x Bourbon',st:'Tall',q:'Good',y:'High',rust:'Susceptible',alt:'H'},
 {n:'Catuai',sp:'Arabica',s:'WCR',line:'Mundo Novo x Caturra',st:'Dwarf',q:'Good',y:'Good',rust:'Susceptible',alt:'H'},
 {n:'Pacamara',sp:'Arabica',s:'WCR',line:'Pacas x Maragogipe',st:'Dwarf',q:'Exceptional',y:'Good',rust:'Susceptible',alt:'H',t:'Very large beans.'},
 {n:'Geisha (Panama)',a:'Gesha|Geisha',sp:'Arabica',s:'WCR',line:'Ethiopian landrace',st:'Tall',q:'Exceptional',y:'Medium',rust:'Tolerant',alt:'H'},
 {n:'Java',sp:'Arabica',s:'WCR',line:'Ethiopian landrace',st:'Tall',q:'Very good',y:'Medium',rust:'Tolerant',alt:'H',t:'Tolerant to coffee berry disease.'},
 // World, introgressed (Timor Hybrid) (WCR)
 {n:'Catimor 129',sp:'Arabica',s:'WCR',line:'Catimor line from Colombia (Caturra x Timor Hybrid 1343)',st:'Dwarf',q:'Good',y:'Very high',rust:'Resistant',alt:'L'},
 {n:'Costa Rica 95',sp:'Arabica',s:'WCR',t:'Its rust resistance has broken down in Costa Rica.',line:'Timor Hybrid 832/1 x Caturra (Catimor)',st:'Dwarf',q:'Low',y:'High',rust:'Susceptible',alt:'L'},
 {n:'Marsellesa',sp:'Arabica',s:'WCR',line:'Timor Hybrid 832/2 x Villa Sarchi (Sarchimor)',st:'Dwarf',q:'Good',y:'High',rust:'Resistant',alt:'L'},
 {n:'Parainema',sp:'Arabica',s:'WCR',line:'Sarchimor (T5296 selection)',st:'Dwarf',q:'Good',y:'Good',rust:'Resistant',alt:'L',t:'Nematode tolerant.'},
 {n:'Obata',sp:'Arabica',s:'WCR',line:'Timor Hybrid 832/2 x Villa Sarchi (Sarchimor)',st:'Dwarf',q:'Good',y:'High',rust:'Resistant',alt:'L'},
 {n:'Ruiru 11',sp:'Arabica',s:'WCR',line:'Composite: Catimor x multi-cross selections',st:'Dwarf',q:'Good',y:'Very high',rust:'Tolerant',alt:'L',t:'Resistant to coffee berry disease.'},
 {n:'Batian',sp:'Arabica',s:'WCR',line:'Composite with SL28, SL34, Rume Sudan, N39, K7, SL4 and Timor Hybrid parentage',st:'Tall',q:'Very good',y:'High',rust:'Tolerant',alt:'L'},
 {n:'Centroamericano (H1)',sp:'Arabica',s:'WCR',line:'T5296 x Rume Sudan (F1 hybrid)',st:'Dwarf',q:'Very good',y:'Very high',rust:'Resistant',alt:'L'},
 {n:'Starmaya',sp:'Arabica',s:'WCR',line:'Marsellesa x Ethiopian/Sudanese wild accession (F1 hybrid)',st:'Dwarf',q:'Very good',y:'High',rust:'Resistant',alt:'M'}
];
// India sits at about 8 to 15 degrees N: WCR bands for 5-15 N are low 700-900 m, medium 900-1300 m, high above 1300 m.
const ALT_IN={L:'from 700 m (low) up',M:'from 900 m (medium) up',H:'above 1300 m (high)'};
function varietyFind(name){const k=String(name||'').trim().toLowerCase();if(!k)return null;return KK_VARIETIES.find(v=>v.a&&v.a.toLowerCase().split('|').includes(k))||KK_VARIETIES.find(v=>v.n.toLowerCase()===k)||KK_VARIETIES.find(v=>v.n.toLowerCase().replace(/\s*\(.*\)/,'')===k||(v.n.match(/\(([^)]+)\)/)||[])[1]?.toLowerCase()===k)||null}
function varietyHtml(name){const v=varietyFind(name);if(!v)return '';const e=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const tags=[v.sp,v.st,v.q?'Quality '+v.q.toLowerCase():'',v.y?'Yield '+v.y.toLowerCase():'',v.rust?'Rust '+v.rust.toLowerCase():''].filter(Boolean);
 const src=VARIETY_SRC[v.s];
 return '<b>'+e(v.n)+'</b> · '+e(v.line)+'<br>'+tags.map(e).join(' · ')+(v.t?'<br>'+e(v.t):'')+(v.alt?'<br>Best altitude in India: '+ALT_IN[v.alt]:'')+'<div style="font-size:11px;color:var(--muted);margin-top:4px">Sources: '+(src.name?e(src.name)+' ':'')+src.links.map(([n,u])=>'<a href="'+u+'" target="_blank" rel="noopener" style="color:var(--coffee);display:inline-block;margin:2px 10px 2px 0">'+e(n)+'</a>').join('')+'</div>'}
function varietyDatalist(){if(document.getElementById('varieties'))return;const d=document.createElement('datalist');d.id='varieties';d.innerHTML=KK_VARIETIES.map(v=>'<option value="'+v.n.replace(/"/g,'&quot;')+'">').join('');document.body.appendChild(d)}
// Variety picker: a bottom sheet with search, filtered by species. iPhone does not show datalists as a dropdown.
// Coffee words, explained plainly for newcomers. KoffyKraft's own wording, checked against the WCR catalogue and Coffee Board of India usage.
const COFFEE_WORDS=[
 ['Plant names','Species','The big family split. Arabica (Coffea arabica) and robusta (Coffea canephora) are different species, like a lemon and an orange. Liberica and excelsa are others.'],
 ['Plant names','Variety','A group of plants inside one species that share traits and pass them on through seed. Typica, SL28 and Chandragiri are varieties of arabica.'],
 ['Plant names','Cultivar','A variety that people chose and keep growing on purpose. In coffee it means much the same as variety.'],
 ['Plant names','Varietal','A describing word: "a varietal coffee" is made from one variety. Many people use it to mean variety itself; specialists prefer "variety" for the plant.'],
 ['Plant names','Selection (Sln)','How the Coffee Board\'s research institute (CCRI) names the varieties it releases in India, numbered in order: Sln 9, Sln 12 (Cauvery), Sln 13 (Chandragiri). Each was bred or picked, then tested for years before release.'],
 ['Plant names','Line, pure line','The offspring of one plant, grown on for generations until the seedlings come out the same as the parent.'],
 ['Plant names','Clone','Plants grown from cuttings or grafts of one mother plant, so they are genetically identical to it. Common with robusta. Robusta clones are planted in pairs or groups because a robusta flower needs pollen from a different plant, which is why S.274 is planted with S.270.'],
 ['Plant names','Landrace','An old local population that grew in one place for generations without formal breeding. Ethiopia has hundreds. Geisha came from one.'],
 ['Breeding','Mutation','A natural change that appears in one plant and is then kept. Caturra is a short (dwarf) mutation of Bourbon. Maragogipe, with its giant beans, is a mutation of Typica.'],
 ['Breeding','Hybrid, cross','A plant bred from two different parents, for example Mundo Novo from Typica and Bourbon.'],
 ['Breeding','F1 hybrid','The first generation of a cross. Strong and productive, but seed from it does not come out the same, so new plants are made by cloning or tissue culture. Centroamericano is one.'],
 ['Breeding','Interspecific hybrid','A cross between two species. The Timor Hybrid is a natural arabica and robusta cross. India\'s S.26 was a natural arabica and liberica cross.'],
 ['Breeding','Introgressed','An arabica that carries a small piece of another species, usually from robusta through the Timor Hybrid, most often to resist leaf rust.'],
 ['Breeding','Catimor, Sarchimor','Families of introgressed arabica. Catimor is Caturra crossed with Timor Hybrid (Cauvery is one). Sarchimor is Villa Sarchi crossed with Timor Hybrid (Chandragiri is one).'],
 ['Breeding','Composite','A variety made by mixing several related lines, so the field is a little varied on purpose. Ruiru 11 and Batian are composites.'],
 ['Breeding','Tetraploid, diploid','How many sets of chromosomes a plant has. Arabica has four, robusta has two. That difference is why the two cross only rarely.'],
 ['In the field','Tall, dwarf (compact)','Plant height and spacing between branches. Dwarf plants fit closer planting and are easier to pick.'],
 ['In the field','Coffee leaf rust','A fungus that spots and strips the leaves, weakening the plant. It has many strains, so a variety\'s resistance can break down when a new strain arrives.'],
 ['In the field','Coffee berry disease (CBD)','A fungus that rots green cherries, found in Africa. It is why some African varieties list CBD resistance.'],
 ['In the field','Peaberry (PB)','A cherry with one round bean instead of the usual two flat ones. Sorted and sold separately.'],
 ['Indian trade terms','Plantation','Washed arabica, sold as parchment. Traded as Arabica Plantation (A, AA, PB grades).'],
 ['Indian trade terms','Cherry','Natural (dried in the fruit) coffee. Arabica Cherry and Robusta Cherry.'],
 ['Indian trade terms','Robusta Parchment','Washed robusta.'],
 ['Indian trade terms','Monsooned Malabar','Natural arabica or robusta held in open warehouses on the Malabar coast through the monsoon. The beans swell and pale, and the cup turns low in acidity and heavy in body.']];
function openVarieties(input,species){const browse=!input;const e=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 if(!document.getElementById('vpStyle')){const st=document.createElement('style');st.id='vpStyle';st.textContent='.vp[hidden]{display:none!important}.vp{position:fixed;inset:0;background:rgba(23,21,18,.45);z-index:60;display:flex;align-items:flex-end;justify-content:center}.vp-b{background:#f7f5f0;width:min(680px,100%);height:86vh;height:86dvh;border-radius:18px 18px 0 0;display:flex;flex-direction:column;padding:14px 14px calc(10px + env(safe-area-inset-bottom))}.vp-h{display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:17px}.vp-f{display:flex;gap:6px;margin:10px 0}.vp-f button{font:inherit;font-size:13px;border:1px solid #ddd8d0;background:#fff;border-radius:999px;padding:7px 12px;cursor:pointer}.vp-f button.on{background:#171512;color:#fff;border-color:#171512}.vp-l{overflow:auto;flex:1}.vp-g{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#8d583b;margin:12px 0 6px}.vp-i{display:block;width:100%;text-align:left;font:inherit;background:#fff;border:1px solid #ddd8d0;border-radius:12px;padding:10px 12px;margin:0 0 6px;cursor:pointer;color:#171512;touch-action:manipulation}.vp-i b{font-size:15px}.vp-i small{display:block;color:#77716a;font-size:12px;margin-top:2px}.vp-i.on{border:2px solid #171512}.vp-x{font:inherit;border:1px solid #ddd8d0;background:#fff;border-radius:999px;padding:8px 14px;cursor:pointer}';document.head.appendChild(st)}
 let sh=document.getElementById('vpSheet');if(!sh){sh=document.createElement('div');sh.id='vpSheet';sh.className='vp';document.body.appendChild(sh);let down=false;sh.addEventListener('pointerdown',ev=>{down=ev.target===sh});sh.addEventListener('click',ev=>{if(down&&ev.target===sh)close();down=false})}
 let sp=/robusta/i.test(species||'')?'Robusta':/arabica/i.test(species||'')?'Arabica':'All',q='',view='list';
 function close(){sh.hidden=true;document.body.style.overflow=''}
 function pick(n){if(browse){const l=sh.querySelector('.vp-l');const card=varietyHtml(n);if(card){l.innerHTML='<button type="button" class="vp-x" id="vpBack" style="margin:6px 0 10px">‹ All varieties</button><div style="background:#fff;border:1px solid #ddd8d0;border-radius:12px;padding:12px;line-height:1.5;font-size:14px">'+card+'</div>';l.scrollTop=0;document.getElementById('vpBack').onclick=render}return}input.value=n;input.dispatchEvent(new Event('input',{bubbles:true}));close()}
 function render(){if(view==='words')return renderWords();const cur=browse?'':String(input.value||'').trim().toLowerCase();const ql=q.toLowerCase();
  const list=KK_VARIETIES.filter(v=>(sp==='All'||v.sp===sp)&&(!ql||(v.n+' '+(v.a||'')+' '+(v.line||'')).toLowerCase().includes(ql)));
  const item=v=>'<button type="button" class="vp-i'+(v.n.toLowerCase()===cur?' on':'')+'" data-vn="'+e(v.n)+'"><b>'+e(v.n)+'</b><small>'+e(v.line||'')+(v.rust?' · rust '+e(v.rust.toLowerCase()):'')+'</small></button>';
  const ind=list.filter(v=>v.s==='IN'),wld=list.filter(v=>v.s!=='IN');
  sh.innerHTML='<div class="vp-b" role="dialog" aria-label="Choose variety"><div class="vp-h"><b>'+(browse?'Coffee varieties':'Variety')+'</b><button type="button" class="vp-x" id="vpClose">Close</button></div><input id="vpQ" placeholder="Search, or type a variety not listed" value="'+e(q)+'" style="margin-top:10px;font-size:16px;padding:11px 12px;border:1px solid #ddd8d0;border-radius:11px;width:100%">'+(browse?'<div class="vp-f" style="margin-bottom:0"><button type="button" class="on">Varieties</button><button type="button" id="vpWords">Words explained</button></div>':'')+'<div class="vp-f">'+['All','Arabica','Robusta'].map(x=>'<button type="button" data-vs="'+x+'" class="'+(sp===x?'on':'')+'">'+x+'</button>').join('')+'</div><div class="vp-l">'+
  (!browse&&q&&!KK_VARIETIES.some(v=>v.n.toLowerCase()===ql)?'<button type="button" class="vp-i" data-vn="'+e(q)+'"><b>Use “'+e(q)+'”</b><small>Not in the list. Saved as you typed it.</small></button>':'')+
  (ind.length?'<div class="vp-g">India (CCRI)</div>'+ind.map(item).join(''):'')+(wld.length?'<div class="vp-g">World (WCR catalogue)</div>'+wld.map(item).join(''):'')+(!list.length&&!q?'<div style="color:#77716a">No varieties for this filter.</div>':'')+'</div></div>';
  sh.querySelectorAll('[data-vn]').forEach(b=>b.onclick=()=>pick(b.dataset.vn));
  sh.querySelectorAll('[data-vs]').forEach(b=>b.onclick=()=>{sp=b.dataset.vs;render()});const vw=document.getElementById('vpWords');if(vw)vw.onclick=()=>{view='words';render()};
  document.getElementById('vpClose').onclick=close;
  const qi=document.getElementById('vpQ');qi.oninput=()=>{q=qi.value;const pos=qi.selectionStart;render();const n=document.getElementById('vpQ');n.focus();try{n.setSelectionRange(pos,pos)}catch(x){}}}
 function renderWords(){const ql=q.toLowerCase();const list=COFFEE_WORDS.filter(([g,t,d])=>!ql||(t+' '+d).toLowerCase().includes(ql));const groups=[...new Set(list.map(x=>x[0]))];
  sh.innerHTML='<div class="vp-b" role="dialog" aria-label="Coffee words explained"><div class="vp-h"><b>Coffee words</b><button type="button" class="vp-x" id="vpClose">Close</button></div><input id="vpQ" placeholder="Search a word" value="'+e(q)+'" style="margin-top:10px;font-size:16px;padding:11px 12px;border:1px solid #ddd8d0;border-radius:11px;width:100%"><div class="vp-f"><button type="button" id="vpList">Varieties</button><button type="button" class="on">Words explained</button></div><div class="vp-l">'+
  '<div style="font-size:13px;color:#77716a;line-height:1.5;margin:4px 0 8px">The words people use about coffee plants, in plain language. Browse the varieties to see them in use.</div>'+
  groups.map(g=>'<div class="vp-g">'+e(g)+'</div>'+list.filter(x=>x[0]===g).map(([,t,d])=>'<div class="vp-i" style="cursor:default"><b>'+e(t)+'</b><small style="font-size:13.5px;line-height:1.5;color:#3d3833">'+e(d)+'</small></div>').join('')).join('')+(!list.length?'<div style="color:#77716a">No match.</div>':'')+
  '<div style="font-size:11.5px;color:#77716a;margin:10px 0">Written by KoffyKraft in plain words, checked against the <a href="https://varieties.worldcoffeeresearch.org/" target="_blank" rel="noopener" style="color:#8d583b">World Coffee Research catalogue</a> and <a href="https://coffeeboard.gov.in/" target="_blank" rel="noopener" style="color:#8d583b">Coffee Board of India</a> usage.</div></div></div>';
  document.getElementById('vpClose').onclick=close;document.getElementById('vpList').onclick=()=>{view='list';q='';render()};
  const qi=document.getElementById('vpQ');qi.oninput=()=>{q=qi.value;const pos=qi.selectionStart;renderWords();const n=document.getElementById('vpQ');n.focus();try{n.setSelectionRange(pos,pos)}catch(x){}}}
 sh.hidden=false;document.body.style.overflow='hidden';render()}
window.addEventListener('hashchange',()=>{const sh=document.getElementById('vpSheet');if(sh&&!sh.hidden){sh.hidden=true;document.body.style.overflow=''}});
