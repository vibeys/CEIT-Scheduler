'use strict';
// Opens the Windows Firewall for the CEIT Scheduler server (one time).   npm run firewall
// Windows asks for administrator permission once. Other computers and phones cannot connect without this rule.
const { spawnSync } = require('child_process');

if (process.platform !== 'win32') { console.log('This step is only needed on Windows. Nothing to do.'); process.exit(0); }
const cmd = '/c netsh advfirewall firewall delete rule name="CEIT Scheduler Server" >nul 2>&1 & ' +
  'netsh advfirewall firewall add rule name="CEIT Scheduler Server" dir=in action=allow protocol=TCP localport=8484-8508 profile=any';
console.log('Windows will ask for permission. Click Yes.');
const r = spawnSync('powershell', ['-NoProfile', '-Command', "Start-Process -FilePath cmd -ArgumentList '" + cmd.replace(/'/g, "''") + "' -Verb RunAs -Wait"], { stdio: 'inherit' });
const ok = spawnSync('netsh', ['advfirewall', 'firewall', 'show', 'rule', 'name=CEIT Scheduler Server'], { encoding: 'utf8' });
console.log(ok.status === 0 ? '\nDone. The firewall is open for the CEIT Scheduler server.' : '\nThe rule was not added (permission was refused?). Try again, or right-click allow-firewall.bat -> Run as administrator.');
process.exit(r.status || 0);
