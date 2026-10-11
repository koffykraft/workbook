// KoffyKraft (C) 2026 T M Thomas. AGPL-3.0 with additional terms (attribution, names): see NOTICE.
// KoffyKraft export: any list of records to CSV (opens in Excel or Sheets) or JSON (full detail, re-importable on My Data).
(function(){
 if(window.KKX)return;
 const flat=(o,p,out)=>{out=out||{};Object.entries(o||{}).forEach(([k,v])=>{const key=p?p+'.'+k:k;if(v&&typeof v==='object'&&!Array.isArray(v))flat(v,key,out);else if(Array.isArray(v))out[key]=v.every(x=>x==null||typeof x!=='object')?v.join('; '):JSON.stringify(v);else out[key]=v});return out};
 const SKIP=new Set(['dirty','cloud']);
 function csv(rows){const fr=rows.map(r=>flat(r));const cols=[];fr.forEach(r=>Object.keys(r).forEach(k=>{if(!SKIP.has(k)&&!cols.includes(k))cols.push(k)}));
  const q=v=>{if(v==null)return '';const s=String(v);return /[",\n\r]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s};
  return '﻿'+[cols.join(','),...fr.map(r=>cols.map(c=>q(r[c])).join(','))].join('\r\n')}
 function save(name,text,type){const b=new Blob([text],{type});const f=new File([b],name,{type});
  if(navigator.canShare&&/iPhone|iPad|Android/i.test(navigator.userAgent)&&navigator.canShare({files:[f]})){navigator.share({files:[f],title:name}).catch(()=>{});return}
  const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},800)}
 const day=()=>new Date().toISOString().slice(0,10);
 // sets: [{label, name, rows}]  shows a small sheet with CSV per set and one JSON with everything
 function menu(title,sets){let sh=document.getElementById('kkxSheet');if(sh)sh.remove();sh=document.createElement('div');sh.id='kkxSheet';
  sh.style.cssText='position:fixed;inset:0;background:rgba(23,21,18,.45);z-index:3000;display:flex;align-items:flex-end;justify-content:center';
  const tot=sets.reduce((a,s)=>a+s.rows.length,0);
  sh.innerHTML='<div style="background:#f7f5f0;width:min(560px,100%);border-radius:18px 18px 0 0;padding:16px 16px calc(16px + env(safe-area-inset-bottom));font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Arial"><div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:17px">'+title+'</b><button type="button" data-x style="font:inherit;border:0;background:transparent;font-size:22px;cursor:pointer">×</button></div>'+
   '<div style="font-size:13px;color:#77716a;margin:4px 0 10px">CSV opens in Excel or Google Sheets. JSON keeps every detail and can be imported back on My Data.</div>'+
   sets.map((s,i)=>'<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:9px 0;border-top:1px solid #e7e1d8"><span>'+s.label+' <span style="color:#77716a">('+s.rows.length+')</span></span><button type="button" data-csv="'+i+'"'+(s.rows.length?'':' disabled')+' style="font:inherit;font-size:14px;border:1px solid #ddd8d0;background:#fff;border-radius:999px;padding:8px 14px;cursor:pointer">CSV</button></div>').join('')+
   '<button type="button" data-json'+(tot?'':' disabled')+' style="margin-top:10px;width:100%;font:inherit;font-size:15px;border:0;background:#171512;color:#fff;border-radius:999px;padding:12px;cursor:pointer">Everything here as JSON</button>'+
   '<a href="data.html" style="display:block;text-align:center;margin-top:10px;font-size:13px;color:#8d583b">Full backup of all your KoffyKraft data</a></div>';
  document.body.appendChild(sh);const close=()=>sh.remove();sh.addEventListener('click',e=>{if(e.target===sh||e.target.closest('[data-x]'))close()});
  sh.querySelectorAll('[data-csv]').forEach(b=>b.onclick=()=>{const s=sets[+b.dataset.csv];save('koffykraft-'+s.name+'-'+day()+'.csv',csv(s.rows),'text/csv')});
  sh.querySelector('[data-json]').onclick=()=>{const o={format:'koffykraft-records',version:1,exportedAt:new Date().toISOString()};sets.forEach(s=>o[s.name]=s.rows.map(r=>{const c={...r};delete c.dirty;return c}));save('koffykraft-'+title.toLowerCase().replace(/[^a-z0-9]+/g,'-')+'-'+day()+'.json',JSON.stringify(o,null,1),'application/json')}}
 window.KKX={csv,save,menu};
})();
