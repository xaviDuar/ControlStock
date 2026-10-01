# Consulta de desperdicios

Funcionalidad que **permite ver el registro de productos desechados y sus motivos** en **¿Cuándo Vence?**. Es la decimosexta funcionalidad listada en [`funcionalidades.md`](./funcionalidades.md).

> Casos de uso: [`docs/requerimientos/consultadesperdiciosCDS.md`](../requerimientos/consultadesperdiciosCDS.md)

---

## Qué hace

- Expone la **consulta del registro de desperdicios** a través de la API `GET /api/desperdicios/`.
- Cada desperdicio incluye: `id_desperdicio`, el producto (`id_producto`), la `fecha`, la `cantidad`, el `motivo` (vencido, mal estado, error cocina, etc.) y el `costo_perdido`.
- Requiere autenticación por token (`IsAuthenticated`).
- **Nota:** en la versión actual no existe una pantalla frontend dedicada; la consulta se realiza vía la API (o el panel de admin de Django).

## Experiencia de usuario

1. Un cliente autenticado consulta `GET /api/desperdicios/` con `Authorization: Token <token>`.
2. Recibe la lista de productos desechados con sus motivos.
3. El registro de nuevos desperdicios se realiza desde el panel admin (ver **Gestión de datos (admin)**).

## Cómo lo hace (implementación)

### Backend (Django + DRF)

| Parte | Archivo | Rol |
|---|---|---|
| Viewset | `src/backend/Inventory/api.py` | `DesperdicioViewSet` (ReadOnly): `select_related('id_producto')`, `IsAuthenticated` |
| Serializer | `src/backend/Inventory/serializers.py` | `DesperdicioSerializer`: campos `__all__` |
| Modelo | `src/backend/Inventory/models.py` | `Desperdicio`: `id_producto` (FK), `fecha`, `cantidad`, `motivo`, `costo_perdido` |
| Rutas | `src/backend/controlStock/urls.py` | router registra `desperdicios` → `/api/desperdicios/` |

### Payload de ejemplo (por ítem)

```
{
  "id_desperdicio": 4,
  "id_producto": 9,
  "fecha": "2026-09-20",
  "cantidad": 2.0,
  "motivo": "vencido",
  "costo_perdido": "300.00"
}
```

### Flujo paso a paso

1. El cliente llama a `GET /api/desperdicios/` (con token).
2. `DesperdicioViewSet` valida la autenticación y arma el queryset con `select_related('id_producto')`.
3. El serializer devuelve la lista JSON de desperdicios.
4. El consumidor recibe el registro de productos desechados con sus motivos.

---

## Validaciones y casos límite

| Situación | Comportamiento |
|---|---|
| Sin token | HTTP 401 |
| Registro vacío | Lista `[]` |
| Sin motivo | `motivo` nulo en el JSON |
| Sin costo | `costo_perdido` nulo |

---

## Limitaciones conocidas

- No hay pantalla frontend para esta consulta (solo API + admin).
- No hay paginación ni filtros en el viewset.
- Endpoint de solo lectura (la gestión es por admin).

---

Volver a [`funcionalidades.md`](./funcionalidades.md).