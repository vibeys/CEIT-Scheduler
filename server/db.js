'use strict';
/*
 * CEIT Scheduler - database module.
 * ONE database file lives on the host computer: <dataDir>/ceit-db.json
 * - every write is atomic (temp file -> rename), so a power cut cannot half-write the file
 * - the previous version is kept as ceit-db.json.bak
 * - timed backups go to <dataDir>/backups (newest 40 are kept)
 * - if the file is ever damaged, the server recovers from .bak or the newest backup
 * - passwords are stored as salted scrypt hashes (never as plain text)
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DEFAULT_TEACHER_PW = 'teacher123';
const DEFAULT_ADMIN_PW = 'admin123';
const DB_VER = 5;
const START_H = 7, END_H = 20;

const uid = (p) => p + Date.now().toString(36) + crypto.randomBytes(3).toString('hex');
const str = (v, max) => (typeof v === 'string' ? v.slice(0, max) : '');

// ---------- passwords ----------
function hashPw(pw) {
  const salt = crypto.randomBytes(16);
  const h = crypto.scryptSync(String(pw), salt, 32);
  return 's1$' + salt.toString('hex') + '$' + h.toString('hex');
}
function checkPw(stored, pw) {
  try {
    const [v, s, h] = String(stored).split('$');
    if (v !== 's1') return false;
    const a = Buffer.from(h, 'hex');
    const b = crypto.scryptSync(String(pw), Buffer.from(s, 'hex'), a.length);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch (e) { return false; }
}
const DUMMY_HASH = hashPw('not-a-real-password');
function setPassword(u, pw) {
  u.pw = hashPw(pw);
  u.pwDefault = u.role === 'teacher' ? pw === DEFAULT_TEACHER_PW : pw === DEFAULT_ADMIN_PW;
}

// ---------- teacher logins (username = surname) ----------
const TITLES = ['MR', 'MRS', 'MS', 'ENGR', 'DR', 'PROF', 'ATTY', 'ARCH'];
const PART = ['DEL', 'DE', 'DELA', 'DELOS', 'DELAS', 'SAN', 'SANTA', 'VAN', 'VON'];
const nameParts = (n) => String(n).replace(/\([^)]*\)/g, ' ').replace(/[^A-Za-z\s]/g, ' ').toUpperCase().split(/\s+/).filter((w) => w && !TITLES.includes(w));
const surname = (n) => {
  const t = nameParts(n), l = t[t.length - 1] || '';
  return (t.length > 1 && PART.includes(t[t.length - 2]) ? t[t.length - 2] : '') + l;
};
function makeTeacherLogin(db, f, pw) {
  const t = nameParts(f.name), sur = surname(f.name).toLowerCase() || 'teacher';
  const dup = db.faculty.some((o) => o.id !== f.id && surname(o.name).toLowerCase() === sur);
  const base = dup && t[0] ? t[0][0].toLowerCase() + sur : sur;
  let n = base, k = 2;
  while (db.users.some((u) => u.username.toLowerCase() === n)) n = base + k++;
  const u = { id: uid('u'), name: f.name, username: n, role: 'teacher', profId: f.id };
  setPassword(u, pw || DEFAULT_TEACHER_PW);
  db.users.push(u);
  return u;
}

// ---------- seed data ----------
function seed() {
  const db = {
    ver: DB_VER, rev: 1, schedules: [], hours: {}, users: [],
    rooms: ['Mikrotik Laboratory', 'Electronics and Circuits Laboratory', 'CEIT Lecture Room', 'Drawing Laboratory', 'Mac Laboratory', 'Computer Laboratory'].map((name, i) => ({ id: 'r' + (i + 1), name })),
    faculty: ['(FT) MRS. ALICIA D. PATERNO', '(FT) - ENGR. JOEY EVANGELISTA', '(FT) - MRS. AILEEN L. VASQUEZ', '(FT) - ENGR. REGINALDO BELZA', '(PT) - ENGR. MA. DOLORES J. LASCO', '(PT) - ENGR. ROSEMARIE C. QUIACHON', '(PT) - ENGR. FRANCIS I. SULIT', '(PT) - ENGR. JENNY H. DEL MUNDO', '(PT) - MR. CASEY FRANCISCO', '(PT) - ENGR. JOHN DENNIS ESPIRITU', '(PT) - ENGR. GLOREN S. FUENTES', '(PT) - DR. IAN BOOTS BAUTISTA', '(PT) - ENGR. ACE VALDEZ', '(PT) - ENGR. DARWIN L. FRANCISCO', '(PT) - Mr. Renato Lampano'].map((name, i) => ({ id: 'p' + (i + 1), name })),
  };
  const admin = { id: 'u1', name: 'Administrator', alias: 'sample', username: 'admin', role: 'admin' };
  setPassword(admin, DEFAULT_ADMIN_PW);
  db.users.push(admin);
  db.faculty.forEach((f) => makeTeacherLogin(db, f));
  return db;
}

// ---------- validation helpers ----------
function bad(msg) { const e = new Error(msg); e.status = 400; return e; }

function cleanNamed(list, what, max) {
  if (!Array.isArray(list)) throw bad('Invalid ' + what + ' list');
  if (list.length > max) throw bad('Too many ' + what);
  const seen = new Set(), out = [];
  for (const x of list) {
    const id = str(x && x.id, 64), name = str(x && x.name, 160).trim();
    if (!id || !name) throw bad('Every ' + what + ' needs a name');
    if (seen.has(id)) throw bad('Duplicate ' + what);
    seen.add(id);
    out.push({ id, name });
  }
  return out;
}

const half = (v) => typeof v === 'number' && isFinite(v) && Math.abs(v * 2 - Math.round(v * 2)) < 1e-9;
function cleanSchedule(s, roomIds, profIds) {
  if (!s || typeof s !== 'object') return null;
  const id = str(s.id, 64);
  const day = s.day, start = s.start, end = s.end;
  if (!id || !roomIds.has(s.roomId)) return null;
  if (!Number.isInteger(day) || day < 0 || day > 5) return null;
  if (!half(start) || !half(end) || start < START_H || end > END_H || end <= start) return null;
  return {
    id, roomId: s.roomId,
    code: str(s.code, 40), name: str(s.name, 200), course: str(s.course, 20), curr: str(s.curr, 60),
    year: String(s.year == null ? '' : s.year).slice(0, 4), sem: str(s.sem, 20),
    profId: profIds.has(s.profId) ? s.profId : '', day, start, end,
  };
}
function cleanSchedules(list, roomIds, profIds, strict) {
  if (!Array.isArray(list)) throw bad('Invalid schedule list');
  if (list.length > 20000) throw bad('Too many classes');
  const out = [], ids = new Set();
  let dropped = 0;
  for (const s of list) {
    const c = cleanSchedule(s, roomIds, profIds);
    if (!c || ids.has(c.id)) { dropped++; continue; }
    ids.add(c.id); out.push(c);
  }
  if (strict && dropped) throw bad('Some classes had invalid data (' + dropped + ')');
  return { list: out, dropped };
}
function cleanHours(h) {
  const out = {};
  if (h && typeof h === 'object') {
    for (const k of Object.keys(h).slice(0, 2000)) {
      if (half(h[k]) && h[k] >= 0.5 && h[k] <= 13) out[str(k, 40)] = h[k];
    }
  }
  return out;
}

// Turn ANY db-shaped object (fresh file, old export from the browser version, etc.) into a clean current db.
function normalize(raw, opts) {
  opts = opts || {};
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.users) || !Array.isArray(raw.rooms)) throw bad('Invalid data file');
  const rooms = cleanNamed(raw.rooms, 'room', 500);
  const faculty = cleanNamed(Array.isArray(raw.faculty) ? raw.faculty : [], 'faculty', 5000);
  const roomIds = new Set(rooms.map((r) => r.id)), profIds = new Set(faculty.map((f) => f.id));
  const sc = cleanSchedules(Array.isArray(raw.schedules) ? raw.schedules : [], roomIds, profIds, false);

  const users = [], names = new Set();
  for (const u of raw.users) {
    if (!u || typeof u !== 'object') continue;
    const username = str(u.username, 40).trim();
    if (!username || names.has(username.toLowerCase())) continue;
    names.add(username.toLowerCase());
    const role = u.role === 'admin' ? 'admin' : 'teacher';
    const rec = { id: str(u.id, 64) || uid('u'), name: str(u.name, 160), username, role };
    if (role === 'admin') rec.alias = str(u.alias, 60);
    else rec.profId = profIds.has(u.profId) ? u.profId : '';
    if (typeof u.pw === 'string' && u.pw.startsWith('s1$')) { rec.pw = u.pw; rec.pwDefault = !!u.pwDefault; }
    else if (typeof u.password === 'string' && u.password) setPassword(rec, u.password); // old browser export
    else continue;
    users.push(rec);
  }
  // the old shared "teacher / teacher123" login is replaced by one login per professor
  const cleaned = users.filter((u) => !(u.role === 'teacher' && !u.profId && u.username === 'teacher'));
  const db = { ver: DB_VER, rev: Number.isInteger(raw.rev) ? raw.rev : 1, rooms, faculty, schedules: sc.list, hours: cleanHours(raw.hours), users: cleaned };
  if (!db.users.some((u) => u.role === 'admin')) {
    if (opts.requireAdmin) throw bad('The data file has no admin account');
    const a = { id: uid('u'), name: 'Administrator', alias: 'sample', username: 'admin', role: 'admin' };
    let n = 'admin', k = 2; while (db.users.some((u) => u.username.toLowerCase() === n)) n = 'admin' + k++;
    a.username = n; setPassword(a, DEFAULT_ADMIN_PW); db.users.push(a);
  }
  // only very old data (before one-login-per-professor) gets logins created for it; later, deleting a login stays deleted
  if ((raw.ver || 0) < 4) db.faculty.forEach((f) => { if (!db.users.some((u) => u.profId === f.id)) makeTeacherLogin(db, f); });
  db.dropped = sc.dropped;
  return db;
}

// Apply the data an admin screen sends us on top of the current database.
function applyAdminData(cur, data) {
  if (!data || typeof data !== 'object') throw bad('Bad data');
  const rooms = cleanNamed(data.rooms, 'room', 500);
  const faculty = cleanNamed(data.faculty, 'faculty', 5000);
  const roomIds = new Set(rooms.map((r) => r.id)), profIds = new Set(faculty.map((f) => f.id));
  // classes in a deleted room are removed together with the room; everything else must be valid
  const sched = cleanSchedules((Array.isArray(data.schedules) ? data.schedules : []).filter((s) => s && roomIds.has(s.roomId)), roomIds, profIds, true);
  if (!Array.isArray(data.users)) throw bad('Invalid account list');
  const users = [], names = new Set();
  for (const u of data.users) {
    const id = str(u && u.id, 64), username = str(u && u.username, 40).trim();
    if (!id || !username) throw bad('Every account needs a username');
    if (names.has(username.toLowerCase())) throw bad('Username "' + username + '" already exists');
    names.add(username.toLowerCase());
    const role = u.role === 'admin' ? 'admin' : 'teacher';
    const old = cur.users.find((x) => x.id === id && x.role === role);
    const rec = { id, name: str(u.name, 160), username, role };
    if (role === 'admin') rec.alias = str(u.alias, 60);
    else rec.profId = profIds.has(u.profId) ? u.profId : '';
    const np = typeof u.newPassword === 'string' ? u.newPassword.trim() : '';
    if (np) {
      if (np.length < 4) throw bad('Password must be at least 4 characters');
      if (np.length > 100) throw bad('Password is too long');
      setPassword(rec, np);
    } else if (old) { rec.pw = old.pw; rec.pwDefault = old.pwDefault; }
    else throw bad('A new account needs a password');
    users.push(rec);
  }
  if (!users.some((u) => u.role === 'admin')) throw bad('At least one admin account is required');
  return { ver: DB_VER, rev: cur.rev, rooms, faculty, schedules: sched.list, hours: cleanHours(data.hours), users };
}

// ---------- storage ----------
function sleepSync(ms) { try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); } catch (e) { /* ignore */ } }
const stamp = () => new Date().toISOString().replace(/[-:]/g, '').replace('T', '-').slice(0, 15);

class Store {
  constructor(dir, log) {
    this.dir = dir; this.log = log || (() => {});
    this.file = path.join(dir, 'ceit-db.json');
    this.backupDir = path.join(dir, 'backups');
    fs.mkdirSync(this.backupDir, { recursive: true });
    this.lastBackup = 0;
    this.db = this._load();
    this.backup('start');
  }
  _readFile(f) { return normalize(JSON.parse(fs.readFileSync(f, 'utf8'))); }
  _load() {
    if (fs.existsSync(this.file)) {
      try { return this._readFile(this.file); }
      catch (e) {
        this.log('Database file is damaged (' + e.message + ') - trying to recover');
        try { fs.renameSync(this.file, path.join(this.dir, 'ceit-db.damaged-' + stamp() + '.json')); } catch (x) { /* ignore */ }
      }
    }
    // recover from the newest good copy (highest revision number wins)
    const candidates = [this.file + '.bak'];
    try {
      fs.readdirSync(this.backupDir).filter((n) => n.endsWith('.json')).forEach((n) => candidates.push(path.join(this.backupDir, n)));
    } catch (e) { /* ignore */ }
    let best = null, from = '';
    for (const c of candidates) {
      if (!fs.existsSync(c)) continue;
      try { const db = this._readFile(c); if (!best || db.rev > best.rev) { best = db; from = c; } }
      catch (e) { /* try next */ }
    }
    if (best) { this.log('Recovered database from ' + from); this.db = best; this._write(); return best; }
    this.log('Creating a new database');
    const db = seed(); this.db = db; this._write();
    return db;
  }
  _write() {
    const tmp = this.file + '.tmp';
    const data = JSON.stringify(Object.assign({}, this.db, { dropped: undefined }), null, 1);
    const fd = fs.openSync(tmp, 'w');
    try { fs.writeSync(fd, data); fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
    try { if (fs.existsSync(this.file)) fs.copyFileSync(this.file, this.file + '.bak'); } catch (e) { /* ignore */ }
    let lastErr;
    for (let i = 0; i < 8; i++) {
      try { fs.renameSync(tmp, this.file); return; }
      catch (e) { lastErr = e; sleepSync(30 * (i + 1)); } // Windows: antivirus may hold the file for a moment
    }
    throw lastErr;
  }
  backup(tag, force) {
    const now = Date.now();
    if (!force && now - this.lastBackup < 15 * 60 * 1000) return;
    try {
      if (!fs.existsSync(this.file)) return;
      fs.copyFileSync(this.file, path.join(this.backupDir, 'ceit-db-' + stamp() + '-' + tag + '.json'));
      this.lastBackup = now;
      const all = fs.readdirSync(this.backupDir).filter((n) => n.endsWith('.json')).sort();
      all.slice(0, Math.max(0, all.length - 40)).forEach((n) => { try { fs.unlinkSync(path.join(this.backupDir, n)); } catch (e) { /* ignore */ } });
    } catch (e) { this.log('Backup failed: ' + e.message); }
  }
  // replace the whole database; revision always goes up
  commit(next) {
    next.rev = (this.db.rev || 0) + 1;
    this.db = next;
    this._write();
    this.backup('auto');
    return next.rev;
  }
}

module.exports = {
  Store, seed, normalize, applyAdminData, makeTeacherLogin, setPassword, checkPw, hashPw, DUMMY_HASH, uid, bad,
  DEFAULT_TEACHER_PW, DEFAULT_ADMIN_PW, DB_VER,
};
