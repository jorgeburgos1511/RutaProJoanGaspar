import { obtenerSalida, actualizarSalida, marcarParadaCompletada } from '../db.js';
import { ir } from '../router.js';

const ESTADOS = ['pendiente', 'en_ruta', 'completada'];
const COLORES_ESTADO = {
  pendiente:  { bg: '#2d2000', text: '#fbbf24', label: 'Pendiente' },
  en_ruta:    { bg: '#001a3d', text: '#60a5fa', label: 'En ruta' },
  completada: { bg: '#002210', text: '#4ade80', label: 'Completada' }
};

let mapaInstancia = null;

export async function renderDetalleSalida(contenedor, salidaId) {
  contenedor.innerHTML = `
    <div class="min-h-screen" style="background:#0f1117">
      ${navBarVolver()}
      <main class="max-w-6xl mx-auto px-4 py-8">
        <div id="detalle-contenido">
          <div class="text-center py-20">
            <div class="spinner mx-auto mb-3"></div>
            <p class="text-gray-500 text-sm">Cargando salida...</p>
          </div>
        </div>
      </main>
    </div>
  `;

  if (mapaInstancia) {
    mapaInstancia.remove();
    mapaInstancia = null;
  }

  try {
    const salida = await obtenerSalida(salidaId);
    if (!salida) {
      document.getElementById('detalle-contenido').innerHTML =
        `<p class="text-center text-red-400 py-20">Salida no encontrada</p>`;
      return;
    }
    renderContenido(salida, salidaId);
  } catch (err) {
    document.getElementById('detalle-contenido').innerHTML =
      `<p class="text-center text-red-400 py-20">Error: ${err.message}</p>`;
  }
}

function renderContenido(salida, salidaId) {
  const estado = COLORES_ESTADO[salida.estado] || COLORES_ESTADO.pendiente;
  const fecha = salida.fecha
    ? new Date(salida.fecha.seconds ? salida.fecha.seconds * 1000 : salida.fecha)
        .toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })
    : '—';
  const paradas = salida.paradas || [];

  const contenido = document.getElementById('detalle-contenido');
  contenido.innerHTML = `
    <div class="flex flex-col lg:flex-row gap-6">

      <!-- Panel izquierdo -->
      <div class="lg:w-96 flex-shrink-0 space-y-4">

        <!-- Header de la salida -->
        <div class="rounded-2xl p-5" style="background:#1a1d26;border:1px solid #2a2d3a">
          <div class="flex items-start justify-between gap-3 mb-3">
            <h1 class="text-xl font-bold text-white leading-tight" style="font-family:'Syne',sans-serif">
              ${salida.nombre}
            </h1>
            <span class="text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0"
              style="background:${estado.bg};color:${estado.text}">
              ${estado.label}
            </span>
          </div>
          <p class="text-gray-500 text-sm capitalize">${fecha}</p>
          <p class="text-gray-600 text-xs mt-1">${paradas.length} parada${paradas.length !== 1 ? 's' : ''}</p>

          <!-- Acciones -->
          <div class="flex flex-col gap-2 mt-4">
            <button id="btn-copiar-link"
              class="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style="background:#f97316;color:white;font-family:'Syne',sans-serif"
              onmouseover="this.style.background='#ea6c0a'"
              onmouseout="this.style.background='#f97316'">
              <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
              Copiar enlace del chofer
            </button>
            <button id="btn-whatsapp"
              class="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style="background:#15803420;color:#4ade80;border:1px solid #15803440"
              onmouseover="this.style.background='#15803430'"
              onmouseout="this.style.background='#15803420'">
              <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
              </svg>
              Enviar por WhatsApp
            </button>
            <button id="btn-cambiar-estado"
              class="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all"
              style="background:#1a1d26;color:#9ca3af;border:1px solid #2a2d3a"
              onmouseover="this.style.borderColor='#6b7280'"
              onmouseout="this.style.borderColor='#2a2d3a'">
              <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 0 0 4.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 0 1-15.357-2m15.357 2H15"/>
              </svg>
              Cambiar estado
            </button>
          </div>
        </div>

        <!-- Lista de paradas -->
        <div class="rounded-2xl p-5" style="background:#1a1d26;border:1px solid #2a2d3a">
          <h2 class="font-semibold text-white mb-4" style="font-family:'Syne',sans-serif">Orden de paradas</h2>
          <div class="space-y-3">
            ${paradas.map((p, i) => tarjetaParada(p, i)).join('')}
          </div>
        </div>

      </div>

      <!-- Mapa -->
      <div class="flex-1">
        <div class="rounded-2xl overflow-hidden sticky top-4" style="border:1px solid #2a2d3a;height:600px">
          <div id="mapa-contenedor" style="width:100%;height:100%"></div>
        </div>
      </div>

    </div>
  `;

  iniciarMapa(paradas);
  configurarBotones(salida, salidaId);
}

function tarjetaParada(p, i) {
  const completada = p.completada;
  return `
    <div class="flex items-start gap-3 p-3 rounded-xl transition-all"
      style="background:#0f1117;border:1px solid ${completada ? '#15803440' : '#2a2d3a'}">
      <div class="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
        style="background:${completada ? '#15803480' : '#f97316'};color:white">
        ${completada ? '✓' : i + 1}
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium ${completada ? 'line-through text-gray-600' : 'text-white'} leading-snug">
          ${p.direccion}
        </p>
        ${p.cliente ? `<p class="text-xs text-gray-500 mt-0.5">👤 ${p.cliente}</p>` : ''}
        ${p.materiales ? `<p class="text-xs text-gray-500 mt-0.5">📦 ${p.materiales}</p>` : ''}
        ${p.idVenta ? `<p class="text-xs text-gray-600 mt-0.5">🧾 ${p.idVenta}</p>` : ''}
      </div>
    </div>
  `;
}

function iniciarMapa(paradas) {
  if (typeof L === 'undefined') {
    setTimeout(() => iniciarMapa(paradas), 300);
    return;
  }

  const contenedor = document.getElementById('mapa-contenedor');
  if (!contenedor) return;

  if (mapaInstancia) {
    mapaInstancia.remove();
    mapaInstancia = null;
  }

  const centro = paradas.length
    ? [paradas[0].lat, paradas[0].lng]
    : [19.4326, -99.1332];

  mapaInstancia = L.map('mapa-contenedor', { zoomControl: true }).setView(centro, 12);

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
    maxZoom: 19
  }).addTo(mapaInstancia);

  const marcadores = [];

  paradas.forEach((p, i) => {
    const icono = L.divIcon({
      className: '',
      html: `<div style="
        width:32px;height:32px;border-radius:50%;
        background:${p.completada ? '#22c55e' : '#f97316'};
        color:white;font-weight:700;font-size:13px;
        display:flex;align-items:center;justify-content:center;
        border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.5);
        font-family:'Syne',sans-serif;
      ">${p.completada ? '✓' : i + 1}</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const marcador = L.marker([p.lat, p.lng], { icon: icono })
      .addTo(mapaInstancia)
      .bindPopup(`
        <div style="font-family:'DM Sans',sans-serif;min-width:160px">
          <strong style="color:#f97316">#${i + 1}</strong>
          <p style="margin:4px 0 2px;font-size:13px">${p.direccion}</p>
          ${p.cliente ? `<p style="font-size:12px;color:#666">👤 ${p.cliente}</p>` : ''}
          ${p.materiales ? `<p style="font-size:12px;color:#666">📦 ${p.materiales}</p>` : ''}
        </div>
      `);
    marcadores.push(marcador);
  });

  if (paradas.length > 1) {
    const coords = paradas.map(p => [p.lat, p.lng]);
    L.polyline(coords, { color: '#f97316', weight: 2.5, opacity: 0.7, dashArray: '6,6' })
      .addTo(mapaInstancia);
    mapaInstancia.fitBounds(L.latLngBounds(coords), { padding: [40, 40] });
  }
}

function configurarBotones(salida, salidaId) {
  const enlaceChofer = `${location.origin}/chofer.html?salida=${salidaId}`;

  document.getElementById('btn-copiar-link').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(enlaceChofer);
      const btn = document.getElementById('btn-copiar-link');
      const textoOriginal = btn.innerHTML;
      btn.innerHTML = '✓ Enlace copiado';
      btn.style.background = '#15803480';
      setTimeout(() => {
        btn.innerHTML = textoOriginal;
        btn.style.background = '#f97316';
      }, 2000);
    } catch {
      prompt('Copia este enlace:', enlaceChofer);
    }
  });

  document.getElementById('btn-whatsapp').addEventListener('click', () => {
    const msg = `Hola, aquí está tu ruta de entrega de hoy:\n\n*${salida.nombre}*\n\n${enlaceChofer}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  });

  document.getElementById('btn-cambiar-estado').addEventListener('click', async () => {
    const estadoActual = salida.estado || 'pendiente';
    const idxActual = ESTADOS.indexOf(estadoActual);
    const nuevoEstado = ESTADOS[(idxActual + 1) % ESTADOS.length];
    try {
      await actualizarSalida(salidaId, { estado: nuevoEstado });
      salida.estado = nuevoEstado;
      renderDetalleSalida(document.getElementById('app'), salidaId);
    } catch (err) {
      alert('Error al cambiar estado: ' + err.message);
    }
  });
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
