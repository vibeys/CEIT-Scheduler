'use strict';
// Opens the PC app from source (npm run client). The installed PC app (exe) is the normal way for client laptops.
const path = require('path');
const { spawn } = require('child_process');
let exe;
try { exe = require('electron'); } catch (e) { console.error('Electron is not installed. Run "npm install" once, then try again.'); process.exit(1); }
if (typeof exe !== 'string' || !require('fs').existsSync(exe)) { console.error('The Electron program file is missing. Run "npm install" once (needs internet), then try again.'); process.exit(1); }
require('./sync-shell.js');
const env = Object.assign({}, process.env);
delete env.ELECTRON_RUN_AS_NODE; // VS Code sets this in its terminal and it would stop the window from opening
const child = spawn(exe, [path.join(__dirname, '..', 'client-pc'), ...process.argv.slice(2)], { stdio: 'inherit', env });
child.on('close', (code) => process.exit(code == null ? 0 : code));
