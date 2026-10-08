# Consulta de inventario

Funcionalidad que **permite ver los lotes de producto que están en el local, con su condición y su fecha de vencimiento calculada** en **¿Cuándo Vence?**. Es la decimocuarta funcionalidad listada en [`funcionalidades.md`](./funcionalidades.md).

> Casos de uso: [`docs/requerimientos/implementados/consultainventarioCDS.md`](../requerimientos/implementados/consultainventarioCDS.md)

---

## Qué hace

- Muestra la pantalla **Inventario** (`/inventario`) con la lista de lotes de producto.
- Por cada lote muestra una fila con columnas: **Producto**, **Condición**, **Duración**, **Elaboración**, **Vencimiento**, **Cantidad**, **Medición** y **Alerta**.
- La columna **Alerta** muestra una palabra con color: **Vencido** (rojo), **Por vencer** (amarillo, ≤ 10% de la duración) o **Buen estado** (verde).
- Los datos vienen de la API `GET /api/productos/` (con autenticación por token).
- Permite **buscar** por nombre de producto o por proveedor (parámetro `?search=`, SearchFilter de DRF).
- Cada lote tiene un **icono de lista** (arriba a la derecha) que permite cargarlo al **carrito de rótulos** indicando la cantidad de rótulos a generar.

## Experiencia de usuario

1. Con sesión iniciada, el usuario entra a `/inventario` (desde el Navbar o los atajos de la portada).
2. Ve el título **Inventario**, la barra de búsqueda y la lista de lotes en formato de tabla (una fila por lote).
3. Cada fila muestra: producto, condición, duración, fechas de elaboración y vencimiento, cantidad, medición y una palabra con color que indica el estado del vencimiento (Vencido/Por vencer/Buen estado).
4. Si la API está cargando, ve "Cargando..."; si falla, ve una caja roja con el error.
5. Al final de la lista se indica cuántos lotes hay.
6. Puede filtrar escribiendo en el buscador (por nombre o proveedor) o pulsar **Limpiar** para ver todo.
7. Puede tocar el icono de lista de un lote, ingresar la cantidad de rótulos y agregarlo al carrito de rótulos.

## Cómo lo hace (implementación)

### Frontend (React + Vite)

| Parte | Archivo | Rol |
|---|---|---|
| Página | `src/frontend/src/pages/ProductosPage.jsx` | Estado (`productos`, `query`, `loading`, `error`), `useEffect` que llama a `fetchProductos(query)`, render de la tabla de lotes |
| Cliente API | `src/frontend/src/api/client.js` | `fetchProductos(query)` → `GET /api/productos/?search=<q>`; agrega `Authorization: Token` |
| Ruta protegida | `src/frontend/src/App.jsx` | `/productos` envuelta en `ProtectedRoute` |

### Backend (Django + DRF)

| Parte | Archivo | Rol |
|---|---|---|
| Viewset | `src/backend/Inventory/api.py` | `ProductoViewSet` (ReadOnly): `select_related('id_tipo_producto', 'id_condicion')`, `SearchFilter` sobre `id_tipo_producto__nombre` y `proveedor`, `IsAuthenticated` |
| Serializer | `src/backend/Inventory/serializers.py` | `ProductoSerializer`: campos `__all__` + `nombre` (fuente `id_tipo_producto.nombre`) + `condicion` (CondicionVencimiento anidada) |
| Modelo | `src/backend/Inventory/models.py` | `Producto`: `id_tipo_producto`, `id_condicion`, `fecha_elaboracion`, `fecha_vencimiento`, `cantidad`, `unidad_medida` (pendiente), `costo_unitario`, `proveedor` |
| Rutas | `src/backend/controlStock/urls.py` | router registra `productos` → `/api/productos/` |

### Payload de ejemplo (por ítem)

```
{
  "id_producto": 1,
  "id_tipo_producto": 3,
  "nombre": "Crema pastelera",
  "id_condicion": 7,
  "condicion": { "id_condicion": 7, "metodo": "congelado", "anotacion": "bolsa cerrada",
                 "duracion_valor": 6, "duracion_unidad": "MESES", "especial": null },
  "fecha_elaboracion": "2026-09-01",
  "fecha_vencimiento": "2027-03-01",
  "cantidad": 12.0,
  "unidad_medida": "kg",
  "costo_unitario": "150.00",
  "proveedor": "Distribuidora X"
}
```

### Flujo paso a paso

1. El usuario abre `/inventario` con sesión.
2. `ProductosPage` monta el `useEffect` dependiente de `query`: `setLoading(true)`, `setError('')`, `fetchProductos(query)`.
3. `fetchProductos` construye `GET /api/productos/?search=<query>` (o sin `search` si la query está vacía).
4. `client.js` inyecta `Authorization: Token <token>`.
5. El backend (`ProductoViewSet`) filtra por nombre o proveedor si viene `search` y responde la lista JSON.
6. La página muestra `"Cargando..."` mientras `loading`, la tabla si hay datos, el contador de lotes, o la caja de error si falla.

### Nota sobre el cálculo del vencimiento

- La `fecha_vencimiento` de cada lote se calcula automáticamente a partir de su `fecha_elaboracion` y su `condicion` (ver **Cálculo automático del vencimiento**). El inventario es la vista donde ese vencimiento se consulta.

### Nota sobre la alerta de color

- La alerta se calcula comparando la `fecha_vencimiento` con la fecha actual:
  - **Vencido** (rojo): `fecha_vencimiento` anterior a hoy.
  - **Por vencer** (amarillo): el tiempo restante hasta el vencimiento es menor o igual al 10% de la duración total de la condición.
  - **Buen estado** (verde): el resto de los casos.

---

## Validaciones y casos límite

| Situación | Comportamiento |
|---|---|
| Carga exitosa | Tabla de lotes + contador |
| Sin lotes cargados | Tarjeta "No hay productos cargados." (sin tabla) |
| Sin resultados para la búsqueda | Tarjeta "No se encontraron productos..." con botón **Ver todos** |
| API con error / 401 / red caída | Caja roja con el mensaje del error |
| Cargando | Texto "Cargando..." |
| Lote sin condición | `condicion` nula, `fecha_vencimiento` posiblemente nula (se muestra `—`); alerta sin color |
| Lote vencido | Alerta **Vencido** (rojo) |
| Lote por vencer (≤ 10% de la duración) | Alerta **Por vencer** (amarillo) |
| Lote en buen estado | Alerta **Buen estado** (verde) |
| Tocar icono de lista | Formulario en la fila pidiendo la cantidad de rótulos |
| Confirmar con cantidad válida | Lote agregado al carrito de rótulos |
| Confirmar sin cantidad | Se pide completar la cantidad; no se agrega nada |

---

## Limitaciones conocidas

- Sin paginación: la lista se renderiza completa.
- Endpoint de solo lectura (la gestión es por admin).
- El campo `unidad_medida` (kg, litros, ml, etc.) no existe aún en el modelo `Producto`; se agregará en un cambio de backend posterior.
- La ruta y el nombre del componente están invertidos respecto a la semántica correcta (hoy `/productos` muestra los lotes); se alinearán en un cambio de código posterior.

---

Volver a [`funcionalidades.md`](./funcionalidades.md).
