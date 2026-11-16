// Builds the VPK in a worker thread with the asset builder compiled to WebAssembly
// (tools/asset_builder): the user's file never leaves this browser.
//   main -> worker: {cmd: 'inspect', file} | {cmd: 'build', saves: [{path, data}]} (optional PC save)
//   worker -> main: {type: 'inspect', ok, version, kindLabel, error}
//                   {type: 'progress', value, label} | {type: 'done', blob} | {type: 'error', stage, message}
'use strict';
importScripts('../builder/vl_asset_builder.js');

var modulePromise = null;
var basePromise = null;
var ready = false;  // a checked game is loaded in the module

function getModule() {
  if (!modulePromise) {
    modulePromise = VLAssetBuilder({
      locateFile: function (p) { return '../builder/' + p; },
      print: function () {},
      printErr: function (t) { console.warn(t); }
    });
  }
  return modulePromise;
}

// our prebuilt files (eboot.bin, param.sfo, LiveArea template, shaders), fetched once
function getBase() {
  if (!basePromise) {
    basePromise = fetch('../base/manifest.json').then(function (r) {
      if (!r.ok) throw new Error('no se pudo descargar base/manifest.json');
      return r.json();
    }).then(function (manifest) {
      return Promise.all(manifest.files.map(function (f) {
        return fetch('../base/' + f.path).then(function (r) {
          if (!r.ok) throw new Error('no se pudo descargar ' + f.path);
          return r.arrayBuffer();
        }).then(function (buf) {
          if (buf.byteLength !== f.size) throw new Error(f.path + ' incompleto');
          return { path: f.path, data: new Uint8Array(buf) };
        });
      }));
    });
    basePromise.catch(function () { basePromise = null; });
  }
  return basePromise;
}

function copyIn(M, bytes) {
  var ptr = M._malloc(bytes.length);
  if (!ptr) throw new Error('memoria insuficiente');
  M.HEAPU8.set(bytes, ptr);
  return ptr;
}

function info(M) { return JSON.parse(M.UTF8ToString(M._vlab_info())); }

function kindLabel(kind) {
  return kind === 'apk' ? 'Android' : kind === 'exe' ? 'Steam' : kind;
}

function inspect(file) {
  ready = false;
  return Promise.all([getModule(), file.arrayBuffer()]).then(function (r) {
    var M = r[0];
    var bytes = new Uint8Array(r[1]);
    var ptr = copyIn(M, bytes);  // vlab_open frees it
    bytes = null;
    var name = M.stringToNewUTF8(file.name || '');
    var rc = M._vlab_open(ptr, r[1].byteLength, name);
    M._free(name);
    var i = info(M);
    ready = rc === 0;
    self.postMessage({ type: 'inspect', ok: ready, version: i.version, kindLabel: kindLabel(i.kind), error: i.error });
    if (ready) getBase();  // start downloading while the user reads
  });
}

// Trophy icons (NoTrpDrm trophy pack): Balatro's achievement icons, BAL_01..BAL_31, fetched from
// Steam's CDN while building (only these ids live here, not the images) and scaled to 240x240 PNG;
// the platinum's (the PlayStation version's, as Exophase serves it) too. Any failure (offline,
// blocked, a browser without OffscreenCanvas) only leaves the trophies out; without the platinum
// icon the builder draws one. The set's icon (the Trophies app's list) is the Steam store's header
// image, cropped to 320x176; without it the builder draws one.
// Switched off for now (the code stays): no icons are fetched and the VPK has no trophy pack.
var TROPHIES_ENABLED = false;
var TROPHY_SET_ICON = 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2379780/7a85430784e4d613cdb0547414d8cf16ffa45747/header.jpg';
var TROPHY_PLATINUM = 'https://m.exophase.com/psn/awards/l/8jj0347b.png';
var TROPHY_CDN = 'https://shared.fastly.steamstatic.com/community_assets/images/apps/2379780/';
var TROPHY_ICONS = [
  '8cddd631acb7f6438c486c05311743c81bb6c87c', '6c56b680fef6cfc0b791b97373e811c1a5ff1d37', '4a2956c85b5372509a57f8921918aee458058bdf',
  'dd13d58459711c378794da939b08b7983f346176', '753ee8cabb8f63c415c4e44970c8c63b37700754', '164a6270413fdb6471db4a09fa9ae76e4b18e7de',
  '89a52d2490b3bb30b3ebd4d78e6ba42ad9a32256', '7cda764a01ac1404ac3f194450e8311d259b412e', '0e5333b2b6d782317610e6ccf8f9aebddbc24ada',
  'f72d11c67a949f737fe19e85b205d267fbd455dd', '85e03184c5c9c00e79bf217a93b961d92b593b67', 'bedc566356cd2aff01c364c5d28e457398cbf8db',
  '383447ec9308e23b1297fab0a12f45539d4e38c6', 'f96657ac51a7cfb76a0afbb92362593d1d7e2c3f', '6aaeb4d4b25e178e91315425a8b9d3e204ecd898',
  '42bc43d7171bf1e590e3704a1045563eacc9215c', 'a55b642e2986b818a9e2c56cfddcc8213b26682e', 'cb2cfe6cd88e1c1769f20ba36c7ff1ead7ec0242',
  '1bb6658790b45b6c1efd1fac68c45d5646853bdc', 'dbfd0636fdbaa4bfcfa7ac79eaed51d99f45d242', 'ef51600bad9ee0f338cde583d16a786ee3032536',
  '420bcf57f3779a3afea55904d06fe1e5e40cadac', 'aae8438a6f5b9b719b1027052f05727cdcd4b634', '4dc9bf05aaa990f8547eae90ae9dafecccaa9374',
  '0decda8e30aca1c09e7ea411f2e677232a581c83', 'e873e467487b547fba760f7b8b8ce93c179c5e3e', '6fc77ec70586d4a4ec395b10af1c0276fe0cdc72',
  '0471d9277d26ba9f758ce01e6bab8f1687e81228', '9d3264dc164752ac2a7ada67cdabe33721ce42b0', '64787b53a89f5588b021d8198c94a657ba101c3e',
  '61e80b0eb403fed6e631bc7869c7f9d9839b80cb'];

// url's image as a w x h PNG: scaled to cover it, centred; with fit, all of it is kept (scaled to fit,
// over a blurred cover of itself)
function trophyIcon(url, w, h, fit) {
  w = w || 240;
  h = h || 240;
  return fetch(url, { mode: 'cors' }).then(function (r) {
    if (!r.ok) throw new Error('icon ' + r.status);
    return r.blob();
  }).then(function (b) {
    return createImageBitmap(b);
  }).then(function (bmp) {
    var c = new OffscreenCanvas(w, h);
    var g = c.getContext('2d');
    g.imageSmoothingQuality = 'high';
    var draw = function (s) {
      var dw = bmp.width * s, dh = bmp.height * s;
      g.drawImage(bmp, (w - dw) / 2, (h - dh) / 2, dw, dh);
    };
    if (fit) g.filter = 'blur(8px)';
    draw(Math.max(w / bmp.width, h / bmp.height));
    if (fit) {
      g.filter = 'none';
      draw(Math.min(w / bmp.width, h / bmp.height));
    }
    return c.convertToBlob({ type: 'image/png' });
  }).then(function (png) {
    return png.arrayBuffer();
  }).then(function (buf) {
    return new Uint8Array(buf);
  });
}

// the set's icon or null
function trophySetIcon() {
  if (!TROPHIES_ENABLED) return Promise.resolve(null);
  if (typeof OffscreenCanvas === 'undefined' || typeof createImageBitmap === 'undefined') return Promise.resolve(null);
  return trophyIcon(TROPHY_SET_ICON, 320, 176, true).catch(function (e) {
    console.warn('trophy set icon not fetched (drawn instead):', e && e.message);
    return null;
  });
}

// [platinum or null, BAL_01..BAL_31], or null without the 31
function trophyIcons() {
  if (!TROPHIES_ENABLED) return Promise.resolve(null);
  if (typeof OffscreenCanvas === 'undefined' || typeof createImageBitmap === 'undefined') return Promise.resolve(null);
  var plat = trophyIcon(TROPHY_PLATINUM).catch(function (e) {
    console.warn('platinum icon not fetched (drawn instead):', e && e.message);
    return null;
  });
  var all = Promise.all(TROPHY_ICONS.map(function (h) { return trophyIcon(TROPHY_CDN + h + '.jpg'); }));
  return Promise.all([plat, all]).then(function (r) { return [r[0]].concat(r[1]); }, function (e) {
    console.warn('trophies left out:', e && e.message);
    return null;
  });
}

function build(saves) {
  if (!ready) throw new Error('elige primero tu copia de Balatro');
  var progress = function (value, label) { self.postMessage({ type: 'progress', value: value, label: label }); };
  return getModule().then(function (M) {
    progress(0, 'Preparando');
    M.onProgress = function (f, label) { progress(0.02 + 0.88 * f, label); };
    if (M._vlab_build() !== 0) throw new Error(info(M).error || 'error al generar los recursos');
    ready = false;
    progress(0.9, TROPHIES_ENABLED ? 'Descargando la base de Vitalatro y los iconos de los trofeos' : 'Descargando la base de Vitalatro');
    return Promise.all([getBase(), trophyIcons(), trophySetIcon()]).then(function (r) {
      var base = r[0], icons = r[1], setIcon = r[2];
      if (icons) icons.forEach(function (png, i) { if (png) M._vlab_trophy_icon(i, copyIn(M, png), png.length); });
      if (icons && setIcon) M._vlab_trophy_icon(-1, copyIn(M, setIcon), setIcon.length);
      // the optional PC save (import/<n>/*.jkr, read by the game's "Import PC save")
      base = base.concat(saves || []);
      base.forEach(function (f) {
        var p = M.stringToNewUTF8(f.path);
        M._vlab_base_add(p, copyIn(M, f.data), f.data.length);
        M._free(p);
      });
      progress(0.93, 'Empaquetando el VPK');
      if (M._vlab_make_vpk() !== 0) throw new Error(info(M).error || 'error al crear el VPK');
      var ptr = M._vlab_vpk_data(), size = M._vlab_vpk_size();
      var blob = new Blob([M.HEAPU8.slice(ptr, ptr + size)], { type: 'application/octet-stream' });
      var trophies = M._vlab_trophies() === 1;
      M._vlab_close();
      self.postMessage({ type: 'done', blob: blob, trophies: trophies });
    });
  });
}

self.onmessage = function (ev) {
  var m = ev.data;
  var stage = m.cmd;
  var p;
  try {
    p = m.cmd === 'inspect' ? inspect(m.file) : m.cmd === 'build' ? build(m.saves) : Promise.resolve();
  } catch (e) {
    p = Promise.reject(e);
  }
  p.catch(function (e) {
    self.postMessage({ type: 'error', stage: stage, message: (e && e.message) || String(e) });
  });
};
