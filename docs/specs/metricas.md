# Métricas por producto

Funcionalidad que **calcula por cada producto su rendimiento, ingresos, costos y ganancia en función de ventas y desperdicios** en **¿Cuándo Vence?**. Es la decimoctava funcionalidad listada en [`funcionalidades.md`](./funcionalidades.md).

> Casos de uso: [`docs/requerimientos/metricasCDS.md`](../requerimientos/metricasCDS.md)

---

## Qué hace

- Expone el endpoint `GET /api/metricas/` que agrega, por producto, las ventas y desperdicios para calcular indicadores.
- Por cada producto devuelve: `cantidad` (elaborada), `vendido`, `desperdiciado`, `rendimiento`, `ingresos`, `costo_total`, `costo_desperdicio` y `ganancia`.
- Requiere autenticación por token (`IsAuthenticated`).
- **Nota:** en la versión actual no existe una pantalla frontend dedicada; el cálculo se consume vía la API.

## Experiencia de usuario

1. Un cliente autenticado consulta `GET /api/metricas/` con `Authorization: Token <token>`.
2. Recibe una fila por producto con sus indicadores de rendimiento y ganancia.
3. Los indicadores se derivan de `Venta` (ingresos) y `Desperdicio` (costo) agregados por producto.

## Cómo lo hace (implementación)

### Backend (Django + DRF)

| Parte | Archivo | Rol |
|---|---|---|
| Endpoint | `src/backend/Inventory/api.py` | `metricas` (líneas 43-88): `@api_view(['GET'])`, `IsAuthenticated` |
| Agregación de ventas | `api.py` | `Venta.objects.values('id_producto_id').annotate(unidades=Sum('cantidad'), ingresos=Sum(cantidad*precio_unitario))` |
| Agregación de desperdicios | `api.py` | `Desperdicio.objects.values('id_producto_id').annotate(unidades=Sum('cantidad'), costo=Sum(cantidad*costo_unitario))` |
| Cálculos | `api.py` | rendimiento = vendido/cantidad; costo_total = costo_unitario*cantidad; ganancia = ingresos − costo_total − costo_desperdicio |
| Rutas | `src/backend/controlStock/urls.py` | `path('api/metricas/', metricas)` |

### Fórmulas

- **Rendimiento** = `vendido / cantidad` (o `None` si cantidad es 0/null).
- **Costo total** = `costo_unitario * cantidad`.
- **Ganancia** = `ingresos − costo_total − costo_desperdicio`.
- **Ingresos** = suma de `cantidad * precio_unitario` de las ventas.
- **Costo desperdicio** = suma de `cantidad * costo_unitario` de los desperdicios.

### Flujo paso a paso

1. El cliente llama a `GET /api/metricas/` con token.
2. El endpoint agrega ventas y desperdicios por `id_producto` (dos diccionarios).
3. Itera sobre `Producto.objects.select_related('id_tipo_producto')` y arma una fila por producto.
4. Devuelve el array JSON con los indicadores redondeados.

### Payload de ejemplo (por ítem)

```
{
  "id_producto": 3,
  "nombre": "Crema pastelera",
  "cantidad": 12.0,
  "vendido": 8.0,
  "desperdiciado": 2.0,
  "rendimiento": 0.6667,
  "ingresos": 14400.0,
  "costo_total": 1800.0,
  "costo_desperdicio": 300.0,
  "ganancia": 12300.0
}
```

---

## Validaciones y casos límite

| Situación | Comportamiento |
|---|---|
| Sin token | HTTP 401 |
| Producto sin ventas ni desperdicios | vendido/desperdiciado = 0; ganancia = −costo_total |
| Producto sin cantidad | rendimiento = `None` |
| Sin productos | `[]` |
| Sin ventas ni desperdicios en general | filas con 0s y ganancia negativa (solo costo) |

---

## Limitaciones conocidas

- No hay pantalla frontend para estas métricas (solo endpoint).
- No hay paginación ni filtros por fecha/rango.
- El rendimiento puede superar 1 si se vendió más de lo elaborado (datos inconsistentes) o ser negativo.
- `costo_desperdicio` usa el `costo_unitario` actual del producto (no el histórico).

---

Volver a [`funcionalidades.md`](./funcionalidades.md).