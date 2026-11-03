'use strict';
// Copies the shared screens into the PC app and the Android app, so there is only ONE design to maintain.
//   public/  (website design)  +  shell/ (connect screen)  ->  client-pc/ui  and  client-android/assets/ui
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const cp = (from, to) => { fs.mkdirSync(path.dirname(to), { recursive: true }); fs.copyFileSync(from, to); };
const targets = [path.join(root, 'client-pc', 'ui'), path.join(root, 'client-android', 'assets', 'ui')];
for (const t of targets) {
  fs.rmSync(t, { recursive: true, force: true });
  cp(path.join(root, 'shell', 'connect.html'), path.join(t, 'connect.html'));
  cp(path.join(root, 'shell', 'connect.js'), path.join(t, 'connect.js'));
  cp(path.join(root, 'public', 'css', 'style.css'), path.join(t, 'css', 'style.css'));
  for (const f of fs.readdirSync(path.join(root, 'public', 'fonts'))) cp(path.join(root, 'public', 'fonts', f), path.join(t, 'fonts', f));
  for (const f of ['logo.png', 'favicon.png']) cp(path.join(root, 'public', 'assets', f), path.join(t, 'assets', f));
}
// the PC app also needs the network helpers
for (const f of ['netinfo.js', 'scan.js']) cp(path.join(root, 'shared', f), path.join(root, 'client-pc', 'lib', f));
cp(path.join(root, 'public', 'assets', 'icon.png'), path.join(root, 'client-pc', 'assets', 'icon.png'));
console.log('Shared screens copied to client-pc and client-android.');
