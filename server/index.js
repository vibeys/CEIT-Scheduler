'use strict';
/*
 * START THE SERVER (server laptop only):   npm start
 * It keeps the ONE database and lets the website, the PC app and the phone app connect over the same Wi-Fi / LAN.
 */
const path = require('path');
const { execFile } = require('child_process');
const QRCode = require('qrcode');
const { startServer } = require('./server');

const dataDir = process.env.CEIT_DATA || path.join(__dirname, '..', 'data');
const publicDir = path.join(__dirname, '..', 'public');
const PORT = parseInt(process.env.PORT, 10) || 8484;

const C = process.stdout.isTTY ? { b: '\x1b[1m', g: '\x1b[32m', y: '\x1b[33m', c: '\x1b[36m', d: '\x1b[2m', x: '\x1b[0m' } : { b: '', g: '', y: '', c: '', d: '', x: '' };
const log = (m) => console.log(C.d + '[' + new Date().toLocaleTimeString() + ']' + C.x + ' ' + m);

// Windows only: is the firewall open for the server? (done once with:  npm run firewall)
function firewallHint() {
  return new Promise((resolve) => {
    if (process.platform !== 'win32') return resolve('');
    execFile('netsh', ['advfirewall', 'firewall', 'show', 'rule', 'name=CEIT Scheduler Server'], { timeout: 6000 }, (err) => {
      resolve(err ? '\n  ' + C.y + '! Windows Firewall may block other devices.' + C.x + '\n    Run this ONCE (it asks for admin permission):  ' + C.b + 'npm run firewall' + C.x + '\n    (or click "Allow access" if Windows asks, and tick Private AND Public networks)\n' : '');
    });
  });
}

// a long-running server must not die because of one odd request: log it and keep going
process.on('uncaughtException', (e) => log('ERROR (kept running): ' + (e && e.stack || e)));
process.on('unhandledRejection', (e) => log('ERROR (kept running): ' + (e && e.stack || e)));

(async () => {
  const s = await startServer({ dataDir, publicDir, preferredPort: PORT, log });
  if (s.reused) {
    console.log('\n  The server is already running on this computer (port ' + s.port + '). Close the other window first if you want to restart it.\n');
    process.exit(0);
  }
  const lan = s.urls.filter((u) => u.kind !== 'virtual');
  console.log('\n  ' + C.b + C.g + 'CEIT Scheduler SERVER is running' + C.x + '   (server name: ' + s.identity.name + ')\n');
  if (!lan.length) {
    console.log('  ' + C.y + 'No network found.' + C.x + ' Connect this laptop to the Wi-Fi or plug in the LAN cable.');
    console.log('  The server still works on this laptop:  ' + s.localUrl + '\n');
  } else {
    console.log('  This laptop is connected by:');
    lan.forEach((u) => console.log('    ' + C.c + u.label.padEnd(9) + C.x + ' ' + C.b + u.url + C.x));
    console.log('\n  Other devices (same Wi-Fi / LAN):');
    console.log('    PC app + Phone app  ->  open the app, it finds this server by itself');
    console.log('    Website             ->  type ' + C.b + lan[0].url + C.x + ' in any browser');
    try { console.log('\n' + (await QRCode.toString(lan[0].url, { type: 'terminal', small: true })).replace(/^/gm, '    ')); } catch (e) { /* ignore */ }
  }
  console.log('  Admin sign in on the first run:  admin / admin123');
  console.log('  Data folder: ' + dataDir);
  console.log('  Press Ctrl+C to stop the server.' + (await firewallHint()) + '\n');
  log('Waiting for devices to connect...');
  const stop = () => { log('Stopping...'); s.close().then(() => process.exit(0)); };
  process.on('SIGINT', stop); process.on('SIGTERM', stop);
})().catch((e) => { console.error('Could not start the server: ' + e.message); process.exit(1); });
