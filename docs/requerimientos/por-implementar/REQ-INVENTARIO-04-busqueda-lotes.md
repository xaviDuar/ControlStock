# REQ-INVENTARIO-04 — Búsqueda de lotes

**Mockup:** `docs/pantallas.pen` → frame **`Inventario`** (nodo `pfMqI`)
**Specs vigentes:** [`consultainventario.md`](../../specs/consultainventario.md)
**Archivos implicados:** pantalla Inventario, `src/frontend/src/api/client.js` (`fetchProductos`) y `src/backend/Inventory/api.py` (`ProductoViewSet`).

---

## 1. Objetivo

Encontrar rápidamente lotes por nombre de producto o proveedor y volver al listado completo al limpiar el filtro.

## 2. Estado actual

- `GET /api/productos/` admite búsqueda por nombre de producto o proveedor.
- La vista de lotes actual está montada bajo `/productos`; se alineará con la ruta `/inventario`.
- El mockup muestra una barra de búsqueda y un control **Limpiar**.

## 3. Estado objetivo

El filtro opera sobre los lotes, mantiene cada partida como fila propia y actualiza el contador de resultados.

## 4. Requerimientos funcionales

| ID | Requerimiento |
|---|---|
| RF-4.1 | El buscador filtra lotes por nombre de producto o proveedor, sin distinguir mayúsculas/minúsculas. |
| RF-4.2 | La búsqueda no agrupa lotes del mismo tipo. |
| RF-4.3 | **Limpiar** vacía el término y restaura todos los lotes. |
| RF-4.4 | Si no hay coincidencias, se informa que no se encontraron lotes y se ofrece limpiar/ver todos. |
| RF-4.5 | Si falla la API durante la búsqueda, se muestra un error diferenciado del estado sin resultados. |

## 5. Requerimientos visuales / no funcionales

| ID | Requerimiento |
|---|---|
| RNF-4.1 | El buscador y **Limpiar** mantienen el estilo del mockup de Inventario. |
| RNF-4.2 | El texto ingresado queda visible mientras se presentan los resultados. |

## 6. Casos de uso

### UC-04.1 — Buscar un lote

| | |
|---|---|
| **Actor** | Empleado autenticado |
| **Objetivo** | Encontrar lotes por producto o proveedor |
| **Precondiciones** | Inventario visible |
| **Disparador** | El usuario escribe en el buscador |

**Flujo principal:**
1. El usuario escribe una palabra o fragmento.
2. El sistema filtra por nombre/proveedor y actualiza filas/contador.
3. El usuario pulsa **Limpiar** para recuperar todos los lotes.

## 7. Criterios de aceptación

| ID | Criterio (Given / When / Then) |
|---|---|
| CA-4.1 | **Given** lotes de distintos productos, **when** se busca parte de un nombre, **then** solo aparecen coincidencias. |
| CA-4.2 | **Given** una búsqueda por proveedor, **when** hay lotes que coinciden, **then** se muestran sin agruparlos. |
| CA-4.3 | **Given** una búsqueda activa, **when** se pulsa **Limpiar**, **then** reaparecen todos los lotes. |
| CA-4.4 | **Given** una consulta sin coincidencias, **when** termina, **then** aparece el estado sin resultados con acción para volver a ver todos. |

## 8. Fuera de alcance

- Filtrar por condición, estado, cantidad o intervalo de fechas.
- Modificar los registros desde los resultados.

## 9. Decisiones

| # | Punto | Decisión |
|---|---|---|
| 1 | Campos de búsqueda | Nombre del producto y proveedor, según la funcionalidad existente y el mockup. |
| 2 | Escritura | Se mantiene la búsqueda simple; no se añade un panel de filtros avanzados. |
