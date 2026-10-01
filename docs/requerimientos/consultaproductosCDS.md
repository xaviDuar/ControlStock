# Consulta de productos — Casos de uso

Requerimientos de la funcionalidad **Consulta de productos** de **¿Cuándo Vence?**, expresados como casos de uso en formato UML detallado.

> Volver a [`funcionalidades.md`](../specs/funcionalidades.md) · Especificación técnica: [`specs/consultaproductos.md`](../specs/consultaproductos.md)

---

## Tabla de casos de uso

| ID | Caso de uso | Actor principal | Disparador | Resultado |
|----|-------------|-----------------|------------|-----------|
| UC-01 | Consultar lotes de producto | Usuario autenticado (API/admin) | Llama a `GET /api/productos/` | Obtiene la lista de lotes con fechas, cantidades, costos y proveedores |
| UC-02 | Buscar productos por nombre o proveedor | Usuario autenticado (API/admin) | Llama a `GET /api/productos/?search=<texto>` | Obtiene solo los lotes coincidentes |
| UC-03 | Consultar sin token (rechazo) | Usuario no autenticado | Llama a la API sin token | Recibe HTTP 401 |

---

## UC-01 — Consultar lotes de producto

**Actor principal:** Usuario autenticado (o herramienta de consumo de la API).
**Actor secundario:** API Django/DRF.
**Objetivo:** Ver los lotes de producto con sus fechas, cantidades, costos y proveedores.
**Disparador:** El usuario consulta `GET /api/productos/` con token válido.

### Precondiciones

1. El usuario tiene un token válido.
2. Existen productos cargados.

### Flujo principal (éxito)

1. El usuario llama a `GET /api/productos/` con `Authorization: Token <token>`.
2. `ProductoViewSet` valida la autenticación (`IsAuthenticated`).
3. El backend arma el queryset con `select_related('id_tipo_producto', 'id_condicion')`.
4. El serializer devuelve cada producto con: `id_producto`, `nombre`, `condicion` (anidada), `fecha_elaboracion`, `fecha_vencimiento`, `cantidad`, `costo_unitario` y `proveedor`.
5. El usuario recibe la lista JSON.
6. El caso de uso termina con éxito.

**Postcondiciones (éxito):** el usuario tiene la lista completa de lotes.

### Flujos alternativos

**FE-1 — Producto sin condición**
- 4a. `condicion` sale nula y `fecha_vencimiento` puede salir nula.

---

## UC-02 — Buscar productos por nombre o proveedor

**Actor principal:** Usuario autenticado (API/admin).
**Actor secundario:** API Django/DRF.
**Objetivo:** Filtrar los lotes por nombre de tipo de producto o proveedor.
**Disparador:** El usuario llama a `GET /api/productos/?search=<texto>`.

### Precondiciones

1. Token válido.
2. Existen productos cargados.

### Flujo principal (éxito)

1. El usuario llama a `GET /api/productos/?search=crema` (u otro texto).
2. El `SearchFilter` filtra por `id_tipo_producto__nombre` o `proveedor` (coincidencia parcial).
3. El backend devuelve solo los lotes coincidentes.
4. El caso de uso termina con éxito.

**Postcondiciones (éxito):** el usuario obtiene los lotes filtrados.

### Flujos alternativos

**FE-1 — Sin coincidencias**
- 3a. El backend devuelve una lista vacía `[]`.

---

## UC-03 — Consultar sin token (rechazo)

**Actor principal:** Usuario no autenticado.
**Actor secundario:** API Django/DRF.
**Objetivo:** Impedir la consulta sin autenticación.
**Disparador:** El usuario llama a `GET /api/productos/` sin token (o con token inválido).

### Precondiciones

1. No hay token válido en la petición.

### Flujo principal (éxito)

1. El usuario llama a la API sin token.
2. DRF rechaza con **HTTP 401** (`DEFAULT_PERMISSION_CLASSES = IsAuthenticated`).
3. No se entregan datos de productos.
4. El caso de uso termina: acceso denegado.

**Postcondiciones (éxito):** no hay fuga de datos; el cliente debe autenticarse.

---

Volver a [`funcionalidades.md`](../specs/funcionalidades.md).