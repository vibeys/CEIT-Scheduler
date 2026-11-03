'use strict';
/*
 * CEIT Scheduler - PC APP (client).
 * This program does NOT run a server and has no database. It only:
 *   1. looks for the CEIT server on your Wi-Fi / LAN (or uses the one it remembers)
 *   2. opens it in a window, with the "connected to ..." bar at the top
 * The server runs on ONE laptop only (npm start in VS Code).
 */
const { app, BrowserWindow, Menu, ipcMain, session } = require('electron');
const path = require('path');
const fs = require('fs');
const net = require('./lib/netinfo');
const { scan, probe } = require('./lib/scan');

const PORT = parseInt(process.env.CEIT_PORT, 10) || 8484;
const VERSION = require('./package.json').version;
const CONNECT = path.join(__dirname, 'ui', 'connect.html');
const ICON = path.join(__dirname, 'assets', 'icon.png');

app.disableHardwareAcceleration(); // avoids blank windows on old PCs / bad graphics drivers
app.setAppUserModelId('com.ceit.scheduler');

let win = null, origin = '';
const cfgFile = () => path.join(app.getPath('userData'), 'client.json');
const loadCfg = () => { try { return JSON.parse(fs.readFileSync(cfgFile(), 'utf8')); } catch (e) { return {}; } };
const saveCfg = (c) => { try { fs.mkdirSync(path.dirname(cfgFile()), { recursive: true }); fs.writeFileSync(cfgFile(), JSON.stringify(c, null, 1)); } catch (e) { /* ignore */ } };

if (!app.requestSingleInstanceLock()) { app.quit(); }
else {
  app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.show(); win.focus(); } });
  app.whenReady().then(start);
}

function showConnect(query) { origin = ''; return win.loadFile(CONNECT, { query: query || {} }); }

function start() {
  session.defaultSession.setPermissionRequestHandler((wc, perm, cb) => cb(false));
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    { label: 'App', submenu: [
      { label: 'Change server\u2026', accelerator: 'CmdOrCtrl+Shift+S', click: () => showConnect({ change: '1' }) },
      { role: 'reload' }, { role: 'forceReload' }, { type: 'separator' },
      { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' }, { role: 'togglefullscreen' }, { type: 'separator' },
      { label: 'Quit', role: 'quit' },
    ] },
  ]));
  win = new BrowserWindow({
    width: 1280, height: 860, minWidth: 360, minHeight: 520, title: 'CEIT Scheduler', icon: ICON,
    backgroundColor: '#f1ece3', show: false, autoHideMenuBar: true,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true, spellcheck: false },
  });
  win.webContents.setUserAgent(win.webContents.getUserAgent() + ' CEITApp/' + VERSION + ' Windows');
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', (e, url) => {
    let ok = false;
    try { const u = new URL(url); ok = (u.protocol === 'file:' && decodeURI(u.pathname).replace(/\\/g, '/').toLowerCase().includes('/ui/connect.html')) || (origin && u.origin === origin); } catch (x) { /* blocked */ }
    if (!ok) e.preventDefault();
  });
  // server went away while loading a page -> back to the connect screen (it searches again by itself)
  win.webContents.on('did-fail-load', (e, code, desc, url, isMain) => {
    if (!isMain || code === -3 || !origin) return;
    showConnect({ reason: 'lost' });
  });
  win.webContents.on('render-process-gone', () => { if (win && !win.isDestroyed()) showConnect({ reason: 'lost' }); });
  win.once('ready-to-show', () => win.show());
  win.on('closed', () => { win = null; });
  showConnect();
}

const ok = (u) => /^http:\/\/[\w.\-]+(:\d{1,5})?\/?$/.test(String(u));

ipcMain.handle('ceit:net', () => net.primary());
ipcMain.handle('ceit:saved', () => loadCfg().server || null);
ipcMain.handle('ceit:probe', (e, host, port) => {
  if (!/^[\w.\-]+$/.test(String(host))) return { ok: false, error: 'That is not a valid address' };
  return probe(String(host), parseInt(port, 10) || PORT, 2500);
});
ipcMain.handle('ceit:discover', async () => {
  const saved = (loadCfg().server || {}).url;
  let first = []; try { first = [new URL(saved).hostname]; } catch (x) { /* none */ }
  return scan(PORT, { first, timeout: 700 });
});
ipcMain.handle('ceit:recover', async (e, serverId) => {
  if (!serverId) return null;
  const list = await scan(PORT, { timeout: 700 });
  const s = list.find((x) => x.serverId === serverId);
  return s ? 'http://' + (s.lanIp || s.ip) + ':' + s.port + '/' : null;
});
ipcMain.handle('ceit:connect', async (e, url, serverId, name) => {
  if (!ok(url) || !win) return false;
  const u = new URL(url);
  if (!serverId || !name) { const r = await probe(u.hostname, parseInt(u.port, 10) || 80, 2500); if (r.ok) { serverId = serverId || r.serverId; name = name || r.name; } }
  const cfg = loadCfg(); cfg.server = { url: u.origin + '/', serverId: serverId || '', name: name || '' }; saveCfg(cfg);
  origin = u.origin;
  win.loadURL(u.origin + '/');
  return true;
});
ipcMain.handle('ceit:change', () => { if (win) showConnect({ change: '1' }); });
ipcMain.handle('ceit:forget', () => { const c = loadCfg(); delete c.server; saveCfg(c); return true; });
ipcMain.handle('ceit:print', () => { if (win) win.webContents.print({ silent: false, printBackground: true }); });

app.on('window-all-closed', () => app.quit());
