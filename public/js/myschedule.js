// Teacher page: VIEW ONLY. A teacher sees all of their own classes (every room) and can print them.
// Only the admin can change a schedule (the server also refuses any change from a teacher account).
if(shell('myschedule')){
 const p=by('faculty',me.profId);
 const blk=b=>`<div class="blk ro" data-c="${esc(b.course)}" style="${pos(b)}"><b>${esc(b.code)}</b><span class="nm">${esc(b.name)}</span><small>${esc(by('rooms',b.roomId)?.name||'')}</small><small>${esc(b.course)} Y${b.year}</small><small>${fmt(b.start)}\u2013${fmt(b.end)}</small></div>`;
 if(!p){$('#main').innerHTML='<h1>My Schedule</h1><div class="card">Your login is not linked to a professor yet. Please ask the admin to link it.</div>'}
 else{
  const L=db.schedules.filter(b=>b.profId===me.profId);
  $('#main').innerHTML=`<h1>My Schedule</h1><div class="bar"><span class="pill">${num(hrs(L))} / week</span><span class="pill">${L.length} class${L.length===1?'':'es'}</span><button class="btn ghost" onclick="doPrint()">Print</button></div>
  <p class="mu tip">This is your class schedule. It is set by the admin, so you can only view and print it.</p>
  ${L.length?gridHTML(L,blk):'<div class="card">No classes assigned to you yet. Once the admin assigns subjects to you they will appear here.</div>'}`}}
