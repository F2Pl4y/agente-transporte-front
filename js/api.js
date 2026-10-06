/**
 * Cliente de Conectividad con el Sistema Central de Transportes Tottus
 * Maneja llamadas seguras al backend y traducción amigable de estados.
 */

const DEFAULT_API_BASE_URL = 'http://localhost:8000';

function resolveApiBaseUrl() {
  if (typeof window === 'undefined' || !window.location || !window.location.origin) {
    return DEFAULT_API_BASE_URL;
  }
  
  // 1. Si la web se carga directamente desde Cloudflare Tunnel o la ruta interna /app
  // Backend y Frontend están en el mismo dominio (Same-Origin)
  if (window.location.hostname.endsWith('trycloudflare.com') || window.location.pathname.startsWith('/app')) {
    return window.location.origin;
  }

  // 2. Si se pasó como parámetro en la URL: ?api=https://tunel.trycloudflare.com
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const paramApi = urlParams.get('api');
    if (paramApi && paramApi.trim()) {
      const cleaned = paramApi.trim().replace(/\/+$/, '');
      localStorage.setItem('tottus_api_url', cleaned);
      return cleaned;
    }
  } catch (e) {}

  // 2. Si se configuró previamente en localStorage
  try {
    const custom = localStorage.getItem('tottus_api_url');
    if (custom && custom.trim()) {
      return custom.trim().replace(/\/+$/, '');
    }
  } catch (e) {}

  // 3. Si la web se carga directamente desde FastAPI (puerto 8000)
  if (window.location.port === '8000') {
    return window.location.origin;
  }

  // 4. Si se abre con Live Server (puertos como 5500, etc.) o archivo local (file://)
  // El backend siempre está en http://localhost:8000
  const isLocalDevServer = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost';
  if (window.location.protocol === 'file:' || isLocalDevServer) {
    return DEFAULT_API_BASE_URL;
  }

  // 5. En GitHub Pages (*.github.io)
  // Si no se configuró túnel, retornar vacío o advertir para no apuntar a github.io (que daría 404)
  if (window.location.hostname.endsWith('github.io')) {
    return localStorage.getItem('tottus_api_url') || '';
  }

  // 6. En entorno de producción con proxy inverso en el mismo dominio
  return window.location.origin;
}

class LogisticsAPI {
  constructor() {
    this.baseUrl = resolveApiBaseUrl();
    this.sessionId = this.getOrCreateSessionId();
  }

  getOrCreateSessionId() {
    try {
      let sid = sessionStorage.getItem('tottus_session_id');
      if (!sid) {
        sid = 'session_' + Math.random().toString(36).substring(2, 10);
        sessionStorage.setItem('tottus_session_id', sid);
      }
      return sid;
    } catch (e) {
      return 'session_' + Math.random().toString(36).substring(2, 10);
    }
  }

  resetSession() {
    try {
      sessionStorage.removeItem('tottus_session_id');
    } catch (e) {}
    this.sessionId = this.getOrCreateSessionId();
  }

  setBaseUrl(newUrl) {
    if (newUrl) {
      this.baseUrl = newUrl.trim().replace(/\/+$/, '');
      try {
        localStorage.setItem('tottus_api_url', this.baseUrl);
      } catch (e) {}
    }
  }

  async checkHealth() {
    if (!this.baseUrl) return false;
    try {
      const response = await fetch(`${this.baseUrl}/api/health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      return response.ok;
    } catch (e) {
      return false;
    }
  }

  /**
   * Obtiene la bitácora unificada de auditoría para gobernanza
   * @param {number} limit
   */
  async getAuditLog(limit = 150) {
    if (!this.baseUrl) return [];
    try {
      const authUser = (typeof window !== 'undefined' && window.authManager) ? window.authManager.getUser() : null;
      const authToken = (authUser && authUser.token) ? authUser.token : null;
      const headers = { 'Accept': 'application/json' };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      const response = await fetch(`${this.baseUrl}/api/audit?limit=${limit}`, {
        method: 'GET',
        headers: headers
      });
      if (!response.ok) return [];
      return await response.json();
    } catch (e) {
      console.warn('Error al consultar auditoría:', e);
      return [];
    }
  }

  /**
   * Verifica las credenciales en tiempo real contra el backend antes de permitir el ingreso
   * @param {string} email - Correo corporativo del colaborador
   * @param {string} key - Clave de acceso del piloto o token
   */
  async verifyAuth(email, key) {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email: email.trim(), key: key.trim() })
      });

      if (!response.ok) {
        let detail = 'Error de autenticación.';
        try {
          const errData = await response.json();
          if (errData && errData.detail) detail = errData.detail;
        } catch (e) {}
        throw new Error(detail);
      }

      return await response.json();
    } catch (err) {
      if (err.message && err.message.includes('Failed to fetch')) {
        throw new Error('No se pudo conectar con el servidor backend en el puerto 8000. Asegúrate de que el backend esté iniciado.');
      }
      throw err;
    }
  }

  /**
   * Envía la consulta del usuario al sistema central
   * @param {Object} params
   * @param {string} params.message - Pregunta del usuario
   * @param {string} params.tiendaId - Código de tienda (ej. '451')
   * @param {string} params.userEmail - Correo del usuario autenticado
   * @param {boolean} params.includeData - Si se solicita la tabla de datos detallada
   */
  async sendMessage({ message, tiendaId, userEmail, includeData = false }) {
    const authUser = (typeof window !== 'undefined' && window.authManager) ? window.authManager.getUser() : null;
    const activeEmail = (authUser && authUser.email) ? authUser.email : (userEmail || 'supervisor@tottus.com.pe');
    const authToken = (authUser && authUser.token) ? authUser.token : null;

    const payload = {
      message: message.trim(),
      session_id: this.sessionId,
      tienda_id: tiendaId || null,
      user_email: activeEmail,
      pais: 'PE', // Alcance exclusivo Perú
      include_data: includeData
    };

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        if (response.status === 401) {
          if (typeof window !== 'undefined' && window.authManager) {
            window.authManager.logout();
            window.authManager.showError('Clave de acceso de piloto incorrecta. Por favor, verifica la clave del equipo.');
          }
          throw new Error('Clave de acceso de piloto incorrecta. Por favor, ingresa la clave válida.');
        }
        if (response.status === 403) {
          let errorDetail = 'Acceso restringido: Se requiere una cuenta corporativa @tottus.com.pe autorizada.';
          try {
            const errData = await response.json();
            if (errData && errData.detail) errorDetail = errData.detail;
          } catch (e) {}
          if (typeof window !== 'undefined' && window.authManager) {
            window.authManager.logout();
            window.authManager.showError(errorDetail);
          }
          throw new Error(errorDetail);
        }
        if (response.status === 503) {
          throw new Error('El sistema central se encuentra procesando un volumen alto de consultas. Por favor, reintenta en unos instantes.');
        }
        if (response.status === 502) {
          throw new Error('No se pudo establecer comunicación con el catálogo de transportes. Verifica que el servicio esté en línea.');
        }
        throw new Error(`El servicio respondió con un estado ${response.status}. Intenta formular tu consulta de nuevo.`);
      }

      const data = await response.json();
      if (data && data.session_id) {
        this.sessionId = data.session_id;
        try {
          sessionStorage.setItem('tottus_session_id', data.session_id);
        } catch (e) {}
      }
      return data;
    } catch (err) {
      if (err.message && err.message.includes('Failed to fetch')) {
        throw new Error('No se pudo conectar con el servicio de transportes en el puerto 8000. Asegúrate de que el backend esté iniciado.');
      }
      throw err;
    }
  }
}

window.logisticsAPI = new LogisticsAPI();
