# REQ-HOME-02 — Resumen de vencimientos y panel de desperdicio futuro

**Mockup:** `docs/pantallas.pen` → frame **`Home`** (nodo `kibN3`)
**Specs vigentes:** [`consultainventario.md`](../../specs/consultainventario.md)
**Archivos implicados:** nueva pantalla Home, `src/frontend/src/api/client.js`, endpoint de productos y cálculo de alertas de vencimiento.

---

## 1. Objetivo

Mostrar en el Home un resumen breve de los lotes que requieren atención por vencimiento y reservar el panel de desperdicio del mockup para una etapa futura, sin consultar ni mostrar datos de desperdicios en esta etapa.

## 2. Estado actual

- No existe un Home autenticado con un resumen de lotes.
- La API protegida `/api/productos/` devuelve los lotes y sus fechas; las alertas por lote están descritas en la spec de Inventario.
- El mockup muestra cuatro filas de vencimientos y una tarjeta de último desperdicio.

## 3. Estado objetivo

- El panel de vencimientos muestra como máximo los cuatro lotes con fecha de vencimiento más cercana.
- Los vencidos se muestran primero; dentro de cada grupo se ordena por fecha de vencimiento ascendente.
- Cada fila resume producto, condición/fecha de vencimiento y alerta visual.
- El panel de desperdicio permanece en la composición con un aviso neutral de futura etapa; no solicita datos de ventas o desperdicios.

## 4. Requerimientos funcionales

| ID | Requerimiento |
|---|---|
| RF-2.1 | El Home obtiene los lotes desde la API autenticada y muestra hasta cuatro con `fecha_vencimiento` disponible, priorizando los vencidos y luego los vencimientos más próximos. |
| RF-2.2 | Cada fila representa un lote físico, no un tipo agregado; dos lotes del mismo producto pueden aparecer por separado. |
| RF-2.3 | La alerta sigue la regla compartida con Inventario: **Vencido** si la fecha ya pasó; **Por vencer** si el tiempo restante es ≤10% de la duración total; **Buen estado** en los demás casos. Si la condición es **Fecha de proveedor**, la duración total se calcula entre la fecha de elaboración y el vencimiento manual del lote. |
| RF-2.4 | Los colores de alerta son rojo para vencido, amarillo para por vencer y verde para buen estado; el texto también identifica el estado. |
| RF-2.5 | Si hay menos de cuatro lotes con vencimiento, se muestran los que existan. Los lotes sin fecha de vencimiento no aparecen en este resumen. |
| RF-2.6 | Si no hay lotes con vencimiento disponible, el panel muestra un mensaje de estado vacío en lugar de filas de ejemplo. |
| RF-2.7 | La tarjeta **Último desperdicio** se conserva visualmente y muestra un aviso de que la funcionalidad estará disponible en una etapa futura. No consulta `/api/desperdicios/` ni muestra datos reales o ficticios. |
| RF-2.8 | Durante la carga se muestra un indicador; si la API falla, el panel informa el error sin ocultar el resto del Home. |

## 5. Requerimientos visuales / no funcionales

| ID | Requerimiento |
|---|---|
| RNF-2.1 | El resumen mantiene la disposición de dos paneles del mockup: vencimientos a la izquierda y desperdicio futuro a la derecha. |
| RNF-2.2 | Los estados conservan contraste y significado legible además del color, dentro de la estética pixel-art de la aplicación. |
| RNF-2.3 | Las fechas se presentan en formato local `es-AR`, consistente con el resto del sistema. |

## 6. Casos de uso

### UC-02.1 — Revisar los vencimientos prioritarios

| | |
|---|---|
| **Actor** | Empleado autenticado |
| **Objetivo** | Identificar rápidamente los lotes vencidos o próximos a vencer |
| **Precondiciones** | Sesión iniciada y Home visible |
| **Disparador** | El usuario abre el Home |

**Flujo principal:**
1. El Home solicita los lotes al endpoint autenticado.
2. El sistema ordena los lotes con vencimiento, prioriza los vencidos y limita la lista a cuatro.
3. El sistema muestra fecha y estado de cada lote con el color correspondiente.
4. El panel de desperdicio muestra el aviso de funcionalidad futura.

**Postcondiciones:** El usuario ve un resumen breve y puede ir a Inventario para consultar el detalle.

## 7. Criterios de aceptación

| ID | Criterio (Given / When / Then) |
|---|---|
| CA-2.1 | **Given** más de cuatro lotes con fecha, **when** carga el Home, **then** se muestran solo los cuatro más urgentes y los vencidos aparecen antes que los futuros. |
| CA-2.2 | **Given** un lote vencido, **when** aparece en el resumen, **then** muestra la alerta Vencido en rojo. |
| CA-2.3 | **Given** un lote dentro del 10% final de su duración, **when** aparece en el resumen, **then** muestra Por vencer en amarillo. |
| CA-2.4 | **Given** un lote sin fecha de vencimiento, **when** se arma el resumen, **then** no se incluye como vencimiento próximo. |
| CA-2.5 | **Given** una respuesta vacía, **when** carga el Home, **then** aparece un mensaje vacío y no se inventan filas. |
| CA-2.6 | **Given** el panel de desperdicio futuro, **when** carga el Home, **then** muestra solo el aviso y no hace una llamada a la API de desperdicios. |
| CA-2.7 | **Given** un lote con condición Fecha de proveedor, **when** se calcula su alerta, **then** el umbral del 10% usa la diferencia entre elaboración y vencimiento manual. |

## 8. Fuera de alcance

- Mostrar registros, métricas o totales de desperdicio.
- Crear, editar o eliminar lotes desde Home.
- Definir alertas configurables por usuario.

## 9. Decisiones

| # | Punto | Decisión |
|---|---|---|
| 1 | Cantidad del resumen | Confirmado: cuatro lotes, como en el mockup. |
| 2 | Orden | Confirmado: vencidos primero y después los vencimientos más cercanos. |
| 3 | Umbral y colores | Confirmado: reutilizar la regla existente de 10% y sus colores. |
| 4 | Desperdicio | Confirmado: conservar la tarjeta con aviso futuro, sin datos ni consulta a su endpoint. |
| 5 | Fecha de proveedor | Confirmado: calcular la duración del lote entre elaboración y vencimiento manual para aplicar el umbral del 10%. |
