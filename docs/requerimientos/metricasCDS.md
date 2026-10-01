# Métricas por producto — Casos de uso

Requerimientos de la funcionalidad **Métricas por producto** de **¿Cuándo Vence?**, expresados como casos de uso en formato UML detallado.

> Volver a [`funcionalidades.md`](../specs/funcionalidades.md) · Especificación técnica: [`specs/metricas.md`](../specs/metricas.md)

---

## Tabla de casos de uso

| ID | Caso de uso | Actor principal | Disparador | Resultado |
|----|-------------|-----------------|------------|-----------|
| UC-01 | Calcular métricas por producto | Usuario autenticado (API) | Llama a `GET /api/metricas/` | Obtiene rendimiento, ingresos, costos y ganancia por producto |
| UC-02 | Consultar métricas sin token (rechazo) | Usuario no autenticado | Llama a la API sin token | Recibe HTTP 401 |

---

## UC-01 — Calcular métricas por producto

**Actor principal:** Usuario autenticado (o herramienta de consumo de la API).
**Actor secundario:** API Django/DRF + modelos `Venta` y `Desperdicio`.
**Objetivo:** Obtener por cada producto su rendimiento, ingresos, costos y ganancia.
**Disparador:** El usuario consulta `GET /api/metricas/` con token válido.

### Precondiciones

1. El usuario tiene un token válido.
2. Existen productos (y opcionalmente ventas/desperdicios).

### Flujo principal (éxito)

1. El usuario llama a `GET /api/metricas/` con `Authorization: Token <token>`.
2. El endpoint agrega ventas por producto (unidades + ingresos) y desperdicios por producto (unidades + costo).
3. Itera los productos y calcula:
   - `rendimiento = vendido / cantidad` (o `None` si `cantidad` es 0).
   - `costo_total = costo_unitario * cantidad`.
   - `ganancia = ingresos − costo_total − costo_desperdicio`.
4. Devuelve una fila JSON por producto.
5. El caso de uso termina con éxito.

**Postcondiciones (éxito):** el usuario tiene los indicadores de rendimiento y ganancia por producto.

### Flujos alternativos

**FE-1 — Producto sin ventas ni desperdicios**
- 3a. `vendido`/`desperdiciado` = 0; `ganancia = −costo_total`.

**FE-2 — Producto sin cantidad**
- 3a. `rendimiento` = `None`.

**FE-3 — Sin productos**
- 4a. La API devuelve `[]`.

---

## UC-02 — Consultar métricas sin token (rechazo)

**Actor principal:** Usuario no autenticado.
**Actor secundario:** API Django/DRF.
**Objetivo:** Impedir el acceso a las métricas sin autenticación.
**Disparador:** El usuario llama a `GET /api/metricas/` sin token.

### Precondiciones

1. No hay token válido en la petición.

### Flujo principal (éxito)

1. El usuario llama a la API sin token.
2. DRF rechaza con **HTTP 401** (`IsAuthenticated`).
3. No se entregan métricas.
4. El caso de uso termina: acceso denegado.

**Postcondiciones (éxito):** no hay fuga de datos financieros; el cliente debe autenticarse.

---

Volver a [`funcionalidades.md`](../specs/funcionalidades.md).