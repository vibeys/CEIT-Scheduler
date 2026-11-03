const by=(k,id)=>db[k].find(x=>x.id===id);
const cleanName=n=>String(n||'').replace(/^\s*\((?:FT|PT)\)\s*-?\s*/i,'').trim();
const whoOf=u=>u.role==='teacher'?cleanName(by('faculty',u.profId)?.name||u.name):(u.alias||u.name);
// me comes from the server (it checked the sign-in token); null = not signed in
const _u=__BOOT.meId&&db.users.find(x=>x.id===__BOOT.meId);
const me=_u?{id:_u.id,role:_u.role,profId:_u.profId||'',name:whoOf(_u),title:_u.role==='admin'?'Admin':'Teacher',pwDefault:!!_u.pwDefault}:null;
document.documentElement.dataset.theme=db.theme||'light';
const $=s=>document.querySelector(s);
const LOGO='<img class="lg" src="assets/logo.png" alt="CEIT logo">';
const fmt=t=>{const h=Math.floor(t);return `${h%12||12}:${t%1?'30':'00'} ${h<12?'AM':'PM'}`};
const hrs=l=>l.reduce((s,b)=>s+b.end-b.start,0);
const num=n=>+n.toFixed(2)+'h';
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function toast(m,bad){const t=$('#toast');t.textContent=m;t.className='show'+(bad?' bad':'');clearTimeout(toast.t);toast.t=setTimeout(()=>t.className='',3200)}
function loader(html,fn,ms=800){$('#loader span').innerHTML=html;$('#loader').classList.add('on');setTimeout(()=>fn&&fn(),ms)}
function logout(){try{api('/api/logout',{method:'POST',body:{},keepalive:true}).catch(()=>{})}catch(e){}loader('Signing out\u2026',()=>{setToken('');location.href='index.html'})}
function toggleTheme(){db.theme=db.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=db.theme;savePrefs()}

// ---- small dialogs (the browser's prompt() does not exist inside the desktop app, so we use our own) ----
function dialogBox(inner,onKey){return new Promise(res=>{
 const m=document.createElement('div');m.className='modal';m.innerHTML=`<div class="mbox" role="dialog" aria-modal="true">${inner}</div>`;
 const done=v=>{document.removeEventListener('keydown',kd,true);m.remove();res(v)};
 const kd=e=>{if(e.key==='Escape'){e.preventDefault();done(null)}else onKey&&onKey(e,done,m)};
 document.addEventListener('keydown',kd,true);m.onclick=e=>{if(e.target===m)done(null)};
 document.body.appendChild(m);m._done=done;dialogBox.last=m})}
function askConfirm(msg,ok='Confirm',danger=true){
 const p=dialogBox(`<h3>Please confirm</h3><p style="margin:0">${esc(msg)}</p><div class="bar"><button class="btn ${danger?'danger':''}" id="q-ok">${esc(ok)}</button><button class="btn ghost" id="q-x">Cancel</button></div>`);
 const m=dialogBox.last;m.querySelector('#q-ok').onclick=()=>m._done(true);m.querySelector('#q-x').onclick=()=>m._done(false);
 m.querySelector(danger?'#q-x':'#q-ok').focus();return p.then(v=>v===true)}
function askText(title,label,val='',type='text'){
 const p=dialogBox(`<h3>${esc(title)}</h3><label>${esc(label)}<input id="q-i" type="${type}" value="${esc(val)}" autocomplete="off" autocapitalize="none" spellcheck="false"></label><div class="bar"><button class="btn" id="q-ok">Save</button><button class="btn ghost" id="q-x">Cancel</button></div>`,(e,done,m)=>{if(e.key==='Enter'&&e.target.id==='q-i'){e.preventDefault();done(m.querySelector('#q-i').value)}});
 const m=dialogBox.last;m.querySelector('#q-ok').onclick=()=>m._done(m.querySelector('#q-i').value);m.querySelector('#q-x').onclick=()=>m._done(null);
 const i=m.querySelector('#q-i');i.focus();i.select();return p}

// Conflict: same room overlap OR same professor overlap in ANY room.
function findConflict(b){
 const o=db.schedules.find(o=>o.id!==b.id&&o.day===b.day&&o.start<b.end&&b.start<o.end&&(o.roomId===b.roomId||(b.profId&&o.profId===b.profId)));
 if(!o)return null;
 if(b.profId&&o.profId===b.profId&&o.roomId!==b.roomId)return `${by('faculty',b.profId).name} is already in ${by('rooms',o.roomId)?.name} (${DAYS[o.day]} ${fmt(o.start)}\u2013${fmt(o.end)})`;
 return `Room is already booked ${DAYS[o.day]} ${fmt(o.start)}\u2013${fmt(o.end)}`}
// Which pages each role can open. Anything else bounces back to the dashboard.
const NAV={admin:[['dashboard','Dashboard'],['scheduler','Scheduler'],['faculty','Faculty'],['admin','Admin']],teacher:[['dashboard','Dashboard'],['myschedule','My Schedule']]};
function shell(page){
 if(!me){$('#app').innerHTML='<div class="box card" style="margin:20vh auto"><h1>Session ended</h1><a class="btn" href="index.html">Go to sign in</a></div>';setTimeout(()=>location.href='index.html',700);return false}
 const nav=NAV[me.role]||[];
 if(!nav.some(n=>n[0]===page)){location.href='dashboard.html';return false}
 $('#app').innerHTML=`<header><a class="brand" href="dashboard.html">${LOGO}<b>CEIT Scheduler</b></a><nav>${nav.map(([p,l])=>`<a href="${p}.html" class="${p===page?'on':''}">${l}</a>`).join('')}</nav><div class="tools"><span id="sv" class="sv">\u25CF Saved</span><button class="sw" onclick="toggleTheme()" aria-label="Toggle theme"><i></i></button><span class="who"><b class="role">${me.title}</b>${esc(me.name)}</span><button class="btn ghost" onclick="logout()">Logout</button></div></header><div class="ph"><img src="assets/logo.png" alt=""><div><b>College of Engineering &amp; Information Technology</b><span>CEIT Scheduler</span></div></div><main id="main"></main>`;
 return true}
const pos=b=>`top:${(b.start-S)*PX}px;height:${(b.end-b.start)*PX-2}px;left:calc(${b.day}*100%/6 + 2px);width:calc(100%/6 - 4px)`;
function gridHTML(L,fn){const td=(new Date().getDay()+6)%7;return `<div class="gridwrap"><div class="gh"><span></span>${DAYS.map((d,i)=>`<b class="${i===td?'today':''}">${d}<small>${num(hrs(L.filter(b=>b.day===i)))}</small></b>`).join('')}</div>
<div class="gb"><div class="hrs">${Array.from({length:E-S},(_,i)=>`<span style="height:${PX}px">${fmt(S+i)}</span>`).join('')}</div><div class="cols" id="cols" style="height:${(E-S)*PX}px">${td<6?`<i class="td" style="left:calc(${td}*100%/6);width:calc(100%/6)"></i>`:''}${L.map(fn).join('')}</div></div></div>`}

// ---- "Saved" light + live updates ----
document.addEventListener('saved',()=>{const s=$('#sv');if(!s)return;s.textContent='\u25CF Saved';s.classList.remove('bad');s.classList.add('on');clearTimeout(s.t);s.t=setTimeout(()=>s.classList.remove('on'),1500)});
document.addEventListener('saveerr',()=>{const s=$('#sv');if(!s)return;s.textContent='\u25CF Not saved \u2013 retrying';s.classList.add('on','bad');clearTimeout(s.t)});

// ================= connection bar + live sync =================
// Native apps (PC app / Android app) give us the real network of THIS device and a "change server" button.
const NATIVE=(()=>{
 if(window.ceitNative)return window.ceitNative; // PC app (Electron)
 const A=window.__ceitAndroid;if(!A)return null;   // Android app
 const cbs={};let n=0;window.__ceitCb=(id,val)=>{const f=cbs[id];if(f){delete cbs[id];f(val)}};
 const ask=(fn,...a)=>new Promise(r=>{const id='c'+(++n);cbs[id]=r;A[fn](...a,id)});
 return{app:'android',getNetworkInfo:()=>Promise.resolve(JSON.parse(A.getNetworkInfo())),changeServer:()=>A.changeServer(),connect:u=>A.connect(u,'',''),print:()=>A.print(),recoverServer:id=>ask('recoverServer',id).then(r=>(r&&r.url)||null)}})();
const doPrint=()=>NATIVE&&NATIVE.print?NATIVE.print():window.print();
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const NM={state:'connecting',name:'',serverId:'',dev:{ip:'',label:''},last:Date.now(),want:0,ctl:null,stamp:0,streaming:false,fail:0,offSince:0,bar:null,nonet:false};
function ensureBar(){
 if(NM.bar)return NM.bar;
 const b=document.createElement('div');b.id='netbar';b.setAttribute('role','status');
 b.innerHTML='<i class="dot"></i><b class="nb-t"></b><span class="nb-srv"></span><span class="nb-dev"></span><span class="nb-sync"></span><button type="button" class="nb-btn" hidden>Change server</button>';
 document.body.prepend(b);
 b.addEventListener('click',e=>{if(e.target.closest('.nb-btn'))return;b.classList.toggle('open');fit()});
 const btn=b.querySelector('.nb-btn');if(NATIVE&&NATIVE.changeServer){btn.hidden=false;btn.onclick=()=>NATIVE.changeServer()}
 NM.bar=b;window.addEventListener('resize',fit);return b}
function fit(){if(NM.bar)document.documentElement.style.setProperty('--nbh',NM.bar.offsetHeight+'px')}
function renderBar(){
 const b=ensureBar(),s=NM.state,open=b.classList.contains('open');
 const t=ts=>new Date(ts).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',second:'2-digit'});
 b.className='nb '+({online:'ok',syncing:'sync',connecting:'wait',offline:'bad',nonet:'bad'}[s])+(open?' open':'');
 b.querySelector('.nb-t').textContent={online:'Connected',syncing:'Syncing\u2026',connecting:'Connecting\u2026',offline:'Not connected',nonet:'No network'}[s];
 b.querySelector('.nb-srv').innerHTML=s==='nonet'?'Connect this device to the Wi-Fi or LAN':`Server <code>${esc(location.host)}</code>${NM.name?' \u00B7 '+esc(NM.name):''}`;
 b.querySelector('.nb-dev').innerHTML=NM.dev.ip?`This device <code>${esc(NM.dev.ip)}</code>${NM.dev.label?' \u00B7 '+esc(NM.dev.label):''}`:(NM.dev.label?esc(NM.dev.label):'');
 b.querySelector('.nb-sync').textContent=s==='offline'?(saving()?'Your changes will sync when the server is back':'Trying to reconnect\u2026'):s==='nonet'?'':NM.want>REV?'New changes \u2013 updating\u2026':(me?'Live sync on \u00B7 ':'')+'last update '+t(NM.last);
 fit()}
function setState(s){if(NM.state!==s){NM.state=s;renderBar()}}
const netOk=()=>navigator.onLine!==false&&!NM.nonet;
async function refreshDevice(){
 try{
  if(NATIVE&&NATIVE.getNetworkInfo){const i=await NATIVE.getNetworkInfo();NM.nonet=i.type==='none';NM.dev={ip:i.ip||'',label:i.label||''}}
  else{const w=await api('/api/whoami');NM.dev={ip:w.ip||'',label:''}}
 }catch(e){}
 if(NM.nonet)setState('nonet');else if(NM.state==='nonet')setState(NM.streaming?'online':'offline');
 renderBar()}
document.addEventListener('saving',()=>{if(NM.state==='online')setState('syncing')});
document.addEventListener('saved',()=>{NM.last=Date.now();if(NM.state==='syncing')NM.state='online';renderBar()});
document.addEventListener('saveerr',()=>renderBar());
window.addEventListener('online',()=>{refreshDevice()});window.addEventListener('offline',()=>{NM.nonet=true;setState('nonet')});

// ---- when it is safe to refresh the page by itself (never while dragging, typing or a window is open) ----
let _pressed=false;
document.addEventListener('pointerdown',()=>_pressed=true,true);
['pointerup','pointercancel'].forEach(t=>document.addEventListener(t,()=>_pressed=false,true));
function idle(){
 if(saving()||_pressed||document.querySelector('.modal'))return false;
 const a=document.activeElement;if(a&&/^(INPUT|SELECT|TEXTAREA)$/.test(a.tagName))return false;
 return![...document.querySelectorAll('#main input')].some(i=>!i.closest('.chip')&&!i.readOnly&&i.type!=='checkbox'&&i.type!=='hidden'&&i.type!=='search'&&i.value)}
setInterval(()=>{if(!me)return;if(NM.want<=REV)NM.want=0;if(NM.want>REV&&idle()){NM.want=0;setState('syncing');location.reload()}},500);

// ---- live connection to the server (events). Every change on any device reaches this device within a moment. ----
function onEvent(block){
 let ev='message',data='';
 block.split('\n').forEach(l=>{if(l.startsWith('event:'))ev=l.slice(6).trim();else if(l.startsWith('data:'))data+=l.slice(5).trim()});
 if(!data)return;let d;try{d=JSON.parse(data)}catch(e){return}
 if(ev==='hello'){NM.serverId=d.serverId||'';NM.name=d.name||'';NM.last=Date.now();if(d.rev>REV)NM.want=d.rev}
 else if(ev==='rev'){NM.want=Math.max(NM.want,d.rev);NM.last=d.time||Date.now()}
 else if(ev==='bye'){setToken('');toast('You were signed out. Please sign in again.',1);setTimeout(()=>location.href='index.html',1200);return}
 renderBar()}
async function stream(){
 const ctl=new AbortController();NM.ctl=ctl;
 const r=await fetch('/api/events',{headers:{Authorization:'Bearer '+getToken()},cache:'no-store',signal:ctl.signal});
 if(r.status===401){const x=new Error('401');x.status=401;throw x}
 if(!r.ok||!r.body)throw new Error('stream');
 NM.streaming=true;NM.stamp=Date.now();NM.fail=0;NM.offSince=0;setState(saving()?'syncing':'online');refreshDevice();
 const rd=r.body.getReader(),dec=new TextDecoder();let buf='';
 try{for(;;){const x=await rd.read();if(x.done)break;NM.stamp=Date.now();buf+=dec.decode(x.value,{stream:true});let i;while((i=buf.indexOf('\n\n'))>=0){const blk=buf.slice(0,i);buf=buf.slice(i+2);onEvent(blk)}}}
 finally{NM.streaming=false}}
async function liveLoop(){
 for(;;){
  try{await stream()}catch(e){if(e.status===401){setToken('');location.href='index.html';return}}
  if(!NM.offSince)NM.offSince=Date.now();
  setState(netOk()?'offline':'nonet');
  await sleep(Math.min(5000,1000+(NM.fail++)*700))}}
setInterval(()=>{if(NM.streaming&&Date.now()-NM.stamp>28000&&NM.ctl)NM.ctl.abort()},4000); // no heartbeat for 28 s = connection is dead
// old browsers without streaming: ask the server every few seconds instead
async function pollLoop(){
 for(;;){
  try{const r=await api(me?'/api/rev':'/api/ping');NM.fail=0;NM.offSince=0;if(me){if(r.rev>REV)NM.want=r.rev;NM.last=Date.now()}else{NM.serverId=r.serverId||'';NM.name=r.name||'';NM.last=Date.now()}setState(saving()?'syncing':'online');if(!NM.dev.ip)refreshDevice()}
  catch(e){if(e.status===401){setToken('');location.href='index.html';return}if(!NM.offSince)NM.offSince=Date.now();setState(netOk()?'offline':'nonet')}
  await sleep(4000)}}
// native app: if the server moved to another IP address, find it again and follow it
setInterval(async()=>{
 if(NM.state==='offline'&&NATIVE&&NATIVE.recoverServer&&NM.serverId&&NM.offSince&&Date.now()-NM.offSince>12000){
  try{const u=await NATIVE.recoverServer(NM.serverId);if(u&&new URL(u).host!==location.host){toast('Server found at a new address \u2013 reconnecting\u2026');setTimeout(()=>NATIVE.connect(u),900)}}catch(e){}}},9000);
setInterval(()=>{if(NATIVE&&!document.hidden)refreshDevice()},6000);
ensureBar();renderBar();refreshDevice();
if(me&&window.ReadableStream&&window.TextDecoder&&window.AbortController)liveLoop();else pollLoop();
window.addEventListener('pagehide',()=>{try{NM.ctl&&NM.ctl.abort()}catch(e){}});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)renderBar()});
