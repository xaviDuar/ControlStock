# REQ-INVENTARIO-03 — Consulta de lotes del local

**Mockup:** `docs/pantallas.pen` → frame **`Inventario`** (nodo `pfMqI`) y estado **`Inventario — Cargar lote`** (nodo `spCSJ`)
**Specs vigentes:** [`consultainventario.md`](../../specs/consultainventario.md)
**Archivos implicados:** `src/frontend/src/App.jsx`, `src/frontend/src/pages/InventoryPage.jsx`, `src/frontend/src/pages/ProductosPage.jsx`, `src/frontend/src/api/client.js`, `src/backend/Inventory/models.py`, `serializers.py`, `api.py` y migraciones.

---

## 1. Objetivo

Controlar los lotes físicos que se encuentran en el local, con cantidad, unidad y vencimiento por partida.

## 2. Estado actual

- `Producto` representa un lote con tipo, condición, fechas y cantidad.
- `cantidad` no tiene unidad de medida asociada.
- La API `GET /api/productos/` devuelve lotes; actualmente la vista de lotes está montada en `/productos`, mientras que `/inventario` muestra el catálogo de tipos.

## 3. Estado objetivo

- `/inventario` muestra una fila por cada lote físico; un producto repetido con otro vencimiento se muestra y cuenta aparte.
- La tabla muestra: **Producto**, **Condición**, **Duración**, **Elaboración**, **Vencimiento**, **Cantidad**, **Medición**, **Alerta** y acción de rótulos.
- La unidad se almacena por lote; dos partidas del mismo producto pueden tener unidades diferentes.
- La carga de nuevas partidas está cubierta por `REQ-INVENTARIO-01`; la acción de carrito está cubierta por `REQ-INVENTARIO-02`.

## 4. Requerimientos funcionales

| ID | Requerimiento |
|---|---|
| RF-3.1 | La ruta protegida `/inventario` obtiene y muestra las partidas desde la API de productos/lotes. |
| RF-3.2 | Cada registro de `Producto` se muestra como una fila; los nombres pueden repetirse para lotes distintos. |
| RF-3.3 | Cada fila muestra producto, condición, duración, fecha de elaboración, fecha de vencimiento, cantidad, unidad y alerta. |
| RF-3.4 | La alerta es **Vencido** si la fecha ya pasó; **Por vencer** si queda ≤10% de la duración total; **Buen estado** en los demás casos. Para **Fecha de proveedor**, la duración total es la diferencia entre elaboración y vencimiento manual del lote. |
| RF-3.5 | Los estados usan rojo, amarillo y verde respectivamente, además de su etiqueta textual. Fecha/condición ausentes en datos históricos se muestran como `—` sin asignar una alerta falsa. |
| RF-3.6 | El total al pie cuenta lotes mostrados, no tipos únicos de producto. |
| RF-3.7 | El botón de la fila para agregar rótulos ejecuta `REQ-INVENTARIO-02`; el botón **+** de alta ejecuta `REQ-INVENTARIO-01`. |
| RF-3.8 | Durante carga se informa el estado; sin datos se muestra un estado vacío; ante error se informa el problema sin inventar filas. |

## 5. Requerimientos visuales / no funcionales

| ID | Requerimiento |
|---|---|
| RNF-3.1 | La tabla sigue jerarquía, tipografía Workbench y estética pixel-art del mockup. |
| RNF-3.2 | Los valores se alinean bajo sus encabezados y fechas/cantidades permanecen legibles sin superposición. |
| RNF-3.3 | La pantalla y su API requieren sesión autenticada. |
| RNF-3.4 | La cantidad se interpreta junto con su unidad (por ejemplo, `1 kg` o `500 g`); no se convierten cantidades entre unidades. |

## 6. Casos de uso

### UC-03.1 — Consultar el inventario

| | |
|---|---|
| **Actor** | Empleado autenticado |
| **Objetivo** | Revisar las partidas disponibles y su vencimiento |
| **Precondiciones** | Sesión iniciada |
| **Disparador** | El usuario abre Inventario |

**Flujo principal:**
1. El sistema obtiene los lotes.
2. Muestra cada partida con su cantidad/unidad, fechas y alerta.
3. Muestra el total de lotes.
4. El usuario puede buscar, cargar un lote o agregar rótulos desde las acciones correspondientes.

## 7. Criterios de aceptación

| ID | Criterio (Given / When / Then) |
|---|---|
| CA-3.1 | **Given** dos lotes del mismo producto con vencimientos distintos, **when** abre Inventario, **then** aparecen en filas separadas y cuentan como dos. |
| CA-3.2 | **Given** lotes del mismo tipo con unidades distintas, **when** carga la tabla, **then** cada fila muestra la unidad asignada a su lote. |
| CA-3.3 | **Given** un lote vencido o por vencer, **when** se muestra, **then** se usa la etiqueta y color definidos en RF-3.4/RF-3.5. |
| CA-3.4 | **Given** una respuesta vacía, **when** carga la pantalla, **then** se muestra un estado vacío y el total es cero. |
| CA-3.5 | **Given** una persona sin sesión, **when** abre `/inventario`, **then** se la redirige a la portada de login. |
| CA-3.6 | **Given** un lote con condición Fecha de proveedor, **when** se calcula su alerta, **then** Por vencer usa el 10% del intervalo elaboración→vencimiento manual. |

## 8. Fuera de alcance

- Cambiar o eliminar lotes existentes desde la tabla.
- Administrar el catálogo general de tipos y condiciones (ver Productos).
- Convertir unidades o cambiar registros de ventas/desperdicios.

## 9. Decisiones

| # | Punto | Decisión |
|---|---|---|
| 1 | Unidad | Confirmado: se guarda por lote y puede diferir entre partidas del mismo tipo. |
| 2 | Umbral de alerta | Confirmado: se reutiliza el umbral existente ≤10% de la duración. |
| 3 | Alta y rótulos | Se especifican por separado en `REQ-INVENTARIO-01` y `REQ-INVENTARIO-02`. |
| 4 | Fecha de proveedor | Confirmado: calcular la duración del lote entre elaboración y vencimiento manual para aplicar el umbral del 10%. |
