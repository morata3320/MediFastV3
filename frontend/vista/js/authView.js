export function authBarHTML(user) {
  if (user) {
    return `
      <div class="auth-bar" aria-label="Sesion de usuario">
        <span class="auth-user">Sesion: <strong>${user.username}</strong> (${user.role})</span>
        ${user.role === "admin" ? '<button id="btn-admin-panel" type="button">Admin</button>' : ""}
        <button id="btn-logout" type="button">Salir</button>
      </div>
    `;
  }

  return `
    <div class="auth-bar" aria-label="Acceso de usuario">
      <button id="btn-login-open" type="button">Login</button>
      <button id="btn-register-open" type="button">Registro</button>
    </div>
  `;
}

export function authModalHTML(mode = "login") {
  const isLogin = mode === "login";

  return `
    <div id="auth-overlay" class="auth-overlay" aria-hidden="false"></div>

    <section
      id="auth-modal"
      class="auth-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-title"
    >
      <button id="btn-auth-close" class="auth-close" type="button" aria-label="Cerrar">×</button>

      <h2 id="auth-title">${isLogin ? "Iniciar sesion" : "Crear cuenta"}</h2>

      <form id="auth-form" novalidate>
        ${isLogin ? `
          <label for="auth-identifier">Usuario o correo</label>
          <input id="auth-identifier" name="identifier" type="text" required autocomplete="username" />
        ` : `
          <label for="auth-username">Usuario</label>
          <input id="auth-username" name="username" type="text" required autocomplete="username" />

          <label for="auth-email">Correo</label>
          <input id="auth-email" name="email" type="email" required autocomplete="email" />
        `}

        <label for="auth-password">Contrasena</label>
        <input id="auth-password" name="password" type="password" required autocomplete="${isLogin ? "current-password" : "new-password"}" />

        <button type="submit">${isLogin ? "Entrar" : "Registrarme"}</button>
      </form>

      <p class="auth-help">
        ${isLogin
          ? 'Admin: <strong>admin</strong> / <strong>Admin123!</strong> · Usuario: <strong>user</strong> / <strong>User123!</strong>'
          : "La cuenta nueva se registra con rol user."}
      </p>
    </section>
  `;
}