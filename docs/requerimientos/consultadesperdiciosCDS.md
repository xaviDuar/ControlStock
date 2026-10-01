# Consulta de desperdicios — Casos de uso

Requerimientos de la funcionalidad **Consulta de desperdicios** de **¿Cuándo Vence?**, expresados como casos de uso en formato UML detallado.

> Volver a [`funcionalidades.md`](../specs/funcionalidades.md) · Especificación técnica: [`specs/consultadesperdicios.md`](../specs/consultadesperdicios.md)

---

## Tabla de casos de uso

| ID | Caso de uso | Actor principal | Disparador | Resultado |
|----|-------------|-----------------|------------|-----------|
| UC-01 | Consultar desperdicios registrados | Usuario autenticado (API/admin) | Llama a `GET /api/desperdicios/` | Obtiene el registro de productos desechados con sus motivos |
| UC-02 | Consultar desperdicios sin token (rechazo) | Usuario no autenticado | Llama a la API sin token | Recibe HTTP 401 |

---

## UC-01 — Consultar desperdicios registrados

**Actor principal:** Usuario autenticado (o herramienta de consumo de la API).
**Actor secundario:** API Django/DRF.
**Objetivo:** Ver el registro de productos desechados y sus motivos.
**Disparador:** El usuario consulta `GET /api/desperdicios/` con token válido.

### Precondiciones

1. El usuario tiene un token válido.
2. Existen desperdicios registrados (opcional; si no, devuelve `[]`).

### Flujo principal (éxito)

1. El usuario llama a `GET /api/desperdicios/` con `Authorization: Token <token>`.
2. `DesperdicioViewSet` valida la autenticación.
3. El backend arma el queryset con `select_related('id_producto')`.
4. El serializer devuelve cada desperdicio con: `id_desperdicio`, `id_producto`, `fecha`, `cantidad`, `motivo` y `costo_perdido`.
5. El usuario recibe la lista JSON.
6. El caso de uso termina con éxito.

**Postcondiciones (éxito):** el usuario tiene el registro de desperdicios con sus motivos.

### Flujos alternativos

**FE-1 — Sin desperdicios**
- 4a. El backend devuelve `[]`.

**FE-2 — Motivo o costo nulos**
- 4a. `motivo` y/o `costo_perdido` pueden venir nulos si no se cargaron.

---

## UC-02 — Consultar desperdicios sin token (rechazo)

**Actor principal:** Usuario no autenticado.
**Actor secundario:** API Django/DRF.
**Objetivo:** Impedir la consulta sin autenticación.
**Disparador:** El usuario llama a `GET /api/desperdicios/` sin token.

### Precondiciones

1. No hay token válido en la petición.

### Flujo principal (éxito)

1. El usuario llama a la API sin token.
2. DRF rechaza con **HTTP 401** (`IsAuthenticated` por defecto).
3. No se entregan datos de desperdicios.
4. El caso de uso termina: acceso denegado.

**Postcondiciones (éxito):** no hay fuga de datos; el cliente debe autenticarse.

---

Volver a [`funcionalidades.md`](../specs/funcionalidades.md).