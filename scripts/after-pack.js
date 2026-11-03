'use strict';
// Puts the CEIT logo (and product details) into the Windows .exe without needing Wine.
const fs = require('fs');
const path = require('path');
const ResEdit = require('resedit');

exports.default = async function afterPack(context) {
  if (context.electronPlatformName !== 'win32') return;
  const info = context.packager.appInfo;
  const exePath = path.join(context.appOutDir, info.productFilename + '.exe');
  const icoPath = path.join(context.packager.projectDir, 'build', 'icon.ico');

  const exe = ResEdit.NtExecutable.from(fs.readFileSync(exePath), { ignoreCert: true });
  const res = ResEdit.NtExecutableResource.from(exe);

  const ico = ResEdit.Data.IconFile.from(fs.readFileSync(icoPath));
  const groups = ResEdit.Resource.IconGroupEntry.fromEntries(res.entries);
  const g = groups[0] || { id: 1, lang: 1033 };
  ResEdit.Resource.IconGroupEntry.replaceIconsForResource(res.entries, g.id, g.lang, ico.icons.map((i) => i.data));

  const vis = ResEdit.Resource.VersionInfo.fromEntries(res.entries);
  const vi = vis[0] || ResEdit.Resource.VersionInfo.createEmpty();
  const [maj, min, pat] = String(info.version).split('.').map((n) => parseInt(n, 10) || 0);
  vi.setFileVersion(maj, min, pat, 0, 1033);
  vi.setProductVersion(maj, min, pat, 0, 1033);
  vi.setStringValues({ lang: 1033, codepage: 1200 }, {
    FileDescription: info.productName, ProductName: info.productName, CompanyName: 'CEIT',
    LegalCopyright: 'CEIT Scheduler', OriginalFilename: info.productFilename + '.exe', InternalName: info.productName,
  });
  vi.outputToResourceEntries(res.entries);

  res.outputResource(exe);
  fs.writeFileSync(exePath, Buffer.from(exe.generate()));
  console.log('  \u2022 logo + version info written into ' + path.basename(exePath));
};
