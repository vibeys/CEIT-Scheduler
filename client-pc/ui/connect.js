// Connect screen of the PC app and the Android app. It finds the CEIT server on the Wi-Fi / LAN, remembers it, and opens it.
(function () {
 try { document.documentElement.dataset.theme = localStorage.getItem('ceit_theme') || 'light'; } catch (e) {}
 const $ = (s) => document.querySelector(s);
 const q = new URLSearchParams(location.search), reason = q.get('reason') || '', change = q.get('change') === '1';
 const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
 // ---- one interface for both apps ----
 let N = window.ceitNative || null; // PC app: Promises already
 if (!N && window.__ceitAndroid) { // Android app: callbacks -> Promises
  const A = window.__ceitAndroid, cbs = {}; let n = 0;
  window.__ceitCb = (id, val) => { const f = cbs[id]; if (f) { delete cbs[id]; f(val); } };
  const ask = (fn, ...a) => new Promise((r) => { const id = 'c' + (++n); cbs[id] = r; A[fn](...a, id); });
  N = { getNetworkInfo: () => Promise.resolve(JSON.parse(A.getNetworkInfo())), getSaved: () => Promise.resolve(JSON.parse(A.getSaved() || 'null')), discover: () => ask('discover'), probe: (h, p) => ask('probe', h, String(p)), connect: (u, i, nm) => A.connect(u, i || '', nm || ''), forget: () => A.forget() };
 }
 const stat = (html, bad, spin) => { const s = $('#stat'); s.className = 'cstat' + (bad ? ' bad' : ''); s.innerHTML = (spin ? '<span class="spin"></span>' : '') + '<span>' + html + '</span>'; };
 if (!N) { stat('Open this page inside the CEIT Scheduler app.', true); return; }

 let saved = null, busy = false, netOk = true, gen = 0; // gen: a newer action cancels older searches
 async function showNet() {
  try {
   const i = await N.getNetworkInfo(); netOk = i.type !== 'none';
   const d = $('#dev'); d.className = 'devline' + (netOk ? '' : ' bad');
   d.innerHTML = '<i></i><span>' + (netOk ? 'This device: <b>' + esc(i.label || 'Network') + '</b>' + (i.ip ? ' \u00B7 <b>' + esc(i.ip) + '</b>' : '') : 'This device is not connected to a network. Turn on Wi-Fi or plug in the LAN cable.') + '</span>';
  } catch (e) {}
 }
 setInterval(showNet, 3000);

 function render(list) {
  const f = $('#found'); f.hidden = !list.length;
  f.innerHTML = list.map((s, i) => '<button type="button" class="cri" data-i="' + i + '"><b>' + esc(s.name || 'CEIT server') + '</b><small>' + esc(s.ip) + ':' + s.port + (s.version ? ' \u00B7 v' + esc(s.version) : '') + '</small></button>').join('');
  f.onclick = (e) => { const b = e.target.closest('.cri'); if (b) open(list[+b.dataset.i]); };
 }
 function open(s) { stat('Opening <b>' + esc(s.name || s.ip) + '</b>\u2026', false, true); N.connect('http://' + s.ip + ':' + s.port + '/', s.serverId, s.name); }

 async function search(silent) {
  if (busy) return; busy = true; const my = ++gen;
  if (!silent) $('#found').hidden = true;
  await showNet();
  if (my !== gen) { busy = false; return; }
  if (!netOk) { stat('Connect this device to the Wi-Fi or LAN first. I will keep looking.', true); busy = false; setTimeout(search, 3000); return; }
  if (!silent) stat('Looking for the server on this Wi-Fi / LAN\u2026', false, true);
  let list = [];
  try { list = (await N.discover()) || []; } catch (e) {}
  busy = false;
  if (my !== gen) return; // the person typed an address meanwhile
  list = list.map((s) => ({ ip: s.lanIp || s.ip, port: s.port, serverId: s.serverId, name: s.name, version: s.version }));
  render(list);
  const same = saved && saved.serverId && list.find((s) => s.serverId === saved.serverId);
  if (same && !change) return open(same);                      // same server, maybe a new IP address
  if (list.length === 1 && !change) return open(list[0]);      // only one server around: just connect
  if (!list.length) { stat('No server found yet. Check that the server laptop is on and running the server, and that this device is on the same Wi-Fi / LAN. I keep looking, or type the address below.', true); clearTimeout(search.t); search.t = setTimeout(() => search(true), 4000); }
  else stat('Choose your server:', false);
 }

 async function manual(e) {
  e.preventDefault(); if ($('#go').disabled) return; ++gen; clearTimeout(search.t); busy = false;
  const host = $('#host').value.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, ''), port = parseInt($('#port').value, 10) || 8484;
  if (!/^[\w.\-]+$/.test(host)) return stat('Type the server IP address, for example 192.168.1.20', true);
  busy = true; $('#go').disabled = true; stat('Checking ' + esc(host) + ':' + port + '\u2026', false, true);
  let r = {}; try { r = await N.probe(host, port); } catch (x) {}
  busy = false; $('#go').disabled = false;
  if (r && r.ok) return open({ ip: host, port: r.port || port, serverId: r.serverId, name: r.name, version: r.version });
  stat('Cannot reach ' + esc(host) + ':' + port + ' \u2013 ' + esc((r && r.error) || 'no answer') + '. Check the address, the Wi-Fi, and that the server is running.', true);
 }

 $('#man').addEventListener('submit', manual);
 $('#scan').onclick = () => { if (!busy) { clearTimeout(search.t); search(); } };
 $('#forget').onclick = async () => { await N.forget(); saved = null; $('#forget').hidden = true; stat('Saved server removed.', false); };

 (async () => {
  await showNet();
  try { saved = await N.getSaved(); } catch (e) {}
  if (saved) { $('#forget').hidden = false; try { const u = new URL(saved.url); $('#host').value = u.hostname; $('#port').value = u.port || 8484; } catch (e) {} }
  if (saved && !change) {
   stat((reason === 'lost' ? 'Lost the connection. Trying again: ' : 'Connecting to ') + '<b>' + esc(saved.name || saved.url) + '</b>\u2026', false, true);
   let r = {}; try { const u = new URL(saved.url); r = await N.probe(u.hostname, u.port || 80); } catch (e) {}
   if (r && r.ok && (!saved.serverId || r.serverId === saved.serverId)) return open({ ip: r.ip || new URL(saved.url).hostname, port: r.port || new URL(saved.url).port, serverId: r.serverId, name: r.name || saved.name, version: r.version });
   stat('The saved server did not answer. Looking for it on the network\u2026', true, true);
  }
  search();
 })();
})();
