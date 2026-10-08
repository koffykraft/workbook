// KoffyKraft roast colour check from a phone photo.
// Relative comparison only: the white card sets the white point (a von Kries style scaling),
// sRGB is converted to CIE XYZ (D65) and CIELAB, and batches are compared with CIEDE2000.
// Background: J. Schanda (ed.), Colorimetry: Understanding the CIE System (Wiley, 2007).
// Readings are kept on this device.
(function(){
const KEY='kk_roast_colour_v1',REF='kk_roast_colour_ref';
const load=()=>{try{return JSON.parse(localStorage.getItem(KEY))||{}}catch(e){return {}}};
const save=o=>{try{localStorage.setItem(KEY,JSON.stringify(o))}catch(e){}};
const getRef=()=>{try{return localStorage.getItem(REF)||''}catch(e){return ''}};
const setRef=v=>{try{v?localStorage.setItem(REF,v):localStorage.removeItem(REF)}catch(e){}};
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const lin=c=>{c/=255;return c<=0.04045?c/12.92:Math.pow((c+0.055)/1.055,2.4)};
// white card assumed to reflect about 85% (paper is not a perfect white); lightness is relative to it
const WHITE=0.85;
function toLab(rgb,white){const s=[0,1,2].map(i=>Math.min(1.2,lin(rgb[i])*WHITE/Math.max(1e-4,lin(white[i]))));
 const X=0.4124*s[0]+0.3576*s[1]+0.1805*s[2],Y=0.2126*s[0]+0.7152*s[1]+0.0722*s[2],Z=0.0193*s[0]+0.1192*s[1]+0.9505*s[2];
 const f=t=>t>0.008856?Math.cbrt(t):7.787*t+16/116;const fx=f(X/0.95047),fy=f(Y),fz=f(Z/1.08883);
 const L=116*fy-16,a=500*(fx-fy),b=200*(fy-fz);return{L,a,b,C:Math.hypot(a,b),h:(Math.atan2(b,a)*180/Math.PI+360)%360}}
function de2000(p,q){const rad=Math.PI/180,{L:L1,a:a1,b:b1}=p,{L:L2,a:a2,b:b2}=q;const C1=Math.hypot(a1,b1),C2=Math.hypot(a2,b2),Cm=(C1+C2)/2;
 const G=0.5*(1-Math.sqrt(Math.pow(Cm,7)/(Math.pow(Cm,7)+Math.pow(25,7))));const a1p=(1+G)*a1,a2p=(1+G)*a2;const C1p=Math.hypot(a1p,b1),C2p=Math.hypot(a2p,b2);
 const h=(b,a)=>{if(!a&&!b)return 0;const x=Math.atan2(b,a)/rad;return x<0?x+360:x};const h1p=h(b1,a1p),h2p=h(b2,a2p);
 const dL=L2-L1,dC=C2p-C1p;let dh=0;if(C1p*C2p){dh=h2p-h1p;if(dh>180)dh-=360;else if(dh<-180)dh+=360}const dH=2*Math.sqrt(C1p*C2p)*Math.sin(dh*rad/2);
 const Lm=(L1+L2)/2,Cpm=(C1p+C2p)/2;let hm=h1p+h2p;if(C1p*C2p){if(Math.abs(h1p-h2p)>180)hm=(hm<360?hm+360:hm-360)/2;else hm/=2}
 const T=1-0.17*Math.cos((hm-30)*rad)+0.24*Math.cos(2*hm*rad)+0.32*Math.cos((3*hm+6)*rad)-0.20*Math.cos((4*hm-63)*rad);
 const dTh=30*Math.exp(-Math.pow((hm-275)/25,2)),RC=2*Math.sqrt(Math.pow(Cpm,7)/(Math.pow(Cpm,7)+Math.pow(25,7)));
 const SL=1+0.015*Math.pow(Lm-50,2)/Math.sqrt(20+Math.pow(Lm-50,2)),SC=1+0.045*Cpm,SH=1+0.015*Cpm*T,RT=-Math.sin(2*dTh*rad)*RC;
 return Math.sqrt(Math.pow(dL/SL,2)+Math.pow(dC/SC,2)+Math.pow(dH/SH,2)+RT*(dC/SC)*(dH/SH))}
function words(cur,ref){const out=[],dL=cur.L-ref.L,dC=cur.C-ref.C;let dh=cur.h-ref.h;if(dh>180)dh-=360;if(dh<-180)dh+=360;
 if(Math.abs(dL)>=0.8)out.push((dL>0?'lighter':'darker')+' by '+Math.abs(dL).toFixed(1)+' L*');
 if(Math.abs(dC)>=0.8)out.push(dC>0?'more saturated':'duller');
 if(Math.abs(dh)>=2)out.push(dh<0?'redder':'more yellow');return out.length?out.join(', '):'about the same'}
function verdict(d){return d<1?'hard to tell apart':d<2?'close, a small difference':d<3.5?'visible side by side':'clearly different'}
function rowsHtml(id,all,ref){const cur=all[id];const others=Object.entries(all).filter(([k])=>k!==id);
 if(!others.length)return '';const list=others.map(([k,v])=>({k,v,d:de2000(cur,v)})).sort((x,y)=>x.d-y.d).slice(0,5);
 return '<div class="cc-m">Nearest measured roasts</div>'+list.map(x=>'<div class="cc-r"><span>'+esc(x.v.label||('Roast '+x.k))+(x.k===ref?' <b>(reference)</b>':'')+'</span><span>ΔE '+x.d.toFixed(1)+'</span></div>').join('')}
// Roast names by Agtron Gourmet (M-Basic) number, from Coffee Review's roast table. Names vary between roasters.
const NAMES=[[70,80,'Light brown','Light, Cinnamon, New England'],[50,70,'Medium brown','Medium, American, City'],[40,50,'Medium-dark brown','Full City, Vienna, Light French'],[35,40,'Dark brown','French, Italian, Espresso'],[30,35,'Very dark brown','Italian, Dark French, Neapolitan'],[25,30,'Black-brown','Dark French, Spanish']];
function roastName(n){if(n==null||!isFinite(n))return null;if(n>80)return['Very light','lighter than the table\'s Light band'];if(n<25)return['Beyond black-brown','darker than the table\'s darkest band'];const x=NAMES.find(([lo,hi])=>n>=lo&&n<=hi);return x?[x[2],x[3]]:null}
const numOf=v=>{const m=String(v??'').match(/(\d+(\.\d+)?)/g);return m?parseFloat(m[m.length-1]):null};
function calib(rows,all){const pts=rows.map(r=>{const c=all[String(r.id)],a=numOf(r.finalColor);return c&&a!=null&&a>=15&&a<=110?[c.L,a]:null}).filter(Boolean);if(pts.length<3)return {n:pts.length};
 const n=pts.length,mx=pts.reduce((s,p)=>s+p[0],0)/n,my=pts.reduce((s,p)=>s+p[1],0)/n;let sxy=0,sxx=0;pts.forEach(([x,y])=>{sxy+=(x-mx)*(y-my);sxx+=(x-mx)*(x-mx)});if(!sxx)return {n};const k=sxy/sxx,c0=my-k*mx;const res=Math.sqrt(pts.reduce((s,[x,y])=>s+Math.pow(y-(c0+k*x),2),0)/Math.max(1,n-2));return {n,k,c0,res}}
function calib2(pts){if(pts.length<3)return {n:pts.length};const n=pts.length,mx=pts.reduce((s,p)=>s+p[0],0)/n,my=pts.reduce((s,p)=>s+p[1],0)/n;let sxy=0,sxx=0;pts.forEach(([x,y])=>{sxy+=(x-mx)*(y-my);sxx+=(x-mx)*(x-mx)});if(!sxx)return {n};const k=sxy/sxx,c0=my-k*mx;const res=Math.sqrt(pts.reduce((s,[x,y])=>s+Math.pow(y-(c0+k*x),2),0)/Math.max(1,n-2));return {n,k,c0,res}}
function nearHtml(id,all,met,ref){const L=(k,src)=>{if(src==='meter'){const m=met[k];return m&&m.L!=null&&m.a!=null&&m.b!=null?{L:m.L,a:m.a,b:m.b}:null}return all[k]||null};const src=L(id,'meter')?'meter':L(id,'photo')?'photo':null;if(!src)return '';const cur=L(id,src);
 const ids=[...new Set([...Object.keys(all),...Object.keys(met)])].filter(k=>k!==id&&L(k,src));if(!ids.length)return '';const list=ids.map(k=>({k,d:de2000(cur,L(k,src)),lb:(met[k]&&met[k].label)||(all[k]&&all[k].label)||k})).sort((x,y)=>x.d-y.d).slice(0,5);
 return '<div class="cc-m">Nearest roasts ('+src+' readings)</div>'+list.map(x=>'<div class="cc-r"><span>'+esc(x.lb)+(x.k===ref?' <b>(reference)</b>':'')+'</span><span>ΔE '+x.d.toFixed(1)+'</span></div>').join('')}
window.colourSection=function(r,rows){const host=document.getElementById('detail');if(!host)return;const id=String(r.id);const label=(r.roastNo?'#'+r.roastNo+' ':'')+(r.estate||r.coffeeCode||r.bean||'Roast')+(r.roastDate?' · '+r.roastDate:'');
 let box=document.getElementById('colSec');if(!box){box=document.createElement('div');box.id='colSec';host.appendChild(box)}
 if(!document.getElementById('ccStyle')){const st=document.createElement('style');st.id='ccStyle';st.textContent='#colSec b{display:inline!important;font-size:inherit!important;margin:0!important;font-weight:700}#colSec{margin-top:14px;border-top:1px solid #ddd8d0;padding-top:12px}#colSec h3{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#8d583b;margin:0 0 8px}.cc-m{font-size:12.5px;color:#77716a;line-height:1.45;margin:6px 0}.cc-b{font:inherit;font-size:14px;border:1px solid #ddd8d0;background:#fff;border-radius:999px;padding:9px 14px;cursor:pointer;margin:4px 6px 4px 0}.cc-b.p{background:#171512;color:#fff;border-color:#171512}.cc-box{background:#faf7f2;border:1px solid #efe8de;border-radius:12px;padding:10px 12px;margin:8px 0;font-size:14px;line-height:1.5}.cc-sw{display:inline-block;width:22px;height:22px;border-radius:6px;vertical-align:middle;border:1px solid #ddd8d0;margin-right:6px}.cc-g{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:6px 0}.cc-g label{display:flex;flex-direction:column;gap:3px;font-size:12px;color:#77716a}.cc-g input,.cc-g select{font-size:16px;padding:9px 10px;border:1px solid #ddd8d0;border-radius:10px;background:#fff;width:100%}.cc-r{display:flex;justify-content:space-between;font-size:13.5px;padding:5px 0;border-bottom:1px solid #f0ebe3}#ccCanvas{width:100%;border-radius:10px;touch-action:manipulation;margin-top:8px}';document.head.appendChild(st)}
 const MKEY='kk_roast_meter_v1',mload=()=>{try{return JSON.parse(localStorage.getItem(MKEY))||{}}catch(e){return {}}},msave=o=>{try{localStorage.setItem(MKEY,JSON.stringify(o))}catch(e){}};
 const lab=(id,all,met)=>{const m=met[id];if(m&&m.L!=null&&m.a!=null&&m.b!=null)return {L:m.L,a:m.a,b:m.b,C:Math.hypot(m.a,m.b),h:(Math.atan2(m.b,m.a)*180/Math.PI+360)%360,src:'meter',label:m.label};const c=all[id];return c?{...c,src:'photo'}:null};
 const render=()=>{const all=load(),met=mload(),ref=getRef(),cur=lab(id,all,met),m=met[id];
  let h='<h3>Colour check</h3>';
  // meter reading
  if(m)h+='<div class="cc-box"><b>Meter</b>'+(m.form?' ('+esc(m.form)+')':'')+': '+[m.ag!=null?'Agtron <b>'+m.ag+'</b>':'',m.L!=null?'L* '+m.L+' · a* '+m.a+' · b* '+m.b:''].filter(Boolean).join(' · ')+'<div class="cc-m" style="margin:2px 0 0"><a href="#" id="ccMEdit" style="color:#8d583b">Edit</a> · <a href="#" id="ccMDel" style="color:#8d583b">Delete</a></div></div>';
  h+='<div id="ccMForm" '+(m?'hidden':'')+'><div class="cc-m">'+(m?'':'Have a colour meter? Enter its reading. Meter numbers are used first for comparisons and names.')+'</div><div class="cc-g"><label>Agtron<input id="ccAg" type="number" inputmode="decimal" step="any" value="'+(m&&m.ag!=null?m.ag:'')+'"></label><label>Form<select id="ccForm"><option'+(m&&m.form==='ground'?'':' selected')+'>ground</option><option'+(m&&m.form==='whole bean'?' selected':'')+'>whole bean</option></select></label><label>L*<input id="ccL" type="number" inputmode="decimal" step="any" value="'+(m&&m.L!=null?m.L:'')+'"></label><label>a*<input id="ccA" type="number" inputmode="decimal" step="any" value="'+(m&&m.a!=null?m.a:'')+'"></label><label>b*<input id="ccB" type="number" inputmode="decimal" step="any" value="'+(m&&m.b!=null?m.b:'')+'"></label></div><button type="button" class="cc-b" id="ccMSave">Save meter reading</button></div>';
  // name
  const ag=m&&m.ag!=null?m.ag:numOf(r.finalColor),nm=roastName(ag),tc=numOf(r.targetColor),tn=roastName(tc);
  if(nm)h+='<div class="cc-box">'+(m&&m.ag!=null?'Meter':'Final colour')+' <b>'+ag+'</b> (Agtron): <b>'+nm[0]+'</b>, often called '+nm[1]+'.'+(tn&&tc!==ag?'<div class="cc-m" style="margin:4px 0 0">Target '+tc+': '+tn[0]+', often called '+tn[1]+'.</div>':'')+'</div>';
  // comparison with reference, same source only
  const rv=ref&&ref!==id?lab(ref,all,met):null;
  if(cur&&rv){const sameSrc=cur.src===rv.src?cur.src:(met[id]&&met[ref]?'meter':(all[id]&&all[ref]?'photo':null));const A=sameSrc==='meter'?lab(id,{},met):sameSrc==='photo'?{...all[id]}:null,B=sameSrc==='meter'?lab(ref,{},met):sameSrc==='photo'?{...all[ref]}:null;
   if(A&&B){const d=de2000(B,A);h+='<div class="cc-box">Against reference ('+sameSrc+'): <b>ΔE '+d.toFixed(1)+'</b>, '+verdict(d)+'. This roast is '+words(A,B)+'.</div>'}}
  if(ref===id)h+='<div class="cc-m">This is your reference roast.</div>';
  // photo reading
  const ph=all[id];
  if(ph){h+='<div class="cc-box"><span class="cc-sw" style="background:rgb('+ph.rgb.join(',')+')"></span><b>Photo</b>: L* '+ph.L.toFixed(1)+' · a* '+ph.a.toFixed(1)+' · b* '+ph.b.toFixed(1)+'<div class="cc-m" style="margin:2px 0 0">Measured '+esc(new Date(ph.at).toLocaleDateString('en-IN',{day:'numeric',month:'short'}))+'</div></div>';
   const pts=(rows||[]).map(x=>{const c=all[String(x.id)],mm=met[String(x.id)],a2=mm&&mm.ag!=null?mm.ag:numOf(x.finalColor);return c&&a2!=null&&a2>=15&&a2<=110?[c.L,a2]:null}).filter(Boolean);const C=calib2(pts);
   if(C.k!=null&&!(m&&m.ag!=null)){const est=C.c0+C.k*ph.L,en=roastName(est);h+='<div class="cc-box">From your photo: about <b>Agtron '+Math.round(est)+'</b> ±'+Math.max(2,Math.round(C.res*2))+(en?', '+en[0]:'')+'.<div class="cc-m" style="margin:4px 0 0">Learned from '+C.n+' of your roasts with both a photo and a meter or Final colour reading.</div></div>'}
   else if(C.k==null)h+='<div class="cc-m">Photo-to-Agtron estimate starts after 3 roasts have both a photo and a meter reading ('+C.n+' so far).</div>'}
  h+=nearHtml(id,all,met,ref);
  h+='<div><label class="cc-b p">'+(ph?'Photo again':'Measure from a photo')+'<input id="ccFile" type="file" accept="image/*" capture="environment" hidden></label>'+((cur)&&ref!==id?'<button type="button" class="cc-b" id="ccRef">Set as reference</button>':'')+(ph?'<button type="button" class="cc-b" id="ccDel">Delete photo reading</button>':'')+'</div>';
  h+='<details class="cc-m"><summary style="cursor:pointer;color:#8d583b;font-weight:600">How to take a good reading</summary><p>Meter: measure the same form every time (ground or whole bean) and note which. Ground is steadier.</p><p>Photo: grind a spoonful and press it flat in a small dish with a plain white card beside it. Same place and light every time: bright shade or a window, no direct sun, no flash, no shadow. Tap the white card, then the coffee. A phone sees visible light only, so Agtron from a photo is estimated from your own paired meter readings. Rough guide for ΔE: under 1 hard to see, 2 to 3 visible side by side.</p><p>Method: CIELAB and CIEDE2000, after Schanda (ed.), Colorimetry: Understanding the CIE System (2007). Roast names: Coffee Review roast table (Agtron scale); names vary between roasters. Readings stay on this phone.</p></details><div id="ccWork"></div>';
  box.innerHTML=h;
  const g=x=>{const v=document.getElementById(x).value.trim();return v===''?null:parseFloat(v)};
  document.getElementById('ccMSave').onclick=()=>{const o={ag:g('ccAg'),L:g('ccL'),a:g('ccA'),b:g('ccB'),form:document.getElementById('ccForm').value,at:Date.now(),label};if(o.ag==null&&o.L==null){alert('Enter at least the Agtron number or L*.');return}if(o.L!=null&&(o.a==null||o.b==null)){o.a=o.a??null;o.b=o.b??null}const mm=mload();mm[id]=o;msave(mm);if(!getRef()&&o.L!=null&&o.a!=null&&o.b!=null)setRef(id);render()};
  const me=document.getElementById('ccMEdit');if(me)me.onclick=ev=>{ev.preventDefault();document.getElementById('ccMForm').hidden=false};
  const md=document.getElementById('ccMDel');if(md)md.onclick=ev=>{ev.preventDefault();if(!confirm('Delete the meter reading?'))return;const mm=mload();delete mm[id];msave(mm);render()};
  const del=document.getElementById('ccDel');if(del)del.onclick=()=>{if(!confirm('Delete the photo reading?'))return;const a=load();delete a[id];save(a);render()};
  const rf=document.getElementById('ccRef');if(rf)rf.onclick=()=>{setRef(id);render()};
  document.getElementById('ccFile').onchange=ev=>{const file=ev.target.files[0];if(file)measure(file)}};
 const measure=file=>{const work=document.getElementById('ccWork');const img=new Image();img.onload=()=>{const max=900,sc=Math.min(1,max/Math.max(img.width,img.height));const c=document.createElement('canvas');c.id='ccCanvas';c.width=Math.round(img.width*sc);c.height=Math.round(img.height*sc);const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(img.src);
  let white=null;work.innerHTML='<div class="cc-box" id="ccStep"><b>1.</b> Tap the white card.</div>';work.appendChild(c);
  const sample=(x,y)=>{const r=Math.max(6,Math.round(c.width/45));const d=ctx.getImageData(Math.max(0,x-r),Math.max(0,y-r),r*2,r*2).data;let s=[0,0,0],n=0;for(let i=0;i<d.length;i+=4){s[0]+=d[i];s[1]+=d[i+1];s[2]+=d[i+2];n++}return{rgb:s.map(v=>Math.round(v/n)),r}};
  c.onclick=ev=>{const b=c.getBoundingClientRect(),x=Math.round((ev.clientX-b.left)*c.width/b.width),y=Math.round((ev.clientY-b.top)*c.height/b.height);const s=sample(x,y);ctx.strokeStyle=white?'#8d583b':'#3f6b5a';ctx.lineWidth=3;ctx.strokeRect(x-s.r,y-s.r,s.r*2,s.r*2);
   if(!white){const m=Math.min(...s.rgb);if(m<120){document.getElementById('ccStep').innerHTML='That spot looks too dark for a white card. Tap the white card again, or retake in brighter light.';return}white=s.rgb;document.getElementById('ccStep').innerHTML='<b>2.</b> Now tap the middle of the coffee.';return}
   const lab=toLab(s.rgb,white);if(lab.L>85){document.getElementById('ccStep').innerHTML='That looks like the card, not the coffee. Tap the coffee.';return}
   const a=load();a[id]={L:lab.L,a:lab.a,b:lab.b,C:lab.C,h:lab.h,rgb:s.rgb,at:Date.now(),label};save(a);if(!getRef())setRef(id);render()}};
  img.onerror=()=>{work.innerHTML='<div class="cc-box">Could not open that photo. Try again.</div>'};img.src=URL.createObjectURL(file)};
 render()};
})();
