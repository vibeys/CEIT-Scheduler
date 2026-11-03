'use strict';
/*
 * Sign-in tokens. They are signed with a secret key that is created once on the host computer
 * (<dataDir>/secret.key). Nothing is stored per session, so a server restart does not log anyone out.
 * A token stops working when the account is deleted or its password changes.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const b64 = (b) => Buffer.from(b).toString('base64url');
const TTL = { admin: 12 * 3600e3, teacher: 14 * 24 * 3600e3 };

class Auth {
  constructor(dir) {
    const f = path.join(dir, 'secret.key');
    try { this.secret = fs.readFileSync(f, 'utf8').trim(); } catch (e) { /* create below */ }
    if (!this.secret || this.secret.length < 32) {
      this.secret = crypto.randomBytes(32).toString('hex');
      fs.writeFileSync(f, this.secret, { mode: 0o600 });
    }
    this.fails = new Map();
    this.revoked = new Map(); // tokens that were signed out (kept until they would expire anyway)
  }
  _mac(p) { return crypto.createHmac('sha256', this.secret).update(p).digest('base64url'); }
  _stamp(u) { return crypto.createHash('sha256').update(String(u.pw)).digest('hex').slice(0, 12); }
  sign(u) {
    const p = b64(JSON.stringify({ u: u.id, k: this._stamp(u), e: Date.now() + (TTL[u.role] || TTL.teacher) }));
    return p + '.' + this._mac(p);
  }
  stamp(u) { return this._stamp(u); }
  revoke(token) {
    try {
      const d = JSON.parse(Buffer.from(String(token).split('.')[0], 'base64url').toString());
      this.revoked.set(token, d.e || Date.now() + 864e5);
      for (const [k, e] of this.revoked) if (e < Date.now()) this.revoked.delete(k);
    } catch (e) { /* ignore */ }
  }
  // returns the user record or null
  verify(token, users) {
    try {
      if (this.revoked.has(token)) return null;
      const [p, m] = String(token || '').split('.');
      if (!p || !m) return null;
      const want = this._mac(p);
      if (want.length !== m.length || !crypto.timingSafeEqual(Buffer.from(want), Buffer.from(m))) return null;
      const d = JSON.parse(Buffer.from(p, 'base64url').toString());
      if (!d || d.e < Date.now()) return null;
      const u = users.find((x) => x.id === d.u);
      return u && this._stamp(u) === d.k ? u : null;
    } catch (e) { return null; }
  }
  // 8 wrong tries for the same user from the same device = 1 minute pause
  blocked(key) {
    const f = this.fails.get(key);
    if (!f) return 0;
    if (f.until && f.until > Date.now()) return Math.ceil((f.until - Date.now()) / 1000);
    if (f.until) this.fails.delete(key);
    return 0;
  }
  fail(key) {
    const f = this.fails.get(key) || { n: 0 };
    f.n++;
    if (f.n >= 8) { f.until = Date.now() + 60e3; f.n = 0; }
    this.fails.set(key, f);
    if (this.fails.size > 5000) this.fails.clear();
  }
  clear(key) { this.fails.delete(key); }
}

module.exports = { Auth };
