'use strict';
/*
 * CEIT Scheduler - SERVER (runs only on the server laptop).
 * Serves the web app from /public and the API under /api.
 * Listens on all network cards (0.0.0.0) so every device on the same Wi-Fi / LAN can reach it:
 *   - any browser (website)       - the PC app (exe)       - the Android app (apk)
 *
 * Permissions are checked HERE (not only in the screens):
 *   admin   -> can read and change everything
 *   teacher -> can only read their own schedule. Any write is refused with 403.
 *
 * Live sync: every signed-in device keeps a small "events" connection open (/api/events).
 * When anything is saved, the server tells every device straight away, so all screens update by themselves.
 */
const express = require('express');
const http = require('http');
const os = require('os');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const QRCode = require('qrcode');
const netinfo = require('../shared/netinfo');
const { Store, seed, normalize, applyAdminData, checkPw, DUMMY_HASH, DEFAULT_TEACHER_PW } = require('./db');
const { Auth } = require('./auth');

const APP_ID = 'ceit-scheduler';
const VERSION = require('../package.json').version;

const cleanName = (n) => String(n || '').replace(/^\s*\((?:FT|PT)\)\s*-?\s*/i, '').trim();
const cleanIp = (a) => String(a || '').replace(/^::ffff:/, '');

function lanUrls(port) {
  return netinfo.list().map((i) => ({ url: 'http://' + i.ip + ':' + port, ip: i.ip, adapter: i.name, kind: i.kind, label: i.label, priv: i.priv }));
}

// The server remembers its own identity, so apps can recognise it even if its IP address changes.
function loadIdentity(dir) {
  const f = path.join(dir, 'server.json');
  let id = {};
  try { id = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { /* first run */ }
  if (!id.id) { id.id = crypto.randomBytes(8).toString('hex'); }
  if (process.env.CEIT_SERVER_NAME) id.name = process.env.CEIT_SERVER_NAME;
  if (!id.name) id.name = os.hostname();
  try { fs.writeFileSync(f, JSON.stringify(id, null, 1)); } catch (e) { /* ignore */ }
  return id;
}

const canon = (v) => (Array.isArray(v) ? v.map(canon) : v && typeof v === 'object' ? Object.keys(v).sort().reduce((o, k) => { if (v[k] !== undefined) o[k] = canon(v[k]); return o; }, {}) : v);
const sameData = (a, b) => {
  const pick = (d) => canon({ rooms: d.rooms, faculty: d.faculty, schedules: d.schedules, hours: d.hours, users: d.users });
  return JSON.stringify(pick(a)) === JSON.stringify(pick(b));
};
const deviceKind = (ua) => {
  ua = String(ua || '');
  if (/CEITApp\/\S+ Android/.test(ua)) return 'Android app';
  if (/CEITApp\/\S+ Windows/.test(ua)) return 'PC app';
  if (/Android|iPhone|iPad|Mobile/.test(ua)) return 'Phone browser';
  return 'Browser';
};

function createApp({ dataDir, publicDir, log, getPort }) {
  fs.mkdirSync(dataDir, { recursive: true });
  const store = new Store(dataDir, log);
  const auth = new Auth(dataDir);
  const identity = loadIdentity(dataDir);
  const app = express();
  app.disable('x-powered-by');

  const tickets = new Map(); // one-time download links (export)
  const clients = new Map(); // live connections: id -> { res, user, ip, kind, since }
  let clientSeq = 0;

  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'");
    if (req.path.startsWith('/api/')) res.setHeader('Cache-Control', 'no-store');
    next();
  });
  app.use(express.json({ limit: '10mb' }));

  const wrap = (fn) => (req, res) => {
    try { fn(req, res); } catch (e) {
      const status = e.status || 500;
      if (status >= 500) log('API error: ' + (e.stack || e.message));
      res.status(status).json({ error: status >= 500 ? 'Server problem. Please try again.' : e.message });
    }
  };
  const needUser = (req, res, next) => {
    const h = req.headers.authorization || '';
    const u = auth.verify(h.startsWith('Bearer ') ? h.slice(7) : '', store.db.users);
    if (!u) return res.status(401).json({ error: 'Please sign in again' });
    req.user = u; req.token = h.slice(7); next();
  };
  const needAdmin = (req, res, next) => needUser(req, res, () => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Only the admin can do this' });
    next();
  });
  const whoName = (u) => {
    if (u.role === 'teacher') { const f = store.db.faculty.find((x) => x.id === u.profId); return cleanName(f ? f.name : u.name); }
    return u.alias || u.name;
  };
  const pubUser = (u) => {
    const o = { id: u.id, name: u.name, username: u.username, role: u.role, pwDefault: !!u.pwDefault };
    if (u.role === 'admin') o.alias = u.alias || ''; else o.profId = u.profId || '';
    return o;
  };

  // ---------- live sync ----------
  const sse = (res, event, data) => { try { res.write('event: ' + event + '\ndata: ' + JSON.stringify(data) + '\n\n'); } catch (e) { /* closed */ } };
  // sign out devices whose account was deleted or whose password changed (they would otherwise stay connected)
  const kick = () => {
    for (const c of clients.values()) {
      const u = store.db.users.find((x) => x.id === c.user.id);
      if (!u || auth.stamp(u) !== c.stamp) { sse(c.res, 'bye', { reason: 'signed-out' }); try { c.res.end(); } catch (e) { /* ignore */ } }
    }
  };
  const broadcast = (rev) => { kick(); for (const c of clients.values()) sse(c.res, 'rev', { rev, time: Date.now() }); };

  app.get('/api/events', needUser, (req, res) => {
    req.socket.setTimeout(0); req.socket.setNoDelay(true);
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-transform', Connection: 'keep-alive', 'X-Accel-Buffering': 'no' });
    const id = ++clientSeq;
    const c = { res, ip: cleanIp(req.socket.remoteAddress), kind: deviceKind(req.headers['user-agent']), since: Date.now(), user: req.user, token: req.token, stamp: auth.stamp(req.user) };
    clients.set(id, c);
    log('Connected: ' + whoName(req.user) + ' (' + req.user.role + ') \u2013 ' + c.kind + ' ' + c.ip + '  [' + clients.size + ' online]');
    res.write('retry: 3000\n\n');
    sse(res, 'hello', { rev: store.db.rev, time: Date.now(), serverId: identity.id, name: identity.name });
    const hb = setInterval(() => { try { res.write(': hb ' + Date.now() + '\n\n'); } catch (e) { /* closed */ } }, 10000);
    const gone = () => { if (clients.delete(id)) { clearInterval(hb); log('Disconnected: ' + whoName(c.user) + ' \u2013 ' + c.kind + ' ' + c.ip + '  [' + clients.size + ' online]'); } };
    req.on('close', gone); res.on('error', gone);
  });

  app.get('/api/devices', needAdmin, (req, res) => {
    res.json({ devices: [...clients.values()].map((c) => ({ ip: c.ip, kind: c.kind, role: c.user.role, name: whoName(c.user), since: c.since })) });
  });

  // ---------- public ----------
  app.get('/api/ping', (req, res) => res.json({ app: APP_ID, version: VERSION, serverId: identity.id, name: identity.name, time: Date.now() }));
  app.get('/api/whoami', (req, res) => res.json({ ip: cleanIp(req.socket.remoteAddress), time: Date.now() }));

  // teacher list for the sign-in screen. A password is only shown while it is still the default one.
  app.get('/api/teachers', (req, res) => {
    const d = store.db;
    const teachers = d.users.filter((u) => u.role === 'teacher').map((u) => ({
      name: whoName(u), username: u.username, pw: u.pwDefault ? DEFAULT_TEACHER_PW : null,
    })).sort((a, b) => a.name.localeCompare(b.name));
    res.json({ teachers, adminDefault: d.users.some((u) => u.role === 'admin' && u.pwDefault) });
  });

  app.post('/api/login', wrap((req, res) => {
    const { username, password, mode } = req.body || {};
    if (typeof username !== 'string' || typeof password !== 'string' || !username.trim() || !password) {
      return res.status(400).json({ error: 'Enter your username and password' });
    }
    const key = cleanIp(req.socket.remoteAddress) + '|' + username.trim().toLowerCase();
    const wait = auth.blocked(key);
    if (wait) return res.status(429).json({ error: 'Too many wrong tries. Please wait ' + wait + ' seconds.' });
    const u = store.db.users.find((x) => x.username.toLowerCase() === username.trim().toLowerCase());
    const ok = checkPw(u ? u.pw : DUMMY_HASH, password) && !!u;
    if (!ok) { auth.fail(key); return res.status(401).json({ error: 'Invalid username or password' }); }
    auth.clear(key);
    if (mode && u.role !== mode) {
      return res.status(403).json({ error: u.role === 'teacher' ? 'That is a teacher account \u2014 tap \u201cTeacher? Sign in here\u201d below.' : 'That is an admin account \u2014 tap \u201cAdmin sign in\u201d below.' });
    }
    if (u.role === 'teacher' && !store.db.faculty.some((f) => f.id === u.profId)) {
      return res.status(403).json({ error: 'This login is not linked to a professor yet. Please ask the admin.' });
    }
    log('Sign in: ' + whoName(u) + ' (' + u.role + ') from ' + cleanIp(req.socket.remoteAddress));
    res.json({ token: auth.sign(u), role: u.role, name: whoName(u) });
  }));

  // ---------- signed in ----------
  app.get('/api/rev', needUser, (req, res) => res.json({ rev: store.db.rev }));

  app.get('/api/db', needUser, wrap((req, res) => {
    const d = store.db, u = req.user;
    let data;
    if (u.role === 'admin') {
      data = { rooms: d.rooms, faculty: d.faculty, schedules: d.schedules, hours: d.hours, users: d.users.map(pubUser) };
    } else { // teacher: read-only and only their own classes
      const f = d.faculty.find((x) => x.id === u.profId);
      data = { rooms: d.rooms, faculty: f ? [f] : [], schedules: f ? d.schedules.filter((s) => s.profId === f.id) : [], hours: {}, users: [pubUser(u)] };
    }
    res.json({ rev: d.rev, meId: u.id, data });
  }));

  app.post('/api/db', needAdmin, wrap((req, res) => {
    const { rev, data } = req.body || {};
    if (rev !== store.db.rev) return res.status(409).json({ error: 'Another admin changed the data. Reloading\u2026', rev: store.db.rev });
    const next = applyAdminData(store.db, data);
    let newRev = store.db.rev;
    if (!sameData(next, store.db)) { // nothing really changed (e.g. only a dropdown moved): do not bother the other devices
      newRev = store.commit(next);
      log('Saved by ' + whoName(req.user) + ' from ' + cleanIp(req.socket.remoteAddress) + ' (version ' + newRev + ')');
      broadcast(newRev);
    }
    const cur = store.db.users.find((x) => x.id === req.user.id);
    const pwDefault = {};
    store.db.users.forEach((x) => { pwDefault[x.id] = !!x.pwDefault; });
    res.json({ rev: newRev, pwDefault, token: cur ? auth.sign(cur) : undefined });
  }));

  app.post('/api/logout', needUser, (req, res) => {
    auth.revoke(req.token);
    for (const c of clients.values()) if (c.token === req.token) { try { c.res.end(); } catch (e) { /* ignore */ } }
    log('Sign out: ' + whoName(req.user));
    res.json({ ok: true });
  });

  // download links: the page asks for a one-time link, then the browser / app downloads it like a normal file
  app.post('/api/export-ticket', needAdmin, (req, res) => {
    const t = crypto.randomBytes(18).toString('hex');
    tickets.set(t, Date.now() + 60e3);
    for (const [k, v] of tickets) if (v < Date.now()) tickets.delete(k);
    res.json({ url: '/api/export/' + t });
  });
  app.get('/api/export/:t', (req, res) => {
    const exp = tickets.get(req.params.t);
    tickets.delete(req.params.t);
    if (!exp || exp < Date.now()) return res.status(404).type('text').send('This download link has expired. Go back and tap Export JSON again.');
    const day = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="ceit-scheduler-backup-' + day + '.json"');
    res.send(JSON.stringify(Object.assign({}, store.db, { dropped: undefined }), null, 1));
  });

  app.post('/api/import', needAdmin, wrap((req, res) => {
    const next = normalize(req.body, { requireAdmin: true });
    const dropped = next.dropped; delete next.dropped;
    store.backup('before-import', true);
    const rev = store.commit(next);
    log('Data imported by ' + whoName(req.user));
    broadcast(rev);
    res.json({ ok: true, rev, dropped });
  }));

  app.post('/api/reset', needAdmin, wrap((req, res) => {
    store.backup('before-reset', true);
    const rev = store.commit(seed());
    log('Data reset by ' + whoName(req.user));
    broadcast(rev);
    res.json({ ok: true, rev });
  }));

  app.get('/api/network', needAdmin, wrap((req, res) => {
    const port = getPort();
    res.json({ port, urls: lanUrls(port), hostname: os.hostname(), serverId: identity.id, name: identity.name, dataFile: store.file, backupDir: store.backupDir, version: VERSION, online: clients.size });
  }));

  app.get('/api/qr', needAdmin, (req, res) => {
    const t = String(req.query.text || '');
    if (!/^https?:\/\/[\w.\-:]+(\/\S*)?$/.test(t) || t.length > 150) return res.status(400).json({ error: 'Bad link' });
    QRCode.toString(t, { type: 'svg', margin: 1, errorCorrectionLevel: 'M' }, (err, svg) => {
      if (err) return res.status(500).json({ error: 'QR failed' });
      res.type('image/svg+xml').send(svg);
    });
  });

  app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

  app.use(express.static(publicDir, {
    etag: true,
    setHeaders: (res, p) => {
      if (/\.(html|js|css)$/i.test(p)) res.setHeader('Cache-Control', 'no-cache');
      else res.setHeader('Cache-Control', 'public, max-age=86400');
    },
  }));

  // JSON problems (bad body, too large) -> clean message instead of an HTML error page
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    const status = err.status || err.statusCode || 500;
    if (status >= 500) log('Error: ' + (err.stack || err.message));
    res.status(status).json({ error: status === 413 ? 'The file is too big' : status >= 500 ? 'Server problem' : 'Bad request' });
  });

  return { app, store, auth, identity, clients };
}

function probe(port) {
  return new Promise((resolve) => {
    const r = http.get({ host: '127.0.0.1', port, path: '/api/ping', timeout: 1500 }, (res) => {
      let b = '';
      res.on('data', (c) => { b += c; if (b.length > 2000) res.destroy(); });
      res.on('end', () => { try { resolve(JSON.parse(b).app === APP_ID); } catch (e) { resolve(false); } });
    });
    r.on('error', () => resolve(false));
    r.on('timeout', () => { r.destroy(); resolve(false); });
  });
}

function listen(server, port, host) {
  return new Promise((resolve, reject) => {
    const onErr = (e) => { server.removeListener('listening', onOk); reject(e); };
    const onOk = () => { server.removeListener('error', onErr); resolve(); };
    server.once('error', onErr); server.once('listening', onOk);
    server.listen(port, host);
  });
}

/*
 * Start the server. If our own server already answers on the preferred port, it is reused (so there is
 * only ever ONE database on the network). If another program uses the port, the next free port is taken.
 */
async function startServer(opts) {
  const { dataDir, publicDir, preferredPort = 8484, host = '0.0.0.0', log = () => {} } = opts;
  if (await probe(preferredPort)) {
    log('CEIT Scheduler server is already running on port ' + preferredPort + ' - using it');
    return { reused: true, port: preferredPort, localUrl: 'http://127.0.0.1:' + preferredPort, urls: lanUrls(preferredPort), close: async () => {} };
  }
  let port = preferredPort;
  const ctx = createApp({ dataDir, publicDir, log, getPort: () => port });
  const server = http.createServer(ctx.app);
  server.keepAliveTimeout = 5000;
  let lastErr;
  for (let i = 0; i < 25; i++) {
    port = preferredPort + i;
    try { await listen(server, port, host); lastErr = null; break; }
    catch (e) { lastErr = e; if (e.code !== 'EADDRINUSE' && e.code !== 'EACCES') throw e; }
  }
  if (lastErr) throw new Error('No free port found near ' + preferredPort + ' (' + lastErr.code + ')');
  log('Server running on port ' + port + ' | data: ' + ctx.store.file);
  return {
    reused: false, port, store: ctx.store, identity: ctx.identity, clients: ctx.clients, localUrl: 'http://127.0.0.1:' + port, urls: lanUrls(port),
    close: () => new Promise((r) => { server.close(() => r()); for (const c of ctx.clients.values()) { try { c.res.end(); } catch (e) { /* ignore */ } } if (server.closeAllConnections) server.closeAllConnections(); }),
  };
}

module.exports = { startServer, lanUrls, createApp };
