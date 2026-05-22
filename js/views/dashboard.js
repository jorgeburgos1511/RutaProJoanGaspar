import { obtenerSalidas, eliminarSalida } from '../db.js';
import { cerrarSesion } from '../auth.js';
import { ir } from '../router.js';

const COLORES_ESTADO = {
  pendiente: { bg: '#2d2000', text: '#fbbf24', label: 'Pendiente' },
  en_ruta:   { bg: '#001a3d', text: '#60a5fa', label: 'En ruta' },
  completada:{ bg: '#002210', text: '#4ade80', label: 'Completada' }
};

export async function renderDashboard(contenedor) {
  contenedor.innerHTML = `
    <div class="min-h-screen" style="background:#0f1117">
      ${navBar()}
      <main class="max-w-4xl mx-auto px-4 py-8">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="text-2xl font-bold text-white" style="font-family:'Syne',sans-serif">Salidas</h1>
            <p class="text-gray-500 text-sm mt-1">Gestiona las rutas de entrega</p>
          </div>
          <button onclick="window.location.hash='#/nueva-salida'"
            class="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white transition-all text-sm"
            style="background:#f97316;font-family:'Syne',sans-serif"
            onmouseover="this.style.background='#ea6c0a'"
            onmouseout="this.style.background='#f97316'">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
            Nueva Salida
          </button>
        </div>
        <div id="lista-salidas">
          <div class="text-center py-16">
            <div class="spinner mx-auto mb-3"></div>
            <p class="text-gray-500 text-sm">Cargando salidas...</p>
          </div>
        </div>
      </main>
    </div>
  `;

  try {
    const salidas = await obtenerSalidas();
    renderLista(salidas);
  } catch (err) {
    document.getElementById('lista-salidas').innerHTML = `
      <div class="text-center py-16">
        <p class="text-red-400">Error al cargar salidas: ${err.message}</p>
      </div>
    `;
  }
}

function renderLista(salidas) {
  const lista = document.getElementById('lista-salidas');
  if (!salidas.length) {
    lista.innerHTML = `
      <div class="text-center py-20">
        <div class="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style="background:#1a1d26">
          <svg width="28" height="28" fill="none" stroke="#f97316" stroke-width="1.5" viewBox="0 0 24 24">
            <path d="M1 3h15l4 9H5L1 3z"/><path d="M5 12l-1 7h16"/>
            <circle cx="9" cy="21" r="1.5"/><circle cx="18" cy="21" r="1.5"/>
          </svg>
        </div>
        <p class="text-white font-semibold mb-1" style="font-family:'Syne',sans-serif">Sin salidas aún</p>
        <p class="text-gray-500 text-sm">Crea tu primera salida para comenzar</p>
      </div>
    `;
    return;
  }

  lista.innerHTML = `<div class="space-y-3">${salidas.map(s => tarjetaSalida(s)).join('')}</div>`;

  salidas.forEach(s => {
    document.getElementById(`ver-${s.id}`)?.addEventListener('click', () => ir(`/salida/${s.id}`));
    document.getElementById(`del-${s.id}`)?.addEventListener('click', () => confirmarEliminar(s.id, s.nombre));
  });
}

function tarjetaSalida(s) {
  const estado = COLORES_ESTADO[s.estado] || COLORES_ESTADO.pendiente;
  const fecha = s.fecha ? new Date(s.fecha.seconds * 1000).toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' }) : '—';
  const numParadas = s.paradas?.length || 0;

  return `
    <div class="rounded-xl p-5 flex items-center justify-between gap-4 transition-all cursor-pointer group"
      style="background:#1a1d26;border:1px solid #2a2d3a"
      onmouseover="this.style.borderColor='#f97316'"
      onmouseout="this.style.borderColor='#2a2d3a'">
      <div class="flex-1 min-w-0" id="ver-${s.id}" style="cursor:pointer">
        <div class="flex items-center gap-3 mb-2 flex-wrap">
          <h3 class="text-white font-semibold truncate" style="font-family:'Syne',sans-serif">${s.nombre}</h3>
          <span class="text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0"
            style="background:${estado.bg};color:${estado.text}">
            ${estado.label}
          </span>
        </div>
        <div class="flex items-center gap-4 text-xs text-gray-500">
          <span class="flex items-center gap-1">
            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
            ${fecha}
          </span>
          <span class="flex items-center gap-1">
            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="10" r="3"/><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>
            ${numParadas} parada${numParadas !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
      <button id="del-${s.id}"
        class="flex-shrink-0 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100"
        style="color:#6b7280"
        onmouseover="this.style.color='#f87171';this.style.background='#2a1111'"
        onmouseout="this.style.color='#6b7280';this.style.background='transparent'"
        title="Eliminar">
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
        </svg>
      </button>
    </div>
  `;
}

async function confirmarEliminar(id, nombre) {
  if (!confirm(`¿Eliminar la salida "${nombre}"? Esta acción no se puede deshacer.`)) return;
  try {
    await eliminarSalida(id);
    ir('/');
    renderDashboard(document.getElementById('app'));
  } catch (err) {
    alert('Error al eliminar: ' + err.message);
  }
}

function navBar() {
  return `
    <nav class="sticky top-0 z-50 px-4 py-3 flex items-center justify-between" style="background:#0f1117;border-bottom:1px solid #1a1d26">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background:#f97316">
          <svg width="16" height="16" fill="none" stroke="white" stroke-width="2.5" viewBox="0 0 24 24">
            <path d="M1 3h15l4 9H5L1 3z"/><path d="M5 12l-1 7h16"/>
            <circle cx="9" cy="21" r="1.5"/><circle cx="18" cy="21" r="1.5"/>
          </svg>
        </div>
        <span class="font-bold text-white" style="font-family:'Syne',sans-serif;letter-spacing:-0.5px">RutaPro</span>
      </div>
      <button onclick="window._cerrarSesion()"
        class="text-xs text-gray-500 hover:text-white transition-colors px-3 py-1.5 rounded-lg"
        style="border:1px solid #2a2d3a"
        onmouseover="this.style.borderColor='#6b7280'"
        onmouseout="this.style.borderColor='#2a2d3a'">
        Cerrar sesión
      </button>
    </nav>
  `;
}

window._cerrarSesion = async () => {
  await cerrarSesion();
};
