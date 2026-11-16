// Page languages: English and Spanish. The browser's language picks one (Spanish for es-*), the
// header's ES / EN switch overrides it (remembered in this browser). Elements with data-i18n get
// their HTML from here; scripts use VL_I18N.t(key) and VL_I18N.label(text) for the builder's
// progress labels and messages, which come in Spanish from the WebAssembly module.
(function () {
  'use strict';
  var S = {
    en: {
      title: 'Vitalatro',
      tagline: 'Balatro on your PS Vita',
      intro1: 'A native PS Vita version made by fans. <strong>It does not include the game</strong>: you need ' +
        '<strong>your own copy of Balatro</strong> (<span class="mono">1.0.1o</span>, Steam or Android).',
      intro2: '<span class="badge">100% local</span> Your file <strong>never leaves your device</strong>: the VPK is made ' +
        'in your browser.',
      step1: 'Pick your copy of Balatro',
      drop_main: 'Drop <span class="mono">Balatro.exe</span> or the <span class="mono">.apk</span> here',
      drop_sub: 'or tap to browse',
      where_file: 'Where is my file?',
      where_file_body: '<li><strong>Steam (PC):</strong> in your library, right click Balatro → <em>Manage</em> → ' +
        '<em>Browse local files</em>. <span class="mono">Balatro.exe</span> is there.</li>' +
        '<li><strong>Android:</strong> the installed <span class="mono">.apk</span> (for example, saved with an APK ' +
        'backup app).</li>',
      save_title: 'Optional: bring your PC save',
      save_body: 'If you play Balatro on Steam, pick your save folder and the VPK will carry it. On the Vita, go to ' +
        '<em>Profile</em> and press <strong>Import PC save</strong> (twice to confirm). What that Vita profile had is ' +
        'kept first in <span class="mono">before_import</span>.',
      save_drop_main: 'Pick your <span class="mono">Balatro</span> save folder',
      save_drop_sub: 'or one profile folder (<span class="mono">1</span>, <span class="mono">2</span>, ' +
        '<span class="mono">3</span>)',
      where_save: 'Where is my save?',
      where_save_body: '<li><strong>Windows:</strong> <span class="mono">%APPDATA%\\Balatro</span> (paste that path in ' +
        'the address bar of the file explorer or the folder picker).</li>' +
        '<li><strong>Linux / Steam Deck (Proton):</strong> <span class="mono">~/.local/share/Steam/steamapps/compatdata/' +
        '2379780/pfx/drive_c/users/steamuser/AppData/Roaming/Balatro</span></li>' +
        '<li>The profile, the unlocks and the run in progress are copied. Steam achievements are not.</li>' +
        '<li>Your save never leaves your device either.</li>' +
        '<li>Back to the PC: on the Vita, <strong>Export for PC</strong> (Profile) writes them to ' +
        '<span class="mono">ux0:data/Vitalatro/export/</span>; copy them over your save folder (with Steam Cloud ' +
        'off for Balatro, or it may bring the old ones back).</li>',
      step2: 'Make the VPK',
      build: 'Make VPK',
      download: 'Download Vitalatro.vpk',
      trophies_note: 'Trophies: the VPK includes Balatro\'s 31 achievements as Vita trophies, plus a platinum ' +
        '(their icons are fetched from Steam and Exophase while it is made). They need the <strong>NoTrpDrm</strong> plugin (firmware 3.60, 3.65, ' +
        '3.67 or 3.68); without it the game works the same.',
      step3: 'Install it on your Vita',
      install: '<li>Your Vita needs <strong>HENkaku / Ensō</strong> and <strong>VitaShell</strong>.</li>' +
        '<li>Copy <span class="mono">Vitalatro.vpk</span> to <span class="mono">ux0:/VPK/</span> (USB or FTP from ' +
        'VitaShell: <span class="mono">SELECT</span> button).</li>' +
        '<li>In VitaShell, open <span class="mono">ux0:/VPK/</span>, press <span class="mono">X</span> on the VPK ' +
        'and confirm the install.</li>' +
        '<li>The Vitalatro bubble appears on the home screen. Have fun!</li>',
      footer: 'Fan project, not affiliated with LocalThunk or Playstack. Balatro belongs to its respective owners. ' +
        'The background is Balatro\'s menu shader.',
      news_title: 'Latest version:',
      news_check: 'Your version is in the top right corner of the title screen ("VL" and a date). If it is older, ' +
        'make the VPK again and install it over the old one: your saves are kept.',
      // scripts
      err_generator: 'the generator failed',
      unknown_error: 'unknown error',
      compatible: 'Compatible version. You can make the VPK now.',
      checking: 'Checking',
      preparing: 'Preparing…',
      ready: 'Done',
      built: '✔ VPK made',
      built_rest: '. Download it and install it on your Vita.',
      with_trophies: ' Trophies included (they need the NoTrpDrm plugin).',
      without_trophies: ' No trophies: their icons could not be downloaded (the game works the same).',
      error: 'Error:',
      save_none: 'No profile.jkr found in that folder. Pick the Balatro folder of your save.',
      save_ok: '✔ PC save ready:',
      save_profile: 'profile',
      save_run: ' (with a run in progress)',
      save_in: '. It goes into the VPK.',
      save_read_err: 'the PC save could not be read; pick the folder again.'
    },
    es: {
      title: 'Vitalatro',
      tagline: 'Balatro en tu PS Vita',
      intro1: 'Versión nativa para PS Vita hecha por fans. <strong>No incluye el juego</strong>: necesitas ' +
        '<strong>tu propia copia de Balatro</strong> (<span class="mono">1.0.1o</span>, Steam o Android).',
      intro2: '<span class="badge">100% local</span> Tu archivo <strong>no sale de tu dispositivo</strong>: el VPK se ' +
        'crea en tu navegador.',
      step1: 'Elige tu copia de Balatro',
      drop_main: 'Arrastra aquí <span class="mono">Balatro.exe</span> o el <span class="mono">.apk</span>',
      drop_sub: 'o pulsa para buscarlo',
      where_file: '¿Dónde está mi archivo?',
      where_file_body: '<li><strong>Steam (PC):</strong> en tu biblioteca, clic derecho en Balatro → <em>Administrar</em> ' +
        '→ <em>Ver archivos locales</em>. Allí está <span class="mono">Balatro.exe</span>.</li>' +
        '<li><strong>Android:</strong> el <span class="mono">.apk</span> instalado en tu dispositivo (por ejemplo, ' +
        'extraído con una app de copia de seguridad de APK).</li>',
      save_title: 'Opcional: trae tu partida de PC',
      save_body: 'Si juegas Balatro en Steam, elige la carpeta de tu guardado y el VPK la llevará dentro. En la Vita, ve ' +
        'a <em>Perfil</em> y pulsa <strong>Importar partida de PC</strong> (dos veces para confirmar). Lo que tuviera ese perfil ' +
        'en la Vita se guarda antes en <span class="mono">before_import</span>.',
      save_drop_main: 'Elige la carpeta <span class="mono">Balatro</span> de tu guardado',
      save_drop_sub: 'o la carpeta de un perfil (<span class="mono">1</span>, <span class="mono">2</span>, ' +
        '<span class="mono">3</span>)',
      where_save: '¿Dónde está mi guardado?',
      where_save_body: '<li><strong>Windows:</strong> <span class="mono">%APPDATA%\\Balatro</span> (pega esa ruta en la ' +
        'barra del explorador de archivos o del selector de carpetas).</li>' +
        '<li><strong>Linux / Steam Deck (Proton):</strong> <span class="mono">~/.local/share/Steam/steamapps/compatdata/' +
        '2379780/pfx/drive_c/users/steamuser/AppData/Roaming/Balatro</span></li>' +
        '<li>Se copian el perfil, los desbloqueos y la partida en curso. Los logros de Steam no.</li>' +
        '<li>Tu guardado tampoco sale de tu dispositivo.</li>' +
        '<li>De vuelta al PC: en la Vita, <strong>Exportar para PC</strong> (Perfil) los deja en ' +
        '<span class="mono">ux0:data/Vitalatro/export/</span>; cópialos sobre tu carpeta de guardado (con Steam Cloud ' +
        'desactivado para Balatro, o puede traer los viejos de vuelta).</li>',
      step2: 'Genera el VPK',
      build: 'Generar VPK',
      download: 'Descargar Vitalatro.vpk',
      trophies_note: 'Trofeos: el VPK incluye los 31 logros de Balatro como trofeos de la Vita, más un platino ' +
        '(sus iconos se descargan de Steam y Exophase al generarlo). Necesitan el plugin <strong>NoTrpDrm</strong> (firmware 3.60, 3.65, 3.67 o 3.68); sin él ' +
        'el juego funciona igual.',
      step3: 'Instálalo en tu Vita',
      install: '<li>Tu Vita necesita <strong>HENkaku / Ensō</strong> y <strong>VitaShell</strong>.</li>' +
        '<li>Copia <span class="mono">Vitalatro.vpk</span> a <span class="mono">ux0:/VPK/</span> (por USB o FTP desde ' +
        'VitaShell: botón <span class="mono">SELECT</span>).</li>' +
        '<li>En VitaShell, entra en <span class="mono">ux0:/VPK/</span>, pulsa <span class="mono">X</span> sobre el VPK ' +
        'y confirma la instalación.</li>' +
        '<li>Aparecerá la burbuja de Vitalatro en la pantalla de inicio. ¡A jugar!</li>',
      footer: 'Proyecto de fans sin relación con LocalThunk ni Playstack. Balatro es de sus respectivos dueños. El fondo ' +
        'es el shader del menú de Balatro.',
      news_title: 'Última versión:',
      news_check: 'Tu versión aparece arriba a la derecha en la pantalla de título ("VL" y una fecha). Si es anterior, ' +
        'genera el VPK de nuevo e instálalo encima: tus partidas se conservan.',
      err_generator: 'el generador falló',
      unknown_error: 'error desconocido',
      compatible: 'Versión compatible. Ya puedes generar el VPK.',
      checking: 'Comprobando',
      preparing: 'Preparando…',
      ready: 'Listo',
      built: '✔ VPK generado',
      built_rest: '. Descárgalo e instálalo en tu Vita.',
      with_trophies: ' Incluye los trofeos (necesitan el plugin NoTrpDrm).',
      without_trophies: ' Sin trofeos: no se pudieron descargar sus iconos (el juego funciona igual).',
      error: 'Error:',
      save_none: 'No encontré ningún profile.jkr en esa carpeta. Elige la carpeta Balatro de tu guardado.',
      save_ok: '✔ Guardado de PC listo:',
      save_profile: 'perfil',
      save_run: ' (con partida en curso)',
      save_in: '. Irá dentro del VPK.',
      save_read_err: 'no se pudo leer el guardado de PC; elige la carpeta otra vez.'
    }
  };
  // the builder's Spanish progress labels and messages, in English
  var LABELS = [
    [/^Preparando$/, 'Preparing'], [/^Texturas$/, 'Textures'], [/^Sonidos$/, 'Sounds'],
    [/^Datos del juego$/, 'Game data'], [/^Fuentes \((.*)\)$/, 'Fonts ($1)'], [/^Fuentes$/, 'Fonts'],
    [/^Icono y LiveArea$/, 'Icon and LiveArea'], [/^Recursos listos$/, 'Assets ready'],
    [/^Descargando la base de Vitalatro y los iconos de los trofeos$/, 'Downloading the Vitalatro base and the trophy icons'],
    [/^Descargando la base de Vitalatro$/, 'Downloading the Vitalatro base'],
    [/^Empaquetando el VPK$/, 'Packing the VPK'],
    [/^Esta copia es la versión (.*) de Balatro; Vitalatro necesita exactamente la (.*)\.$/,
      'This copy is Balatro version $1; Vitalatro needs exactly $2.'],
    [/^no se pudo leer (.*)$/, 'could not read $1'], [/^falta (.*)$/, 'missing $1'],
    [/^elige primero tu copia de Balatro$/, 'pick your copy of Balatro first'],
    [/^memoria insuficiente$/, 'not enough memory'],
    [/^error al generar los recursos$/, 'error while making the assets'], [/^error al crear el VPK$/, 'error while making the VPK']
  ];

  function pick() {
    try {
      var saved = localStorage.getItem('vl_lang');
      if (saved === 'en' || saved === 'es') return saved;
    } catch (e) { /* storage blocked */ }
    var nav = (navigator.languages && navigator.languages[0]) || navigator.language || 'en';
    return /^es\b/i.test(nav) ? 'es' : 'en';
  }

  var lang = pick();
  var I = {
    lang: function () { return lang; },
    t: function (k) { return (S[lang] && S[lang][k]) || S.en[k] || k; },
    label: function (text) {
      if (lang === 'es' || !text) return text;
      for (var i = 0; i < LABELS.length; i++) if (LABELS[i][0].test(text)) return text.replace(LABELS[i][0], LABELS[i][1]);
      return text;
    },
    apply: function () {
      document.documentElement.lang = lang;
      Array.prototype.forEach.call(document.querySelectorAll('[data-i18n]'), function (el) {
        el.innerHTML = I.t(el.getAttribute('data-i18n'));  // our own strings only
      });
      Array.prototype.forEach.call(document.querySelectorAll('[data-lang]'), function (b) {
        b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === lang));
      });
    },
    set: function (l) {
      lang = l;
      try { localStorage.setItem('vl_lang', l); } catch (e) { /* storage blocked */ }
      I.apply();
    }
  };
  window.VL_I18N = I;
  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.forEach.call(document.querySelectorAll('[data-lang]'), function (b) {
      b.addEventListener('click', function () { I.set(b.getAttribute('data-lang')); });
    });
    I.apply();
  });
})();
