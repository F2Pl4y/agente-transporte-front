/**
 * Gestor de Autenticación Corporativa — Tottus Perú
 * Integra Google Identity Services (OAuth 2.0) y validación estricta del dominio @tottus.com.pe
 */

class AuthManager {
  constructor() {
    this.storageKey = 'tottus_auth_user';
    this.clientIdKey = 'tottus_google_client_id';
    this.authorizedDomain = '@tottus.com.pe';
    this.currentUser = this.loadStoredUser();
    
    // Client ID por defecto o el guardado en localStorage
    this.googleClientId = localStorage.getItem(this.clientIdKey) || '';
  }

  /**
   * Carga el usuario almacenado en sesión/local si cumple la regla de dominio
   */
  loadStoredUser() {
    try {
      const data = localStorage.getItem(this.storageKey) || sessionStorage.getItem(this.storageKey);
      if (!data) return null;
      const user = JSON.parse(data);
      if (user && this.isValidEmail(user.email)) {
        return user;
      }
      this.clearStorage();
      return null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Valida estrictamente que el correo pertenezca al dominio oficial de Tottus Perú
   */
  isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;
    return email.trim().toLowerCase().endsWith(this.authorizedDomain);
  }

  /**
   * Decodifica de forma segura el Payload de un JSON Web Token (JWT) de Google
   */
  parseJwt(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Error al decodificar JWT de Google:', e);
      return null;
    }
  }

  /**
   * Guarda la sesión del usuario validado
   */
  setAuthenticatedUser(user) {
    if (!this.isValidEmail(user.email)) {
      throw new Error(`El correo no pertenece al dominio ${this.authorizedDomain}`);
    }
    this.currentUser = user;
    localStorage.setItem(this.storageKey, JSON.stringify(user));

    // Iniciar siempre un session_id nuevo e independiente para este usuario
    if (window.logisticsAPI && typeof window.logisticsAPI.resetSession === 'function') {
      window.logisticsAPI.resetSession();
    }

    // Limpiar el chat visualmente para que el nuevo usuario tenga su pantalla 100% limpia
    if (window.logisticsUI && typeof window.logisticsUI.resetChatUI === 'function') {
      window.logisticsUI.resetChatUI(`Sesión iniciada como ${user.email}`);
    }

    this.hideAuthModal();
    this.renderUserProfile();

    // Limpiar campos del formulario
    const emailInput = document.getElementById('auth-email-input');
    const passwordInput = document.getElementById('auth-password-input');
    if (emailInput) emailInput.value = '';
    if (passwordInput) passwordInput.value = '';
    
    // Notificar a la UI para habilitar inputs
    const messageInput = document.getElementById('message-input');
    if (messageInput) {
      messageInput.disabled = false;
      messageInput.value = '';
      messageInput.placeholder = 'Pregunta por un TIM, camión, tienda o shipment...';
      messageInput.focus();
    }
  }

  /**
   * Cierra la sesión activa
   */
  logout() {
    this.currentUser = null;
    this.clearStorage();
    if (window.logisticsAPI && typeof window.logisticsAPI.resetSession === 'function') {
      window.logisticsAPI.resetSession();
    }
    const chat = document.getElementById('chat-messages');
    if (chat) chat.innerHTML = '';
    const msgInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    if (msgInput) {
      msgInput.disabled = true;
      msgInput.value = '';
      msgInput.placeholder = 'Inicia sesión con tu cuenta corporativa para consultar...';
    }
    if (sendBtn) {
      sendBtn.disabled = true;
    }
    this.renderUserProfile();
    this.showAuthModal();
  }

  clearStorage() {
    try {
      localStorage.removeItem(this.storageKey);
      sessionStorage.removeItem(this.storageKey);
    } catch (e) {}
  }

  isAuthenticated() {
    return !!(this.currentUser && this.isValidEmail(this.currentUser.email));
  }

  getUser() {
    return this.currentUser;
  }

  getEmail() {
    return this.currentUser ? this.currentUser.email : 'supervisor@tottus.com.pe';
  }

  getToken() {
    return this.currentUser ? (this.currentUser.token || '') : '';
  }

  /**
   * Inicializa la interfaz de autenticación y Google Identity Services
   */
  init() {
    this.bindEvents();
    
    if (this.isAuthenticated()) {
      this.hideAuthModal();
      this.renderUserProfile();
      if (window.logisticsUI && typeof window.logisticsUI.resetChatUI === 'function') {
        window.logisticsUI.resetChatUI(`Sesión iniciada como ${this.currentUser.email}`);
      }
      const msgInput = document.getElementById('message-input');
      const sendBtn = document.getElementById('send-btn');
      if (msgInput) {
        msgInput.disabled = false;
        msgInput.placeholder = 'Pregunta por un TIM, camión, o tienda y fecha (ej. camiones a Atocongo el 03.10)...';
      }
      if (sendBtn) {
        sendBtn.disabled = false;
      }
    } else {
      this.showAuthModal();
      this.renderUserProfile();
      const chat = document.getElementById('chat-messages');
      if (chat) chat.innerHTML = '';
      const msgInput = document.getElementById('message-input');
      const sendBtn = document.getElementById('send-btn');
      if (msgInput) {
        msgInput.disabled = true;
        msgInput.placeholder = 'Inicia sesión con tu cuenta corporativa para consultar...';
      }
      if (sendBtn) {
        sendBtn.disabled = true;
      }
    }

    this.initGoogleIdentity();
  }

  /**
   * Inicializa Google Identity Services bajo demanda (solo si se configuró un Client ID)
   */
  initGoogleIdentity() {
    const wrapper = document.getElementById('auth-google-wrapper');
    if (!this.googleClientId) {
      if (wrapper) wrapper.style.display = 'none';
      return;
    }

    // Si ya está disponible la librería global de Google
    if (typeof window.google !== 'undefined' && window.google.accounts && window.google.accounts.id) {
      this.renderGoogleButton();
      return;
    }

    // Si hay Client ID pero falta la librería, la cargamos dinámicamente sin bloquear el renderizado
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => this.renderGoogleButton();
    document.head.appendChild(script);
  }

  renderGoogleButton() {
    const wrapper = document.getElementById('auth-google-wrapper');
    const container = document.getElementById('g_id_signin_container');
    if (!container) return;

    if (!this.googleClientId) {
      if (wrapper) wrapper.style.display = 'none';
      return;
    }

    if (wrapper) wrapper.style.display = 'block';

    try {
      window.google.accounts.id.initialize({
        client_id: this.googleClientId,
        callback: (response) => this.handleGoogleCredentialResponse(response),
        auto_select: false,
        hosted_domain: 'tottus.com.pe'
      });

      window.google.accounts.id.renderButton(container, {
        type: 'standard',
        shape: 'pill',
        theme: 'outline',
        text: 'signin_with',
        size: 'large',
        logo_alignment: 'left',
        width: 320,
        locale: 'es'
      });
    } catch (err) {
      console.warn('Aviso Google Identity:', err);
    }
  }

  /**
   * Procesa la credencial JWT recibida de Google
   */
  handleGoogleCredentialResponse(response) {
    if (!response || !response.credential) {
      this.showError('No se recibió la credencial de autenticación de Google.');
      return;
    }

    const payload = this.parseJwt(response.credential);
    if (!payload || !payload.email) {
      this.showError('No se pudo leer la información de tu cuenta de Google.');
      return;
    }

    const email = payload.email.toLowerCase();
    
    // Validación estricta de dominio @tottus.com.pe
    if (!this.isValidEmail(email)) {
      this.showError(
        `Acceso denegado: La cuenta <strong>${email}</strong> no pertenece a <strong>${this.authorizedDomain}</strong>. Por favor, inicia sesión con tu correo corporativo Tottus.`
      );
      return;
    }

    // Usuario autorizado exitosamente
    this.setAuthenticatedUser({
      email: email,
      name: payload.name || email.split('@')[0],
      picture: payload.picture || null,
      token: response.credential,
      authType: 'google'
    });
  }

  /**
   * Conecta los eventos del formulario de login
   */
  bindEvents() {
    const form = document.getElementById('auth-direct-form');
    const emailInput = document.getElementById('auth-email-input');
    const passwordInput = document.getElementById('auth-password-input');
    const togglePwdBtn = document.getElementById('auth-toggle-pwd-btn');
    const configBtn = document.getElementById('auth-config-client-btn');
    const apiConfigBtn = document.getElementById('auth-config-api-btn');

    // Alternar visibilidad de la contraseña (ojo)
    if (togglePwdBtn && passwordInput) {
      togglePwdBtn.addEventListener('click', () => {
        const isPwd = passwordInput.type === 'password';
        passwordInput.type = isPwd ? 'text' : 'password';
        togglePwdBtn.innerHTML = isPwd 
          ? `<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
             </svg>`
          : `<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
             </svg>`;
      });
    }

    if (form && emailInput) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = emailInput.value.trim().toLowerCase();
        const password = passwordInput ? passwordInput.value.trim() : '';
        
        if (!this.isValidEmail(email)) {
          this.showError(
            `Acceso denegado: El correo debe terminar obligatoriamente en <strong>${this.authorizedDomain}</strong>.`
          );
          return;
        }

        if (!password) {
          this.showError('Por favor, ingresa la clave de acceso del piloto.');
          return;
        }

        this.hideError();
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = `<span>Verificando credenciales...</span>`;
        }

        try {
          if (!window.logisticsAPI) {
            throw new Error('El servicio de conexión aún no está listo. Por favor, reintenta en un segundo.');
          }
          // 🔒 Validación estricta en tiempo real contra el backend
          console.log(`[Auth] Validando credenciales para: ${email}`);
          await window.logisticsAPI.verifyAuth(email, password);

          // ¡Solo si el servidor aprueba la clave y el correo, se permite el acceso!
          this.setAuthenticatedUser({
            email: email,
            name: email.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            picture: null,
            token: password,
            authType: 'pilot_key'
          });
        } catch (err) {
          console.error('[Auth] Fallo en verificación:', err);
          this.showError(err.message || 'Error al validar credenciales con el servidor.');
          if (passwordInput) {
            passwordInput.value = '';
            passwordInput.focus();
          }
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHtml;
          }
        }
      });
    }

    // Botón para configurar Google Client ID a futuro
    if (configBtn) {
      configBtn.addEventListener('click', () => {
        const current = this.googleClientId || '';
        const nuevo = prompt(
          'Ingresa tu Google OAuth Client ID cuando TI te lo otorgue (ej. 123...apps.googleusercontent.com):',
          current
        );
        if (nuevo !== null) {
          this.googleClientId = nuevo.trim();
          localStorage.setItem(this.clientIdKey, this.googleClientId);
          alert('Google Client ID actualizado.');
          this.renderGoogleButton();
        }
      });
    }

    // Botón para configurar la URL del Servidor / Dev Tunnel (útil para pruebas en GitHub Pages)
    if (apiConfigBtn) {
      apiConfigBtn.addEventListener('click', () => {
        const currentUrl = localStorage.getItem('tottus_api_url') || 'http://localhost:8000';
        const nuevaUrl = prompt(
          'Configura la URL de tu Servidor Backend (Dev Tunnel o IP remota):\nEjemplo: https://xyz-8000.use.devtunnels.ms',
          currentUrl
        );
        if (nuevaUrl !== null && nuevaUrl.trim()) {
          const limpia = nuevaUrl.trim().replace(/\/+$/, '');
          localStorage.setItem('tottus_api_url', limpia);
          window.location.reload();
        }
      });
    }
  }

  showError(htmlMessage) {
    const errorBanner = document.getElementById('auth-error-banner');
    const errorText = document.getElementById('auth-error-text');
    if (errorBanner && errorText) {
      errorText.innerHTML = htmlMessage;
      errorBanner.classList.add('visible');
    }
  }

  hideError() {
    const errorBanner = document.getElementById('auth-error-banner');
    if (errorBanner) {
      errorBanner.classList.remove('visible');
    }
  }

  showAuthModal() {
    this.hideError();
    const modal = document.getElementById('auth-overlay');
    if (modal) {
      modal.classList.remove('hidden');
    }
    const messageInput = document.getElementById('message-input');
    if (messageInput) {
      messageInput.disabled = true;
      messageInput.placeholder = 'Inicia sesión con tu cuenta @tottus.com.pe para consultar...';
    }
  }

  hideAuthModal() {
    this.hideError();
    const modal = document.getElementById('auth-overlay');
    if (modal) {
      modal.classList.add('hidden');
    }
  }

  /**
   * Renderiza el avatar e información del usuario en la barra superior
   */
  renderUserProfile() {
    const container = document.getElementById('user-profile-container');
    if (!container) return;

    if (!this.isAuthenticated()) {
      container.innerHTML = `
        <button id="header-login-btn" class="ios-user-pill" style="cursor: pointer;" title="Iniciar Sesión">
          <span class="ios-user-avatar" style="background: #86868b;">?</span>
          <span style="font-weight: 600; font-size: 12px; color: #00853f;">Acceder</span>
        </button>
      `;
      const btn = document.getElementById('header-login-btn');
      if (btn) btn.addEventListener('click', () => this.showAuthModal());
      return;
    }

    const user = this.currentUser;
    const initial = (user.name ? user.name[0] : (user.email[0] || 'T')).toUpperCase();
    const avatarContent = user.picture 
      ? `<img src="${user.picture}" alt="Avatar" referrerpolicy="no-referrer" />`
      : initial;

    container.innerHTML = `
      <div class="ios-user-pill" title="Autenticado como ${user.email}">
        <div class="ios-user-avatar">${avatarContent}</div>
        <div class="ios-user-info">
          <span class="ios-user-name">${user.name}</span>
          <span class="ios-user-email">${user.email}</span>
        </div>
        <button id="header-logout-btn" class="ios-logout-btn" title="Cerrar sesión">
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    `;

    const logoutBtn = document.getElementById('header-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm(`¿Deseas cerrar la sesión de ${user.email}?`)) {
          this.logout();
        }
      });
    }
  }
}

// Instancia global
window.authManager = new AuthManager();

// Si los elementos ya existen en el DOM, enlazar eventos de inmediato
if (document.readyState !== 'loading') {
  window.authManager.bindEvents();
} else {
  document.addEventListener('DOMContentLoaded', () => {
    window.authManager.bindEvents();
  });
}
