# Búsqueda de productos

Funcionalidad que **permite filtrar el inventario por nombre y limpiar el filtro para ver todo de nuevo** en **¿Cuándo Vence?**. Es la octava funcionalidad listada en [`funcionalidades.md`](./funcionalidades.md).

> Casos de uso: [`docs/requerimientos/implementados/busquedaproductosCDS.md`](../requerimientos/implementados/busquedaproductosCDS.md)

---

## Qué hace

- Permite escribir en una barra de búsqueda (dentro de **Inventario**) y filtrar los tipos de producto por nombre.
- El filtro se aplica en tiempo real mientras se escribe.
- Si no hay coincidencias, muestra un aviso con un botón **Ver todos**.
- El botón **Limpiar** vacía la búsqueda y vuelve a mostrar la lista completa.

## Experiencia de usuario

1. En `/inventario`, el usuario ve la barra de búsqueda: placeholder *"Buscar por nombre de producto..."*.
2. Escribe un texto (p. ej. "crema"): la lista se filtra al instante mostrando solo los tipos cuyo nombre contiene el texto (sin distinguir mayúsculas).
3. Si no hay coincidencias, ve la tarjeta *"No se encontraron productos para 'crema'"* con el botón **Ver todos**.
4. Pulsa **Limpiar** (o **Ver todos**): el buscador se vacía y se muestra toda la lista de nuevo.

## Cómo lo hace (implementación)

### Frontend (React + Vite)

| Parte | Archivo | Rol |
|---|---|---|
| Estado | `src/frontend/src/pages/InventoryPage.jsx` | `query` controla el input; cada cambio dispara el `useEffect` |
| Búsqueda | `src/frontend/src/api/client.js` | `fetchTipos(query)` arma `GET /api/tipos/?search=<query>` |
| Filtro backend | `src/backend/Inventory/api.py` | `TipoProductoViewSet` con `SearchFilter` y `search_fields=['nombre']` |
| Filtro cliente | `src/frontend/src/pages/InventoryPage.jsx` | `filtered = query ? tipos.filter(t => t.nombre.toLowerCase().includes(query.toLowerCase())) : tipos` |
| Limpiar | `src/frontend/src/pages/InventoryPage.jsx` | `setQuery('')` (botón **Limpiar** y **Ver todos**) |

### Flujo paso a paso

1. El usuario escribe en el input de búsqueda → `setQuery(valor)`.
2. El `useEffect` (depende de `query`) corre de nuevo: `setLoading(true)`, `setError('')`, `fetchTipos(query)`.
3. La API recibe `?search=<query>` y el backend filtra por nombre.
4. En paralelo, el frontend aplica su propio filtro cliente sobre los datos recibidos.
5. La tabla muestra `filtered`:
   - Con resultados → filas filtradas + contador.
   - Sin resultados y con `query` → tarjeta "No se encontraron productos..." con botón **Ver todos**.
6. El usuario pulsa **Limpiar** (o **Ver todos**) → `setQuery('')` → se vuelve a cargar la lista completa.

---

## Validaciones y casos límite

| Situación | Comportamiento |
|---|---|
| Texto con mayúsculas/minúsculas mezcladas | Se normaliza con `toLowerCase()` (búsqueda insensible a mayúsculas) |
| Búsqueda sin coincidencias | Tarjeta de "no encontrado" con botón **Ver todos** |
| Búsqueda vacía (`query=''`) | Se muestra toda la lista |
| Backend filtra y cliente también filtra | Doble filtrado (equivalente); no rompe la lista |
| Error de API durante la búsqueda | Caja de error (no tabla) |

---

## Limitaciones conocidas

- La búsqueda no es de "tipeo debounce": cada tecla dispara un request al backend.
- No hay búsqueda por otros campos (proveedor, observaciones) en esta pantalla.

---

Volver a [`funcionalidades.md`](./funcionalidades.md).