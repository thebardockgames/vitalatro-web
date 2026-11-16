// Page flow: pick the game file -> the worker checks it (format, version) -> build -> download.
// All the work happens in js/worker.js; nothing is uploaded anywhere.
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var drop = $('drop'), input = $('file');
  var fileStatus = $('file-status'), buildStatus = $('build-status');
  var buildBtn = $('build'), stepBuild = $('step-build');
  var progress = $('progress'), fill = $('progress-fill'), ptext = $('progress-text'), ppct = $('progress-pct');
  var download = $('download');

  var T = VL_I18N.t, L = VL_I18N.label;
  var worker = null;
  var busy = false;
  var downloadUrl = null;

  function status(el, kind, label, text) {
    el.hidden = false;
    el.className = 'status ' + kind;
    el.textContent = '';
    if (label) {
      var b = document.createElement('span');
      b.className = 'label';
      b.textContent = label + ' ';
      el.appendChild(b);
    }
    el.appendChild(document.createTextNode(text || ''));
  }

  function setProgress(value, label) {
    var pct = Math.max(0, Math.min(100, Math.round(value * 100)));
    fill.style.width = pct + '%';
    ppct.textContent = pct + '%';
    if (label) ptext.textContent = L(label);
  }

  function resetBuild() {
    buildBtn.disabled = true;
    stepBuild.setAttribute('aria-disabled', 'true');
    progress.hidden = true;
    buildStatus.hidden = true;
    download.hidden = true;
    if (downloadUrl) { URL.revokeObjectURL(downloadUrl); downloadUrl = null; }
  }

  function getWorker() {
    if (worker) return worker;
    worker = new Worker('js/worker.js');
    worker.onmessage = onMessage;
    worker.onerror = function (e) {
      busy = false;
      status(buildStatus, 'err', T('error'), T('err_generator') + ' (' + (e.message || T('unknown_error')) + ').');
      worker = null;
    };
    return worker;
  }

  function sizeMB(n) {
    var s = (n / 1048576).toFixed(1);
    return (VL_I18N.lang() === 'es' ? s.replace('.', ',') : s) + ' MB';
  }

  function onMessage(ev) {
    var m = ev.data;
    if (m.type === 'inspect') {
      busy = false;
      if (m.ok) {
        status(fileStatus, 'ok', '✔ Balatro ' + m.version + ' (' + m.kindLabel + ').', T('compatible'));
        buildBtn.disabled = false;
        stepBuild.setAttribute('aria-disabled', 'false');
      } else {
        status(fileStatus, 'err', '✘', L(m.error));
      }
    } else if (m.type === 'progress') {
      setProgress(m.value, m.label);
    } else if (m.type === 'done') {
      busy = false;
      setProgress(1, T('ready'));
      downloadUrl = URL.createObjectURL(m.blob);
      download.href = downloadUrl;
      download.hidden = false;
      status(buildStatus, 'ok', T('built'), '(' + sizeMB(m.blob.size) + ')' + T('built_rest') +
        (m.trophies ? T('with_trophies') : ''));
      buildBtn.disabled = true;  // the worker let go of the game: pick the file again to rebuild
    } else if (m.type === 'error') {
      busy = false;
      status(m.stage === 'inspect' ? fileStatus : buildStatus, 'err', '✘ ' + T('error'), L(m.message));
      buildBtn.disabled = m.stage === 'inspect';
    }
  }

  function choose(file) {
    if (!file || busy) return;
    resetBuild();
    busy = true;
    status(fileStatus, '', '…', T('checking') + ' ' + file.name + ' (' + sizeMB(file.size) + ')…');
    getWorker().postMessage({ cmd: 'inspect', file: file });
  }

  input.addEventListener('change', function () { choose(input.files[0]); input.value = ''; });

  // "Latest version": the shipped eboot's build date (base/manifest.json) and changelog.json's newest
  // entry, in the page's language (redrawn when the language changes)
  var news = null;
  function showNews() {
    if (!news || !news.version) return;
    $('news-version').textContent = 'VL ' + news.version;
    var list = $('news-list');
    list.textContent = '';
    var entry = news.entries && news.entries[0];
    var items = entry ? (entry[VL_I18N.lang()] || entry.en || []) : [];
    items.forEach(function (t) {
      var li = document.createElement('li');
      li.textContent = t;
      list.appendChild(li);
    });
    $('news').hidden = false;
  }
  Promise.all([
    fetch('base/manifest.json').then(function (r) { return r.json(); }),
    fetch('changelog.json').then(function (r) { return r.ok ? r.json() : {}; }, function () { return {}; })
  ]).then(function (r) {
    news = { version: r[0].version, entries: r[1].entries };
    showNews();
  }, function () { /* no news: the page works without it */ });
  Array.prototype.forEach.call(document.querySelectorAll('[data-lang]'), function (b) {
    b.addEventListener('click', function () { setTimeout(showNews, 0); });
  });

  // Optional PC save: the files of %APPDATA%/Balatro/<n>/ go into the VPK as import/<n>/ (the game's
  // "Import PC save" button reads them). Picking the Balatro folder brings every profile; picking one
  // profile folder (or its files) counts as that number, else 1.
  var saveInput = $('save-dir'), saveStatus = $('save-status');
  var saveFiles = [];
  saveInput.addEventListener('change', function () {
    saveFiles = [];
    var profiles = {};
    Array.prototype.forEach.call(saveInput.files, function (f) {
      var rel = (f.webkitRelativePath || f.name).replace(/\\/g, '/');
      var m = rel.match(/(?:^|\/)(?:([1-3])\/)?(profile|meta|save)\.jkr$/);
      if (!m || f.size > 4 * 1048576) return;
      var n = m[1] || ((rel.match(/^([1-3])\//) || [])[1]) || '1';
      saveFiles.push({ path: 'import/' + n + '/' + m[2] + '.jkr', file: f });
      profiles[n] = profiles[n] || {};
      profiles[n][m[2]] = true;
    });
    var nums = Object.keys(profiles).filter(function (n) { return profiles[n].profile; }).sort();
    saveFiles = saveFiles.filter(function (s) { return nums.indexOf(s.path.split('/')[1]) >= 0; });
    if (!nums.length) {
      status(saveStatus, 'err', '✘', T('save_none'));
      return;
    }
    status(saveStatus, 'ok', T('save_ok'), T('save_profile') + ' ' + nums.join(', ') +
      (nums.some(function (n) { return profiles[n].save; }) ? T('save_run') : '') + T('save_in'));
    saveInput.value = '';
  });
  drop.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); }
  });
  ['dragenter', 'dragover'].forEach(function (t) {
    drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.add('over'); });
  });
  ['dragleave', 'drop'].forEach(function (t) {
    drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.remove('over'); });
  });
  drop.addEventListener('drop', function (e) {
    var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    choose(f);
  });
  // a file dropped outside the box must not navigate away from the page
  window.addEventListener('dragover', function (e) { e.preventDefault(); });
  window.addEventListener('drop', function (e) { e.preventDefault(); });

  buildBtn.addEventListener('click', function () {
    if (busy) return;
    busy = true;
    buildBtn.disabled = true;
    download.hidden = true;
    buildStatus.hidden = true;
    progress.hidden = false;
    setProgress(0, T('preparing'));
    Promise.all(saveFiles.map(function (s) {
      return s.file.arrayBuffer().then(function (b) { return { path: s.path, data: new Uint8Array(b) }; });
    })).then(function (saves) {
      getWorker().postMessage({ cmd: 'build', saves: saves });
    }, function () {
      busy = false;
      status(buildStatus, 'err', '✘ ' + T('error'), T('save_read_err'));
    });
  });
})();
