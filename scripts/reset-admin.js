'use strict';
// Forgot the admin password?  Stop the server, then run:   npm run reset-admin
// It sets the first admin account's password back to  admin123  (change it again after you sign in).
const path = require('path');
const { Store, setPassword, DEFAULT_ADMIN_PW } = require('../server/db');

const dir = process.env.CEIT_DATA || path.join(__dirname, '..', 'data');
const s = new Store(dir, () => {});
const name = process.argv[2];
const admin = s.db.users.find((u) => u.role === 'admin' && (!name || u.username.toLowerCase() === name.toLowerCase()));
if (!admin) { console.error('No admin account found' + (name ? ' named ' + name : '') + '.'); process.exit(1); }
setPassword(admin, DEFAULT_ADMIN_PW);
s.commit(s.db);
console.log('Done. Admin "' + admin.username + '" can now sign in with the password  ' + DEFAULT_ADMIN_PW + '  (change it after signing in).');
console.log('Start the server again with:  npm start');
