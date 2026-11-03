'use strict';
/*
 * Network helpers shared by the server and the PC app.
 *  - list(): this computer's IPv4 network cards, with a guess of the type (Wi-Fi / Ethernet)
 *  - candidates(): the addresses a client should try when it looks for the server on the LAN
 */
const os = require('os');

const VIRTUAL = /vethernet|virtual|vmware|vbox|hyper-v|docker|wsl|loopback|tailscale|zerotier|hamachi|vpn|\btun\d|\btap\d|utun|bridge|veth|\bbr-|npcap|pseudo/i;
const WIFI = /wi-?fi|wlan|wireless|wlp|\bwl\d|airport/i;
const ETH = /ethernet|\beth\d|\ben\d|eno\d|enp|ens\d|\blan\b|local area/i;

const kindOf = (name) => (VIRTUAL.test(name) ? 'virtual' : WIFI.test(name) ? 'wifi' : ETH.test(name) ? 'ethernet' : 'other');
const LABEL = { wifi: 'Wi-Fi', ethernet: 'Ethernet', virtual: 'Virtual adapter', other: 'Network' };

const ip2n = (ip) => ip.split('.').reduce((a, b) => ((a << 8) | parseInt(b, 10)) >>> 0, 0) >>> 0;
const n2ip = (n) => [n >>> 24, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');
const prefixOf = (mask) => mask.split('.').reduce((a, o) => a + (parseInt(o, 10) >>> 0).toString(2).replace(/0/g, '').length, 0);
const isPrivate = (ip) => /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(ip);

function list() {
  const out = [];
  const ifs = os.networkInterfaces();
  for (const name of Object.keys(ifs)) {
    for (const i of ifs[name] || []) {
      if ((i.family !== 'IPv4' && i.family !== 4) || i.internal) continue;
      if (i.address.startsWith('169.254.')) continue; // no real network (auto-assigned)
      const kind = kindOf(name);
      out.push({ name, kind, label: LABEL[kind], ip: i.address, netmask: i.netmask, prefix: prefixOf(i.netmask), priv: isPrivate(i.address) });
    }
  }
  // real, private networks first; virtual adapters last
  out.sort((a, b) => (Number(b.priv) - Number(a.priv)) || ((a.kind === 'virtual') - (b.kind === 'virtual')));
  return out;
}

// What this device is connected with right now (used by the "connected" bar)
function primary() {
  const l = list().filter((x) => x.kind !== 'virtual');
  const p = l.find((x) => x.kind === 'ethernet') || l.find((x) => x.kind === 'wifi') || l[0];
  return p ? { type: p.kind === 'other' ? 'other' : p.kind, label: p.label, ip: p.ip, all: l.map((x) => ({ ip: x.ip, label: x.label })) } : { type: 'none', label: 'No network', ip: '', all: [] };
}

// Hosts to try when looking for a server: the /24 around each real private address (wider masks: its 2 neighbours too)
function candidates() {
  const seen = new Set(), out = [];
  const own = new Set(list().map((x) => x.ip));
  for (const n of list()) {
    if ((!n.priv && !process.env.CEIT_SCAN_ANY) || n.kind === 'virtual') continue;
    const base = ip2n(n.ip);
    let blocks = [base & 0xffffff00];
    if (n.prefix < 24) blocks = [-1, 0, 1].map((d) => ((base & 0xffffff00) + d * 256) >>> 0);
    if (n.prefix > 24) { // small network: only its own range
      const net = base & ip2n(n.netmask) >>> 0, size = 2 ** (32 - n.prefix);
      for (let k = 1; k < size - 1; k++) { const ip = n2ip((net + k) >>> 0); if (!seen.has(ip)) { seen.add(ip); out.push(ip); } }
      continue;
    }
    for (const b of blocks) for (let k = 1; k < 255; k++) { const ip = n2ip((b + k) >>> 0); if (!seen.has(ip)) { seen.add(ip); out.push(ip); } }
  }
  // own addresses last (the server may be on this very computer: it is also tried as 127.0.0.1)
  return out.filter((ip) => !own.has(ip)).concat([...own]);
}

module.exports = { list, primary, candidates, kindOf, LABEL };
