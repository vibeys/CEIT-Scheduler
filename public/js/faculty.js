if(shell('faculty')){
 let sel=sessionStorage.getItem('pid')||db.faculty[0]?.id;
 const blk=b=>`<div class="blk ro" data-c="${esc(b.course)}" style="${pos(b)}"><b>${esc(b.code)}</b><span class="nm">${esc(by('rooms',b.roomId)?.name||'')}</span><small>${esc(b.course)} Y${b.year}</small><small>${fmt(b.start)}–${fmt(b.end)}</small></div>`;
 function draw(){
  if(!by('faculty',sel))sel=db.faculty[0]?.id;
  const p=by('faculty',sel),L=db.schedules.filter(b=>b.profId===sel),lg=db.users.find(u=>u.profId===sel);
  $('#main').innerHTML=`<h1>Faculty Schedule${p?' — '+esc(p.name):''}</h1><div class="bar"><select id="ps" aria-label="Faculty">${db.faculty.map(f=>`<option value="${f.id}" ${f.id===sel?'selected':''}>${esc(f.name)}</option>`).join('')}</select>${p?`<span class="pill">${num(hrs(L))} / week</span><span class="pill">${lg?'Login: '+esc(lg.username):'No login yet'}</span>`:''}<button class="btn ghost" onclick="doPrint()">Print</button>${p?'<button class="btn danger" id="d">Remove</button>':''}</div>
  <form id="f" class="bar"><input id="n" placeholder="Add new faculty…" required><button class="btn">Add faculty</button></form>${p?gridHTML(L,blk):'<p class="mu">No faculty yet.</p>'}`;
  $('#ps').onchange=e=>{sel=e.target.value;sessionStorage.setItem('pid',sel);draw()};
  $('#f').onsubmit=e=>{e.preventDefault();const f={id:uid('p'),name:$('#n').value.trim()};db.faculty.push(f);const u=makeTeacherLogin(f);sel=f.id;save();draw();toast(`Faculty added · teacher login: ${u.username} / ${DEFAULT_PW}`)};
  if(p)$('#d').onclick=async()=>{if(await askConfirm('Remove this faculty? Their classes become unassigned and their teacher login is deleted.','Remove')){db.schedules.forEach(b=>{if(b.profId===sel)b.profId=''});db.users=db.users.filter(u=>u.profId!==sel);db.faculty=db.faculty.filter(f=>f.id!==sel);save();draw()}};
 }draw()}
