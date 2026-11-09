# 🚛 Asistente de Transporte y Despachos — Frontend Web 🇵🇪
### Interfaz Ejecutiva para Supervisores de Tienda y Operaciones Logísticas (Tottus Perú)

Este repositorio contiene la **Aplicación Web Frontend** del Asistente de Transporte y Despachos de **Tottus Perú (Falabella)**. Permite a supervisores de tienda y coordinadores logísticos consultar en lenguaje natural el estado de camiones, placas, guías (`Trf_DO`), embarques (`Shipment`), transferencias (`TIM`), consolidado de carga, *lead times* estimados y mercadería en tránsito desde el Centro de Distribución Huachipa hacia las tiendas.

> 🔗 **Repositorio Backend asociado:** `agent-test` (API Gateway con FastAPI, Google Gemini y Toolbox MCP sobre BigQuery).

---

## 🌟 Características Principales

- **Arquitectura Liviana (Zero Build Step):** Construida con HTML5 semántico, CSS3 con variables nativas y JavaScript Vanilla (ES6+) modular. No requiere Node.js, `npm install` ni procesos de empaquetado.
- **Sistema de Diseño Corporativo Retail (v4.0):** Interfaz ejecutiva basada en colores planos institucionales de Tottus (`#045c34`, `#66ac24`), tipografía oficial **Montserrat**, barra superior con **4 KPIs operativos** (CD Huachipa, Red de 40+ Tiendas, Ventana de 31 Días y Trazabilidad de TIMs/Placas) y tablas con numeración automática y scroll horizontal independiente.
- **Exportación Nativa a Excel (`.xls` / `.xlsx`):** Generador en cliente de libros Excel con formato corporativo mediante el estándar XML *SpreadsheetML* (sin requerir librerías externas obligatorias, y con soporte automático para *SheetJS* si está presente).
- **Módulo de Gobernanza y Bitácora de Auditoría:** Panel modal integrado (`Gobernanza y Bitácora de Consultas`) que consulta en tiempo real el historial unificado de preguntas realizadas por los colaboradores (`/api/audit`), con filtro instantáneo por usuario, prompt u operación en BigQuery.
- **Control de Concurrencia y Resiliencia:** Bloqueo preventivo de envíos simultáneos en cliente, indicadores progresivos de estado de consulta y verificación periódica de salud (`/api/health`).

---

## 📁 Estructura del Proyecto

```text
agente-transporte-front/
├── index.html          # Estructura principal: Header Retail, Barra de KPIs, Chat, Login y Modal de Auditoría
├── css/
│   ├── custom.css      # Sistema de diseño visual corporativo Retail Tottus (tokens, tablas, responsive)
│   └── auth.css        # Estilos del modal de autenticación y control de acceso @tottus.com.pe
├── js/
│   ├── api.js          # Cliente HTTP (LogisticsAPI): resolución de URL, /api/auth/verify, /api/chat y /api/audit
│   ├── auth.js         # Gestor de sesión (AuthManager): validación de dominio, Clave Piloto y Google OAuth 2.0
│   ├── ui.js           # Renderizador (LogisticsUI): burbujas, post-procesamiento de tablas y exportación Excel
│   ├── app.js          # Controlador principal: eventos, atajos rápidos (chips), concurrencia y bitácora
│   └── marked.min.js   # Librería local para renderizado seguro y rápido de Markdown (0 dependencias CDN)
└── README.md           # Documentación técnica de este repositorio
```

---

## 🚀 Despliegue y Ejecución

### 1. Servido Directamente desde el Backend FastAPI (Recomendado en Local / Cloud Run)
Si este repositorio se ubica junto al repositorio backend (`../agente-transporte-front`) o dentro de `/app/frontend` en el contenedor Docker, FastAPI lo monta automáticamente en modo *Same-Origin*:
* URL de acceso: **`http://localhost:8000/app/`**

### 2. Servidor Web Estático Local
Puedes abrir `index.html` o levantar un servidor HTTP ligero:
```bash
python -m http.server 3000
```
Luego visita `http://localhost:3000` (se conectará automáticamente al backend en `http://localhost:8000`).

### 3. Alojamiento en GitHub Pages
1. Ve a **Settings > Pages** en el repositorio de GitHub.
2. Selecciona la rama principal (`main`) y la carpeta raíz (`/`).
3. Accede mediante la URL pública asignada pasando el parámetro `?api=` hacia tu backend o túnel HTTPS.

---

## 🔗 Conectividad con el Servidor Backend

El módulo [`js/api.js`](js/api.js) resuelve automáticamente la URL del backend siguiendo esta prioridad:

1. **Same-Origin (`/app`, Cloud Run `*.run.app` o túneles directos):** Utiliza el mismo dominio (`window.location.origin`).
2. **Parámetro en URL (Ideal para enlaces compartidos en GitHub Pages):**
   ```text
   https://<tu-usuario>.github.io/agente-transporte-front/?api=https://<tu-servidor-o-tunel-https>
   ```
   *(El parámetro se guarda automáticamente en `localStorage` bajo la clave `tottus_api_url` para futuras visitas).*
3. **Entorno de Desarrollo Local:** Apunta por defecto a `http://localhost:8000`.

---

## 🛡️ Seguridad, Autenticación y Privacidad

- **Sin secretos hardcodeados en cliente:** El frontend no almacena claves maestras, credenciales de GCP ni tokens en el código fuente.
- **Verificación en Tiempo Real (`/api/auth/verify`):** Antes de desbloquear el chat, [`js/auth.js`](js/auth.js) valida contra el backend que el correo pertenezca exclusivamente al dominio **`@tottus.com.pe`**, esté incluido en la lista blanca (`ALLOWED_USERS`) y cuente con la credencial válida (Clave del Piloto o JWT de Google Identity Services OAuth 2.0).
- **Aislamiento de Sesión por Usuario:** Al iniciar o cerrar sesión, se genera un `session_id` nuevo e independiente y se limpia el historial visual en pantalla.
