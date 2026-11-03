if(shell('dashboard')){
 if(me.role==='teacher'){
  // Teacher home: only their own classes
  const p=by('faculty',me.profId),L=db.schedules.filter(b=>b.profId===me.profId).sort((a,b)=>a.day-b.day||a.start-b.start);
  const rows=L.map(b=>`<tr><td><b>${esc(b.code)}</b><br><small>${esc(b.name)}</small></td><td>${esc(b.course)} · Year ${b.year}<br><small>${esc(b.sem)}</small></td><td>${esc(by('rooms',b.roomId)?.name||'')}</td><td>${DAYS[b.day]}</td><td>${fmt(b.start)}–${fmt(b.end)}</td></tr>`).join('');
  $('#main').innerHTML=`<h1>Welcome ${esc(me.name)} (${me.role})</h1>${p?'':'<div class="card" style="margin-bottom:20px">Your login is not linked to a professor yet. Please ask the admin to link it.</div>'}
  <div class="cards">${[['Classes',L.length],['Hours / week',num(hrs(L))],['Teaching days',new Set(L.map(b=>b.day)).size],['Subjects',new Set(L.map(b=>b.code)).size]].map(([a,b])=>`<div class="card"><small>${a}</small><h2>${b}</h2></div>`).join('')}</div>
  <div class="bar"><h3>My classes</h3><a class="btn" href="myschedule.html">Open My Schedule</a></div>
  ${L.length?`<div class="tbl"><table><thead><tr><th>Subject</th><th>Section</th><th>Room</th><th>Day</th><th>Time</th></tr></thead><tbody>${rows}</tbody></table></div><p class="mu">The admin assigns your subjects and sets your schedule. You can view and print it in My Schedule.</p>`:'<div class="card">No classes assigned to you yet. Once the admin assigns subjects to you, they will show up here.</div>'}`;
 }else{
  const S_=db.schedules,cell=l=>`<td>${num(hrs(l))}</td>`;
  const rows=db.rooms.map(r=>{const l=S_.filter(b=>b.roomId===r.id);return `<tr><td>${esc(r.name)}</td>${DAYS.map((_,i)=>cell(l.filter(b=>b.day===i))).join('')}<td><b>${num(hrs(l))}</b></td></tr>`}).join('');
  $('#main').innerHTML=`<h1>Welcome ${esc(me.name)} (${me.role})</h1><div class="cards">${[['Rooms',db.rooms.length],['Total hours',num(hrs(S_))],['Faculty',db.faculty.length],['Classes',S_.length]].map(([a,b])=>`<div class="card"><small>${a}</small><h2>${b}</h2></div>`).join('')}</div>
  <h3>Total hours per day and per room</h3><div class="tbl"><table><thead><tr><th>Room</th>${DAYS.map(d=>`<th>${d}</th>`).join('')}<th>Total</th></tr></thead><tbody>${rows}</tbody><tfoot><tr><th>All rooms</th>${DAYS.map((_,i)=>`<th>${num(hrs(S_.filter(b=>b.day===i)))}</th>`).join('')}<th>${num(hrs(S_))}</th></tr></tfoot></table></div>`}}
