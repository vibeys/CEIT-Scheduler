// Client data layer. The REAL database lives on the host computer; this keeps a copy in memory and sends changes to the server.
// Only things that belong to this device (theme, last chosen course) are kept in this device's browser.
const DAYS=['Mon','Tue','Wed','Thu','Fri','Sat'],S=7,E=20,PX=56,DEFAULT_PW='teacher123';
const uid=p=>p+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
let REV=__BOOT.rev;
let db=__BOOT.data||{schedules:[],hours:{},rooms:[],faculty:[],users:[]};
db.schedules=db.schedules||[];db.hours=db.hours||{};db.rooms=db.rooms||[];db.faculty=db.faculty||[];db.users=db.users||[];
try{db.sel=JSON.parse(localStorage.getItem('ceit_sel')||'{}')||{}}catch(e){db.sel={}}
db.theme=localStorage.getItem('ceit_theme')||'light';

// ---- teacher logins: one account per professor (username = surname by default). The server stores the password safely hashed. ----
const TITLES=['MR','MRS','MS','ENGR','DR','PROF','ATTY','ARCH'],PART=['DEL','DE','DELA','DELOS','DELAS','SAN','SANTA','VAN','VON'];
const nameParts=n=>String(n).replace(/\([^)]*\)/g,' ').replace(/[^A-Za-z\s]/g,' ').toUpperCase().split(/\s+/).filter(w=>w&&!TITLES.includes(w));
const surname=n=>{const t=nameParts(n),l=t[t.length-1]||'';return(t.length>1&&PART.includes(t[t.length-2])?t[t.length-2]:'')+l};
function makeTeacherLogin(f,pw){
 const t=nameParts(f.name),sur=surname(f.name).toLowerCase()||'teacher';
 const dup=db.faculty.some(o=>o.id!==f.id&&surname(o.name).toLowerCase()===sur);
 const base=dup&&t[0]?t[0][0].toLowerCase()+sur:sur;
 let n=base,k=2;while(db.users.some(u=>u.username.toLowerCase()===n))n=base+k++;
 const u={id:uid('u'),name:f.name,username:n,newPassword:pw||DEFAULT_PW,role:'teacher',profId:f.id};
 db.users.push(u);return u}

// ---- saving (admin only). Changes go to the server right away; if the network drops they are retried. ----
let _dirty=false,_busy=false,_retry=0;
const saving=()=>_dirty||_busy;
function savePrefs(){try{localStorage.setItem('ceit_sel',JSON.stringify(db.sel||{}));localStorage.setItem('ceit_theme',db.theme||'light')}catch(e){}}
function save(){
 savePrefs();
 if(typeof me==='undefined'||!me||me.role!=='admin')return; // teachers are view-only
 _dirty=true;flush()}
async function flush(){
 if(_busy||!_dirty)return;_busy=true;_dirty=false;document.dispatchEvent(new Event('saving'));
 const snap=JSON.parse(JSON.stringify({schedules:db.schedules,hours:db.hours,rooms:db.rooms,faculty:db.faculty,users:db.users}));
 try{
  const r=await api('/api/db',{method:'POST',body:{rev:REV,data:snap}});
  REV=r.rev;if(r.token)setToken(r.token);
  db.users.forEach(u=>{const s=snap.users.find(x=>x.id===u.id);if(s&&s.newPassword&&s.newPassword===u.newPassword)delete u.newPassword;if(r.pwDefault&&u.id in r.pwDefault)u.pwDefault=r.pwDefault[u.id]});
  _retry=0;document.dispatchEvent(new Event('saved'));
 }catch(e){
  if(e.status===409){toast(e.message,1);_dirty=false;setTimeout(()=>location.reload(),1300)}
  else if(e.status===401){setToken('');toast('Your session ended. Please sign in again.',1);setTimeout(()=>location.href='index.html',1200)}
  else if(e.status){toast('Could not save: '+e.message,1);_dirty=false;setTimeout(()=>location.reload(),1800)}
  else{_dirty=true;document.dispatchEvent(new Event('saveerr'));_retry++;setTimeout(flush,Math.min(8000,1500*_retry))}
 }
 _busy=false;if(_dirty&&!_retry)flush()}
window.addEventListener('pagehide',()=>{if(_dirty&&!_busy&&typeof me!=='undefined'&&me&&me.role==='admin'){try{api('/api/db',{method:'POST',keepalive:true,body:{rev:REV,data:{schedules:db.schedules,hours:db.hours,rooms:db.rooms,faculty:db.faculty,users:db.users}}}).catch(()=>{})}catch(e){}}});
