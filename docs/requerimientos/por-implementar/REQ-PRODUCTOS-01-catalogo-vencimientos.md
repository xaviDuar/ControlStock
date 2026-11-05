# REQ-PRODUCTOS-01 — Catálogo de productos y vencimientos

**Mockup:** `docs/pantallas.pen` → frame **`Productos`** (nodo `qseH0`)
**Specs vigentes:** [`consultaproductos.md`](../../specs/consultaproductos.md)
**Archivos implicados:** `src/frontend/src/App.jsx`, `src/frontend/src/pages/InventoryPage.jsx`, `src/frontend/src/pages/ProductosPage.jsx`, `src/frontend/src/api/client.js`, `src/backend/Inventory/models.py`, `serializers.py` y `api.py`.

---

## 1. Objetivo

Ofrecer un índice general, más estático que Inventario, de los productos que se utilizan y sus reglas de vencimiento para cada estado de conservación, adaptadas del archivo `vencimientosv4`.

## 2. Estado actual

- El catálogo se obtiene de `GET /api/tipos/`, que entrega `TipoProducto` y sus condiciones.
- Los vencimientos por método están representados por `CondicionVencimiento`; los campos `vencimiento_*` de `TipoProducto` son legacy.
- El código actual muestra el catálogo en `/inventario`; el mockup y el significado acordado lo ubican en `/productos`.

## 3. Estado objetivo

- `/productos` muestra todos los productos del catálogo, aunque no tengan lotes en stock.
- Cada fila representa un tipo de producto e indica las reglas por método: Refrigerado, Congelado, Bodega y Toppinera, además de observaciones cuando existan.
- La pantalla informa condiciones/duraciones, no lotes físicos ni cantidades de stock.

## 4. Requerimientos funcionales

| ID | Requerimiento |
|---|---|
| RF-1.1 | La ruta protegida `/productos` consulta el catálogo desde `GET /api/tipos/`. |
| RF-1.2 | Se muestra una fila por cada tipo de producto del catálogo, sin filtrar por stock disponible. |
| RF-1.3 | La tabla muestra producto, reglas de Refrigerado, Congelado, Bodega y Toppinera, y observaciones si existen. |
| RF-1.4 | Cada condición muestra su duración/unidad y anotación; los casos especiales se presentan como **Fin del día** o **Fec. de proveedor** según corresponda. |
| RF-1.5 | La fuente de reglas es `CondicionVencimiento`; no se toman los campos legacy como fuente de verdad. |
| RF-1.6 | Si un método no tiene condición, su celda muestra `—`; las observaciones ausentes también muestran `—`. |
| RF-1.7 | La página es de consulta. No permite crear, editar ni eliminar productos desde el frontend. |
| RF-1.8 | Mientras se carga la API se informa el estado de carga; ante error se informa claramente; con catálogo vacío se muestra un estado vacío. |
| RF-1.9 | Productos no muestra el botón **+** de carga de lotes; esa acción pertenece exclusivamente a Inventario. |

## 5. Requerimientos visuales / no funcionales

| ID | Requerimiento |
|---|---|
| RNF-1.1 | La tabla, columnas y jerarquía siguen el frame `Productos` y la estética pixel-art oscura del mockup. |
| RNF-1.2 | La lectura de las condiciones no depende exclusivamente de color; el valor de duración/especial se presenta como texto. |
| RNF-1.3 | La pantalla requiere sesión autenticada y formato local de fechas/unidades coherente con la aplicación. |

## 6. Casos de uso

### UC-01.1 — Consultar las reglas de vencimiento de un producto

| | |
|---|---|
| **Actor** | Empleado autenticado |
| **Objetivo** | Consultar cuánto dura un producto según su conservación |
| **Precondiciones** | Sesión iniciada |
| **Disparador** | El usuario abre Productos desde la navegación |

**Flujo principal:**
1. El sistema consulta el catálogo y sus condiciones.
2. Muestra cada producto con sus métodos y valores de vencimiento.
3. El usuario consulta el detalle o busca un producto por nombre (ver `REQ-PRODUCTOS-02`).

## 7. Criterios de aceptación

| ID | Criterio (Given / When / Then) |
|---|---|
| CA-1.1 | **Given** un tipo sin lote en Inventario, **when** se abre Productos, **then** sigue apareciendo en el catálogo. |
| CA-1.2 | **Given** un producto con varias condiciones, **when** se muestra, **then** cada condición aparece bajo su método correspondiente. |
| CA-1.3 | **Given** una condición especial de fin de día o proveedor, **when** se muestra, **then** aparece su texto correspondiente en vez de una duración inventada. |
| CA-1.4 | **Given** un método sin condición, **when** se muestra la tabla, **then** aparece `—` en esa celda. |
| CA-1.5 | **Given** una persona sin sesión, **when** abre `/productos`, **then** se la redirige al login. |

## 8. Fuera de alcance

- Controlar cantidades, fechas de elaboración o vencimientos de lotes físicos (eso corresponde a Inventario).
- Editar las reglas desde esta pantalla.
- Importar `vencimientosv4` en tiempo real desde el frontend.

## 9. Decisiones

| # | Punto | Decisión |
|---|---|---|
| 1 | Distinción de pantallas | Confirmado: Productos es el catálogo general de reglas; Inventario son los lotes físicos existentes. |
| 2 | Origen de reglas | La información adaptada de `vencimientosv4` se consulta desde el catálogo/condiciones en la base del sistema. |
| 3 | Edición | Esta funcionalidad es de consulta; gestión de datos queda en Django Admin. |
| 4 | Botón de alta | Confirmado por el alcance: solo aparece en Inventario, no en el catálogo Productos. |
