if(shell('admin')){
 let am=sessionStorage.getItem('am')||'teacher',NET=null,QR='';
 const profOpts=()=>db.faculty.map(f=>`<option value="${f.id}" ${db.users.some(u=>u.profId===f.id)?'disabled':''}>${esc(f.name)}${db.users.some(u=>u.profId===f.id)?' (has login)':''}</option>`).join('');
 const row=u=>{const lk=u.role==='teacher'&&!by('faculty',u.profId);
  return `<tr><td>${esc(whoOf(u))}<span class="pill">${u.role}</span><br><small>@${esc(u.username)}${u.pwDefault&&!u.newPassword?' \u00B7 default password':''}${lk?' \u00B7 not linked to a professor':''}</small>${lk?`<br><select data-link="${u.id}"><option value="">Link to professor\u2026</option>${profOpts()}</select>`:''}</td>
  <td><div class="acts"><button class="btn ghost sm" data-pw="${u.id}">Password</button>${u.role==='admin'?`<button class="btn ghost sm" data-al="${u.id}">Alias</button>`:''}${u.id===me.id?'<small>You</small>':`<button class="btn danger sm" data-u="${u.id}">Delete</button>`}</div></td></tr>`};
 let DEVS=[];
 const ago=t=>{const m=Math.round((Date.now()-t)/60000);return m<1?'just now':m<60?m+' min':Math.round(m/60)+' h'};
 const devHTML=()=>`<small class="eyebrow">Devices connected now \u00B7 ${DEVS.length}</small><div class="tbl" style="margin-top:8px"><table><tbody>${DEVS.map(d=>`<tr><td>${esc(d.name)} <span class="pill">${d.role}</span><br><small>${esc(d.kind)} \u00B7 ${esc(d.ip)} \u00B7 connected ${ago(d.since)}</small></td></tr>`).join('')||'<tr><td><small>No device is connected.</small></td></tr>'}</tbody></table></div>`;
 const netHTML=()=>!NET?'<small class="mu">Loading\u2026</small>':(NET.urls.length?`<div class="netrow"><div class="netl"><p class="tip">This laptop is the <b>server</b> (${esc(NET.name)}). The <b>PC app</b> and the <b>Phone app</b> find it by themselves on the same Wi-Fi / LAN. For a <b>website</b>, open one of these in any browser:</p>${NET.urls.map(u=>`<div class="neturl"><span class="pill">${esc(u.label)}</span><code>${esc(u.url)}</code><button class="btn ghost sm" data-cp="${esc(u.url)}">Copy</button></div>`).join('')}<small class="mu">Want the same address every time? Ask your network admin to reserve this laptop\u2019s IP address. The apps still find the server if it changes.</small></div><div class="qr" id="qr">${QR}</div></div>`:'<p class="tip">No network connection found. Connect this laptop to the school Wi-Fi or plug in the LAN cable.</p>')+`<div id="devs" style="margin-top:16px">${devHTML()}</div><small class="mu" style="display:block;margin-top:10px">Database file: <code>${esc(NET.dataFile)}</code> \u00B7 automatic backups are kept next to it.</small>`;
 function draw(){
  const A=db.users.filter(u=>u.role==='admin'),T=db.users.filter(u=>u.role==='teacher');
  $('#main').innerHTML=`<h1>Admin</h1>${me.pwDefault?'<div class="card warn tip">You are still using the default admin password. Please change it: tap <b>Password</b> next to your own account below.</div>':''}<div class="split2">
  <section class="card"><h3>Network access</h3><div id="net">${netHTML()}</div></section>
  <section class="card"><h3>Accounts</h3>
  <div class="seg"><button data-am="teacher" class="${am==='teacher'?'on':''}">Teacher login</button><button data-am="admin" class="${am==='admin'?'on':''}">Admin account</button></div>
  ${am==='teacher'?`<form id="uf" class="bar"><input id="un" list="fl" placeholder="Name, e.g. Engr. Juan Dela Cruz" autocomplete="off" required><datalist id="fl">${db.faculty.filter(f=>!db.users.some(u=>u.profId===f.id)).map(f=>`<option value="${esc(cleanName(f.name))}">`).join('')}</datalist><input id="uu" placeholder="Username" autocapitalize="none" required><input id="up" placeholder="Password" required><button class="btn">Add teacher</button></form>
  <div class="bar"><button class="btn ghost" id="all" type="button">Create logins for all faculty</button><small>Username = surname, password = ${DEFAULT_PW}</small></div>`
  :`<form id="uf" class="bar"><input id="ua" placeholder="Alias, e.g. sample" required><input id="uu" placeholder="Username" autocapitalize="none" required><input id="up" placeholder="Password" required><button class="btn">Add admin</button></form>`}
  <small class="eyebrow">Admins \u00B7 ${A.length}</small><div class="tbl" style="margin:8px 0 18px"><table><tbody>${A.map(row).join('')}</tbody></table></div>
  <small class="eyebrow">Teachers \u00B7 ${T.length}</small><div class="tbl" style="margin-top:8px"><table><tbody>${T.map(row).join('')||'<tr><td><small>No teacher logins yet.</small></td></tr>'}</tbody></table></div></section>
  <section class="card"><h3>Rooms</h3><form id="rf" class="bar"><input id="rn" placeholder="Room name" required><button class="btn">Add</button></form>
  <div class="tbl"><table><tbody>${db.rooms.map(r=>`<tr><td>${esc(r.name)}</td><td><button class="btn danger" data-r="${r.id}">Delete</button></td></tr>`).join('')}</tbody></table></div></section>
  <section class="card"><h3>Data (JSON)</h3><p class="tip mu">Export saves a backup file of everything. Import loads a backup file (also works with files from the old browser version).</p><div class="bar"><button class="btn" id="ex">Export JSON</button><button class="btn ghost" id="im">Import JSON</button><button class="btn danger" id="rs">Reset all</button></div><input type="file" id="fi" accept=".json" hidden></section></div>`;
  document.querySelectorAll('[data-am]').forEach(b=>b.onclick=()=>{am=b.dataset.am;sessionStorage.setItem('am',am);draw()});
  const taken=n=>db.users.some(u=>u.username.toLowerCase()===n.toLowerCase());
  $('#uf').onsubmit=e=>{e.preventDefault();const n=$('#uu').value.trim(),pw=$('#up').value.trim();
   if(taken(n))return toast('Username already exists',1);
   if(pw.length<4)return toast('Password must be at least 4 characters',1);
   if(am==='teacher'){
    // Name -> professor: reuse an existing professor with that name, otherwise add a new one. Each login is tied to one professor.
    const nm=$('#un').value.trim().replace(/\s+/g,' '),key=s=>cleanName(s).toLowerCase().replace(/[^a-z]/g,'');
    if(!key(nm))return toast('Enter the teacher name',1);
    let f=db.faculty.find(x=>key(x.name)===key(nm));
    if(f&&db.users.some(u=>u.profId===f.id))return toast('That professor already has a login',1);
    if(!f){f={id:uid('p'),name:nm};db.faculty.push(f)}
    db.users.push({id:uid('u'),name:f.name,username:n,newPassword:pw,role:'teacher',profId:f.id});toast('Teacher account created')}
   else{const al=$('#ua').value.trim();if(!al)return toast('Enter an alias',1);
    db.users.push({id:uid('u'),name:al,alias:al,username:n,newPassword:pw,role:'admin'});toast('Admin account created')}
   save();draw()};
  if(am==='teacher')$('#all').onclick=()=>{const m=db.faculty.filter(f=>!db.users.some(u=>u.profId===f.id));if(!m.length)return toast('Every professor already has a login');m.forEach(f=>makeTeacherLogin(f));save();draw();toast(`${m.length} teacher login${m.length>1?'s':''} created \u00B7 password: ${DEFAULT_PW}`)};
  document.querySelectorAll('[data-link]').forEach(s=>s.onchange=()=>{if(!s.value)return;const u=by('users',s.dataset.link);u.profId=s.value;u.name=by('faculty',s.value).name;save();draw();toast('Login linked')});
  document.querySelectorAll('[data-pw]').forEach(b=>b.onclick=async()=>{const u=by('users',b.dataset.pw),v=await askText('New password','New password for @'+u.username,'','password');if(v==null)return;if(v.trim().length<4)return toast('Password must be at least 4 characters',1);u.newPassword=v.trim();u.pwDefault=false;save();draw();toast('Password updated')});
  document.querySelectorAll('[data-al]').forEach(b=>b.onclick=async()=>{const u=by('users',b.dataset.al),v=await askText('Alias','Alias for @'+u.username,u.alias||'');if(v&&v.trim()){u.alias=v.trim();save();if(u.id===me.id){const w=setInterval(()=>{if(!saving()){clearInterval(w);location.reload()}},150);return}draw();toast('Alias updated')}});
  document.querySelectorAll('[data-u]').forEach(b=>b.onclick=async()=>{if(await askConfirm('Delete this account?','Delete')){db.users=db.users.filter(u=>u.id!==b.dataset.u);save();draw()}});
  $('#rf').onsubmit=e=>{e.preventDefault();db.rooms.push({id:uid('r'),name:$('#rn').value.trim()});save();draw();toast('Room added')};
  document.querySelectorAll('[data-r]').forEach(b=>b.onclick=async()=>{if(await askConfirm('Delete room and its schedules?','Delete')){db.rooms=db.rooms.filter(r=>r.id!==b.dataset.r);db.schedules=db.schedules.filter(c=>c.roomId!==b.dataset.r);save();draw()}});
  document.querySelectorAll('[data-cp]').forEach(b=>b.onclick=()=>copyText(b.dataset.cp));
  $('#ex').onclick=async()=>{try{const r=await api('/api/export-ticket',{method:'POST',body:{}});const a=document.createElement('a');a.href=r.url;a.download='ceit-scheduler-backup.json';document.body.appendChild(a);a.click();a.remove();toast('Backup file is downloading\u2026')}catch(x){toast('Export failed: '+x.message,1)}};
  $('#im').onclick=()=>$('#fi').click();
  $('#fi').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=async()=>{
   let d;try{d=JSON.parse(r.result)}catch(x){return toast('That is not a valid JSON file',1)}
   if(!await askConfirm('Replace ALL current data with this file? A backup of the current data is saved first.','Import',false))return;
   try{const out=await api('/api/import',{method:'POST',body:d});toast(out.dropped?`Imported (${out.dropped} invalid class${out.dropped>1?'es were':' was'} skipped)`:'Imported');setTimeout(()=>{setToken('');location.href='index.html'},1400)}catch(x){toast(x.message,1)}};r.readAsText(f);e.target.value=''};
  $('#rs').onclick=async()=>{if(await askConfirm('Reset EVERYTHING to defaults? A backup is saved first, but all schedules and accounts go back to the starting data.','Reset')){try{await api('/api/reset',{method:'POST',body:{}});setToken('');location.href='index.html'}catch(x){toast(x.message,1)}}};
 }
 function copyText(t){
  const ok=()=>toast('Copied');
  if(navigator.clipboard&&window.isSecureContext)return navigator.clipboard.writeText(t).then(ok,()=>copyText.old(t,ok));
  copyText.old(t,ok)}
 copyText.old=(t,ok)=>{const a=document.createElement('textarea');a.value=t;a.style.cssText='position:fixed;opacity:0';document.body.appendChild(a);a.select();try{document.execCommand('copy');ok()}catch(e){toast(t)}a.remove()};
 draw();
 // network info + QR code (loaded after the page is drawn)
 api('/api/network').then(async n=>{NET=n;if(n.urls[0]){try{const r=await fetch('/api/qr?text='+encodeURIComponent(n.urls[0].url),{headers:{Authorization:'Bearer '+getToken()}});if(r.ok)QR=await r.text()}catch(e){}}
  const box=$('#net');if(box)box.innerHTML=netHTML();document.querySelectorAll('[data-cp]').forEach(b=>b.onclick=()=>copyText(b.dataset.cp))}).catch(()=>{});
 async function devs(){try{DEVS=(await api('/api/devices')).devices;const d=$('#devs');if(d)d.innerHTML=devHTML()}catch(e){}}
 devs();setInterval(()=>{if(!document.hidden)devs()},4000);
}
