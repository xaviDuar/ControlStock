# Consulta de inventario

Funcionalidad que **permite ver la lista completa de los tipos de producto con sus ubicaciones y observaciones** en **¿Cuándo Vence?**. Es la séptima funcionalidad listada en [`funcionalidades.md`](./funcionalidades.md).

> Casos de uso: [`docs/requerimientos/implementados/consultainventarioCDS.md`](../requerimientos/implementados/consultainventarioCDS.md)

---

## Qué hace

- Muestra la pantalla **Inventario** (`/inventario`) con la lista de tipos de producto.
- Por cada tipo de producto muestra una fila con columnas: **Producto**, **Refrigerado**, **Congelado**, **Bodega**, **Toppinera** y **Obs.** (observaciones).
- Los datos vienen de la API `GET /api/tipos/` (con autenticación por token).
- Complementa con la **Búsqueda de productos** (filtrar por nombre) y el contador de resultados.

## Experiencia de usuario

1. Con sesión iniciada, el usuario entra a `/inventario` (desde el Navbar o los atajos de la portada).
2. Ve el título **Inventario**, la barra de búsqueda y la lista de tipos de producto en formato de tabla (una fila por producto).
3. Si la API está cargando, ve "Cargando..."; si falla, ve una caja roja con el error.
4. Al final de la lista se indica cuántos tipos de producto hay.
5. Puede filtrar escribiendo en el buscador o pulsar **Limpiar** para ver todo.

## Cómo lo hace (implementación)

### Frontend (React + Vite)

| Parte | Archivo | Rol |
|---|---|---|
| Página | `src/frontend/src/pages/InventoryPage.jsx` | Estado (`tipos`, `query`, `loading`, `error`), `useEffect` que llama a `fetchTipos(query)`, render de la tabla |
| Cliente API | `src/frontend/src/api/client.js` | `fetchTipos(query)` → `GET /api/tipos/?search=<q>`; agrega `Authorization: Token` |
| Celda de dato | `src/frontend/src/components/DataCell.jsx` | Muestra cada valor de vencimiento (o placeholder) |
| Ruta protegida | `src/frontend/src/App.jsx` | `/inventario` envuelta en `ProtectedRoute` |

### Backend (Django + DRF)

| Parte | Archivo | Rol |
|---|---|---|
| Viewset | `src/backend/Inventory/api.py` | `TipoProductoViewSet` (ReadOnly): `queryset` con `prefetch_related('condicionvencimiento_set')`, `SearchFilter` sobre `nombre`, `IsAuthenticated` |
| Serializer | `src/backend/Inventory/serializers.py` | `TipoProductoSerializer`: `id_tipo_producto`, `nombre`, los 4 vencimientos legacy, `observaciones` y `condiciones` (anidadas) |
| Modelo | `src/backend/Inventory/models.py` | `TipoProducto`: `nombre` (unique), `vencimiento_refrigerado/congelado/bodega/toppinera` (legacy), `observaciones` |
| Rutas | `src/backend/controlStock/urls.py` | router registra `tipos` → `/api/tipos/` |

### Flujo paso a paso

1. El usuario abre `/inventario` con sesión.
2. `InventoryPage` monta el `useEffect` dependiente de `query`: `setLoading(true)`, `setError('')`, `fetchTipos(query)`.
3. `fetchTipos` construye `GET /api/tipos/?search=<query>` (o sin `search` si la query está vacía).
4. `client.js` inyecta `Authorization: Token <token>`.
5. El backend (`TipoProductoViewSet`) filtra por nombre si viene `search` y responde la lista JSON.
6. La página muestra `"Cargando..."` mientras `loading`, la tabla si hay datos, el contador de tipos, o la caja de error si falla.

### Nota sobre los datos

- Los campos `vencimiento_refrigerado/congelado/bodega/toppinera` son **legacy** (solo referencia/exportación). La fuente de verdad de los vencimientos está en `CondicionVencimiento` (accesible vía `condiciones`).

---

## Validaciones y casos límite

| Situación | Comportamiento |
|---|---|
| Carga exitosa | Tabla de tipos de producto + contador |
| Sin resultados para la búsqueda | Tarjeta "No se encontraron productos..." con botón **Ver todos** |
| API con error / 401 / red caída | Caja roja con el mensaje del error |
| Cargando | Texto "Cargando..." |
| Búsqueda activa con resultados | Tabla filtrada (filtro cliente sobre `nombre`) |

---

## Limitaciones conocidas

- El filtro se aplica también en el cliente (`tipos.filter`) además del `search` del backend.
- Sin paginación: la lista se renderiza completa.
- No hay acciones de alta/edición desde esta pantalla (solo lectura; eso es de la gestión admin).

---

Volver a [`funcionalidades.md`](./funcionalidades.md).