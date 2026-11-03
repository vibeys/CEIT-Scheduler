'use strict';
// The only things the screens are allowed to ask the PC app to do.
const { contextBridge, ipcRenderer } = require('electron');
const call = (name) => (...a) => ipcRenderer.invoke('ceit:' + name, ...a);
contextBridge.exposeInMainWorld('ceitNative', {
  app: 'pc',
  getNetworkInfo: call('net'),
  getSaved: call('saved'),
  discover: call('discover'),
  probe: call('probe'),
  connect: call('connect'),
  changeServer: call('change'),
  forget: call('forget'),
  recoverServer: call('recover'),
  print: call('print'),
});
