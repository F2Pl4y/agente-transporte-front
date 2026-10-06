# 🚛 Asistente de Transporte y Despachos — Frontend Web
### Interfaz Web para Supervisores y Jefes de Operaciones

Esta aplicación web proporciona una interfaz conversacional moderna, rápida y ejecutiva, diseñada bajo principios de **Apple iOS Design System** y adaptada para operaciones logísticas de retail.

Permite a supervisores de tienda y coordinadores logísticos consultar en lenguaje natural el estado de camiones, guías, transferencias (TIM), consolidado de carga y mercadería despachada.

---

## 🌟 Características Principales

- **Arquitectura Liviana (Zero Build Step):** Construida con HTML5, CSS3 nativo y JavaScript moderno. No requiere Node.js, `npm install` ni herramientas de compilación.
- **Diseño iOS Frosted Glass:** Componentes con efectos de desenfoque, tipografía ejecutiva, microinteracciones y tablas con scroll horizontal independiente.
- **Exportación Nativa a Excel:** Generación en cliente de archivos `.xlsx` y `.xls` con formato formal mediante SheetJS.
- **Trazabilidad y Gobernanza:** Historial de consultas y auditoría para trazabilidad de consultas operativas.
- **Despliegue Instantáneo:** Compatible directamente con **GitHub Pages**, servidores estáticos o apertura local.

---

## 🚀 Despliegue y Ejecución

### 1. En GitHub Pages
Puedes alojar este frontend de forma estática en GitHub Pages:
1. Ve a **Settings > Pages** en tu repositorio.
2. Selecciona la rama principal (`main`) y la carpeta raíz (`/`).
3. Guarda y accede mediante la URL pública asignada.

### 2. Ejecución Local
Simplemente abre `index.html` en tu navegador favorito o inicia un servidor local con Python:
```bash
python -m http.server 3000
```
Luego visita `http://localhost:3000`.

---

## 🔗 Conectividad con el Servidor Backend

El frontend se comunica con un backend API compatible (FastAPI / REST). 

### Configuración de la URL del Servidor:
1. **Vía Parámetro en URL (Recomendado para enlaces compartidos):**
   ```text
   https://tu-usuario.github.io/agente-transporte-front/?api=https://tu-servidor-o-tunel.com
   ```
2. **Vía Interfaz Gráfica:**
   Haz clic en el indicador de estado en la barra superior (**"Sistema En Línea"** / **"Configurar Túnel"**) para ingresar o actualizar la dirección de tu API.
3. **Por Defecto en Local:**
   Apunta a `http://localhost:8000`.

---

## 🛡️ Seguridad y Privacidad

- **Sin credenciales en cliente:** El frontend no almacena contraseñas maestras, tokens de servicios en la nube ni claves privadas.
- **Validación de Dominio:** Diseñado para autenticación corporativa vía Google Identity Services (OAuth 2.0).
- **Tratamiento Seguro de Datos:** Toda la comunicación sensible viaja a través de HTTPS hacia el backend autorizado.
