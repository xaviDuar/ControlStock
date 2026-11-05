# REQ-PRODUCTOS-02 — Búsqueda del catálogo

**Mockup:** `docs/pantallas.pen` → frame **`Productos`** (nodo `qseH0`)
**Specs vigentes:** [`busquedaproductos.md`](../../specs/busquedaproductos.md)
**Archivos implicados:** pantalla Productos, `src/frontend/src/api/client.js` (`fetchTipos`) y `src/backend/Inventory/api.py` (`TipoProductoViewSet`).

---

## 1. Objetivo

Permitir filtrar el catálogo de productos por nombre para encontrar sus reglas de vencimiento.

## 2. Estado actual

- `GET /api/tipos/` admite búsqueda por nombre.
- La búsqueda de catálogo está en el componente actualmente montado bajo `/inventario`; se alineará con la ruta `/productos`.
- El mockup de Productos muestra un buscador y control para limpiar.

## 3. Estado objetivo

El buscador filtra el catálogo de Productos por nombre sin afectar los lotes mostrados en Inventario.

## 4. Requerimientos funcionales

| ID | Requerimiento |
|---|---|
| RF-2.1 | La búsqueda del catálogo filtra por nombre de producto, sin distinguir mayúsculas y minúsculas. |
| RF-2.2 | El filtro se actualiza al escribir y el contador corresponde a los productos coincidentes. |
| RF-2.3 | **Limpiar** vacía la búsqueda y restaura todos los productos del catálogo. |
| RF-2.4 | Si no hay coincidencias, se muestra un mensaje de no resultados y una acción para volver a ver todos. |
| RF-2.5 | Los errores de API se muestran como error, diferenciados del estado sin coincidencias. |

## 5. Requerimientos visuales / no funcionales

| ID | Requerimiento |
|---|---|
| RNF-2.1 | El buscador conserva la posición, dimensiones y estilo pixel-art del mockup `Productos`. |
| RNF-2.2 | La búsqueda no modifica los valores ni las condiciones del catálogo. |

## 6. Casos de uso

### UC-02.1 — Buscar un producto del catálogo

| | |
|---|---|
| **Actor** | Empleado autenticado |
| **Objetivo** | Encontrar un producto y consultar sus reglas |
| **Precondiciones** | Catálogo Productos visible |
| **Disparador** | El usuario ingresa texto en el buscador |

**Flujo principal:**
1. El usuario escribe el nombre o parte del nombre.
2. La tabla presenta los productos que coinciden.
3. El usuario limpia el campo para recuperar el catálogo completo.

## 7. Criterios de aceptación

| ID | Criterio (Given / When / Then) |
|---|---|
| CA-2.1 | **Given** productos en el catálogo, **when** se busca una parte del nombre, **then** aparecen solo las coincidencias. |
| CA-2.2 | **Given** una búsqueda sin coincidencias, **when** termina, **then** aparece el estado vacío con acción para volver al catálogo completo. |
| CA-2.3 | **Given** un filtro aplicado, **when** se pulsa **Limpiar**, **then** reaparecen todos los productos. |
| CA-2.4 | **Given** una respuesta de API con error, **when** se realiza la búsqueda, **then** se muestra el error y no el mensaje de no coincidencias. |

## 8. Fuera de alcance

- Búsqueda por proveedor, estado de vencimiento, condición o lote (son criterios del Inventario o no solicitados para el catálogo).
- Ordenamiento avanzado, filtros combinados o paginación.

## 9. Decisiones

| # | Punto | Decisión |
|---|---|---|
| 1 | Campo de búsqueda | Confirmado con la funcionalidad existente: nombre del producto. |
| 2 | Acción para recuperar el catálogo | Mantener **Limpiar** y/o **Ver todos** según el estado visual definido en el mockup. |
