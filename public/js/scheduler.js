if(shell('scheduler')){
 const admin=me.role==='admin',M=COURSE_MAP,D=CURRICULUM_DATABASE,ORD=['c','u','y','s'];
 let rid=sessionStorage.getItem('rid')||db.rooms[0]?.id,drag=null,pick=null;
 db.sel=db.sel||{};
 function fix(){const s=db.sel;if(!M[s.c])s.c=Object.keys(M)[0];if(!M[s.c][s.u])s.u=Object.keys(M[s.c])[0];if(!M[s.c][s.u][s.y])s.y=Object.keys(M[s.c][s.u])[0];if(!M[s.c][s.u][s.y].includes(s.s))s.s=M[s.c][s.u][s.y][0]}
 const cur=()=>{const s=db.sel;return(((D[s.c]||{})[s.u]||{})[s.y]||{})[s.s]||[]};
 const opt=(a,v,f=x=>x)=>a.map(x=>`<option value="${x}" ${x==v?'selected':''}>${esc(f(x))}</option>`).join('');
 const blkOf=el=>db.schedules.find(b=>b.id===el.closest('.blk').dataset.id);
 const pickTxt=()=>pick.k==='s'?cur()[pick.id]?.code:by('faculty',pick.id)?.name;
 const blk=b=>`<div class="blk" data-c="${esc(b.course)}" data-id="${b.id}" style="${pos(b)}"><b>${esc(b.code)}</b><span class="nm">${esc(b.name)}</span><small>${esc(b.course)} Y${b.year} · ${esc(b.sem)}</small><small>${fmt(b.start)}–${fmt(b.end)}</small>${admin?`<select class="ps"><option value="">No faculty</option>${db.faculty.map(f=>`<option value="${f.id}" ${f.id===b.profId?'selected':''}>${esc(f.name)}</option>`).join('')}</select><button class="x" title="Remove">×</button><i class="rz"></i>`:`<small>${esc(by('faculty',b.profId)?.name||'')}</small>`}</div>`;
 function draw(){
  fix();const s=db.sel,L=db.schedules.filter(b=>b.roomId===rid);if(!by('rooms',rid))rid=db.rooms[0]?.id;
  $('#main').innerHTML=`<div class="bar"><select id="rs" aria-label="Room">${opt(db.rooms.map(r=>r.id),rid,id=>by('rooms',id).name)}</select><span class="pill">Room total: ${num(hrs(L))}</span>${admin?'<button class="btn ghost" id="cr">Clear room</button><button class="btn danger" id="ca">Clear all</button>':''}</div>
  ${pick?`<div class="bar"><span class="pill">Selected: ${esc(pickTxt()||'')} — tap ${pick.k==='s'?'a time slot on the grid':'a class block'}</span><button class="btn ghost" id="pc">Cancel</button></div>`:''}
  <div class="split">${admin?`<aside class="card"><b>Load subjects</b>
  <select id="sc">${opt(Object.keys(M),s.c)}</select><select id="su">${opt(Object.keys(M[s.c]),s.u)}</select><select id="sy">${opt(Object.keys(M[s.c][s.u]),s.y,y=>'Year '+y)}</select><select id="ss">${opt(M[s.c][s.u][s.y],s.s)}</select>
  <small class="mu"><b>Easy way:</b> tap a subject, then tap the time slot on the grid. Or press and drag it. Tap a faculty, then tap a class block. Default 3 hrs (editable).</small>
  <div class="pal">${cur().map((x,i)=>`<div class="chip ${pick&&pick.k==='s'&&pick.id==i?'on':''}" data-k="s" data-id="${i}"><b>${esc(x.code)}</b> <input class="sh" data-c="${esc(x.code)}" type="number" min="0.5" max="13" step="0.5" value="${db.hours[x.code]??3}" title="Hours"><br><small>${esc(x.name)}</small></div>`).join('')||'<small>No subjects in database for this term.</small>'}</div>
  <b>Faculty</b><div class="pal">${db.faculty.map(f=>`<div class="chip ${pick&&pick.k==='p'&&pick.id===f.id?'on':''}" data-k="p" data-id="${f.id}">${esc(f.name)}</div>`).join('')}</div></aside>`:''}
  ${gridHTML(L,blk)}</div>`;
  bind()}
 function addAt(x,e){
  const r=$('#cols').getBoundingClientRect(),d=Math.min(5,Math.max(0,Math.floor((e.clientX-r.left)/(r.width/6)))),h=db.hours[x.code]??3;
  let st=Math.min(E-.5,Math.max(S,S+Math.floor((e.clientY-r.top)/PX*2)/2)),en=st+h;if(en>E){en=E;st=Math.max(S,E-h)}
  const s=db.sel,b={id:uid('c'),roomId:rid,code:x.code,name:x.name,course:s.c,curr:s.u,year:s.y,sem:s.s,profId:'',day:d,start:st,end:en},c=findConflict(b);
  if(c){toast(c,1);return 0}db.schedules.push(b);save();draw();return 1}
 function apply(b,k,id){const s=db.sel;
  if(k==='s'){const x=cur()[id];Object.assign(b,{code:x.code,name:x.name,course:s.c,curr:s.u,year:s.y,sem:s.s});save();return 1}
  const old=b.profId;b.profId=id;const c=findConflict(b);if(c){b.profId=old;toast(c,1);return 0}save();toast('Faculty assigned');return 1}
 function bind(){
  $('#rs').onchange=e=>{rid=e.target.value;sessionStorage.setItem('rid',rid);draw()};
  if(!admin)return;
  if(pick)$('#pc').onclick=()=>{pick=null;draw()};
  $('#cr').onclick=async()=>{if(await askConfirm('Clear all classes in this room?','Clear room')){db.schedules=db.schedules.filter(b=>b.roomId!==rid);save();draw();toast('Room cleared')}};
  $('#ca').onclick=async()=>{if(await askConfirm('Clear ALL schedules in ALL rooms?','Clear all')){db.schedules=[];save();draw();toast('All schedules cleared')}};
  ['sc','su','sy','ss'].forEach((id,i)=>$('#'+id).onchange=e=>{pick=null;db.sel[ORD[i]]=e.target.value;ORD.slice(i+1).forEach(k=>delete db.sel[k]);fix();save();draw()});
  document.querySelectorAll('.sh').forEach(i=>i.onchange=()=>{const v=Math.round(+i.value*2)/2;if(v<.5)return draw();db.hours[i.dataset.c]=v;save();toast('Duration saved')});
  document.querySelectorAll('.ps').forEach(p=>p.onchange=()=>{const b=blkOf(p),old=b.profId;b.profId=p.value;const c=findConflict(b);if(c){b.profId=old;toast(c,1)}else save();draw()});
  document.querySelectorAll('.x').forEach(x=>x.onclick=()=>{const b=blkOf(x);db.schedules=db.schedules.filter(o=>o!==b);save();draw()});
 }
 if(admin){
  document.onpointerdown=e=>{
   const ch=e.target.closest('.chip[data-k]');
   if(ch&&!e.target.closest('input')){const k=ch.dataset.k;drag={t:'new',k,id:ch.dataset.id,x:e.clientX,y:e.clientY,txt:k==='s'?cur()[ch.dataset.id].code:by('faculty',ch.dataset.id).name};return}
   const el=e.target.closest('.blk');
   if(!el){if(pick&&e.target.closest('#cols'))drag={t:'tap',x:e.clientX,y:e.clientY};return}
   if(e.target.closest('select,button'))return;
   const b=blkOf(el);drag={t:e.target.classList.contains('rz')?'rz':'mv',b,el,x:e.clientX,y:e.clientY,o:{...b}};el.classList.add('drag')};
  document.onpointermove=e=>{if(!drag)return;
   if(drag.t==='new'){if(!drag.g&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>8){drag.g=document.createElement('div');drag.g.className='gst';drag.g.textContent=drag.txt;document.body.appendChild(drag.g)}
    if(drag.g)drag.g.style.cssText=`left:${e.clientX+12}px;top:${e.clientY+12}px`;return}
   if(drag.t==='tap')return;
   const{b,o}=drag,dt=Math.round((e.clientY-drag.y)/PX*2)/2;
   if(drag.t==='rz')b.end=Math.min(E,Math.max(o.start+.5,o.end+dt));
   else{const w=$('#cols').getBoundingClientRect().width/6,len=o.end-o.start;b.start=Math.min(E-len,Math.max(S,o.start+dt));b.end=b.start+len;b.day=Math.min(5,Math.max(0,o.day+Math.round((e.clientX-drag.x)/w)))}
   drag.el.style.cssText=pos(b);drag.el.classList.toggle('bad',!!findConflict(b))};
  document.onpointerup=document.onpointercancel=e=>{if(!drag)return;const d=drag;drag=null;const cancel=e.type==='pointercancel';
   if(d.t==='tap'){if(!cancel&&Math.hypot(e.clientX-d.x,e.clientY-d.y)<10){if(pick.k==='s'){if(addAt(cur()[pick.id],e))pick=null}else toast('Tap a class block to assign faculty',1)}return}
   if(d.t==='new'){
    if(!d.g){if(cancel)return;pick=pick&&pick.k===d.k&&pick.id===d.id?null:{k:d.k,id:d.id};draw();return}
    d.g.remove();if(cancel)return;
    const t=document.elementFromPoint(e.clientX,e.clientY),bl=t&&t.closest('.blk');
    if(bl){apply(blkOf(bl),d.k,d.id);draw()}
    else if(d.k==='s'&&t&&t.closest('#cols'))addAt(cur()[d.id],e);
    else if(d.k==='p')toast('Drop the faculty onto a class block',1);
    return}
   const moved=d.b.start!==d.o.start||d.b.end!==d.o.end||d.b.day!==d.o.day;
   if(!moved&&pick){apply(d.b,pick.k,pick.id)&&(pick=null);draw();return}
   const c=findConflict(d.b);if(c){Object.assign(d.b,d.o);toast(c,1)}else save();draw()};
 }
 draw()}
