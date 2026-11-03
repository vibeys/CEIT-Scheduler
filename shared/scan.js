'use strict';
/*
 * Finds CEIT Scheduler servers on the local network.
 * It simply asks  http://<ip>:<port>/api/ping  on every address of the LAN (TCP only - no broadcast,
 * so Windows Firewall never shows a pop-up on the client PC).
 */
const http = require('http');
const net = require('./netinfo');

const APP_ID = 'ceit-scheduler';

function probe(host, port, timeout) {
  return new Promise((resolve) => {
    let done = false;
    const fin = (v) => { if (!done) { done = true; resolve(v); } };
    const req = http.get({ host, port, path: '/api/ping', timeout: timeout || 2500, agent: false, headers: { 'Cache-Control': 'no-store' } }, (res) => {
      let b = '';
      res.on('data', (c) => { b += c; if (b.length > 4000) res.destroy(); });
      res.on('end', () => {
        try { const j = JSON.parse(b); if (j.app === APP_ID) return fin({ ok: true, ip: host, port: Number(port), serverId: j.serverId || '', name: j.name || '', version: j.version || '' }); } catch (e) { /* not ours */ }
        fin({ ok: false, error: 'This is not a CEIT Scheduler server' });
      });
    });
    req.on('error', (e) => fin({ ok: false, error: e.code === 'ECONNREFUSED' ? 'Nothing is listening on that address and port' : (e.code || e.message) }));
    req.on('timeout', () => { req.destroy(); fin({ ok: false, error: 'No answer (timeout)' }); });
  });
}

async function scan(port, opts) {
  opts = opts || {};
  const first = (opts.first || []).filter(Boolean);
  const ips = [...new Set(['127.0.0.1', ...first, ...net.candidates()])];
  const groups = new Map(); // serverId -> every address it answered on
  let i = 0;
  const work = async () => {
    while (i < ips.length) {
      const ip = ips[i++];
      const r = await probe(ip, port, opts.timeout || 700);
      if (!r.ok) continue;
      const k = r.serverId || ip;
      if (!groups.has(k)) { groups.set(k, []); if (opts.onFound) opts.onFound(r); }
      groups.get(k).push(r);
    }
  };
  await Promise.all(Array.from({ length: opts.concurrency || 96 }, work));
  // the same server answers on 127.0.0.1 (if it is on this PC) and on its LAN address: prefer the LAN address
  return [...groups.values()].map((g) => g.find((r) => r.ip !== '127.0.0.1') || g[0]);
}

module.exports = { probe, scan };
