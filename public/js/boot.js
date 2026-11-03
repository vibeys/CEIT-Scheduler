// Start-up: talk to the server first, then load the page scripts in order.
window.onerror=(m,u,l)=>document.body.insertAdjacentHTML('afterbegin',`<pre style="padding:12px;color:#a8432f;white-space:pre-wrap">Error: ${m} (${(u||'').split('/').pop()}:${l})</pre>`);
(function(){
 const tag=document.getElementById('boot'),page=tag.dataset.page,list=(tag.dataset.scripts||'').split(',').filter(Boolean);
 const TK='ceit_token';
 window.getToken=()=>{try{return localStorage.getItem(TK)||''}catch(e){return ''}};
 window.setToken=t=>{try{t?localStorage.setItem(TK,t):localStorage.removeItem(TK)}catch(e){}};
 // all server calls go through here. Errors have .status (HTTP code) or .network (server not reachable)
 window.api=async(path,o)=>{o=o||{};const h={},t=getToken();if(t)h.Authorization='Bearer '+t;
  let body;if(o.body!==undefined){h['Content-Type']='application/json';body=JSON.stringify(o.body)}
  let r;try{r=await fetch(path,{method:o.method||'GET',headers:h,body,cache:'no-store',keepalive:!!o.keepalive})}
  catch(e){const x=new Error('Cannot reach the server');x.network=true;throw x}
  const txt=await r.text();let j=null;try{j=txt?JSON.parse(txt):null}catch(e){}
  if(!r.ok){const x=new Error((j&&j.error)||('Server error '+r.status));x.status=r.status;x.data=j;throw x}
  return j};
 const sleep=ms=>new Promise(r=>setTimeout(r,ms));
 let off=null;
 const showOffline=()=>{if(off)return;off=document.createElement('div');off.id='offline';
  off.innerHTML='<img src="assets/logo.png" alt=""><h3>Cannot reach the server</h3><p>Check that the host computer is on and CEIT Scheduler is running, and that you are on the same Wi-Fi / network. Trying again\u2026</p>';
  document.body.appendChild(off)};
 const hideOffline=()=>{if(off){off.remove();off=null}};
 const fatal=m=>{hideOffline();document.body.insertAdjacentHTML('afterbegin',`<pre style="padding:12px;color:#a8432f;white-space:pre-wrap">Error: ${m}</pre>`)};
 const B=window.__BOOT={rev:0,meId:null,data:null,teachers:null};
 const load=i=>{if(i>=list.length)return;const s=document.createElement('script');s.src=list[i];s.onload=()=>load(i+1);s.onerror=()=>fatal('Could not load '+list[i]);document.body.appendChild(s)};
 (async()=>{
  for(;;){
   try{
    if(page==='login'){
     if(getToken()){try{await api('/api/rev');location.replace('dashboard.html');return}catch(e){if(e.network)throw e;setToken('')}}
     B.teachers=await api('/api/teachers');
    }else{
     try{const r=await api('/api/db');B.rev=r.rev;B.meId=r.meId;B.data=r.data}catch(e){if(e.status===401)setToken('');else throw e}
    }
    hideOffline();break;
   }catch(e){if(e.network){showOffline();await sleep(2500);continue}fatal(e.message);return}
  }
  load(0);
 })();
})();
