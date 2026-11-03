'use strict';
// Builds the Android app:  npm run apk   (needs the Android build tools - see client-android/build.sh)
// The finished apk is already in the "apk" folder, so most people never need this.
const path = require('path');
const { spawnSync } = require('child_process');
require('./sync-shell.js');
const r = spawnSync('sh', [path.join(__dirname, '..', 'client-android', 'build.sh')], { stdio: 'inherit' });
if (r.error || r.status !== 0) {
  console.error('\nCould not build the apk here. This step needs Linux/macOS (or WSL) with: default-jdk-headless aapt apksigner zipalign dalvik-exchange android-sdk-platform-23');
  console.error('The ready-made apk is in the "apk" folder.');
  process.exit(1);
}
