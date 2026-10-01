# Consulta de productos

Funcionalidad que **permite ver los lotes de producto con sus fechas, cantidades, costos y proveedores** en **¿Cuándo Vence?**. Es la decimocuarta funcionalidad listada en [`funcionalidades.md`](./funcionalidades.md).

> Casos de uso: [`docs/requerimientos/consultaproductosCDS.md`](../requerimientos/consultaproductosCDS.md)

---

## Qué hace

- Expone la **consulta de lotes de producto** a través de la API `GET /api/productos/`.
- Cada producto incluye: tipo de producto (`nombre`), condición de vencimiento anidada, `fecha_elaboracion`, `fecha_vencimiento`, `cantidad`, `costo_unitario` y `proveedor`.
- Permite **buscar** por nombre de tipo de producto o por proveedor (parámetro `?search=`, SearchFilter de DRF).
- Requiere autenticación por token (`IsAuthenticated`).
- **Nota:** en la versión actual no existe una pantalla frontend dedicada; la consulta se realiza vía la API (o el panel de admin de Django).

## Experiencia de usuario

1. Un cliente autenticado consulta `GET /api/productos/` con `Authorization: Token <token>`.
2. Recibe la lista de lotes con sus fechas, cantidades, costos y proveedores.
3. Puede filtrar con `?search=<texto>` por nombre de tipo o proveedor.
4. La gestión de los datos (crear/editar/borrar) se hace desde el panel admin (ver **Gestión de datos (admin)**).

## Cómo lo hace (implementación)

### Backend (Django + DRF)

| Parte | Archivo | Rol |
|---|---|---|
| Viewset | `src/backend/Inventory/api.py` | `ProductoViewSet` (ReadOnly): `select_related('id_tipo_producto', 'id_condicion')`, `SearchFilter` sobre `id_tipo_producto__nombre` y `proveedor`, `IsAuthenticated` |
| Serializer | `src/backend/Inventory/serializers.py` | `ProductoSerializer`: campos `__all__` + `nombre` (fuente `id_tipo_producto.nombre`) + `condicion` (CondicionVencimiento anidada) |
| Modelo | `src/backend/Inventory/models.py` | `Producto`: `id_tipo_producto`, `id_condicion`, `fecha_elaboracion`, `fecha_vencimiento`, `cantidad`, `costo_unitario`, `proveedor` |
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
  "costo_unitario": "150.00",
  "proveedor": "Distribuidora X"
}
```

### Flujo paso a paso

1. El cliente llama a `GET /api/productos/?search=<q>` (con token).
2. `ProductoViewSet` aplica el `SearchFilter` si viene `search`.
3. Devuelve la lista serializada (JSON) con las relaciones resueltas (`select_related`).
4. El consumidor de la API recibe los lotes con fechas, cantidades, costos y proveedores.

---

## Validaciones y casos límite

| Situación | Comportamiento |
|---|---|
| Sin token | HTTP 401 |
| Búsqueda por nombre o proveedor | Filtra vía `?search=` |
| Sin `search` | Devuelve todos los productos |
| Producto sin condición | `condicion` nula, `fecha_vencimiento` posiblemente nula |
| Carga masiva | Lista completa (sin paginación) |

---

## Limitaciones conocidas

- No hay pantalla frontend para esta consulta (solo API + admin).
- No hay paginación.
- Endpoint de solo lectura (la gestión es por admin).

---

Volver a [`funcionalidades.md`](./funcionalidades.md).