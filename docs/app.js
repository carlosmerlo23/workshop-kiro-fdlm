/* ============================================================
   Workshop Kiro · Fundación de la Mujer
   Interactividad: progreso, checklists, selector SO, copiar
   ============================================================ */

(function () {
  'use strict';

  var STORAGE_KEY = 'workshop-kiro-fdlm-progreso';
  var SO_KEY = 'workshop-kiro-fdlm-so';

  /* ---------- Persistencia del progreso ---------- */
  function leerProgreso() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function guardarProgreso(estado) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(estado)); } catch (e) {}
  }

  var estado = leerProgreso();
  var checks = Array.prototype.slice.call(document.querySelectorAll('.chk'));

  // Restaurar estado guardado y sincronizar duplicados (mismo data-id en pasos y checklist)
  function aplicarEstado() {
    checks.forEach(function (chk) {
      var id = chk.getAttribute('data-id');
      chk.checked = !!estado[id];
      marcarPaso(chk);
    });
    actualizarProgreso();
  }

  function marcarPaso(chk) {
    var paso = chk.closest('.paso');
    if (paso) { paso.classList.toggle('completado', chk.checked); }
  }

  // Contar progreso: unimos por data-id para no contar duplicados
  function actualizarProgreso() {
    var ids = {};
    checks.forEach(function (chk) { ids[chk.getAttribute('data-id')] = chk.checked; });
    var claves = Object.keys(ids);
    var hechos = claves.filter(function (k) { return ids[k]; }).length;
    var total = claves.length;
    var pct = total ? Math.round((hechos / total) * 100) : 0;

    document.getElementById('barraProgreso').style.width = pct + '%';
    document.getElementById('progresoTexto').textContent = pct + '%';

    // Banner "todo listo" si el checklist final está completo
    var checklistIds = ['c-kiro','c-sesion','c-creditos','c-git','c-node','c-uv','c-material','c-abrir'];
    var listo = checklistIds.every(function (k) { return ids[k]; });
    var banner = document.getElementById('listoBanner');
    if (banner) { banner.classList.toggle('visible', listo); }
  }

  checks.forEach(function (chk) {
    chk.addEventListener('change', function () {
      var id = chk.getAttribute('data-id');
      estado[id] = chk.checked;
      // Sincronizar cualquier otro checkbox con el mismo data-id
      checks.forEach(function (otro) {
        if (otro !== chk && otro.getAttribute('data-id') === id) { otro.checked = chk.checked; marcarPaso(otro); }
      });
      marcarPaso(chk);
      guardarProgreso(estado);
      actualizarProgreso();
    });
  });

  // Reiniciar progreso
  var btnReset = document.getElementById('btnReset');
  if (btnReset) {
    btnReset.addEventListener('click', function () {
      if (!confirm('¿Reiniciar todo tu progreso marcado?')) return;
      estado = {};
      guardarProgreso(estado);
      checks.forEach(function (chk) { chk.checked = false; marcarPaso(chk); });
      actualizarProgreso();
    });
  }

  /* ---------- Selector de sistema operativo ---------- */
  var soBtns = Array.prototype.slice.call(document.querySelectorAll('.so-btn'));
  function aplicarSO(so) {
    soBtns.forEach(function (b) { b.classList.toggle('activo', b.getAttribute('data-so') === so); });
    document.querySelectorAll('.so-contenido').forEach(function (el) {
      el.classList.toggle('oculto', el.getAttribute('data-so') !== so);
    });
    try { localStorage.setItem(SO_KEY, so); } catch (e) {}
  }
  soBtns.forEach(function (b) {
    b.addEventListener('click', function () { aplicarSO(b.getAttribute('data-so')); });
  });
  var soGuardado = 'windows';
  try { soGuardado = localStorage.getItem(SO_KEY) || 'windows'; } catch (e) {}
  aplicarSO(soGuardado);

  /* ---------- Botones de copiar ---------- */
  document.querySelectorAll('.btn-copiar').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var texto = btn.getAttribute('data-copy');
      var fin = function () {
        var original = btn.textContent;
        btn.textContent = '¡Copiado!';
        btn.classList.add('copiado');
        setTimeout(function () { btn.textContent = original; btn.classList.remove('copiado'); }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(texto).then(fin).catch(function () { copiarFallback(texto, fin); });
      } else { copiarFallback(texto, fin); }
    });
  });
  function copiarFallback(texto, fin) {
    var ta = document.createElement('textarea');
    ta.value = texto; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); fin(); } catch (e) {}
    document.body.removeChild(ta);
  }

  /* ---------- Navegación activa según scroll ---------- */
  var secciones = Array.prototype.slice.call(document.querySelectorAll('.seccion[id]'));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-link'));

  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) {
          var id = e.target.getAttribute('id');
          navLinks.forEach(function (l) {
            l.classList.toggle('activo', l.getAttribute('data-seccion') === id);
          });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    secciones.forEach(function (s) { obs.observe(s); });
  }

  /* ---------- Menú móvil ---------- */
  var menuToggle = document.getElementById('menuToggle');
  var navLateral = document.getElementById('navLateral');
  if (menuToggle && navLateral) {
    menuToggle.addEventListener('click', function () { navLateral.classList.toggle('abierto'); });
    navLinks.forEach(function (l) {
      l.addEventListener('click', function () { navLateral.classList.remove('abierto'); });
    });
  }

  /* ---------- Inicializar ---------- */
  aplicarEstado();
})();
