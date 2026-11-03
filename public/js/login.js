// Two sign-ins on one page: Admin (default) and Teacher (small link under the form, or index.html#teacher)
if(me)location.href='dashboard.html';
const TL=__BOOT.teachers||{teachers:[],adminDefault:false};
const t1=TL.teachers.find(t=>t.pw);
const MODES={
 admin:{sub:'Admin sign in',hint:TL.adminDefault?'Default admin: admin / admin123':'',link:'Teacher? Sign in here \u2192',ph:'Admin username'},
 teacher:{sub:'Teacher sign in',hint:t1?`Your username is your surname, e.g. ${t1.username} / ${DEFAULT_PW}`:'Use the login your admin gave you',link:'\u2190 Admin sign in',ph:'Teacher username'}};
let mode='admin';
// ---- show / hide password ----
function showPw(on){const p=$('#p'),b=$('#eye');p.type=on?'text':'password';b.textContent=on?'Hide':'Show';b.setAttribute('aria-pressed',on);b.setAttribute('aria-label',on?'Hide password':'Show password')}
$('#eye').onclick=()=>showPw($('#p').type==='password');
// ---- teacher list: tap "Open to see user and pass of teacher", tap a name to fill the form ----
// A password is only listed while it is still the default one. Once a teacher changes it, it stays private.
const CR_TXT=$('#cr').textContent;
function teacherList(q=''){
 q=q.trim().toLowerCase();
 const T=TL.teachers.filter(x=>!q||x.name.toLowerCase().includes(q)||x.username.toLowerCase().includes(q));
 $('#crl').innerHTML=T.length?T.map(x=>`<button type="button" class="cri" data-u="${esc(x.username)}" data-p="${esc(x.pw||'')}"><b>${esc(x.name)}</b><small>user: ${esc(x.username)} \u00B7 pass: ${x.pw?esc(x.pw):'private (changed by the teacher)'}</small></button>`).join(''):`<div class="cre">${q?'No teacher found.':'No teacher accounts yet. Ask the admin to create one.'}</div>`}
function openList(on){$('#cl').hidden=!on;$('#cr').setAttribute('aria-expanded',on);$('#cr').textContent=on?'Close the teacher list':CR_TXT;if(on){$('#cf').value='';teacherList()}}
$('#cr').onclick=()=>openList($('#cl').hidden);
$('#cf').oninput=e=>teacherList(e.target.value);
$('#cf').onkeydown=e=>{if(e.key==='Enter')e.preventDefault()};
$('#crl').onclick=e=>{const b=e.target.closest('.cri');if(!b)return;$('#u').value=b.dataset.u;$('#p').value=b.dataset.p;if(b.dataset.p){toast('Filled in \u2014 tap Sign in');$('#f .btn').focus()}else{toast('Type your own password');$('#p').focus()}};
function setMode(m,first){mode=m;const c=MODES[m];document.body.dataset.mode=m;$('#sub').textContent=c.sub;$('#hint').textContent=c.hint;$('#sw').textContent=c.link;$('#u').placeholder=c.ph;if(!first)$('#f').reset();showPw(false);openList(false);$('#u').focus()}
const fromHash=first=>setMode(location.hash==='#teacher'?'teacher':'admin',first===true);
$('#sw').onclick=e=>{e.preventDefault();location.hash=mode==='admin'?'teacher':'admin'};
window.addEventListener('hashchange',()=>fromHash());fromHash(true);
$('#f').removeAttribute('inert');document.body.classList.add('ready');$('#u').focus();
$('#f').onsubmit=async e=>{e.preventDefault();
 const btn=$('#f .btn');if(btn.disabled)return;btn.disabled=true;
 try{
  const r=await api('/api/login',{method:'POST',body:{username:$('#u').value.trim(),password:$('#p').value,mode}});
  setToken(r.token);
  loader(`Welcome<em>${esc(r.name)} (${r.role})</em>`,()=>{location.href='dashboard.html'},1600);
 }catch(x){toast(x.network?'Cannot reach the server':x.message,1);btn.disabled=false}};
