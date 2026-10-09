// KoffyKraft tap feedback: every tap shows a ripple where the finger landed,
// and the tapped button dips for a moment, so you know the tap registered.
(function(){
 if(window.__kkTap)return;window.__kkTap=true;
 const css='*{-webkit-tap-highlight-color:transparent}'+
 '.kk-press{transform:scale(.96)!important;filter:brightness(.9);transition:transform .07s ease,filter .07s ease!important}'+
 '.kk-rip{position:fixed;z-index:2147483646;pointer-events:none;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;background:rgba(141,88,59,.28);box-shadow:0 0 0 2px rgba(141,88,59,.35);transform:scale(.3);opacity:1;animation:kkrip .38s ease-out forwards}'+
 '@keyframes kkrip{to{transform:scale(1.6);opacity:0}}'+
 '@media (prefers-reduced-motion:reduce){.kk-rip{animation:kkripr .3s linear forwards;transform:scale(1)}@keyframes kkripr{to{opacity:0}}.kk-press{transform:none!important}}';
 const st=document.createElement('style');st.textContent=css;(document.head||document.documentElement).appendChild(st);
 // iOS only applies :active styles when a touch listener exists
 document.addEventListener('touchstart',function(){},{passive:true});
 const SEL='button,a[href],[role=button],summary,label,select,.chip,.btn,.tile,.ntile,.card[onclick],[onclick],[data-go],[data-dg],[data-ts],[data-lv],[data-rl],[data-l],[data-sp],input[type=checkbox],input[type=radio],input[type=range]';
 let pressed=null,since=0;
 function release(){const el=pressed;if(!el)return;pressed=null;const wait=Math.max(0,110-(Date.now()-since));setTimeout(()=>el.classList.remove('kk-press'),wait)}
 document.addEventListener('pointerdown',function(e){
  if(e.button>0)return;
  const t=e.target instanceof Element?e.target:null;if(!t)return;
  const el=t.closest(SEL);const onMap=t.closest('.leaflet-container');
  if(!el&&!onMap)return;
  if(el&&(el.disabled||el.getAttribute('aria-disabled')==='true'))return;
  const r=document.createElement('span');r.className='kk-rip';r.style.left=e.clientX+'px';r.style.top=e.clientY+'px';document.body.appendChild(r);setTimeout(()=>r.remove(),450);
  if(el&&!/^(INPUT|SELECT)$/.test(el.tagName)&&!el.closest('.leaflet-container')){release();pressed=el;since=Date.now();el.classList.add('kk-press');try{navigator.vibrate&&navigator.vibrate(8)}catch(x){}}
 },{capture:true,passive:true});
 ['pointerup','pointercancel','pointerleave','scroll'].forEach(ev=>document.addEventListener(ev,release,{capture:true,passive:true}));
})();
