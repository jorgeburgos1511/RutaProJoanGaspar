import { crearSalida } from '../db.js';
import { usuarioActual } from '../auth.js';
import { ir } from '../router.js';

let paradas = [];
let contadorParada = 0;

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
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
              Agregar parada
            </button>
          </div>
          <div id="lista-paradas">
            <p class="text-gray-600 text-sm text-center py-6">Sin paradas. Agrega al menos una.</p>
          </div>
        </div>

        <div id="msg-error" class="hidden mb-4 px-4 py-3 rounded-xl text-sm" style="background:#3b1212;color:#f87171;border:1px solid #7f1d1d"></div>

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

function abrirModalParada(paradaExistente = null) {
  const esEdicion = paradaExistente !== null;
  const overlay = document.createElement('div');
  overlay.id = 'modal-parada';
  overlay.className = 'fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4';
  overlay.style.background = 'rgba(0,0,0,0.7)';
  overlay.innerHTML = `
    <div class="w-full max-w-lg rounded-2xl p-6" style="background:#1a1d26;border:1px solid #2a2d3a">
      <h3 class="font-bold text-white mb-5" style="font-family:'Syne',sans-serif">
        ${esEdicion ? 'Editar parada' : 'Agregar parada'}
      </h3>

      <div class="space-y-4">
        <div>
          <label class="block text-xs text-gray-400 mb-1.5">Dirección <span class="text-red-400">*</span></label>
          <div class="relative">
            <input type="text" id="mp-direccion" placeholder="Calle, número, colonia..."
              value="${esEdicion ? (paradaExistente.direccion || '') : ''}"
              class="w-full px-4 py-3 rounded-xl text-white text-sm outline-none pr-10"
              style="background:#0f1117;border:1px solid #2a2d3a"
              onfocus="this.style.borderColor='#f97316'"
              onblur="this.style.borderColor='#2a2d3a'">
            <button id="btn-buscar-dir" title="Buscar coordenadas"
              class="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all"
              style="color:#f97316">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </button>
          </div>
          <p id="mp-geo-status" class="text-xs mt-1 text-gray-600"></p>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs text-gray-400 mb-1.5">Latitud</label>
            <input type="number" id="mp-lat" step="any" placeholder="Auto"
              value="${esEdicion ? paradaExistente.lat : ''}"
              class="w-full px-3 py-2.5 rounded-xl text-white text-sm outline-none"
              style="background:#0f1117;border:1px solid #2a2d3a"
              onfocus="this.style.borderColor='#f97316'"
              onblur="this.style.borderColor='#2a2d3a'">
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1.5">Longitud</label>
            <input type="number" id="mp-lng" step="any" placeholder="Auto"
              value="${esEdicion ? paradaExistente.lng : ''}"
              class="w-full px-3 py-2.5 rounded-xl text-white text-sm outline-none"
              style="background:#0f1117;border:1px solid #2a2d3a"
              onfocus="this.style.borderColor='#f97316'"
              onblur="this.style.borderColor='#2a2d3a'">
          </div>
        </div>

        <div>
          <label class="block text-xs text-gray-400 mb-1.5">Cliente</label>
          <input type="text" id="mp-cliente" placeholder="Nombre del cliente (opcional)"
            value="${esEdicion ? paradaExistente.cliente || '' : ''}"
            class="w-full px-4 py-3 rounded-xl text-white text-sm outline-none"
            style="background:#0f1117;border:1px solid #2a2d3a"
            onfocus="this.style.borderColor='#f97316'"
            onblur="this.style.borderColor='#2a2d3a'">
        </div>

        <div>
          <label class="block text-xs text-gray-400 mb-1.5">Materiales</label>
          <textarea id="mp-materiales" rows="2" placeholder="Ej: 3 PTR 2x4, 5 láminas galvanizadas (opcional)"
            class="w-full px-4 py-3 rounded-xl text-white text-sm outline-none resize-none"
            style="background:#0f1117;border:1px solid #2a2d3a"
            onfocus="this.style.borderColor='#f97316'"
            onblur="this.style.borderColor='#2a2d3a'">${esEdicion ? paradaExistente.materiales || '' : ''}</textarea>
        </div>

        <div>
          <label class="block text-xs text-gray-400 mb-1.5">ID de Venta</label>
          <input type="text" id="mp-id-venta" placeholder="Ej: VTA-0042 (opcional)"
            value="${esEdicion ? paradaExistente.idVenta || '' : ''}"
            class="w-full px-4 py-3 rounded-xl text-white text-sm outline-none"
            style="background:#0f1117;border:1px solid #2a2d3a"
            onfocus="this.style.borderColor='#f97316'"
            onblur="this.style.borderColor='#2a2d3a'">
        </div>
      </div>

      <div class="flex gap-3 mt-6">
        <button id="btn-cancelar-modal"
          class="flex-1 py-3 rounded-xl text-sm font-medium transition-all"
          style="background:#0f1117;color:#9ca3af;border:1px solid #2a2d3a"
          onmouseover="this.style.borderColor='#6b7280'"
          onmouseout="this.style.borderColor='#2a2d3a'">
          Cancelar
        </button>
        <button id="btn-confirmar-modal"
          class="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all"
          style="background:#f97316;font-family:'Syne',sans-serif"
          onmouseover="this.style.background='#ea6c0a'"
          onmouseout="this.style.background='#f97316'">
          ${esEdicion ? 'Guardar cambios' : 'Agregar'}
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById('btn-cancelar-modal').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

  document.getElementById('btn-buscar-dir').addEventListener('click', async () => {
    const dir = document.getElementById('mp-direccion').value.trim();
    if (!dir) return;
    const statusEl = document.getElementById('mp-geo-status');
    statusEl.textContent = 'Buscando...';
    statusEl.style.color = '#f97316';
    try {
      const coords = await geocodificar(dir);
      document.getElementById('mp-lat').value = coords.lat;
      document.getElementById('mp-lng').value = coords.lng;
      statusEl.textContent = `✓ Coordenadas encontradas: ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`;
      statusEl.style.color = '#4ade80';
    } catch {
      statusEl.textContent = 'No se encontraron coordenadas. Ingresa lat/lng manualmente.';
      statusEl.style.color = '#f87171';
    }
  });

  document.getElementById('btn-confirmar-modal').addEventListener('click', () => {
    const direccion = document.getElementById('mp-direccion').value.trim();
    const lat = parseFloat(document.getElementById('mp-lat').value);
    const lng = parseFloat(document.getElementById('mp-lng').value);

    if (!direccion) {
      document.getElementById('mp-geo-status').textContent = 'La dirección es requerida';
      document.getElementById('mp-geo-status').style.color = '#f87171';
      return;
    }
    if (isNaN(lat) || isNaN(lng)) {
      document.getElementById('mp-geo-status').textContent = 'Busca las coordenadas o ingrésalas manualmente';
      document.getElementById('mp-geo-status').style.color = '#f87171';
      return;
    }

    const parada = {
      id: esEdicion ? paradaExistente.id : `p-${++contadorParada}`,
      direccion,
      lat,
      lng,
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
        ${p.cliente ? `<p class="text-gray-500 text-xs mt-0.5">Cliente: ${p.cliente}</p>` : ''}
        ${p.materiales ? `<p class="text-gray-500 text-xs mt-0.5">Materiales: ${p.materiales}</p>` : ''}
        ${p.idVenta ? `<p class="text-gray-500 text-xs mt-0.5">Venta: ${p.idVenta}</p>` : ''}
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

async function geocodificar(direccion) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(direccion)}&format=json&limit=1`,
    { headers: { 'User-Agent': 'RutaPro/1.0 materiales-joan-gaspar' } }
  );
  const data = await res.json();
  if (!data.length) throw new Error('Sin resultados');
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
}

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
      ordenadas[wp.waypoint_index] = { ...ps[wp.trips_index !== undefined ? wp.trips_index : wp.waypoint_index], orden: wp.waypoint_index };
    });

    return ordenadas.filter(Boolean).map((p, i) => ({ ...p, orden: i }));
  } catch {
    return ps.map((p, i) => ({ ...p, orden: i }));
  }
}

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
