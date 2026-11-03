'use strict';
// Builds the PC app installer (exe) into the "dist" folder:  npm run dist
const path = require('path');
require('./sync-shell.js');
const builder = require('electron-builder');
builder.build({ projectDir: path.join(__dirname, '..'), targets: builder.Platform.WINDOWS.createTarget(), publish: 'never' })
  .then((files) => console.log('\nDone. Installer:\n  ' + files.filter((f) => f.endsWith('.exe')).join('\n  ')))
  .catch((e) => { console.error('\nBuild failed:', e && e.message || e); process.exit(1); });
