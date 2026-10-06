/**
 * Controlador Principal de la Aplicación
 * Conecta los eventos de usuario con la API y el Renderizador UI.
 */

function initApp() {
  const messageInput = document.getElementById('message-input');
  const sendBtn = document.getElementById('send-btn');
  const storeSelect = document.getElementById('store-select');
  const includeDataCheckbox = document.getElementById('include-data-checkbox');
  const resetBtn = document.getElementById('reset-chat-btn');
  const chipButtons = document.querySelectorAll('.suggestion-chip');

  // 0. Inicialización del Módulo de Autenticación Corporativa Tottus
  if (window.authManager) {
    window.authManager.init();
  }

  // 1. Verificación de conectividad con el backend
  const connectionBadge = document.getElementById('connection-status');
  if (connectionBadge) {
    connectionBadge.addEventListener('click', () => {
      checkBackendHealth();
    });
  }

  let consecutiveFailures = 0;
  async function checkBackendHealth() {
    const isOnline = await window.logisticsAPI.checkHealth();
    if (isOnline) {
      consecutiveFailures = 0;
      window.logisticsUI.updateConnectionStatus(true);
    } else {
      consecutiveFailures++;
      // Solo marcar desconectado tras 2 fallos consecutivos reales para evitar falsos parpadeos por latencia
      if (consecutiveFailures >= 2) {
        window.logisticsUI.updateConnectionStatus(false);
      }
    }
  }

  checkBackendHealth();
  setInterval(checkBackendHealth, 30000); // Re-verificar periódicamente

  // 2. Enviar mensaje del usuario
  async function handleSendMessage(customText = null) {
    // Si no está autenticado, solicitar login inmediatamente
    if (window.authManager && !window.authManager.isAuthenticated()) {
      window.authManager.showAuthModal();
      return;
    }

    const text = customText || messageInput.value.trim();
    if (!text) return;

    // Bloquear input mientras procesa
    messageInput.value = '';
    messageInput.disabled = true;
    sendBtn.disabled = true;

    // Agregar mensaje del usuario a la pantalla
    window.logisticsUI.addUserMessage(text);

    // Mostrar animación de consulta
    const typingId = window.logisticsUI.addAssistantTyping();

    try {
      const tiendaId = storeSelect ? storeSelect.value : null;
      const includeData = includeDataCheckbox ? includeDataCheckbox.checked : false;

      const response = await window.logisticsAPI.sendMessage({
        message: text,
        tiendaId: tiendaId,
        includeData: includeData
      });

      // Doble candado: Si el interruptor de Excel está desactivado, jamás mostrar la tarjeta de exportación
      if (!includeData && response) {
        response.data = null;
      }

      window.logisticsUI.removeTyping(typingId);
      window.logisticsUI.addAssistantMessage(response);
    } catch (err) {
      window.logisticsUI.removeTyping(typingId);
      window.logisticsUI.addErrorMessage(err.message || 'Ocurrió un error al procesar la consulta.');
    } finally {
      messageInput.disabled = false;
      sendBtn.disabled = false;
      messageInput.focus();
    }
  }

  // 3. Event Listeners
  if (sendBtn) {
    sendBtn.addEventListener('click', () => handleSendMessage());
  }

  if (messageInput) {
    messageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    });
  }

  // 4. Preguntas sugeridas (Chips) - Configuración dinámica y escritura en input
  const chipAngamos = document.getElementById('chip-angamos');
  if (chipAngamos) {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const dateFormatted = `${day}.${month}`;
    chipAngamos.innerHTML = `🏪 Camiones a Angamos el ${dateFormatted}`;
    chipAngamos.setAttribute('data-query', `quiero saber cuantos camiones se han ido a la tienda de angamos el dia ${dateFormatted}`);
  }

  chipButtons.forEach(chip => {
    chip.addEventListener('click', () => {
      const query = chip.getAttribute('data-query');
      if (query && messageInput) {
        messageInput.value = query;
        messageInput.focus();
        const len = messageInput.value.length;
        messageInput.setSelectionRange(len, len);
        messageInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
  });

  // 5. Reiniciar chat
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('¿Deseas iniciar una nueva sesión de consulta?')) {
        window.logisticsAPI.resetSession();
        if (window.logisticsUI && typeof window.logisticsUI.resetChatUI === 'function') {
          window.logisticsUI.resetChatUI('Sesión reiniciada');
        }
      }
    });
  }

  // 6. Módulo de Gobernanza y Auditoría Centralizada
  const openAuditBtn = document.getElementById('open-audit-btn');
  const closeAuditBtn = document.getElementById('close-audit-btn');
  const auditOverlay = document.getElementById('audit-overlay');
  const auditRefreshBtn = document.getElementById('audit-refresh-btn');
  const auditSearchInput = document.getElementById('audit-search-input');
  const auditTableWrap = document.getElementById('audit-table-wrap');
  const auditTotalCount = document.getElementById('audit-total-count');

  let cachedAuditLogs = [];

  async function loadAuditLog() {
    if (!auditTableWrap) return;
    auditTableWrap.innerHTML = '<div style="padding: 30px; text-align: center; color: var(--ios-text-secondary); font-size: 13px;">Cargando bitácora de auditoría en tiempo real...</div>';
    
    cachedAuditLogs = await window.logisticsAPI.getAuditLog(200);
    renderAuditTable(cachedAuditLogs);
  }

  function renderAuditTable(entries) {
    if (!auditTableWrap) return;
    if (auditTotalCount) {
      auditTotalCount.textContent = `${entries.length} consultas registradas`;
    }

    if (!entries || entries.length === 0) {
      auditTableWrap.innerHTML = '<div style="padding: 30px; text-align: center; color: var(--ios-text-secondary); font-size: 13px;">No hay consultas registradas aún.</div>';
      return;
    }

    const rowsHtml = entries.map((item, idx) => {
      let timeFormatted = item.timestamp ? new Date(item.timestamp).toLocaleString('es-PE', { hour12: true }) : '-';
      let toolsBadge = (item.tools_executed && item.tools_executed.length > 0)
        ? `<span style="display: inline-block; padding: 2px 7px; background: rgba(0,133,63,0.1); color: #00853f; border-radius: 6px; font-size: 11px; font-weight: 600;">${item.tools_executed.join(', ')}</span>`
        : `<span style="display: inline-block; padding: 2px 7px; background: rgba(245,158,11,0.1); color: #d97706; border-radius: 6px; font-size: 11px; font-weight: 600;">Directo / Guardrail</span>`;

      return `
        <tr style="border-bottom: 1px solid rgba(0,0,0,0.04);">
          <td style="padding: 8px 10px; text-align: center; font-weight: 600; color: var(--ios-text-tertiary);">${idx + 1}</td>
          <td style="padding: 8px 10px; white-space: nowrap; font-size: 12px; color: var(--ios-text-secondary);">${timeFormatted}</td>
          <td style="padding: 8px 10px; font-weight: 600; color: #1d1d1f; white-space: nowrap;">${item.user_email || '-'}</td>
          <td style="padding: 8px 10px; max-width: 300px; word-break: break-word; font-weight: 500;">${item.user_message || '-'}</td>
          <td style="padding: 8px 10px;">${toolsBadge}</td>
          <td style="padding: 8px 10px; text-align: center; font-variant-numeric: tabular-nums;">${item.records_count || 0}</td>
        </tr>
      `;
    }).join('');

    auditTableWrap.innerHTML = `
      <table style="width: 100%; border-collapse: collapse; font-size: 12.5px; text-align: left;">
        <thead style="position: sticky; top: 0; background: #f8f9fa; z-index: 2; border-bottom: 1px solid var(--ios-divider);">
          <tr>
            <th style="padding: 10px 10px; width: 40px; text-align: center;">#</th>
            <th style="padding: 10px 10px; width: 150px;">Fecha y Hora</th>
            <th style="padding: 10px 10px; width: 190px;">Colaborador</th>
            <th style="padding: 10px 10px;">Pregunta (Prompt)</th>
            <th style="padding: 10px 10px; width: 180px;">Operación BigQuery</th>
            <th style="padding: 10px 10px; width: 60px; text-align: center;">Filas</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    `;
  }

  if (openAuditBtn && auditOverlay) {
    openAuditBtn.addEventListener('click', () => {
      if (window.authManager && !window.authManager.isAuthenticated()) {
        window.authManager.showAuthModal();
        return;
      }
      auditOverlay.classList.remove('hidden');
      loadAuditLog();
    });
  }

  if (closeAuditBtn && auditOverlay) {
    closeAuditBtn.addEventListener('click', () => {
      auditOverlay.classList.add('hidden');
    });
  }

  if (auditRefreshBtn) {
    auditRefreshBtn.addEventListener('click', () => loadAuditLog());
  }

  if (auditSearchInput) {
    auditSearchInput.addEventListener('input', (e) => {
      const q = e.target.value.trim().toLowerCase();
      if (!q) {
        renderAuditTable(cachedAuditLogs);
        return;
      }
      const filtered = cachedAuditLogs.filter(item => 
        (item.user_email || '').toLowerCase().includes(q) ||
        (item.user_message || '').toLowerCase().includes(q) ||
        (item.tools_executed || []).some(t => String(t).toLowerCase().includes(q))
      );
      renderAuditTable(filtered);
    });
  }
}

// Inicialización segura sin bloqueos
if (document.readyState !== 'loading') {
  initApp();
} else {
  document.addEventListener('DOMContentLoaded', initApp);
}
