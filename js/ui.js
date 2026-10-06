/**
 * Módulo de Renderizado e Interfaz de Usuario (UI) — Apple iOS + Tottus Perú
 * Diseñado exclusivamente para personal operativo y supervisores de tienda.
 */

const TOOL_NAMES_TRANSLATION = {
  'consultar_despachos_logistica': 'Detalle de Mercadería y SKUs',
  'resumen_carga_transporte': 'Consolidado de Camión y Carga',
  'consultar_cargas_pendientes_despacho': 'Cargas Pendientes de Envío',
  'resumen_despachos_por_division': 'Desglose por Departamento Comercial',
  'alertas_vencimiento_transito': 'Control Preventivo de Perecibles',
  'buscar_por_shipment_o_do': 'Rastreo por Guía o Embarque',
  'buscar_tienda_por_nombre': 'Identificación de Tienda'
};

class LogisticsUI {
  constructor() {
    this.chatContainer = document.getElementById('chat-messages');
    this.statusBadge = document.getElementById('connection-status');
  }

  updateConnectionStatus(isOnline) {
    if (!this.statusBadge) return;
    const hasUrl = window.logisticsAPI && Boolean(window.logisticsAPI.baseUrl);
    if (isOnline) {
      this.statusBadge.innerHTML = `
        <span class="ios-status-pill online" title="Conectado a ${window.logisticsAPI.baseUrl}. Clic para ver o cambiar.">
          <span class="ios-status-dot"></span>
          Sistema En Línea
        </span>
      `;
    } else if (!hasUrl) {
      this.statusBadge.innerHTML = `
        <span class="ios-status-pill offline" style="background: rgba(255, 149, 0, 0.12); color: #b45309; border-color: rgba(255, 149, 0, 0.35); cursor: pointer;" title="Haz clic para ingresar la URL pública de tu túnel HTTPS.">
          <span class="ios-status-dot" style="background: #f59e0b; box-shadow: 0 0 6px #f59e0b;"></span>
          Configurar Túnel
        </span>
      `;
    } else {
      this.statusBadge.innerHTML = `
        <span class="ios-status-pill offline" title="No se pudo conectar a ${window.logisticsAPI.baseUrl}. Clic para cambiar URL.">
          <span class="ios-status-dot"></span>
          Desconectado
        </span>
      `;
    }
  }

  resetChatUI(customSubtitle = 'Sesión iniciada') {
    if (!this.chatContainer) {
      this.chatContainer = document.getElementById('chat-messages');
    }
    if (!this.chatContainer) return;
    this.chatContainer.innerHTML = `
      <div class="ios-assistant-row animate-fade-in">
        <div class="ios-avatar-small">TP</div>
        <div class="ios-assistant-bubble-wrap">
          <div class="chat-bubble-assistant">
            <p style="font-weight: 650; font-size: 15.5px; margin-bottom: 6px; letter-spacing: -0.01em;">
              ¡Hola! Soy tu Asistente de Transporte y Despachos de Tottus Perú 🇵🇪
            </p>
            <p style="color: var(--ios-text-secondary); margin-bottom: 8px;">
              Puedo asistirte en tiempo real con las operaciones del Centro de Distribución y Tiendas:
            </p>
            <ul style="margin-left: 1.25rem; font-size: 13.5px; color: var(--ios-text-primary);">
              <li><strong>Placa del camión y transporte asignado:</strong> para cualquier número de TIM o guía.</li>
              <li><strong>Consolidado de carga:</strong> Total de cajas, pallets, bultos y peso en kilogramos.</li>
              <li><strong>Detalle de mercadería:</strong> SKUs y productos enviados a cada tienda.</li>
              <li><strong>Control preventivo:</strong> Artículos perecibles con vencimiento próximo en ruta.</li>
            </ul>
            <p style="font-size: 12.5px; color: var(--ios-text-secondary); margin-top: 10px;">
              💡 <em>Escribe tu consulta abajo o selecciona una de las sugerencias rápidas.</em>
            </p>
          </div>
          <div class="ios-msg-timestamp-assistant">Asistente Logístico Tottus • ${customSubtitle}</div>
        </div>
      </div>
    `;
    this.scrollToBottom();
  }

  addUserMessage(text) {
    const time = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    const msgHtml = `
      <div class="ios-user-row animate-fade-in">
        <div class="ios-user-bubble-wrap">
          <div class="chat-bubble-user">
            ${this.escapeHtml(text)}
          </div>
          <div class="ios-msg-timestamp-user">${time}</div>
        </div>
      </div>
    `;
    this.chatContainer.insertAdjacentHTML('beforeend', msgHtml);
    this.scrollToBottom();
  }

  addAssistantTyping() {
    const id = 'typing-indicator-' + Date.now();
    const typingHtml = `
      <div id="${id}" class="ios-assistant-row animate-fade-in">
        <div class="ios-avatar-small">TP</div>
        <div class="ios-assistant-bubble-wrap">
          <div class="chat-bubble-assistant">
            <div style="display: flex; align-items: center; gap: 8px; color: var(--ios-text-secondary); font-size: 13px;">
              <span id="${id}-text">Consultando registros oficiales...</span>
              <div class="dot-typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    this.chatContainer.insertAdjacentHTML('beforeend', typingHtml);
    this.scrollToBottom();

    // Actualizaciones progresivas para consultas analíticas de BigQuery y síntesis de IA
    const steps = [
      { delay: 2600, text: 'Buscando datos y despachos en BigQuery...' },
      { delay: 5800, text: 'Calculando camiones, transferencias y pesos...' },
      { delay: 9200, text: 'Sintetizando informe ejecutivo con Gemini...' }
    ];

    if (!this._typingTimers) {
      this._typingTimers = {};
    }
    this._typingTimers[id] = [];

    steps.forEach(step => {
      const timer = setTimeout(() => {
        const textSpan = document.getElementById(`${id}-text`);
        if (textSpan) {
          textSpan.textContent = step.text;
        }
      }, step.delay);
      this._typingTimers[id].push(timer);
    });

    return id;
  }

  removeTyping(id) {
    if (this._typingTimers && this._typingTimers[id]) {
      this._typingTimers[id].forEach(timer => clearTimeout(timer));
      delete this._typingTimers[id];
    }
    const elem = document.getElementById(id);
    if (elem) elem.remove();
  }

  addAssistantMessage(response) {
    const time = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    
    // Parsear Markdown a HTML seguro
    let formattedAnswer = response.answer || '';
    if (window.marked && typeof window.marked.parse === 'function') {
      formattedAnswer = window.marked.parse(response.answer);
    } else {
      // Fallback básico si la librería no estuviera disponible
      formattedAnswer = this.escapeHtml(formattedAnswer)
        .replace(/`([^`]+)`/g, '<code class="ios-inline-code">$1</code>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br/>');
    }

    // Mejorar tablas Markdown de Gemini: agregar columna '#' y contenedor con scroll de 15 filas
    try {
      const parserDiv = document.createElement('div');
      parserDiv.innerHTML = formattedAnswer;
      const tables = parserDiv.querySelectorAll('table');
      tables.forEach(table => {
        // 1. Agregar columna '#' en la cabecera
        const thRow = table.querySelector('thead tr');
        if (thRow && !thRow.querySelector('.th-row-num')) {
          const th = document.createElement('th');
          th.className = 'th-row-num';
          th.textContent = '#';
          thRow.insertBefore(th, thRow.firstChild);
        }

        // 2. Agregar número de fila 1, 2, 3... en el cuerpo
        const trs = table.querySelectorAll('tbody tr');
        trs.forEach((tr, idx) => {
          if (!tr.querySelector('.td-row-num')) {
            const td = document.createElement('td');
            td.className = 'td-row-num';
            td.textContent = (idx + 1);
            tr.insertBefore(td, tr.firstChild);
          }
        });

        // 3. Envolver la tabla en un scroll container
        const wrapper = document.createElement('div');
        wrapper.className = 'ios-table-scroll-container';
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);
      });
      formattedAnswer = parserDiv.innerHTML;
    } catch (e) {
      console.warn('No se pudo post-procesar la tabla markdown:', e);
    }

    // Preparar etiqueta de verificación operativa (Explainable UI amigable estilo Apple)
    let auditBadgeHtml = '';
    if (response.tools_executed && response.tools_executed.length > 0) {
      const names = response.tools_executed.map(t => TOOL_NAMES_TRANSLATION[t.tool_name] || 'Operación Logística');
      const uniqueNames = [...new Set(names)].join(', ');
      auditBadgeHtml = `
        <div class="ios-audit-badge">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Verificado en Sistema Central de Despachos (${uniqueNames})</span>
        </div>
      `;
    }

    // Tabla de datos estructurados si está disponible
    let tableHtml = '';
    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      tableHtml = this.generateDataTableHtml(response.data);
    }

    const msgHtml = `
      <div class="ios-assistant-row animate-fade-in">
        <div class="ios-avatar-small">TP</div>
        <div class="ios-assistant-bubble-wrap">
          <div class="chat-bubble-assistant">
            <div class="prose">
              ${formattedAnswer}
            </div>
            ${tableHtml}
            ${auditBadgeHtml}
          </div>
          <div class="ios-msg-timestamp-assistant">Asistente Logístico Tottus • ${time}</div>
        </div>
      </div>
    `;

    this.chatContainer.insertAdjacentHTML('beforeend', msgHtml);
    this.scrollToBottom();
  }

  generateDataTableHtml(data) {
    if (!data || data.length === 0) return '';
    // Extraer dinámicamente todas las columnas presentes en los registros
    const allKeys = [];
    data.forEach(row => {
      if (row && typeof row === 'object') {
        Object.keys(row).forEach(k => {
          if (!allKeys.includes(k)) allKeys.push(k);
        });
      }
    });

    // Ordenar lógicamente las columnas para máxima claridad operativa
    const priorityOrder = [
      'tim', 'Placa', 'Tienda', 'Nombre_Tienda', 'Inventario_Whse',
      'hora_carga', 'Hora_de_Carga', 'fecha_despacho', 'Fecha_Enviado',
      'fecha_estimada_llegada', 'lead_time_horas',
      'sku', 'Descripcion', 'Shipment', 'Trf_DO', 'Tipo_DO',
      'total_pallets', 'total_cajas', 'total_unidades', 'peso_total_kg', 'volumen_total_m3'
    ];
    allKeys.sort((a, b) => {
      const idxA = priorityOrder.indexOf(a);
      const idxB = priorityOrder.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return 0;
    });

    const columns = allKeys.length > 0 ? allKeys : Object.keys(data[0]);
    const tableId = 'table-' + Math.random().toString(36).substring(2, 8);

    const headersHtml = `<th class="th-row-num">#</th>` + columns.map(c => `<th>${this.formatColumnHeader(c)}</th>`).join('');
    
    // Renderizar registros (hasta 500 filas para previsualización con scroll fluido)
    const displayRows = data.slice(0, 500);
    const rowsHtml = displayRows.map((row, index) => {
      const cells = columns.map(c => `<td>${row[c] !== null && row[c] !== undefined ? row[c] : '-'}</td>`).join('');
      return `<tr><td class="td-row-num">${index + 1}</td>${cells}</tr>`;
    }).join('');

    // Guardar data en memoria para descarga completa
    window[tableId] = data;

    const countTitle = data.length > 500 
      ? `📦 Registros Detallados (mostrando 500 de ${data.length} filas)` 
      : `📦 Registros Detallados (${data.length} filas)`;

    return `
      <div class="ios-data-card">
        <div class="ios-data-header">
          <span class="ios-data-title">${countTitle}</span>
          <button onclick="window.logisticsUI.downloadExcel('${tableId}')" class="ios-export-btn">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Descargar Excel (.xlsx)
          </button>
        </div>
        <div class="ios-table-scroll-container">
          <table>
            <thead><tr>${headersHtml}</tr></thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </div>
      </div>
    `;
  }

  formatColumnHeader(key) {
    const dict = {
      'tim': 'TIM',
      'Placa': 'Placa Camión',
      'Tienda': 'Tienda',
      'Nombre_Tienda': 'Nombre Tienda',
      'sku': 'SKU',
      'Descripcion': 'Descripción',
      'Shipment': 'Embarque (Shipment)',
      'Trf_DO': 'Orden Entrega (DO)',
      'Tipo_DO': 'Tipo DO',
      'Inventario_Whse': 'CD Origen',
      'hora_carga': 'Hora de Carga',
      'Hora_de_Carga': 'Hora de Carga',
      'Fecha_Enviado': 'Fecha Envío',
      'Hora_de_Enviado': 'Hora de Envío',
      'fecha_despacho': 'Fecha Despacho',
      'fecha_estimada_llegada': 'Fecha Llegada Estimada',
      'lead_time_horas': 'Lead Time (Horas)',
      'total_pallets': 'Pallets',
      'total_skus_distintos': 'Total SKUs',
      'total_unidades': 'Unidades',
      'total_cajas': 'Cajas',
      'peso_total_kg': 'Peso (kg)',
      'volumen_total_m3': 'Volumen (m³)'
    };
    return dict[key] || key.replace(/_/g, ' ');
  }

  downloadExcel(tableId) {
    const data = window[tableId];
    if (!data || data.length === 0) return;

    // 1. Determinar nombre representativo y limpio del archivo Excel
    let storeName = '';
    let dispatchDate = '';
    for (const r of data) {
      if (!storeName && (r.Nombre_Tienda || r.Tienda || r.tienda_id)) {
        storeName = String(r.Nombre_Tienda || r.Tienda || r.tienda_id).trim().replace(/\s+/g, '_');
      }
      if (!dispatchDate && (r.fecha_despacho || r.Fecha_Enviado)) {
        dispatchDate = String(r.fecha_despacho || r.Fecha_Enviado).substring(0, 10);
      }
      if (storeName && dispatchDate) break;
    }

    const todayStr = new Date().toISOString().substring(0, 10);
    const safeStore = storeName || 'Tottus';
    const safeDate = dispatchDate || todayStr;
    const fileName = `Despachos_${safeStore}_${safeDate}`;

    // 2. Extraer todas las columnas presentes con nombres comerciales amigables
    const allKeys = [];
    data.forEach(row => {
      if (row && typeof row === 'object') {
        Object.keys(row).forEach(k => {
          if (!allKeys.includes(k)) allKeys.push(k);
        });
      }
    });

    const formattedData = data.map(row => {
      const obj = {};
      allKeys.forEach(k => {
        const header = this.formatColumnHeader(k);
        obj[header] = (row[k] !== null && row[k] !== undefined) ? row[k] : '';
      });
      return obj;
    });

    // 3. Generar libro Excel .xlsx nativo si SheetJS está disponible
    if (window.XLSX && typeof window.XLSX.utils !== 'undefined') {
      try {
        const ws = window.XLSX.utils.json_to_sheet(formattedData);
        const wb = window.XLSX.utils.book_new();
        window.XLSX.utils.book_append_sheet(wb, ws, "Despachos Tottus");
        window.XLSX.writeFile(wb, `${fileName}.xlsx`);
        return;
      } catch (err) {
        console.warn('Aviso: Fallo exportador SheetJS, usando generador XML Excel:', err);
      }
    }

    // 4. Fallback: Libro Excel XML (SpreadsheetML) compatible directamente con Microsoft Excel
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<?mso-application progid="Excel.Sheet"?>\n';
    xml += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"\n';
    xml += ' xmlns:o="urn:schemas-microsoft-com:office:office"\n';
    xml += ' xmlns:x="urn:schemas-microsoft-com:office:excel"\n';
    xml += ' xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"\n';
    xml += ' xmlns:html="http://www.w3.org/TR/REC-html40">\n';
    xml += ' <Styles>\n';
    xml += '  <Style ss:ID="Header">\n';
    xml += '   <Font ss:Bold="1" ss:Color="#FFFFFF"/>\n';
    xml += '   <Interior ss:Color="#00853F" ss:Pattern="Solid"/>\n';
    xml += '   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>\n';
    xml += '  </Style>\n';
    xml += '  <Style ss:ID="Default">\n';
    xml += '   <Alignment ss:Vertical="Center"/>\n';
    xml += '  </Style>\n';
    xml += ' </Styles>\n';
    xml += ' <Worksheet ss:Name="Despachos Tottus">\n';
    xml += '  <Table>\n';

    // Cabecera
    xml += '   <Row ss:StyleID="Header">\n';
    allKeys.forEach(k => {
      xml += `    <Cell><Data ss:Type="String">${this.escapeXml(this.formatColumnHeader(k))}</Data></Cell>\n`;
    });
    xml += '   </Row>\n';

    // Filas
    formattedData.forEach(row => {
      xml += '   <Row ss:StyleID="Default">\n';
      allKeys.forEach(k => {
        const header = this.formatColumnHeader(k);
        const val = row[header];
        if (typeof val === 'number') {
          xml += `    <Cell><Data ss:Type="Number">${val}</Data></Cell>\n`;
        } else {
          xml += `    <Cell><Data ss:Type="String">${this.escapeXml(String(val || ''))}</Data></Cell>\n`;
        }
      });
      xml += '   </Row>\n';
    });

    xml += '  </Table>\n';
    xml += ' </Worksheet>\n';
    xml += '</Workbook>';

    const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  escapeXml(unsafe) {
    return String(unsafe)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  downloadCSV(tableId) {
    this.downloadExcel(tableId);
  }

  addErrorMessage(text) {
    const msgHtml = `
      <div class="ios-assistant-row animate-fade-in">
        <div class="ios-avatar-small" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">!</div>
        <div class="ios-assistant-bubble-wrap">
          <div class="ios-error-bubble">
            ${this.escapeHtml(text)}
          </div>
        </div>
      </div>
    `;
    this.chatContainer.insertAdjacentHTML('beforeend', msgHtml);
    this.scrollToBottom();
  }

  escapeHtml(string) {
    const div = document.createElement('div');
    div.innerText = string;
    return div.innerHTML;
  }

  scrollToBottom() {
    this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
  }
}

window.logisticsUI = new LogisticsUI();
