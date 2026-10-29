/* =====================================================
   SAPFPI · Lógica de la aplicación
   - Pantalla de bloqueo estilo iPhone
   - CRUD de Instructores, Competencias, Asignaciones y Fichas
   - Persistencia en localStorage cifrada con XOR + Base64
   ===================================================== */
(() => {
  'use strict';

  /* ---------------------------------------------------
     1. CIFRADO XOR + BASE64 
     --------------------------------------------------- */
  const DB_KEY = 'sapfpiDB';
  const SECRET = 'SAPFPI_SENA_2026'; // clave secreta predefinida

  function xor(bytes) {
    const k = new TextEncoder().encode(SECRET);
    return bytes.map((b, i) => b ^ k[i % k.length]);
  }

  function encrypt(obj) {
    const bytes = new TextEncoder().encode(JSON.stringify(obj));
    let bin = '';
    xor(bytes).forEach(b => (bin += String.fromCharCode(b)));
    return btoa(bin);
  }

  function decrypt(text) {
    const bin = atob(text);
    const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(xor(bytes)));
  }

  /* ---------------------------------------------------
     2. DATOS SEMILLA + PERSISTENCIA
     --------------------------------------------------- */
  const seed = () => ({
    instructores: [
      { id: 1, nombre: 'María Fernanda Rojas', documento: '63451200', email: 'mrojas@sena.edu.co', especialidad: 'Desarrollo de Software', estado: 'Activo' },
      { id: 2, nombre: 'Carlos Andrés Pardo', documento: '91245780', email: 'cpardo@sena.edu.co', especialidad: 'Bases de Datos', estado: 'Activo' },
      { id: 3, nombre: 'Luz Marina Gómez', documento: '37890412', email: 'lgomez@sena.edu.co', especialidad: 'Gestión Empresarial', estado: 'Activo' },
      { id: 4, nombre: 'Jorge Iván Castillo', documento: '13765009', email: 'jcastillo@sena.edu.co', especialidad: 'Redes y Seguridad', estado: 'Inactivo' },
      { id: 5, nombre: 'Andrea Paola Ruiz', documento: '1098654321', email: 'aruiz@sena.edu.co', especialidad: 'Diseño Web', estado: 'Activo' }
    ],
    competencias: [
      { id: 1, codigo: '220501014', nombre: 'Construir el software de acuerdo con el diseño', horas: 320, programa: 'Análisis y Desarrollo de Software' },
      { id: 2, codigo: '220501007', nombre: 'Modelar los datos del sistema de información', horas: 180, programa: 'Análisis y Desarrollo de Software' },
      { id: 3, codigo: '210201501', nombre: 'Administrar la infraestructura de red', horas: 240, programa: 'Gestión de Redes de Datos' },
      { id: 4, codigo: '210101051', nombre: 'Gestionar procesos administrativos', horas: 150, programa: 'Gestión Empresarial' },
      { id: 5, codigo: '220501093', nombre: 'Diseñar interfaces web usables', horas: 200, programa: 'Producción Multimedia' }
    ],
    fichas: [
      { id: 1, numero: '2711080', programa: 'Análisis y Desarrollo de Software', nivel: 'Tecnólogo', jornada: 'Diurna', inicio: '2025-02-10', fin: '2027-02-10', estado: 'En formación' },
      { id: 2, numero: '2711455', programa: 'Gestión de Redes de Datos', nivel: 'Tecnólogo', jornada: 'Nocturna', inicio: '2025-08-04', fin: '2027-08-04', estado: 'En formación' },
      { id: 3, numero: '2650321', programa: 'Gestión Empresarial', nivel: 'Tecnólogo', jornada: 'Mixta', inicio: '2023-03-01', fin: '2025-03-01', estado: 'Finalizada' },
      { id: 4, numero: '2802190', programa: 'Producción Multimedia', nivel: 'Técnico', jornada: 'Diurna', inicio: '2027-01-18', fin: '2028-01-18', estado: 'Por iniciar' }
    ],
    asignaciones: [
      { id: 1, instructorId: 1, competenciaId: 1, fichaId: 1, fecha: '2026-02-02', horas: 120 },
      { id: 2, instructorId: 2, competenciaId: 2, fichaId: 1, fecha: '2026-03-16', horas: 90 },
      { id: 3, instructorId: 4, competenciaId: 3, fichaId: 2, fecha: '2026-04-06', horas: 100 },
      { id: 4, instructorId: 3, competenciaId: 4, fichaId: 3, fecha: '2025-01-20', horas: 80 },
      { id: 5, instructorId: 5, competenciaId: 5, fichaId: 4, fecha: '2027-01-25', horas: 60 }
    ]
  });

  function loadDB() {
    try {
      const raw = localStorage.getItem(DB_KEY);
      if (raw) {
        const data = decrypt(raw);
        if (data && data.instructores && data.competencias && data.fichas && data.asignaciones) return data;
      }
    } catch (e) {
      console.warn('No se pudo leer la base cifrada; se restablecen datos de ejemplo.', e);
    }
    const fresh = seed();
    saveDB(fresh);
    return fresh;
  }

  function saveDB(data = db) {
    try { localStorage.setItem(DB_KEY, encrypt(data)); }
    catch (e) { toast('No se pudo guardar en el navegador', 'err'); }
  }

  let db = loadDB();

  /* ---------------------------------------------------
     3. CONFIGURACIÓN DE MÓDULOS
     --------------------------------------------------- */
  const byId = (list, id) => list.find(x => x.id === Number(id));
  const opts = (list, fn) => () => list().map(x => ({ value: x.id, label: fn(x) }));

  const estadoBadge = v => {
    const cls = { 'Activo': 'ok', 'Inactivo': 'off', 'En formación': 'ok', 'Finalizada': 'off', 'Por iniciar': 'warn' }[v] || 'info';
    return `<span class="badge ${cls}">${esc(v)}</span>`;
  };
  // Regla de texto general: letras (con tildes, ñ, ü), números y signos básicos
  const TEXTO = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9 .,:;()'\-_\/]{3,120}$/;
  const MSG_TEXTO = 'Solo letras, números y signos básicos (3 a 120 caracteres)';

  const MODULES = {
    instructores: {
      title: 'Instructores', singular: 'instructor', icon: 'fa-chalkboard-user',
      sub: 'Gestiona el equipo de instructores del centro de formación.',
      fields: [
        { key: 'nombre', label: 'Nombre completo', type: 'text', required: true, full: true, pattern: TEXTO, msg: MSG_TEXTO },
        { key: 'documento', label: 'Documento', type: 'text', required: true, pattern: /^\d{5,12}$/, msg: 'Solo números (5 a 12 dígitos)' },
        { key: 'email', label: 'Correo', type: 'email', required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, msg: 'Correo no válido' },
        { key: 'especialidad', label: 'Especialidad', type: 'text', required: true, pattern: TEXTO, msg: MSG_TEXTO   },
        { key: 'estado', label: 'Estado', type: 'select', required: true, options: () => ['Activo', 'Inactivo'].map(v => ({ value: v, label: v })) },
        { key: 'nombre', label: 'Nombre completo', type: 'text', required: true, full: true, pattern: TEXTO, msg: MSG_TEXTO },
        { key: 'especialidad', label: 'Especialidad', type: 'text', required: true, pattern: TEXTO, msg: MSG_TEXTO }
      ],
      columns: [
        { label: 'Instructor', render: r => `<span class="cell-main">${esc(r.nombre)}</span><span class="cell-sub">${esc(r.email)}</span>` },
        { label: 'Documento', render: r => esc(r.documento) },
        { label: 'Especialidad', render: r => esc(r.especialidad) },
        { label: 'Estado', render: r => estadoBadge(r.estado) }
      ],
      search: r => [r.nombre, r.documento, r.email, r.especialidad, r.estado]
    },

    competencias: {
      title: 'Competencias', singular: 'competencia', icon: 'fa-list-check',
      sub: 'Catálogo de competencias asociadas a los programas de formación.',
      fields: [
        { key: 'codigo', label: 'Código', type: 'text', required: true, pattern: /^\d{6,12}$/, msg: 'Solo números (6 a 12 dígitos)' },
        { key: 'horas', label: 'Horas', type: 'number', required: true, min: 1, max: 2000, num: true },
        { key: 'nombre', label: 'Nombre de la competencia', type: 'text', required: true, full: true },
        { key: 'programa', label: 'Programa de formación', type: 'text', required: true, full: true },
        { key: 'nombre', label: 'Nombre de la competencia', type: 'text', required: true, full: true, pattern: TEXTO, msg: MSG_TEXTO },
        { key: 'programa', label: 'Programa de formación', type: 'text', required: true, full: true, pattern: TEXTO, msg: MSG_TEXTO }
      ],
      columns: [
        { label: 'Código', render: r => `<code>${esc(r.codigo)}</code>` },
        { label: 'Competencia', render: r => `<span class="cell-main">${esc(r.nombre)}</span><span class="cell-sub">${esc(r.programa)}</span>` },
        { label: 'Horas', render: r => `<span class="badge info">${r.horas} h</span>` }
      ],
      search: r => [r.codigo, r.nombre, r.programa]
    },

    asignaciones: {
      title: 'Asignaciones', singular: 'asignación', icon: 'fa-link',
      sub: 'Relaciona instructores, competencias y fichas con su intensidad horaria.',
      fields: [
        { key: 'instructorId', label: 'Instructor', type: 'select', required: true, full: true, num: true, options: opts(() => db.instructores, x => x.nombre) },
        { key: 'competenciaId', label: 'Competencia', type: 'select', required: true, full: true, num: true, options: opts(() => db.competencias, x => x.nombre) },
        { key: 'fichaId', label: 'Ficha', type: 'select', required: true, num: true, options: opts(() => db.fichas, x => `${x.numero} · ${x.programa}`) },
        { key: 'fecha', label: 'Fecha de asignación', type: 'date', required: true },
        { key: 'horas', label: 'Horas asignadas', type: 'number', required: true, min: 1, max: 2000, num: true }
      ],
      columns: [
        { label: 'Instructor', render: r => esc(byId(db.instructores, r.instructorId)?.nombre ?? '— eliminado —') },
        { label: 'Competencia', render: r => { const c = byId(db.competencias, r.competenciaId); return c ? `<span class="cell-main">${esc(c.nombre)}</span><span class="cell-sub">${esc(c.codigo)}</span>` : '—'; } },
        { label: 'Ficha', render: r => `<span class="badge info">${esc(byId(db.fichas, r.fichaId)?.numero ?? '—')}</span>` },
        { label: 'Fecha', render: r => fmtDate(r.fecha) },
        { label: 'Horas', render: r => `${r.horas} h` }
      ],
      search: r => [
        byId(db.instructores, r.instructorId)?.nombre,
        byId(db.competencias, r.competenciaId)?.nombre,
        byId(db.fichas, r.fichaId)?.numero, r.fecha
      ]
    },

    fichas: {
      title: 'Fichas Tituladas', singular: 'ficha', icon: 'fa-folder-open',
      sub: 'Grupos de formación titulada con su jornada y fechas de ejecución.',
      fields: [
        { key: 'numero', label: 'Número de ficha', type: 'text', required: true, pattern: /^\d{6,8}$/, msg: 'Solo números (6 a 8 dígitos)' },
        { key: 'nivel', label: 'Nivel', type: 'select', required: true, options: () => ['Técnico', 'Tecnólogo'].map(v => ({ value: v, label: v })) },
        { key: 'programa', label: 'Programa de formación', type: 'text', required: true, full: true },
        { key: 'jornada', label: 'Jornada', type: 'select', required: true, options: () => ['Diurna', 'Nocturna', 'Mixta'].map(v => ({ value: v, label: v })) },
        { key: 'estado', label: 'Estado', type: 'select', required: true, options: () => ['Por iniciar', 'En formación', 'Finalizada'].map(v => ({ value: v, label: v })) },
        { key: 'inicio', label: 'Fecha de inicio', type: 'date', required: true },
        { key: 'fin', label: 'Fecha de fin', type: 'date', required: true },
        { key: 'programa', label: 'Programa de formación', type: 'text', required: true, full: true, pattern: TEXTO, msg: MSG_TEXTO }
      ],
      columns: [
        { label: 'Ficha', render: r => `<span class="cell-main">${esc(r.numero)}</span><span class="cell-sub">${esc(r.nivel)} · ${esc(r.jornada)}</span>` },
        { label: 'Programa', render: r => esc(r.programa) },
        { label: 'Fechas', render: r => `${fmtDate(r.inicio)} <span class="cell-sub">hasta ${fmtDate(r.fin)}</span>` },
        { label: 'Estado', render: r => estadoBadge(r.estado) }
      ],
      search: r => [r.numero, r.programa, r.nivel, r.jornada, r.estado]
    }
  };

  /* ---------------------------------------------------
     4. UTILIDADES
     --------------------------------------------------- */
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  function esc(v) {
    return String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function fmtDate(iso) {
    if (!iso) return '—';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }
  const nextId = list => list.reduce((m, x) => Math.max(m, x.id), 0) + 1;

  function toast(msg, type = 'ok') {
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<i class="fa-solid ${type === 'ok' ? 'fa-circle-check' : 'fa-circle-exclamation'}"></i><span>${esc(msg)}</span>`;
    $('#toasts').appendChild(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 300); }, 2800);
  }

  /* ---------------------------------------------------
     5. PANTALLA DE BLOQUEO
     --------------------------------------------------- */
  const lock = $('#lock');
  const app = $('#app');
  const slider = $('#slider');
  const handle = $('#sliderHandle');

  function tickClock() {
    const now = new Date();
    $('#lockClock').textContent = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false });
    $('#lockDate').textContent = now.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
  }
  setInterval(tickClock, 1000);
  tickClock();

  function refreshLockWidgets() {
    $('#wInstructores').textContent = db.instructores.length;
    $('#wFichas').textContent = db.fichas.length;
    $('#wCompetencias').textContent = db.competencias.length;
    $('#nAsign').textContent = db.asignaciones.length;
  }

  function unlock() {
    if (lock.classList.contains('unlocking')) return;
    lock.classList.add('unlocking');
    app.hidden = false;
    document.body.classList.remove('is-locked');
    render();
    setTimeout(() => { lock.hidden = true; }, 700);
  }

  function relock() {
    lock.hidden = false;
    refreshLockWidgets();
    handle.style.transform = '';
    $('#loginForm').hidden = true;
    document.body.classList.add('is-locked');
    requestAnimationFrame(() => lock.classList.remove('unlocking'));
    setTimeout(() => { app.hidden = true; }, 50);
  }

  // Deslizar para desbloquear
  (function initSlider() {
    let dragging = false, startX = 0, max = 0;
    const getMax = () => slider.clientWidth - handle.offsetWidth - 10;

    handle.addEventListener('pointerdown', e => {
      dragging = true; startX = e.clientX; max = getMax();
      handle.classList.add('dragging');
      handle.setPointerCapture(e.pointerId);
    });
    handle.addEventListener('pointermove', e => {
      if (!dragging) return;
      const x = Math.min(Math.max(0, e.clientX - startX), max);
      handle.style.transform = `translateX(${x}px)`;
    });
    const end = e => {
      if (!dragging) return;
      dragging = false;
      handle.classList.remove('dragging');
      const x = new DOMMatrix(getComputedStyle(handle).transform).m41;
      if (x > max * 0.85) { handle.style.transform = `translateX(${max}px)`; unlock(); }
      else handle.style.transform = '';
    };
    handle.addEventListener('pointerup', end);
    handle.addEventListener('pointercancel', end);
    slider.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') { e.preventDefault(); unlock(); } });
  })();

  $('#quickAccess').addEventListener('click', unlock);
  $('#toggleLogin').addEventListener('click', () => {
    const f = $('#loginForm');
    f.hidden = !f.hidden;
    if (!f.hidden) $('#loginUser').focus();
  });
  $('#loginForm').addEventListener('submit', e => {
    e.preventDefault();
    const u = $('#loginUser').value.trim().toLowerCase();
    const p = $('#loginPass').value;
    if (u === 'admin' && p === 'sena2026') {
      $('#loginError').hidden = true;
      unlock();
    } else {
      $('#loginError').hidden = false;
      const f = $('#loginForm');
      f.classList.remove('shake'); void f.offsetWidth; f.classList.add('shake');
    }
  });
  $('#btnLock').addEventListener('click', relock);

  /* ---------------------------------------------------
     6. RENDER (tabs, stats, tabla)
     --------------------------------------------------- */
  let current = 'instructores';
  let query = '';

  function render() {
    renderTabs();
    renderStats();
    renderTable();
  }

  function renderTabs() {
    $$('.tab').forEach(t => t.classList.toggle('active', t.dataset.module === current));
  }

  function renderStats() {
    $('#stats').innerHTML = ['instructores', 'competencias', 'asignaciones', 'fichas'].map(k => `
      <button class="stat glass ${k === current ? 'active' : ''}" data-module="${k}">
        <div class="stat-icon"><i class="fa-solid ${MODULES[k].icon}"></i></div>
        <div><strong>${db[k].length}</strong><span>${MODULES[k].title}</span></div>
      </button>`).join('');
  }

  function renderTable() {
    const m = MODULES[current];
    $('#panelTitle').textContent = m.title;
    $('#panelSub').textContent = m.sub;
    $('#btnNew').title = `Nueva ${m.singular}`;

    $('#thead').innerHTML = `<tr>${m.columns.map(c => `<th>${c.label}</th>`).join('')}<th class="actions-col">Acciones</th></tr>`;

    const q = query.trim().toLowerCase();
    const rows = db[current].filter(r => !q || m.search(r).some(v => String(v ?? '').toLowerCase().includes(q)));

    $('#tbody').innerHTML = rows.map((r, i) => `
      <tr style="animation-delay:${Math.min(i * 30, 300)}ms">
        ${m.columns.map(c => `<td>${c.render(r)}</td>`).join('')}
        <td class="actions-col">
          <button class="row-btn edit" data-id="${r.id}" title="Editar"><i class="fa-solid fa-pen"></i></button>
          <button class="row-btn del" data-id="${r.id}" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
        </td>
      </tr>`).join('');

    $('#empty').hidden = rows.length > 0;
  }

  function setModule(name) {
    current = name; query = ''; $('#search').value = '';
    render();
  }

  $('#tabs').addEventListener('click', e => { const t = e.target.closest('.tab'); if (t) setModule(t.dataset.module); });
  $('#stats').addEventListener('click', e => { const s = e.target.closest('.stat'); if (s) setModule(s.dataset.module); });
  $('#search').addEventListener('input', e => { query = e.target.value; renderTable(); });

  /* ---------------------------------------------------
     7. CRUD (crear / editar con modal, eliminar con confirmación)
     --------------------------------------------------- */
  let editingId = null;
  const modal = $('#modal');

  function openForm(id = null) {
    const m = MODULES[current];
    editingId = id;
    const rec = id ? db[current].find(x => x.id === id) : {};

    // Para asignaciones se necesita que existan datos relacionados
    if (current === 'asignaciones' && (!db.instructores.length || !db.competencias.length || !db.fichas.length)) {
      toast('Primero crea instructores, competencias y fichas', 'err');
      return;
    }

    $('#modalTitle').textContent = id ? `Editar ${m.singular}` : `Nueva ${m.singular}`;
    $('#formFields').innerHTML = m.fields.map(f => {
      const val = rec[f.key] ?? '';
      let input;
      if (f.type === 'select') {
        input = `<select name="${f.key}"><option value="">Selecciona...</option>${f.options().map(o =>
          `<option value="${esc(o.value)}" ${String(o.value) === String(val) ? 'selected' : ''}>${esc(o.label)}</option>`).join('')}</select>`;
      } else {
        const extra = f.type === 'number' ? ` min="${f.min}" max="${f.max}"` : '';
        input = `<input name="${f.key}" type="${f.type}" value="${esc(val)}"${extra}>`;
      }
      return `<div class="form-group ${f.full ? 'full' : ''}" data-key="${f.key}">
        <label>${f.label}${f.required ? ' *' : ''}</label>${input}<span class="err"></span></div>`;
    }).join('');

    modal.hidden = false;
    $('#formFields input, #formFields select').focus();
  }

  function closeForm() { modal.hidden = true; editingId = null; }

  function validate(data) {
    const m = MODULES[current];
    let ok = true;
    m.fields.forEach(f => {
      const grp = $(`.form-group[data-key="${f.key}"]`);
      const v = data[f.key];
      let msg = '';
      if (f.required && (v === '' || v == null)) msg = 'Campo obligatorio';
      else if (f.pattern && !f.pattern.test(v)) msg = f.msg || 'Formato no válido';
      else if (f.type === 'number' && (isNaN(v) || v < f.min || v > f.max)) msg = `Debe estar entre ${f.min} y ${f.max}`;
      grp.classList.toggle('invalid', !!msg);
      $('.err', grp).textContent = msg;
      if (msg) ok = false;
    });

    // Reglas adicionales
    if (ok && current === 'fichas' && data.fin < data.inicio) {
      const grp = $('.form-group[data-key="fin"]');
      grp.classList.add('invalid'); $('.err', grp).textContent = 'Debe ser posterior al inicio'; ok = false;
    }
    // Unicidad de claves de negocio
    const unique = { instructores: 'documento', competencias: 'codigo', fichas: 'numero' }[current];
    if (ok && unique && db[current].some(r => r[unique] === data[unique] && r.id !== editingId)) {
      const grp = $(`.form-group[data-key="${unique}"]`);
      grp.classList.add('invalid'); $('.err', grp).textContent = 'Ya existe un registro con este valor'; ok = false;
    }
    return ok;
  }

  $('#form').addEventListener('submit', e => {
    e.preventDefault();
    const m = MODULES[current];
    const data = {};
    m.fields.forEach(f => {
      let v = $(`[name="${f.key}"]`).value.trim();
      if (f.num && v !== '') v = Number(v);
      data[f.key] = v;
    });
    if (!validate(data)) return;

    if (editingId) {
      const i = db[current].findIndex(x => x.id === editingId);
      db[current][i] = { ...db[current][i], ...data };
      toast(`${cap(m.singular)} actualizada`);
    } else {
      db[current].push({ id: nextId(db[current]), ...data });
      toast(`${cap(m.singular)} creada`);
    }
    saveDB();
    closeForm();
    render();
  });

  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

  // Eliminar
  let deletingId = null;
  function askDelete(id) {
    deletingId = id;
    const refs = dependents(current, id);
    $('#confirmText').textContent = refs
      ? `Tiene ${refs} asignación(es) asociada(s) y no se puede eliminar.`
      : 'Esta acción no se puede deshacer.';
    $('#confirmYes').hidden = !!refs;
    $('#confirm').hidden = false;
  }

  function dependents(mod, id) {
    const fk = { instructores: 'instructorId', competencias: 'competenciaId', fichas: 'fichaId' }[mod];
    return fk ? db.asignaciones.filter(a => a[fk] === id).length : 0;
  }

  $('#confirmNo').addEventListener('click', () => { $('#confirm').hidden = true; });
  $('#confirmYes').addEventListener('click', () => {
    db[current] = db[current].filter(x => x.id !== deletingId);
    saveDB();
    $('#confirm').hidden = true;
    toast(`${cap(MODULES[current].singular)} eliminada`);
    render();
  });

  // Eventos de la tabla y modal
  $('#btnNew').addEventListener('click', () => openForm());
  $('#tbody').addEventListener('click', e => {
    const edit = e.target.closest('.edit'), del = e.target.closest('.del');
    if (edit) openForm(Number(edit.dataset.id));
    if (del) askDelete(Number(del.dataset.id));
  });
  $('#modalClose').addEventListener('click', closeForm);
  $('#modalCancel').addEventListener('click', closeForm);
  [modal, $('#confirm')].forEach(el => el.addEventListener('mousedown', e => { if (e.target === el) { el.hidden = true; editingId = null; } }));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { modal.hidden = true; $('#confirm').hidden = true; } });

  $('#btnReset').addEventListener('click', () => {
    if (!confirm('¿Restablecer todos los datos a los valores de ejemplo?')) return;
    db = seed(); saveDB(); render(); toast('Datos de ejemplo restablecidos');
  });
  // Validación robusta para campos de texto generales (Nombres, Notas, etc.)
function isValidText(text) {
  // Permite letras (incluyendo acentos y eñes), números, espacios y signos básicos de puntuación
  const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s.,\-_]+$/;
  return regex.test(text);
}

// Ejemplo de validación previa en la creación de reservas (dentro del módulo Reservas o App):
function validateReservaInput(cliente, telefono, notas) {
  if (!isValidText(cliente)) {
    return { ok: false, error: 'El nombre del cliente contiene caracteres no permitidos.' };
  }
  if (!/^\d{7,15}$/.test(telefono)) {
    return { ok: false, error: 'El teléfono debe contener únicamente números (entre 7 y 15 dígitos).' };
  }
  if (notas && !isValidText(notas)) {
    return { ok: false, error: 'Las notas contienen caracteres especiales no válidos.' };
  }
  return { ok: true };
}

  /* ---------------------------------------------------
     8. INICIO
     --------------------------------------------------- */
  refreshLockWidgets();
})();
