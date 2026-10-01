# Consulta de ventas

Funcionalidad que **permite ver el registro de ventas realizadas** en **¿Cuándo Vence?**. Es la decimoquinta funcionalidad listada en [`funcionalidades.md`](./funcionalidades.md).

> Casos de uso: [`docs/requerimientos/consultaventasCDS.md`](../requerimientos/consultaventasCDS.md)

---

## Qué hace

- Expone la **consulta del registro de ventas** a través de la API `GET /api/ventas/`.
- Cada venta incluye: `id_venta`, el producto vendido (`id_producto`), la `fecha`, la `cantidad` y el `precio_unitario`.
- Requiere autenticación por token (`IsAuthenticated`).
- **Nota:** en la versión actual no existe una pantalla frontend dedicada; la consulta se realiza vía la API (o el panel de admin de Django).

## Experiencia de usuario

1. Un cliente autenticado consulta `GET /api/ventas/` con `Authorization: Token <token>`.
2. Recibe la lista de ventas registradas.
3. El registro de nuevas ventas se realiza desde el panel admin (ver **Gestión de datos (admin)**).

## Cómo lo hace (implementación)

### Backend (Django + DRF)

| Parte | Archivo | Rol |
|---|---|---|
| Viewset | `src/backend/Inventory/api.py` | `VentaViewSet` (ReadOnly): `select_related('id_producto')`, `IsAuthenticated` |
| Serializer | `src/backend/Inventory/serializers.py` | `VentaSerializer`: campos `__all__` (id_venta, id_producto, fecha, cantidad, precio_unitario) |
| Modelo | `src/backend/Inventory/models.py` | `Venta`: `id_producto` (FK), `fecha`, `cantidad`, `precio_unitario` |
| Rutas | `src/backend/controlStock/urls.py` | router registra `ventas` → `/api/ventas/` |

### Payload de ejemplo (por ítem)

```
{
  "id_venta": 12,
  "id_producto": 5,
  "fecha": "2026-09-15",
  "cantidad": 3.0,
  "precio_unitario": "1800.00"
}
```

### Flujo paso a paso

1. El cliente llama a `GET /api/ventas/` (con token).
2. `VentaViewSet` valida la autenticación y arma el queryset con `select_related('id_producto')`.
3. El serializer devuelve la lista JSON de ventas.
4. El consumidor recibe el registro de ventas.

---

## Validaciones y casos límite

| Situación | Comportamiento |
|---|---|
| Sin token | HTTP 401 |
| Registro vacío | Lista `[]` |
| Muchas ventas | Lista completa (sin paginación) |

---

## Limitaciones conocidas

- No hay pantalla frontend para esta consulta (solo API + admin).
- No hay paginación ni filtros de búsqueda en el viewset (a diferencia de productos/tipos).
- Endpoint de solo lectura (la gestión es por admin).

---

Volver a [`funcionalidades.md`](./funcionalidades.md).