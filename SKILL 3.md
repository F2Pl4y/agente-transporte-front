---
name: diseno-premium-retail
description: "Aplica un sistema de diseño visual corporativo, limpio, plano y sin degradados (colores reales), utilizando la tipografía Montserrat y una paleta de verdes de retail. Úsalo para crear interfaces ejecutivas de alta fidelidad, ordenadas y legibles."
---

# UI Design System Skill

## Cuándo usar esta skill

Usa esta skill cuando el usuario pida crear, rediseñar o mejorar una interfaz web, dashboard, landing, app interna, agente visual, formulario, pantalla de administración o demo ejecutiva.

## Objetivo

Crear interfaces modernas, limpias, profesionales y listas para demo, no solo funcionales.

La interfaz debe verse:
- Clara
- Elegante
- Moderna
- Con buena jerarquía visual
- Responsive
- Fácil de entender para negocio
- Lista para mostrar a una gerencia
- **Tiene que ser el mejor diseño del mundo y sin degradé, colores reales.**

## Principios visuales

1. Prioriza claridad antes que decoración.
2. Usa jerarquía visual fuerte: título, subtítulo, acciones, contenido principal.
3. Usa cards limpias, bordes suaves y buen espaciado.
4. Evita interfaces saturadas.
5. Usa colores consistentes mediante tokens.
6. Usa sombras sutiles, no exageradas.
7. Usa estados visuales: loading, empty, error y success.
8. Usa microcopy claro y ejecutivo.
9. No uses tablas gigantes como primera solución.
10. La pantalla debe entenderse en menos de 5 segundos.

## Stack preferido

Si el proyecto no define stack, usa:
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- lucide-react
- recharts para gráficos simples

Si el proyecto ya tiene stack (como en este caso, que utiliza FastAPI, HTML y CSS clásico), respétalo, pero aplica las mismas guías estéticas de colores y tipografía.

## Paleta de Colores Planos (Corporativo Retail)

Usa esta paleta por defecto para interfaces retail / corporativas (sin degradados):

- **Primary**: `#045c34` (Verde Corporativo - Botones principales, cabeceras)
- **Secondary**: `#66ac24` (Verde Manzana - Acentos de éxito, bordes seleccionados)
- **Accent**: `#99c76b` (Verde Suave - Detalles secundarios)
- **Soft highlight**: `#e5e778` (Amarillo/Lima Suave - Resaltado de advertencias sutiles)
- **Background**: `#f7f8f5` (Fondo general de la pantalla, claro y limpio)
- **Surface**: `#ffffff` (Fondo de tarjetas, paneles y modales)
- **Text primary**: `#1f2933` (Slate oscuro para texto principal y títulos)
- **Text secondary**: `#64748b` (Slate gris para textos secundarios y metadatos)
- **Border**: `#e5e7eb` (Gris claro para bordes limpios)

Evita usar rojo o celeste como colores principales.

## Tipografía (Montserrat)
- **Familia tipográfica**: Montserrat (`font-family: 'Montserrat', sans-serif;`).
- Carga Montserrat desde Google Fonts:
  ```html
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  ```
- **Títulos Portadas**: Montserrat Bold, `85 pt` (proporcional para web: `2.25rem` o `36px`).
- **Títulos**: Montserrat Bold, `50 pt` (proporcional para web: `1.5rem` o `24px`).
- **Textos**: Montserrat Regular, `24 pt` (proporcional para web: `0.95rem` o `15px`).
- **Frases / Destacados**: Montserrat SemiBold, `35 pt` (proporcional para web: `1.15rem` o `18px`).
- El cuerpo de texto en bold se usa únicamente para destacar ideas fuerzas o mensajes normativos importantes.

## Componentes esperados

Cuando aplique, crear o mejorar:
- **AppShell**: Marco contenedor de la aplicación.
- **Header**: Con el título ejecutivo, subtítulo y estado.
- **KPI cards**: Tarjetas métricas en la parte superior.
- **Filters**: Panel de filtros o carga rápida.
- **Data table**: Tablas limpias con bordes suaves.
- **Empty state**: Estado vacío con un icono sutil.
- **Loading skeleton**: O spinners limpios en los botones.
- **Primary / Secondary buttons**: Botones con colores sólidos corporativos.

## Layout recomendado

Para dashboards o apps internas, usa esta estructura:

1. **Header ejecutivo**:
   - Nombre de la herramienta
   - Descripción breve
   - Acción principal
2. **Resumen superior (KPIs)**:
   - 3 a 5 KPIs principales (ej. total productos, tasa de cumplimiento, alertas)
   - Estado o variación
   - Lectura rápida
3. **Contenido principal**:
   - Cards accionables (Panel de controles a la izquierda, resultados a la derecha)
   - Insights / Recomendaciones
   - Tabla solo si es necesaria (con bordes suaves y celdas limpias)
4. **Panel de acciones**:
   - Próximos pasos
   - Alertas de alérgenos chilenos
   - Tareas sugeridas

## Reglas de implementación

Antes de modificar código:
1. Revisa la estructura del proyecto.
2. Identifica framework, librerías y archivos relevantes.
3. Propón brevemente qué archivos modificarás.
4. Luego implementa.

Durante la implementación:
1. Crea componentes reutilizables.
2. Evita duplicar estilos.
3. Usa nombres claros.
4. No rompas funcionalidad existente.
5. Agrega datos mock solo si no hay datos reales.
6. Mantén responsive básico.
7. Considera accesibilidad mínima (por ejemplo, asegurando alto contraste del texto en botones y fondos).

## Checklist final

Antes de terminar, valida:
- La UI se ve profesional.
- Hay jerarquía visual clara.
- La acción principal es evidente.
- Los colores son consistentes.
- Hay buen espaciado.
- La interfaz no está saturada.
- Existen estados loading, empty y error cuando aplica.
- El código queda modular.
- La pantalla es presentable para una demo ejecutiva.
- **El diseño es el mejor del mundo, sin degradados y con colores reales.**
