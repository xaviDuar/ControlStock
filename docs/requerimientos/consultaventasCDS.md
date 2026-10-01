# Consulta de ventas — Casos de uso

Requerimientos de la funcionalidad **Consulta de ventas** de **¿Cuándo Vence?**, expresados como casos de uso en formato UML detallado.

> Volver a [`funcionalidades.md`](../specs/funcionalidades.md) · Especificación técnica: [`specs/consultaventas.md`](../specs/consultaventas.md)

---

## Tabla de casos de uso

| ID | Caso de uso | Actor principal | Disparador | Resultado |
|----|-------------|-----------------|------------|-----------|
| UC-01 | Consultar ventas registradas | Usuario autenticado (API/admin) | Llama a `GET /api/ventas/` | Obtiene el registro de ventas |
| UC-02 | Consultar ventas sin token (rechazo) | Usuario no autenticado | Llama a la API sin token | Recibe HTTP 401 |

---

## UC-01 — Consultar ventas registradas

**Actor principal:** Usuario autenticado (o herramienta de consumo de la API).
**Actor secundario:** API Django/DRF.
**Objetivo:** Ver el registro de ventas realizadas.
**Disparador:** El usuario consulta `GET /api/ventas/` con token válido.

### Precondiciones

1. El usuario tiene un token válido.
2. Existen ventas registradas (opcional; si no, devuelve `[]`).

### Flujo principal (éxito)

1. El usuario llama a `GET /api/ventas/` con `Authorization: Token <token>`.
2. `VentaViewSet` valida la autenticación.
3. El backend arma el queryset con `select_related('id_producto')`.
4. El serializer devuelve cada venta con: `id_venta`, `id_producto`, `fecha`, `cantidad` y `precio_unitario`.
5. El usuario recibe la lista JSON.
6. El caso de uso termina con éxito.

**Postcondiciones (éxito):** el usuario tiene el registro de ventas.

### Flujos alternativos

**FE-1 — Sin ventas**
- 4a. El backend devuelve `[]`.

---

## UC-02 — Consultar ventas sin token (rechazo)

**Actor principal:** Usuario no autenticado.
**Actor secundario:** API Django/DRF.
**Objetivo:** Impedir la consulta sin autenticación.
**Disparador:** El usuario llama a `GET /api/ventas/` sin token.

### Precondiciones

1. No hay token válido en la petición.

### Flujo principal (éxito)

1. El usuario llama a la API sin token.
2. DRF rechaza con **HTTP 401** (`IsAuthenticated` por defecto).
3. No se entregan datos de ventas.
4. El caso de uso termina: acceso denegado.

**Postcondiciones (éxito):** no hay fuga de datos; el cliente debe autenticarse.

---

Volver a [`funcionalidades.md`](../specs/funcionalidades.md).