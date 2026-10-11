// Feedback box: anonymous by default, contact optional. Drops into any element with id="feedback".
(function(){
 function mount(el){if(!el)return;const page=location.pathname.replace(/^\//,'')||'home';
  el.innerHTML='<div style="display:grid;gap:8px"><div style="font-size:13px;color:#77716a;line-height:1.45">Tell us what works, what is missing or what went wrong. No account needed. Leave a contact only if you want a reply.</div>'+
  '<div style="display:flex;gap:6px;flex-wrap:wrap" id="fbK">'+['Idea','Problem','Question','Thanks'].map((k,i)=>'<button type="button" data-k="'+k+'" style="font:inherit;font-size:13.5px;border:1px solid #ddd8d0;background:'+(i?'#fff':'#171512')+';color:'+(i?'#171512':'#fff')+';border-radius:999px;padding:7px 12px;cursor:pointer">'+k+'</button>').join('')+'</div>'+
  '<textarea id="fbM" rows="4" maxlength="4000" placeholder="Your feedback" style="font:inherit;font-size:16px;padding:10px 12px;border:1px solid #ddd8d0;border-radius:11px;width:100%;resize:vertical"></textarea>'+
  '<input id="fbC" maxlength="200" placeholder="Email or phone (optional)" style="font:inherit;font-size:16px;padding:10px 12px;border:1px solid #ddd8d0;border-radius:11px;width:100%">'+
  '<button type="button" id="fbS" style="font:inherit;font-size:15px;border:0;background:#171512;color:#fff;border-radius:999px;padding:11px;cursor:pointer">Send feedback</button><div id="fbR" style="font-size:13px;color:#3f6b5a"></div></div>';
  let kind='Idea';el.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{kind=b.dataset.k;el.querySelectorAll('[data-k]').forEach(x=>{const on=x===b;x.style.background=on?'#171512':'#fff';x.style.color=on?'#fff':'#171512'})});
  el.querySelector('#fbS').onclick=async()=>{const m=el.querySelector('#fbM').value.trim(),c=el.querySelector('#fbC').value.trim(),r=el.querySelector('#fbR'),b=el.querySelector('#fbS');
   if(m.length<3){r.style.color='#b4432f';r.textContent='Please write a few words first.';return}
   b.disabled=true;b.textContent='Sending…';const h={'content-type':'application/json'};try{const t=localStorage.getItem('kk_auth_token');if(t)h.authorization='Bearer '+t}catch(e){}
   try{const res=await fetch('/api/feedback',{method:'POST',headers:h,body:JSON.stringify({message:m,contact:c,kind,page})});const j=await res.json().catch(()=>({}));
    if(res.ok){r.style.color='#3f6b5a';r.textContent='Thank you. Your feedback has been sent.';el.querySelector('#fbM').value=''}else{r.style.color='#b4432f';r.textContent=j.error||'Could not send. Please try again.'}}
   catch(e){r.style.color='#b4432f';r.textContent='No connection. Your text is still here; try again when online.'}
   b.disabled=false;b.textContent='Send feedback'}}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>mount(document.getElementById('feedback')));else mount(document.getElementById('feedback'));
})();
