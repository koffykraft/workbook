// KoffyKraft (C) 2026 T M Thomas. AGPL-3.0 with additional terms (attribution, names): see NOTICE.
// Share cards: turns one or more records into images (Instagram post or story) or a PDF (email, WhatsApp),
// drawn on this phone and handed to the share sheet. Nothing is uploaded.
// Use: KKCARD.open([{kind,title,sub,date,rows:[[label,value]],notes,loc,chips}], {heading, brand})
(function(){
if(window.KKCARD)return;
const FONT='-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function brand(fallback){let c={};try{c=JSON.parse(localStorage.getItem('kk_profile_v1')||'{}')}catch(e){}
 return{name:(c.title||'').trim()||fallback||'KoffyKraft',logo:/^data:image\/(png|jpeg|webp);base64,/.test(c.logo||'')?c.logo:'',accent:/^#[0-9a-f]{6}$/i.test(c.accent||'')?c.accent:'#8d583b'}}
const loadImg=src=>new Promise(ok=>{if(!src)return ok(null);const i=new Image();i.onload=()=>ok(i);i.onerror=()=>ok(null);i.src=src});
function wrap(x,text,maxW){const words=String(text).split(/\s+/);const lines=[];let cur='';for(const w of words){const t=cur?cur+' '+w:w;if(x.measureText(t).width>maxW&&cur){lines.push(cur);cur=w}else cur=t}if(cur)lines.push(cur);return lines}
function rr(x,X,Y,W,H,r){x.beginPath();x.moveTo(X+r,Y);x.arcTo(X+W,Y,X+W,Y+H,r);x.arcTo(X+W,Y+H,X,Y+H,r);x.arcTo(X,Y+H,X,Y,r);x.arcTo(X,Y,X+W,Y,r);x.closePath()}
// draw one record; returns true if it fitted at this scale
function layout(x,W,H,it,b,o,s,draw){const P=Math.round(W*.07),inner=W-2*P;let y=P;const f=(sz,w)=>{x.font=(w||400)+' '+Math.round(sz*s)+'px '+FONT};
 const ac=b.accent;
 if(draw){x.fillStyle='#f7f5f0';x.fillRect(0,0,W,H);x.fillStyle='#fff';rr(x,P*.5,P*.5,W-P,H-P,W*.035);x.fill();x.fillStyle=ac;rr(x,P*.5,P*.5,W-P,W*.018,W*.009);x.fill()}
 y+=W*.03;
 // brand row
 const lg=W*.085;if(b.img&&draw){const k=Math.min(lg/b.img.width,lg/b.img.height),iw=b.img.width*k,ih=b.img.height*k;x.drawImage(b.img,P+(lg-iw)/2,y+(lg-ih)/2,iw,ih)}
 f(W*.03,600);if(draw){x.fillStyle='#77716a';x.textBaseline='middle';x.fillText(b.name,P+(b.img?lg+W*.025:0),y+lg/2)}
 y+=lg+W*.035;
 // kind chip
 f(W*.026,700);const kt=String(it.kind||'').toUpperCase();const kw=x.measureText(kt).width+W*.04;if(draw){x.strokeStyle=ac;x.lineWidth=Math.max(2,W*.002);rr(x,P,y,kw,W*.05,W*.025);x.stroke();x.fillStyle=ac;x.textBaseline='middle';x.fillText(kt,P+W*.02,y+W*.025)}
 if(it.date){f(W*.026,500);if(draw){x.fillStyle='#77716a';x.textAlign='right';x.fillText(it.date,W-P,y+W*.025);x.textAlign='left'}}
 y+=W*.05+W*.03;
 // title
 f(W*.062,800);x.textBaseline='top';const tl=wrap(x,it.title||'',inner).slice(0,3);tl.forEach(l=>{if(draw){x.fillStyle='#171512';x.fillText(l,P,y)}y+=W*.072*s});
 if(it.sub){f(W*.032,400);wrap(x,it.sub,inner).slice(0,2).forEach(l=>{if(draw){x.fillStyle='#77716a';x.fillText(l,P,y)}y+=W*.042*s})}
 y+=W*.025;
 // chips
 if(it.chips&&it.chips.length){f(W*.026,600);let cx=P;for(const c of it.chips){const cw=x.measureText(c).width+W*.036;if(cx+cw>W-P){cx=P;y+=W*.06}if(draw){x.fillStyle='#f3ece3';rr(x,cx,y,cw,W*.048,W*.024);x.fill();x.fillStyle='#5b4636';x.textBaseline='middle';x.fillText(c,cx+W*.018,y+W*.024);x.textBaseline='top'}cx+=cw+W*.015}y+=W*.07}
 // rows
 const lw=inner*.36;for(const [k,v] of it.rows||[]){if(v==null||v==='')continue;f(W*.03,500);let vl=(f(W*.032,600),wrap(x,String(v),inner-lw-W*.02));if(vl.length>4){vl=vl.slice(0,4);vl[3]=vl[3].replace(/[\s,;]+\S*$/,'')+' …'}const rh=Math.max(1,vl.length)*W*.044*s+W*.022;
  if(draw){x.strokeStyle='#efe9e1';x.lineWidth=Math.max(1,W*.0012);x.beginPath();x.moveTo(P,y);x.lineTo(W-P,y);x.stroke();f(W*.03,500);x.fillStyle='#77716a';x.fillText(k,P,y+W*.014);f(W*.032,600);x.fillStyle='#171512';vl.forEach((l,i)=>x.fillText(l,P+lw,y+W*.014+i*W*.044*s))}
  y+=rh}
 if(o.notes&&it.notes){y+=W*.02;f(W*.03,400);const nl=wrap(x,it.notes,inner-W*.04).slice(0,6);const nh=nl.length*W*.042*s+W*.04;if(draw){x.fillStyle='#faf7f2';rr(x,P,y,inner,nh,W*.02);x.fill();x.fillStyle='#3d3833';nl.forEach((l,i)=>x.fillText(l,P+W*.02,y+W*.02+i*W*.042*s))}y+=nh}
 if(o.loc&&it.loc){y+=W*.02;f(W*.028,500);if(draw){x.fillStyle='#77716a';x.fillText('Location '+it.loc,P,y)}y+=W*.04}
 // footer
 const fy=H-P-W*.02;f(W*.024,400);if(draw){x.textBaseline='alphabetic';x.fillStyle='#9a948c';x.fillText('© '+new Date().getFullYear()+' '+b.name,P,fy);x.textAlign='right';x.fillText('Made with KoffyKraft · roast.koffykraft.coffee',W-P,fy);x.textAlign='left'}
 return y<fy-W*.05}
function render(it,W,H,b,o){const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');let s=1;while(s>.55&&!layout(x,W,H,it,b,o,s,false))s-=.05;layout(x,W,H,it,b,o,s,true);return c}
function overview(items,W,H,b,heading){const rows=items.map(it=>[it.kind,[it.title,it.date].filter(Boolean).join(' · ')]);return render({kind:'Summary',title:heading||'Records',sub:items.length+' records',rows},W,H,b,{notes:false,loc:false})}
// a minimal PDF: one full-page JPEG per page, A4
function pdf(canvases){const enc=new TextEncoder();const parts=[];let len=0;const offs=[];const push=d=>{const u=typeof d==='string'?enc.encode(d):d;parts.push(u);len+=u.length};
 push('%PDF-1.4\n%\xC7\xEC\x8F\xA2\n');const n=canvases.length;const obj=i=>{offs[i]=len;push(i+' 0 obj\n')};
 obj(1);push('<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
 obj(2);push('<< /Type /Pages /Count '+n+' /Kids ['+canvases.map((_,i)=>(3+i*3)+' 0 R').join(' ')+'] >>\nendobj\n');
 canvases.forEach((c,i)=>{const p=3+i*3,im=p+1,ct=p+2;const b64=c.toDataURL('image/jpeg',.9).split(',')[1];const bin=atob(b64);const jpg=new Uint8Array(bin.length);for(let k=0;k<bin.length;k++)jpg[k]=bin.charCodeAt(k);
  obj(p);push('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /XObject << /Im'+i+' '+im+' 0 R >> >> /Contents '+ct+' 0 R >>\nendobj\n');
  obj(im);push('<< /Type /XObject /Subtype /Image /Width '+c.width+' /Height '+c.height+' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length '+jpg.length+' >>\nstream\n');push(jpg);push('\nendstream\nendobj\n');
  const cs='q 595 0 0 842 0 0 cm /Im'+i+' Do Q';obj(ct);push('<< /Length '+cs.length+' >>\nstream\n'+cs+'\nendstream\nendobj\n')});
 const total=3+n*3;const xref=len;push('xref\n0 '+total+'\n0000000000 65535 f \n');for(let i=1;i<total;i++)push(String(offs[i]).padStart(10,'0')+' 00000 n \n');
 push('trailer\n<< /Size '+total+' /Root 1 0 R >>\nstartxref\n'+xref+'\n%%EOF');return new Blob(parts,{type:'application/pdf'})}
const toBlob=c=>new Promise(ok=>c.toBlob(ok,'image/jpeg',.92));
const FMT={post:{n:'Instagram post',w:1080,h:1350},story:{n:'Story',w:1080,h:1920},pdf:{n:'PDF (A4)',w:1240,h:1754}};
async function open(items,opt){opt=opt||{};if(!items||!items.length)return;const b=brand(opt.brand);b.img=await loadImg(b.logo);
 let st={fmt:'post',notes:false,loc:false};try{Object.assign(st,JSON.parse(localStorage.getItem('kk_card_opts')||'{}'))}catch(e){}
 let el=document.getElementById('kkcard');if(!el){el=document.createElement('div');el.id='kkcard';document.body.appendChild(el);
  const css=document.createElement('style');css.textContent='#kkcard{position:fixed;inset:0;z-index:3000;background:rgba(23,21,18,.55);display:flex;align-items:flex-end;justify-content:center}#kkcard .sh{background:#f7f5f0;width:100%;max-width:640px;max-height:92vh;overflow:auto;border-radius:20px 20px 0 0;padding:16px 16px calc(16px + env(safe-area-inset-bottom));font-family:'+FONT+'}#kkcard h3{margin:0 0 4px;font-size:18px}#kkcard .mini{font-size:12.5px;color:#77716a;line-height:1.45}#kkcard .chips{display:flex;gap:6px;flex-wrap:wrap;margin:10px 0}#kkcard .chips button{font:inherit;font-size:14px;border:1px solid #ddd8d0;background:#fff;border-radius:999px;padding:8px 13px;min-height:36px}#kkcard .chips button.on{background:#171512;color:#fff;border-color:#171512}#kkcard .pv{display:flex;gap:8px;overflow-x:auto;padding:4px 0 8px}#kkcard .pv img{height:300px;border-radius:10px;box-shadow:0 2px 10px rgba(0,0,0,.12);flex:0 0 auto;background:#fff}#kkcard label{display:flex;gap:8px;align-items:center;font-size:14px;margin:6px 0}#kkcard label input{width:20px;height:20px}#kkcard .rb{display:flex;gap:8px;margin-top:10px}#kkcard .rb button{flex:1;font:inherit;font-size:15px;font-weight:600;border:1px solid #ddd8d0;background:#fff;border-radius:999px;padding:12px;min-height:44px}#kkcard .rb button.go{background:#171512;color:#fff;border-color:#171512}';document.head.appendChild(css)}
 let files=[];
 async function build(){const F=FMT[st.fmt];const pv=el.querySelector('.pv');pv.innerHTML='<div class="mini">Drawing…</div>';await new Promise(r=>setTimeout(r,20));
  const prof=brand('').name!=='KoffyKraft';const cs=items.map(it=>render(it,F.w,F.h,prof||!it.brand?b:Object.assign({},b,{name:it.brand}),st));if(st.fmt==='pdf'&&items.length>1)cs.unshift(overview(items,F.w,F.h,b,opt.heading));
  pv.innerHTML='';cs.forEach(c=>{const i=new Image();i.src=c.toDataURL('image/jpeg',.7);pv.appendChild(i)});
  const base=(opt.heading||'koffykraft').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')+'-'+new Date().toISOString().slice(0,10);
  if(st.fmt==='pdf')files=[new File([pdf(cs)],base+'.pdf',{type:'application/pdf'})];
  else files=await Promise.all(cs.map(async(c,i)=>new File([await toBlob(c)],base+(cs.length>1?'-'+(i+1):'')+'.jpg',{type:'image/jpeg'})));
  el.querySelector('#kcInfo').textContent=st.fmt==='pdf'?files[0].name+' · '+Math.max(1,Math.round(files[0].size/1024))+' KB · '+cs.length+' page'+(cs.length>1?'s':''):files.length+' image'+(files.length>1?'s':'')+(files.length>1?'; Instagram makes them a carousel':'')}
 el.innerHTML='<div class="sh" role="dialog" aria-label="Share"><h3>Share '+(items.length>1?items.length+' records':'this record')+'</h3><div class="mini">Drawn on this phone with your profile name, logo and colour (set them in Me, Profile). Nothing is uploaded.</div>'+
  '<div class="chips">'+Object.entries(FMT).map(([k,f])=>'<button type="button" data-fmt="'+k+'" class="'+(st.fmt===k?'on':'')+'">'+f.n+'</button>').join('')+'</div>'+
  '<label><input type="checkbox" id="kcN"'+(st.notes?' checked':'')+'> Include notes</label><label><input type="checkbox" id="kcL"'+(st.loc?' checked':'')+'> Include GPS location</label>'+
  '<div class="pv"></div><div class="mini" id="kcInfo"></div><div class="rb"><button type="button" id="kcX">Close</button><button type="button" id="kcS">Save</button><button type="button" class="go" id="kcG">Share</button></div></div>';
 el.style.display='flex';const save=()=>{try{localStorage.setItem('kk_card_opts',JSON.stringify(st))}catch(e){}};
 el.querySelectorAll('[data-fmt]').forEach(x=>x.onclick=()=>{st.fmt=x.dataset.fmt;el.querySelectorAll('[data-fmt]').forEach(y=>y.classList.toggle('on',y===x));save();build()});
 el.querySelector('#kcN').onchange=e=>{st.notes=e.target.checked;save();build()};el.querySelector('#kcL').onchange=e=>{st.loc=e.target.checked;save();build()};
 el.querySelector('#kcX').onclick=()=>{el.style.display='none'};el.onclick=e=>{if(e.target===el)el.style.display='none'};
 const dl=()=>files.forEach((f,i)=>setTimeout(()=>{const a=document.createElement('a');a.href=URL.createObjectURL(f);a.download=f.name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},2000)},i*300));
 el.querySelector('#kcS').onclick=dl;
 el.querySelector('#kcG').onclick=async()=>{try{if(navigator.canShare&&navigator.canShare({files})){await navigator.share({files,title:opt.heading||'KoffyKraft'});return}}catch(e){if(e&&e.name==='AbortError')return}dl()};
 await build()}
window.KKCARD={open,render,pdf};
})();
