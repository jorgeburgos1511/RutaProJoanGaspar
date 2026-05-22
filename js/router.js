import { onAuth } from './auth.js';
import { renderDashboard } from './views/dashboard.js';
import { renderNuevaSalida } from './views/nueva-salida.js';
import { renderDetalleSalida } from './views/detalle-salida.js';
import { renderLogin } from './views/login.js';

const rutas = {
  '/': renderDashboard,
  '/nueva-salida': renderNuevaSalida,
};

let usuarioLogueado = null;

export function iniciarRouter() {
  onAuth(usuario => {
    usuarioLogueado = usuario;
    navegar(location.hash || '#/');
  });

  window.addEventListener('hashchange', () => {
    navegar(location.hash);
  });
}

export function navegar(hash) {
  const contenedor = document.getElementById('app');
  if (!contenedor) return;

  const path = hash.replace('#', '') || '/';

  if (!usuarioLogueado) {
    renderLogin(contenedor);
    return;
  }

  // Ruta dinámica /salida/:id
  const matchSalida = path.match(/^\/salida\/(.+)$/);
  if (matchSalida) {
    renderDetalleSalida(contenedor, matchSalida[1]);
    return;
  }

  const render = rutas[path] || renderDashboard;
  render(contenedor);
}

export function ir(path) {
  location.hash = '#' + path;
}
