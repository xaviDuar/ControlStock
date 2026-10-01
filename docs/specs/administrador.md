# Gestión de datos (admin)

Funcionalidad que **permite crear, editar y borrar productos, ventas, desperdicios, tipos y condiciones desde el panel de administración de Django** en **¿Cuándo Vence?**. Es la decimoséptima funcionalidad listada en [`funcionalidades.md`](./funcionalidades.md).

> Casos de uso: [`docs/requerimientos/implementados/administradorCDS.md`](../requerimientos/implementados/administradorCDS.md)

---

## Qué hace

- Expone el panel **Django Admin** (`/admin/`) para la gestión completa de los datos del sistema.
- Permite **crear, editar y borrar** registros de: `TipoProducto`, `CondicionVencimiento`, `Producto`, `Venta` y `Desperdicio`.
- Proporciona listados, búsquedas y filtros por modelo para localizar registros.
- Al guardar un `Producto` con condición y fecha de elaboración, aplica el **cálculo automático del vencimiento** (ver funcionalidad homónima).
- Al editar un `TipoProducto`, permite gestionar sus condiciones de vencimiento en línea (inline).

## Experiencia de usuario

1. El usuario (staff/superuser) entra a `/admin/` y se autentica con usuario y contraseña del admin de Django.
2. Ve la lista de modelos registrados: Tipos de producto, Condiciones, Productos, Ventas y Desperdicios.
3. Desde cada modelo puede listar, buscar, filtrar, crear, editar y borrar registros.
4. En un `TipoProducto`, puede agregar/editar sus `CondicionVencimiento` desde el inline.
5. Al guardar un `Producto`, el sistema calcula y guarda `fecha_vencimiento` automáticamente.

## Cómo lo hace (implementación)

### Backend (Django)

| Parte | Archivo | Rol |
|---|---|---|
| Registros | `src/backend/Inventory/admin.py` | `@admin.register(...)` para los 5 modelos con `list_display`, `search_fields`, `list_filter` e inlines |
| Inline | `src/backend/Inventory/admin.py` | `CondicionInline(admin.TabularInline)` sobre `CondicionVencimiento` dentro de `TipoProductoAdmin` |
| Modelos | `src/backend/Inventory/models.py` | `TipoProducto`, `CondicionVencimiento`, `Producto`, `Venta`, `Desperdicio` |
| Cálculo al guardar | `src/backend/Inventory/models.py` | `Producto.save()` recalcula `fecha_vencimiento` |
| URL | `src/backend/controlStock/urls.py` | `path('admin/', admin.site.urls)` |

### Modelos y su configuración admin

| Modelo | list_display | Búsqueda | Filtros | Inline |
|---|---|---|---|---|
| TipoProducto | nombre | nombre | — | Condiciones |
| CondicionVencimiento | tipo, método, anotación, duración, especial | nombre del tipo | método, especial | — |
| Producto | tipo, elaboración, vencimiento, condición, cantidad, costo, proveedor | proveedor, nombre del tipo | método de condición, elaboración | — |
| Venta | producto, fecha, cantidad, precio | — | fecha | — |
| Desperdicio | producto, fecha, cantidad, motivo, costo | — | fecha, motivo | — |

### Flujo de guardado de un Producto

1. El usuario crea/edita un `Producto` con `fecha_elaboracion` e `id_condicion`.
2. `Producto.save()` obtiene la condición y llama a `calcular_fecha_vencimiento`.
3. Asigna el resultado a `fecha_vencimiento` y persiste.

---

## Validaciones y casos límite

| Situación | Comportamiento |
|---|---|
| Usuario sin permisos | Django Admin exige usuario con permisos staff/superuser |
| Borrar un TipoProducto | En cascada borra sus condiciones y productos asociados (FK `CASCADE`) |
| Borrar un Producto con ventas/desperdicios | En cascada borra ventas y desperdicios (FK `CASCADE`) |
| Condición usada por productos | `Producto.id_condicion` es `PROTECT`: no se puede borrar una condición en uso |
| Guardar Producto con condición PROVEEDOR | `fecha_vencimiento` queda vacía (no calculable) |
| Validación de forms | Django Admin valida tipos de campo, requeridos, etc. |

---

## Limitaciones conocidas

- El acceso está restringido a usuarios con permisos (staff/superuser); un usuario común de la SPA no entra.
- No hay customización visual del admin (usa el skin por defecto de Django).
- `condiciones` inline: borrar un tipo borra en cascada sus condiciones (no hay `PROTECT` en esa relación).

---

Volver a [`funcionalidades.md`](./funcionalidades.md).