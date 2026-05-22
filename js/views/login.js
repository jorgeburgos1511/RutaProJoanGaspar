import { iniciarSesion } from '../auth.js';

export function renderLogin(contenedor) {
  contenedor.innerHTML = `
    <div class="min-h-screen flex items-center justify-center px-4" style="background:#0f1117">
      <div class="w-full max-w-md">
        <div class="text-center mb-10">
          <div class="inline-flex items-center gap-3 mb-4">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center" style="background:#f97316">
              <svg width="24" height="24" fill="none" stroke="white" stroke-width="2.5" viewBox="0 0 24 24">
                <path d="M1 3h15l4 9H5L1 3z"/><path d="M5 12l-1 7h16"/>
                <circle cx="9" cy="21" r="1.5"/><circle cx="18" cy="21" r="1.5"/>
              </svg>
            </div>
            <span class="text-3xl font-bold text-white" style="font-family:'Syne',sans-serif;letter-spacing:-1px">RutaPro</span>
          </div>
          <p class="text-gray-400 text-sm">Gestión de rutas de entrega</p>
        </div>

        <div class="rounded-2xl p-8" style="background:#1a1d26;border:1px solid #2a2d3a">
          <h2 class="text-xl font-semibold text-white mb-6" style="font-family:'Syne',sans-serif">Iniciar sesión</h2>

          <div id="error-login" class="hidden mb-4 px-4 py-3 rounded-lg text-sm" style="background:#3b1212;color:#f87171;border:1px solid #7f1d1d"></div>

          <form id="form-login" class="space-y-4">
            <div>
              <label class="block text-sm text-gray-400 mb-1.5">Correo electrónico</label>
              <input type="email" id="email" required
                class="w-full px-4 py-3 rounded-xl text-white text-sm outline-none transition-all"
                style="background:#0f1117;border:1px solid #2a2d3a;color:white"
                placeholder="admin@empresa.com"
                onfocus="this.style.borderColor='#f97316'"
                onblur="this.style.borderColor='#2a2d3a'">
            </div>
            <div>
              <label class="block text-sm text-gray-400 mb-1.5">Contraseña</label>
              <input type="password" id="password" required
                class="w-full px-4 py-3 rounded-xl text-white text-sm outline-none transition-all"
                style="background:#0f1117;border:1px solid #2a2d3a"
                placeholder="••••••••"
                onfocus="this.style.borderColor='#f97316'"
                onblur="this.style.borderColor='#2a2d3a'">
            </div>
            <button type="submit" id="btn-login"
              class="w-full py-3 rounded-xl font-semibold text-white transition-all mt-2"
              style="background:#f97316;font-family:'Syne',sans-serif"
              onmouseover="this.style.background='#ea6c0a'"
              onmouseout="this.style.background='#f97316'">
              Entrar
            </button>
          </form>
        </div>
      </div>
    </div>
  `;

  document.getElementById('form-login').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = document.getElementById('btn-login');
    const errorEl = document.getElementById('error-login');
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    btn.disabled = true;
    btn.textContent = 'Entrando...';
    errorEl.classList.add('hidden');

    try {
      await iniciarSesion(email, password);
    } catch (err) {
      let msg = 'Error al iniciar sesión';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Correo o contraseña incorrectos';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Demasiados intentos. Intenta más tarde';
      }
      errorEl.textContent = msg;
      errorEl.classList.remove('hidden');
      btn.disabled = false;
      btn.textContent = 'Entrar';
    }
  });
}
