'use strict';
// Run with:  npm test
// Starts the server in a temporary folder and checks logins, permissions, saving, backups and recovery.
const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert');
const { startServer } = require('../server/server');

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ceit-test-'));
const pub = path.join(__dirname, '..', 'public');
let base, srv, pass = 0;
const ok = (name) => { pass++; console.log('  \u2713 ' + name); };

async function call(p, o = {}, token) {
  const h = {}; if (token) h.Authorization = 'Bearer ' + token;
  if (o.body !== undefined) h['Content-Type'] = 'application/json';
  const r = await fetch(base + p, { method: o.method || 'GET', headers: h, body: o.body !== undefined ? JSON.stringify(o.body) : undefined });
  const t = await r.text(); let j = null; try { j = JSON.parse(t); } catch (e) { /* not json */ }
  return { status: r.status, json: j, text: t, headers: r.headers };
}
const login = (u, p, mode) => call('/api/login', { method: 'POST', body: { username: u, password: p, mode } });

(async () => {
  console.log('CEIT Scheduler self-test');
  srv = await startServer({ dataDir: dir, publicDir: pub, preferredPort: 18484, log: () => {} });
  base = srv.localUrl;

  // ---- basics ----
  assert.strictEqual((await call('/api/ping')).json.app, 'ceit-scheduler'); ok('server answers /api/ping');
  const idx = await call('/'); assert.strictEqual(idx.status, 200); assert(idx.text.includes('Schedule Manager')); ok('login page is served');
  for (const f of ['assets/logo.png', 'favicon.ico', 'fonts/dm-sans-latin-400-normal.woff2', 'js/boot.js', 'css/style.css']) assert.strictEqual((await call('/' + f)).status, 200, f);
  ok('logo, favicon, offline fonts and scripts are served');
  assert.strictEqual((await call('/api/db')).status, 401); ok('database is closed without sign-in');

  // ---- public teacher list ----
  const tl = (await call('/api/teachers')).json;
  assert(tl.teachers.length === 15 && tl.adminDefault === true); assert(tl.teachers.every((t) => t.pw === 'teacher123'));
  assert(!JSON.stringify(tl).includes('s1$')); ok('teacher list shows only default passwords, never hashes');

  // ---- login rules ----
  assert.strictEqual((await login('admin', 'wrong', 'admin')).status, 401); ok('wrong password refused');
  const wrongMode = await login('admin', 'admin123', 'teacher'); assert.strictEqual(wrongMode.status, 403); ok('admin cannot sign in on the teacher tab');
  const A = (await login('admin', 'admin123', 'admin')).json; assert(A.token && A.role === 'admin'); ok('admin signs in');
  const T = (await login('paterno', 'teacher123', 'teacher')).json; assert(T.token && T.role === 'teacher'); ok('teacher signs in (username = surname)');
  const dm = (await call('/api/teachers')).json.teachers.find((t) => /DEL MUNDO/i.test(t.name)); assert.strictEqual(dm.username, 'delmundo'); ok('"Del Mundo" gets username delmundo');

  // ---- admin reads and saves ----
  let d = (await call('/api/db', {}, A.token)).json;
  assert(d.data.users.length === 16 && d.data.rooms.length === 6 && !JSON.stringify(d).includes('"pw"')); ok('admin gets everything, no password data');
  const room = d.data.rooms[0], prof = d.data.faculty[0];
  const cls = { id: 'c1', roomId: room.id, code: 'IT 111', name: 'Intro', course: 'BSIT', curr: 'Curriculum 2026-2027', year: '1', sem: '1st Sem', profId: prof.id, day: 0, start: 8, end: 11 };
  let r = await call('/api/db', { method: 'POST', body: { rev: d.rev, data: Object.assign({}, d.data, { schedules: [cls] }) } }, A.token);
  assert.strictEqual(r.status, 200); const rev2 = r.json.rev; assert(rev2 > d.rev); ok('admin saves a class');

  // ---- stale save is refused (two admins at once) ----
  r = await call('/api/db', { method: 'POST', body: { rev: d.rev, data: Object.assign({}, d.data, { schedules: [] }) } }, A.token);
  assert.strictEqual(r.status, 409); ok('an old copy cannot overwrite newer data (409)');

  // ---- bad data is refused ----
  d = (await call('/api/db', {}, A.token)).json;
  r = await call('/api/db', { method: 'POST', body: { rev: d.rev, data: Object.assign({}, d.data, { schedules: [Object.assign({}, cls, { id: 'c2', start: 25, end: 26 })] }) } }, A.token);
  assert.strictEqual(r.status, 400); ok('impossible class times are refused');
  r = await call('/api/db', { method: 'POST', body: { rev: d.rev, data: Object.assign({}, d.data, { users: d.data.users.filter((u) => u.role !== 'admin') }) } }, A.token);
  assert.strictEqual(r.status, 400); ok('the last admin cannot be removed');

  // ---- teacher is VIEW ONLY ----
  const td = (await call('/api/db', {}, T.token)).json;
  assert.strictEqual(td.data.users.length, 1); assert.strictEqual(td.data.faculty.length, 1); assert.strictEqual(td.data.schedules.length, 1); ok('teacher only receives their own schedule');
  const other = (await login('evangelista', 'teacher123', 'teacher')).json;
  assert.strictEqual((await call('/api/db', {}, other.token)).json.data.schedules.length, 0); ok('another teacher cannot see that class');
  for (const [m, p] of [['POST', '/api/db'], ['POST', '/api/export-ticket'], ['POST', '/api/import'], ['POST', '/api/reset'], ['GET', '/api/network'], ['GET', '/api/devices']]) {
    const x = await call(p, { method: m, body: m === 'POST' ? { rev: td.rev, data: {} } : undefined }, T.token);
    assert.strictEqual(x.status, 403, m + ' ' + p);
  }
  ok('teacher cannot save, export, import, reset or see network info / devices (403)');

  // ---- password change logs out old token, new one works ----
  d = (await call('/api/db', {}, A.token)).json;
  const users = d.data.users.map((u) => (u.username === 'paterno' ? Object.assign({}, u, { newPassword: 'newpass99' }) : u));
  r = await call('/api/db', { method: 'POST', body: { rev: d.rev, data: Object.assign({}, d.data, { users }) } }, A.token);
  assert.strictEqual(r.status, 200); assert.strictEqual(r.json.pwDefault[users.find((u) => u.username === 'paterno').id], false);
  assert.strictEqual((await login('paterno', 'teacher123', 'teacher')).status, 401);
  assert.strictEqual((await login('paterno', 'newpass99', 'teacher')).status, 200);
  assert.strictEqual((await call('/api/rev', {}, T.token)).status, 401); ok('password change works and ends the old session');
  assert(!(await call('/api/teachers')).json.teachers.find((t) => t.username === 'paterno').pw); ok('a changed password is no longer shown on the login page');

  // ---- login lock after many wrong tries ----
  let last; for (let i = 0; i < 9; i++) last = await login('evangelista', 'bad' + i, 'teacher');
  assert.strictEqual(last.status, 429); ok('too many wrong passwords = short lock (429)');

  // ---- sign-out security ----
  const SU = (await login('sulit', 'teacher123', 'teacher')).json;
  const kctl = new AbortController(); let kbuf = '';
  const kev = await fetch(base + '/api/events', { headers: { Authorization: 'Bearer ' + SU.token }, signal: kctl.signal });
  (async () => { const r3 = kev.body.getReader(), d3 = new TextDecoder(); try { for (;;) { const x = await r3.read(); if (x.done) { kbuf += '[closed]'; break; } kbuf += d3.decode(x.value); } } catch (e) { /* aborted */ } })();
  await new Promise((r2) => setTimeout(r2, 300));
  let kd = (await call('/api/db', {}, A.token)).json;
  const ku = kd.data.users.map((u) => (u.username === 'sulit' ? Object.assign({}, u, { newPassword: 'brandnew1' }) : u));
  assert.strictEqual((await call('/api/db', { method: 'POST', body: { rev: kd.rev, data: Object.assign({}, kd.data, { users: ku }) } }, A.token)).status, 200);
  await new Promise((r2) => setTimeout(r2, 400));
  assert(kbuf.includes('event: bye') && kbuf.includes('[closed]')); ok('a teacher whose password was changed is cut off from live updates at once');
  assert.strictEqual((await call('/api/rev', {}, SU.token)).status, 401); ok('...and the old sign-in no longer works');
  const LO = (await login('vasquez', 'teacher123', 'teacher')).json;
  assert.strictEqual((await call('/api/rev', {}, LO.token)).status, 200);
  assert.strictEqual((await call('/api/logout', { method: 'POST', body: {} }, LO.token)).status, 200);
  assert.strictEqual((await call('/api/rev', {}, LO.token)).status, 401); ok('logout really ends the sign-in on the server (stolen token is useless)');

  // ---- export / import (also the OLD browser format) ----
  const tk = (await call('/api/export-ticket', { method: 'POST', body: {} }, A.token)).json; assert(tk.url.startsWith('/api/export/'));
  const dl = await call(tk.url); assert.strictEqual(dl.status, 200); assert(/attachment/.test(dl.headers.get('content-disposition'))); const exp = dl.json; assert(exp.schedules.length === 1);
  assert.strictEqual((await call(tk.url)).status, 404); ok('export: one-time download link works once, then expires');
  const legacy = { theme: 'dark', ver: 4, sel: {}, hours: { 'IT 111': 3 }, schedules: [cls], rooms: d.data.rooms, faculty: d.data.faculty,
    users: [{ id: 'u1', name: 'Administrator', alias: 'sample', username: 'admin', password: 'oldadmin1', role: 'admin' }] };
  r = await call('/api/import', { method: 'POST', body: legacy }, A.token); assert.strictEqual(r.status, 200);
  assert.strictEqual((await login('admin', 'oldadmin1', 'admin')).status, 200); ok('old browser-version export imports (plain passwords get hashed)');
  const A2 = (await login('admin', 'oldadmin1', 'admin')).json;
  assert.strictEqual((await call('/api/import', { method: 'POST', body: { nope: 1 } }, A2.token)).status, 400); ok('a wrong file is refused');

  // ---- identity, device address, live events ----
  const ping = (await call('/api/ping')).json; assert(ping.app === 'ceit-scheduler' && ping.serverId.length >= 8 && ping.name); ok('ping returns the server id and name (apps use it to recognise the server)');
  assert.strictEqual((await call('/api/whoami')).json.ip, '127.0.0.1'); ok('server tells each device its own IP address');
  assert.strictEqual((await call('/api/events')).status, 401); ok('live events need a sign-in');
  const { probe, scan } = require('../shared/scan');
  const pr = await probe('127.0.0.1', srv.port, 1500); assert(pr.ok && pr.serverId === ping.serverId); ok('app-side probe recognises the server');
  const sc = await scan(srv.port, { timeout: 400 }); assert(sc.some((x) => x.serverId === ping.serverId)); ok('app-side LAN scan finds the server by itself');
  const events = []; const ctl = new AbortController();
  const ev = await fetch(base + '/api/events', { headers: { Authorization: 'Bearer ' + A2.token }, signal: ctl.signal });
  assert.strictEqual(ev.status, 200); assert(/text\/event-stream/.test(ev.headers.get('content-type')));
  const rd = ev.body.getReader(), dec = new TextDecoder(); let buf = '';
  (async () => { try { for (;;) { const x = await rd.read(); if (x.done) break; buf += dec.decode(x.value); } } catch (e) { /* aborted */ } })();
  await new Promise((r2) => setTimeout(r2, 300)); assert(buf.includes('event: hello'));
  const dv = (await call('/api/devices', {}, A2.token)).json.devices; assert(dv.length === 1 && dv[0].role === 'admin' && dv[0].ip === '127.0.0.1'); ok('live connection is listed as a connected device');
  let cur = (await call('/api/db', {}, A2.token)).json;
  await call('/api/db', { method: 'POST', body: { rev: cur.rev, data: Object.assign({}, cur.data, { rooms: cur.data.rooms.concat([{ id: 'rx', name: 'Sync Room' }]) }) } }, A2.token);
  await new Promise((r2) => setTimeout(r2, 300)); assert(buf.includes('event: rev')); ok('a save is pushed to connected devices at once');
  const before = buf.length; cur = (await call('/api/db', {}, A2.token)).json;
  const same = await call('/api/db', { method: 'POST', body: { rev: cur.rev, data: cur.data } }, A2.token);
  await new Promise((r2) => setTimeout(r2, 300)); assert.strictEqual(same.json.rev, cur.rev); assert.strictEqual(buf.length, before); ok('saving identical data changes nothing and stays quiet (no needless refresh)');
  ctl.abort(); await new Promise((r2) => setTimeout(r2, 200));
  assert.strictEqual((await call('/api/devices', {}, A2.token)).json.devices.length, 0); ok('device disappears from the list when it disconnects');

  // ---- files on disk ----
  const file = path.join(dir, 'ceit-db.json');
  assert(fs.existsSync(file) && fs.existsSync(file + '.bak')); assert(fs.readdirSync(path.join(dir, 'backups')).length >= 2);
  assert(!fs.readFileSync(file, 'utf8').includes('oldadmin1')); ok('one database file + backups exist, no plain passwords inside');

  // ---- restart keeps everything, tokens survive ----
  const tokenBefore = A2.token; await srv.close();
  srv = await startServer({ dataDir: dir, publicDir: pub, preferredPort: 18484, log: () => {} }); base = srv.localUrl;
  assert.strictEqual((await call('/api/rev', {}, tokenBefore)).status, 200);
  assert.strictEqual((await call('/api/db', {}, tokenBefore)).json.data.schedules.length, 1); ok('after a restart the data and sessions are still there');

  // ---- damaged file recovery ----
  await srv.close(); fs.writeFileSync(file, '{ this is not json');
  srv = await startServer({ dataDir: dir, publicDir: pub, preferredPort: 18484, log: () => {} }); base = srv.localUrl;
  const rec = await login('admin', 'oldadmin1', 'admin'); assert.strictEqual(rec.status, 200);
  assert.strictEqual((await call('/api/db', {}, rec.json.token)).json.data.schedules.length, 1); ok('a damaged database file is recovered automatically');

  // ---- same port, second start reuses the running app (one database only) ----
  const again = await startServer({ dataDir: fs.mkdtempSync(path.join(os.tmpdir(), 'ceit-test2-')), publicDir: pub, preferredPort: 18484, log: () => {} });
  assert(again.reused && again.port === 18484); ok('starting twice reuses the running server (no second database)');

  // ---- port busy by another program -> next port ----
  const net = require('net'); const blocker = net.createServer().listen(18500, '0.0.0.0'); await new Promise((r2) => blocker.once('listening', r2));
  const alt = await startServer({ dataDir: fs.mkdtempSync(path.join(os.tmpdir(), 'ceit-test3-')), publicDir: pub, preferredPort: 18500, log: () => {} });
  assert.strictEqual(alt.port, 18501); await alt.close(); blocker.close(); ok('a busy port moves to the next free one');

  await srv.close();
  fs.rmSync(dir, { recursive: true, force: true });
  console.log('\nAll ' + pass + ' checks passed.');
  process.exit(0);
})().catch((e) => { console.error('\nFAILED:', e && e.stack || e); process.exit(1); });
