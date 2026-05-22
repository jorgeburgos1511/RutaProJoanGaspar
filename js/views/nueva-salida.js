import { crearSalida } from '../db.js';
import { usuarioActual } from '../auth.js';
import { ir } from '../router.js';

let paradas = [];
let contadorParada = 0;
let coordsModal = { lat: null, lng: null };

export function renderNuevaSalida(contenedor) {
  paradas = [];
  contadorParada = 0;

  contenedor.innerHTML = `
    <div class="min-h-screen" style="background:#0f1117">
      ${navBarVolver()}
      <main class="max-w-2xl mx-auto px-4 py-8">
        <div class="mb-8">
          <h1 class="text-2xl font-bold text-white" style="font-family:'Syne',sans-serif">Nueva Salida</h1>
          <p class="text-gray-500 text-sm mt-1">Agrega las paradas y optimiza la ruta</p>
        </div>

        <div class="rounded-2xl p-6 mb-6" style="background:#1a1d26;border:1px solid #2a2d3a">
          <label class="block text-sm text-gray-400 mb-1.5">Nombre de la salida</label>
          <input type="text" id="nombre-salida" placeholder='Ej: "Entrega martes 27"'
            class="w-full px-4 py-3 rounded-xl text-white text-sm outline-none"
            style="background:#0f1117;border:1px solid #2a2d3a"
            onfocus="this.style.borderColor='#f97316'"
            onblur="this.style.borderColor='#2a2d3a'">
        </div>

        <div class="rounded-2xl p-6 mb-6" style="background:#1a1d26;border:1px solid #2a2d3a">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-semibold text-white" style="font-family:'Syne',sans-serif">Paradas</h2>
            <button id="btn-agregar-parada"
              class="flex items-center gap-2 text-sm px-4 py-2 rounded-xl transition-all"
              style="background:#f9731620;color:#f97316;border:1px solid #f9731640"
              onmouseover="this.style.background='#f9731630'"
              onmouseout="this.style.background='#f9731620'">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Agregar parada
            </button>
          </div>
          <div id="lista-paradas">
            <p class="text-gray-600 text-sm text-center py-6">Sin paradas. Agrega al menos una.</p>
          </div>
        </div>

        <div id="msg-error" class="hidden mb-4 px-4 py-3 rounded-xl text-sm"
          style="background:#3b1212;color:#f87171;border:1px solid #7f1d1d"></div>

        <button id="btn-guardar"
          class="w-full py-4 rounded-xl font-bold text-white text-sm transition-all flex items-center justify-center gap-2"
          style="background:#f97316;font-family:'Syne',sans-serif"
          onmouseover="this.style.background='#ea6c0a'"
          onmouseout="this.style.background='#f97316'">
          <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          Optimizar y Guardar Ruta
        </button>
      </main>
    </div>
  `;

  document.getElementById('btn-agregar-parada').addEventListener('click', () => abrirModalParada());
  document.getElementById('btn-guardar').addEventListener('click', guardarSalida);
}

// ─── Modal de parada ─────────────────────────────────────────────────────────

function abrirModalParada(paradaExistente = null) {
  coordsModal = paradaExistente?.lat
    ? { lat: paradaExistente.lat, lng: paradaExistente.lng }
    : { lat: null, lng: null };

  const esEdicion = paradaExistente !== null;
  const overlay = document.createElement('div');
  overlay.id = 'modal-parada';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:50;display:flex;align-items:flex-end;justify-content:center;background:rgba(0,0,0,0.75);overflow-y:auto';

  const ubicacionHTML = coordsModal.lat
    ? `<div id="mp-ubicacion-badge" style="display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:12px;background:#002210;border:1px solid #15803440;margin-bottom:4px">
        <svg width="14" height="14" fill="#4ade80" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>
        <span style="font-size:12px;color:#4ade80;flex:1">Ubicación confirmada (${coordsModal.lat.toFixed(4)}, ${coordsModal.lng.toFixed(4)})</span>
        <button id="btn-cambiar-ubicacion" style="font-size:11px;color:#9ca3af;background:none;border:none;cursor:pointer;text-decoration:underline">Cambiar</button>
      </div>`
    : '';

  overlay.innerHTML = `
    <div id="modal-inner" style="width:100%;max-width:520px;border-radius:24px 24px 0 0;padding:24px;background:#1a1d26;border:1px solid #2a2d3a;margin-top:auto">
      <div style="width:40px;height:4px;border-radius:2px;background:#2a2d3a;margin:0 auto 20px"></div>
      <h3 style="font-family:'Syne',sans-serif;font-weight:700;font-size:18px;color:white;margin:0 0 20px">
        ${esEdicion ? 'Editar parada' : 'Agregar parada'}
      </h3>

      <div style="margin-bottom:16px">
        <label style="display:block;font-size:12px;color:#9ca3af;margin-bottom:6px">
          Dirección <span style="color:#f87171">*</span>
        </label>
        <div style="display:flex;gap:8px">
          <input type="text" id="mp-direccion"
            placeholder="Ej: Av. Vallarta 1234, Guadalajara"
            value="${esEdicion ? (paradaExistente.direccion || '') : ''}"
            style="flex:1;padding:12px 16px;border-radius:12px;background:#0f1117;border:1px solid #2a2d3a;color:white;font-size:14px;outline:none;font-family:'DM Sans',sans-serif"
            onfocus="this.style.borderColor='#f97316'"
            onblur="this.style.borderColor='#2a2d3a'">
          <button id="btn-buscar-dir"
            style="padding:12px 16px;border-radius:12px;background:#f97316;color:white;border:none;cursor:pointer;font-size:13px;font-weight:600;font-family:'Syne',sans-serif;white-space:nowrap;display:flex;align-items:center;gap:6px"
            onmouseover="this.style.background='#ea6c0a'"
            onmouseout="this.style.background='#f97316'">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            Abrir mapa
          </button>
        </div>
        <p id="mp-geo-status" style="font-size:12px;margin-top:6px;min-height:16px;color:#6b7280"></p>
        ${ubicacionHTML}
      </div>

      <div style="display:flex;flex-direction:column;gap:12px">
        <div>
          <label style="display:block;font-size:12px;color:#9ca3af;margin-bottom:6px">Cliente</label>
          <input type="text" id="mp-cliente"
            placeholder="Nombre del cliente (opcional)"
            value="${esEdicion ? paradaExistente.cliente || '' : ''}"
            style="width:100%;padding:12px 16px;border-radius:12px;background:#0f1117;border:1px solid #2a2d3a;color:white;font-size:14px;outline:none;box-sizing:border-box;font-family:'DM Sans',sans-serif"
            onfocus="this.style.borderColor='#f97316'"
            onblur="this.style.borderColor='#2a2d3a'">
        </div>
        <div>
          <label style="display:block;font-size:12px;color:#9ca3af;margin-bottom:6px">Materiales</label>
          <textarea id="mp-materiales" rows="2"
            placeholder="Ej: 3 PTR 2x4, 5 láminas galvanizadas (opcional)"
            style="width:100%;padding:12px 16px;border-radius:12px;background:#0f1117;border:1px solid #2a2d3a;color:white;font-size:14px;outline:none;resize:none;box-sizing:border-box;font-family:'DM Sans',sans-serif"
            onfocus="this.style.borderColor='#f97316'"
            onblur="this.style.borderColor='#2a2d3a'">${esEdicion ? paradaExistente.materiales || '' : ''}</textarea>
        </div>
        <div>
          <label style="display:block;font-size:12px;color:#9ca3af;margin-bottom:6px">ID de Venta</label>
          <input type="text" id="mp-id-venta"
            placeholder="Ej: VTA-0042 (opcional)"
            value="${esEdicion ? paradaExistente.idVenta || '' : ''}"
            style="width:100%;padding:12px 16px;border-radius:12px;background:#0f1117;border:1px solid #2a2d3a;color:white;font-size:14px;outline:none;box-sizing:border-box;font-family:'DM Sans',sans-serif"
            onfocus="this.style.borderColor='#f97316'"
            onblur="this.style.borderColor='#2a2d3a'">
        </div>
      </div>

      <div style="display:flex;gap:12px;margin-top:20px;padding-bottom:8px">
        <button id="btn-cancelar-modal"
          style="flex:1;padding:14px;border-radius:12px;background:#0f1117;color:#9ca3af;border:1px solid #2a2d3a;font-size:14px;font-weight:500;cursor:pointer;font-family:'DM Sans',sans-serif"
          onmouseover="this.style.borderColor='#6b7280'"
          onmouseout="this.style.borderColor='#2a2d3a'">
          Cancelar
        </button>
        <button id="btn-confirmar-modal"
          style="flex:1;padding:14px;border-radius:12px;background:#f97316;color:white;border:none;font-size:14px;font-weight:700;cursor:pointer;font-family:'Syne',sans-serif"
          onmouseover="this.style.background='#ea6c0a'"
          onmouseout="this.style.background='#f97316'">
          ${esEdicion ? 'Guardar cambios' : 'Agregar parada'}
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  document.getElementById('btn-cancelar-modal').addEventListener('click', () => overlay.remove());

  document.getElementById('mp-direccion').addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); buscarYAbrirMapa(); }
  });
  document.getElementById('btn-buscar-dir').addEventListener('click', buscarYAbrirMapa);
  document.getElementById('btn-cambiar-ubicacion')?.addEventListener('click', () => {
    if (coordsModal.lat) abrirMapaFullscreen(coordsModal.lat, coordsModal.lng);
  });

  document.getElementById('btn-confirmar-modal').addEventListener('click', () => {
    const direccion = document.getElementById('mp-direccion').value.trim();
    const statusEl = document.getElementById('mp-geo-status');

    if (!direccion) {
      statusEl.textContent = 'La dirección es requerida';
      statusEl.style.color = '#f87171';
      return;
    }
    if (!coordsModal.lat) {
      statusEl.textContent = 'Primero busca la dirección para confirmar la ubicación en el mapa';
      statusEl.style.color = '#f87171';
      return;
    }

    const parada = {
      id: esEdicion ? paradaExistente.id : `p-${++contadorParada}`,
      direccion,
      lat: coordsModal.lat,
      lng: coordsModal.lng,
      cliente: document.getElementById('mp-cliente').value.trim(),
      materiales: document.getElementById('mp-materiales').value.trim(),
      idVenta: document.getElementById('mp-id-venta').value.trim(),
      completada: false
    };

    if (esEdicion) {
      const idx = paradas.findIndex(p => p.id === paradaExistente.id);
      if (idx !== -1) paradas[idx] = parada;
    } else {
      paradas.push(parada);
    }

    overlay.remove();
    renderListaParadas();
  });
}

// ─── Búsqueda + mapa fullscreen ───────────────────────────────────────────────

// Centro de Guadalajara como fallback
const GDL_CENTRO = { lat: 20.6597, lng: -103.3496 };

async function buscarYAbrirMapa() {
  const dir = document.getElementById('mp-direccion').value.trim();
  const statusEl = document.getElementById('mp-geo-status');
  const btn = document.getElementById('btn-buscar-dir');

  // Si ya tenemos coords (modo edición o búsqueda previa), abrir directo ahí
  if (coordsModal.lat) {
    abrirMapaFullscreen(coordsModal.lat, coordsModal.lng, dir, false);
    return;
  }

  // Si no hay dirección escrita, abrir mapa en GDL para que ponga el pin manualmente
  if (!dir) {
    abrirMapaFullscreen(GDL_CENTRO.lat, GDL_CENTRO.lng, '', true);
    return;
  }

  // Intentar geocodificar, pero abrir el mapa SIEMPRE (con o sin éxito)
  statusEl.textContent = 'Buscando dirección...';
  statusEl.style.color = '#f97316';
  btn.disabled = true;

  try {
    const coords = await geocodificar(dir);
    coordsModal = { lat: coords.lat, lng: coords.lng };
    statusEl.textContent = '';
    abrirMapaFullscreen(coords.lat, coords.lng, dir, false);
  } catch {
    // No se encontró → abrir mapa en GDL, usuario coloca el pin manualmente
    statusEl.textContent = '';
    abrirMapaFullscreen(GDL_CENTRO.lat, GDL_CENTRO.lng, dir, true);
  } finally {
    btn.disabled = false;
  }
}

function abrirMapaFullscreen(lat, lng, dirInicial = '', sinPinInicial = false) {
  // Eliminar instancia anterior si existe
  const anterior = document.getElementById('mapa-fs-overlay');
  if (anterior) anterior.remove();

  const fsOverlay = document.createElement('div');
  fsOverlay.id = 'mapa-fs-overlay';
  fsOverlay.style.cssText = 'position:fixed;inset:0;z-index:100;background:#0f1117';

  fsOverlay.innerHTML = `
    <div style="padding:12px 16px;display:flex;flex-direction:column;gap:10px;background:#1a1d26;border-bottom:1px solid #2a2d3a;flex-shrink:0">
      <div style="display:flex;align-items:center;gap:10px">
        <button id="btn-fs-volver"
          style="padding:8px 12px;border-radius:10px;background:#0f1117;color:#9ca3af;border:1px solid #2a2d3a;cursor:pointer;font-size:12px;display:flex;align-items:center;gap:5px;font-family:'DM Sans',sans-serif;flex-shrink:0">
          <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
          Volver
        </button>
        <p style="color:white;font-size:14px;font-weight:600;margin:0;font-family:'Syne',sans-serif;flex:1">
          Selecciona la ubicación
        </p>
      </div>

      <div style="display:flex;gap:8px">
        <input type="text" id="mp-fs-buscar"
          placeholder="Buscar otra dirección..."
          value="${dirInicial}"
          style="flex:1;padding:10px 14px;border-radius:10px;background:#0f1117;border:1px solid #2a2d3a;color:white;font-size:13px;outline:none;font-family:'DM Sans',sans-serif"
          onfocus="this.style.borderColor='#f97316'"
          onblur="this.style.borderColor='#2a2d3a'">
        <button id="btn-fs-buscar-dir"
          style="padding:10px 14px;border-radius:10px;background:#f97316;color:white;border:none;cursor:pointer;font-size:12px;font-weight:600;font-family:'Syne',sans-serif">
          Buscar
        </button>
      </div>

      <p id="mp-fs-status" style="font-size:11px;color:#6b7280;margin:0;min-height:14px">
        ${sinPinInicial ? '👆 Toca el mapa donde está la ubicación o busca otra dirección' : '👆 Arrastra el pin o toca otro punto para ajustar'}
      </p>
    </div>

    <div id="mapa-fs-contenedor" style="width:100%;position:relative;background:#222"></div>

    <div style="padding:16px;background:#1a1d26;border-top:1px solid #2a2d3a;flex-shrink:0">
      <p id="mapa-fs-coords" style="font-size:12px;color:#6b7280;margin:0 0 12px;font-family:'DM Sans',sans-serif;text-align:center">
        ${sinPinInicial ? '📍 Sin ubicación seleccionada' : `📍 ${lat.toFixed(5)}, ${lng.toFixed(5)}`}
      </p>
      <button id="btn-fs-confirmar"
        style="width:100%;padding:16px;border-radius:14px;background:${sinPinInicial ? '#3a3d4a' : '#f97316'};color:white;border:none;font-size:16px;font-weight:700;cursor:pointer;font-family:'Syne',sans-serif;transition:background 0.2s"
        ${sinPinInicial ? 'disabled' : ''}>
        ${sinPinInicial ? 'Selecciona un punto en el mapa' : '✓ Confirmar esta ubicación'}
      </button>
    </div>
  `;

  document.body.appendChild(fsOverlay);

  // Calcular altura exacta del contenedor (window - header - footer)
  const contenedorMapa = document.getElementById('mapa-fs-contenedor');
  function ajustarAltura() {
    const headerH = fsOverlay.children[0].offsetHeight;
    const footerH = fsOverlay.children[2].offsetHeight;
    contenedorMapa.style.height = (window.innerHeight - headerH - footerH) + 'px';
  }
  ajustarAltura();
  window.addEventListener('resize', ajustarAltura);

  // Estado del mapa
  let coordsActuales = sinPinInicial ? null : { lat, lng };
  let marker = null;

  // Crear mapa con setView - tiles de CartoDB (mismas que funcionan en detalle-salida)
  const mapa = L.map(contenedorMapa, {
    zoomControl: true,
    attributionControl: false
  }).setView([lat, lng], sinPinInicial ? 12 : 17);

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(mapa);

  const icono = L.divIcon({
    className: '',
    html: `<div style="width:36px;height:36px;border-radius:50% 50% 50% 0;background:#f97316;transform:rotate(-45deg);border:3px solid white;box-shadow:0 3px 12px rgba(0,0,0,0.4)"></div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36]
  });

  function colocarPin(nuevoLat, nuevoLng) {
    coordsActuales = { lat: nuevoLat, lng: nuevoLng };
    if (!marker) {
      marker = L.marker([nuevoLat, nuevoLng], { icon: icono, draggable: true }).addTo(mapa);
      marker.on('dragend', e => {
        const p = e.target.getLatLng();
        coordsActuales = { lat: p.lat, lng: p.lng };
        actualizarUICoords();
      });
    } else {
      marker.setLatLng([nuevoLat, nuevoLng]);
    }
    actualizarUICoords();
  }

  function actualizarUICoords() {
    if (!coordsActuales) return;
    const el = document.getElementById('mapa-fs-coords');
    const btn = document.getElementById('btn-fs-confirmar');
    if (el) el.textContent = `📍 ${coordsActuales.lat.toFixed(5)}, ${coordsActuales.lng.toFixed(5)}`;
    if (btn) {
      btn.disabled = false;
      btn.style.background = '#f97316';
      btn.textContent = '✓ Confirmar esta ubicación';
    }
  }

  if (!sinPinInicial) colocarPin(lat, lng);

  // Clic en el mapa coloca/mueve el pin
  mapa.on('click', e => colocarPin(e.latlng.lat, e.latlng.lng));

  // Múltiples invalidateSize para asegurar render correcto
  setTimeout(() => mapa.invalidateSize(true), 50);
  setTimeout(() => mapa.invalidateSize(true), 300);
  setTimeout(() => mapa.invalidateSize(true), 800);

  // Buscador interno del fullscreen
  async function buscarEnFullscreen() {
    const q = document.getElementById('mp-fs-buscar').value.trim();
    if (!q) return;
    const status = document.getElementById('mp-fs-status');
    status.textContent = 'Buscando...';
    status.style.color = '#f97316';
    try {
      const coords = await geocodificar(q);
      mapa.setView([coords.lat, coords.lng], 17);
      colocarPin(coords.lat, coords.lng);
      status.textContent = '✓ Encontrado. Ajusta si es necesario.';
      status.style.color = '#4ade80';
      // Actualizar también el campo de dirección del modal padre
      const dirInput = document.getElementById('mp-direccion');
      if (dirInput) dirInput.value = q;
    } catch {
      status.textContent = 'No se encontró. Toca el mapa donde está la ubicación.';
      status.style.color = '#f87171';
    }
  }

  document.getElementById('btn-fs-buscar-dir').addEventListener('click', buscarEnFullscreen);
  document.getElementById('mp-fs-buscar').addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); buscarEnFullscreen(); }
  });

  document.getElementById('btn-fs-volver').addEventListener('click', () => {
    window.removeEventListener('resize', ajustarAltura);
    mapa.remove();
    fsOverlay.remove();
  });

  document.getElementById('btn-fs-confirmar').addEventListener('click', () => {
    if (!coordsActuales) return;
    coordsModal = { lat: coordsActuales.lat, lng: coordsActuales.lng };

    // Crear o actualizar badge en el modal padre
    const statusEl = document.getElementById('mp-geo-status');
    let badge = document.getElementById('mp-ubicacion-badge');

    if (!badge && statusEl) {
      badge = document.createElement('div');
      badge.id = 'mp-ubicacion-badge';
      badge.style.cssText = 'display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:12px;background:#002210;border:1px solid #15803440;margin-top:8px';
      badge.innerHTML = `
        <svg width="14" height="14" fill="#4ade80" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>
        <span style="font-size:12px;color:#4ade80;flex:1"></span>
        <button id="btn-cambiar-ubicacion" style="font-size:11px;color:#9ca3af;background:none;border:none;cursor:pointer;text-decoration:underline">Cambiar</button>
      `;
      statusEl.parentElement.appendChild(badge);
      badge.querySelector('#btn-cambiar-ubicacion').addEventListener('click', () => {
        abrirMapaFullscreen(coordsModal.lat, coordsModal.lng, document.getElementById('mp-direccion').value.trim(), false);
      });
    }

    if (badge) {
      badge.querySelector('span').textContent = `Ubicación confirmada (${coordsActuales.lat.toFixed(4)}, ${coordsActuales.lng.toFixed(4)})`;
    }
    if (statusEl) statusEl.textContent = '';

    window.removeEventListener('resize', ajustarAltura);
    mapa.remove();
    fsOverlay.remove();
  });
}

// ─── Lista de paradas ─────────────────────────────────────────────────────────

function renderListaParadas() {
  const lista = document.getElementById('lista-paradas');
  if (!paradas.length) {
    lista.innerHTML = '<p class="text-gray-600 text-sm text-center py-6">Sin paradas. Agrega al menos una.</p>';
    return;
  }

  lista.innerHTML = `<div class="space-y-3">${paradas.map((p, i) => `
    <div class="flex items-start gap-3 p-4 rounded-xl" style="background:#0f1117;border:1px solid #2a2d3a">
      <div class="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white mt-0.5"
        style="background:#f97316">${i + 1}</div>
      <div class="flex-1 min-w-0">
        <p class="text-white text-sm font-medium truncate">${p.direccion}</p>
        ${p.cliente ? `<p class="text-gray-500 text-xs mt-0.5">👤 ${p.cliente}</p>` : ''}
        ${p.materiales ? `<p class="text-gray-500 text-xs mt-0.5">📦 ${p.materiales}</p>` : ''}
        ${p.idVenta ? `<p class="text-gray-500 text-xs mt-0.5">🧾 ${p.idVenta}</p>` : ''}
      </div>
      <div class="flex gap-1 flex-shrink-0">
        <button data-edit="${p.id}" class="p-1.5 rounded-lg transition-all" style="color:#6b7280"
          onmouseover="this.style.color='#f97316'" onmouseout="this.style.color='#6b7280'" title="Editar">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button data-del="${p.id}" class="p-1.5 rounded-lg transition-all" style="color:#6b7280"
          onmouseover="this.style.color='#f87171'" onmouseout="this.style.color='#6b7280'" title="Eliminar">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
          </svg>
        </button>
      </div>
    </div>
  `).join('')}</div>`;

  lista.querySelectorAll('[data-edit]').forEach(btn => {
    const parada = paradas.find(p => p.id === btn.dataset.edit);
    if (parada) btn.addEventListener('click', () => abrirModalParada(parada));
  });
  lista.querySelectorAll('[data-del]').forEach(btn => {
    btn.addEventListener('click', () => {
      paradas = paradas.filter(p => p.id !== btn.dataset.del);
      renderListaParadas();
    });
  });
}

// ─── Geocodificación ──────────────────────────────────────────────────────────

async function geocodificar(direccion) {
  const yaIncluye = /jalisco|guadalajara|zapopan|tlaquepaque|tonalá|tonala|tlajomulco/i.test(direccion);
  const query = yaIncluye ? direccion : `${direccion}, Guadalajara, Jalisco, México`;

  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=mx`,
    { headers: { 'User-Agent': 'RutaPro/1.0 materiales-joan-gaspar' } }
  );
  const data = await res.json();
  if (!data.length) throw new Error('Sin resultados');
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
}

// ─── Optimización de ruta ─────────────────────────────────────────────────────

async function optimizarRuta(ps) {
  if (ps.length <= 1) return ps.map((p, i) => ({ ...p, orden: i }));
  try {
    const coords = ps.map(p => `${p.lng},${p.lat}`).join(';');
    const url = `https://router.project-osrm.org/trip/v1/driving/${coords}?roundtrip=false&source=first&destination=last`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.code !== 'Ok') throw new Error(data.message);
    const ordenadas = new Array(ps.length);
    data.waypoints.forEach(wp => {
      ordenadas[wp.waypoint_index] = { ...ps[wp.waypoint_index], orden: wp.waypoint_index };
    });
    return ordenadas.filter(Boolean).map((p, i) => ({ ...p, orden: i }));
  } catch {
    return ps.map((p, i) => ({ ...p, orden: i }));
  }
}

// ─── Guardar salida ───────────────────────────────────────────────────────────

async function guardarSalida() {
  const nombre = document.getElementById('nombre-salida').value.trim();
  const errorEl = document.getElementById('msg-error');
  const btn = document.getElementById('btn-guardar');

  errorEl.classList.add('hidden');

  if (!nombre) {
    errorEl.textContent = 'El nombre de la salida es requerido';
    errorEl.classList.remove('hidden');
    return;
  }
  if (paradas.length === 0) {
    errorEl.textContent = 'Agrega al menos una parada';
    errorEl.classList.remove('hidden');
    return;
  }

  btn.disabled = true;
  btn.innerHTML = `<div class="spinner" style="border-color:white;border-top-color:transparent"></div> Optimizando ruta...`;

  try {
    const paradasOptimizadas = await optimizarRuta(paradas);
    const usuario = usuarioActual();
    const id = await crearSalida({
      nombre,
      fecha: new Date(),
      creadoPor: usuario?.uid || 'desconocido',
      paradas: paradasOptimizadas
    });
    ir(`/salida/${id}`);
  } catch (err) {
    errorEl.textContent = 'Error al guardar: ' + err.message;
    errorEl.classList.remove('hidden');
    btn.disabled = false;
    btn.innerHTML = `
      <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
      Optimizar y Guardar Ruta`;
  }
}

function navBarVolver() {
  return `
    <nav class="sticky top-0 z-50 px-4 py-3 flex items-center gap-3" style="background:#0f1117;border-bottom:1px solid #1a1d26">
      <button onclick="window.location.hash='#/'"
        class="p-2 rounded-xl transition-all" style="color:#9ca3af;border:1px solid #2a2d3a"
        onmouseover="this.style.borderColor='#6b7280'" onmouseout="this.style.borderColor='#2a2d3a'">
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background:#f97316">
          <svg width="16" height="16" fill="none" stroke="white" stroke-width="2.5" viewBox="0 0 24 24">
            <path d="M1 3h15l4 9H5L1 3z"/><path d="M5 12l-1 7h16"/>
            <circle cx="9" cy="21" r="1.5"/><circle cx="18" cy="21" r="1.5"/>
          </svg>
        </div>
        <span class="font-bold text-white" style="font-family:'Syne',sans-serif;letter-spacing:-0.5px">RutaPro</span>
      </div>
    </nav>
  `;
}
