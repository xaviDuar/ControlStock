# Gestión de datos (admin) — Casos de uso

Requerimientos de la funcionalidad **Gestión de datos (admin)** de **¿Cuándo Vence?**, expresados como casos de uso en formato UML detallado.

> Volver a [`funcionalidades.md`](../specs/funcionalidades.md) · Especificación técnica: [`specs/administrador.md`](../specs/administrador.md)

---

## Tabla de casos de uso

| ID | Caso de uso | Actor principal | Disparador | Resultado |
|----|-------------|-----------------|------------|-----------|
| UC-01 | Gestionar tipos de producto y condiciones | Usuario admin | Entra a /admin y edita un TipoProducto | Crea/edita el tipo y sus condiciones inline |
| UC-02 | Gestionar productos | Usuario admin | Crea/edita un Producto | Guarda el lote con vencimiento calculado automáticamente |
| UC-03 | Gestionar ventas y desperdicios | Usuario admin | Crea/edita ventas o desperdicios | Registra ventas y productos desechados |
| UC-04 | Borrar registros | Usuario admin | Borra un registro de cualquier modelo | El registro se elimina (con efectos en cascada según la FK) |

---

## UC-01 — Gestionar tipos de producto y condiciones

**Actor principal:** Usuario admin (staff/superuser).
**Actor secundario:** Django Admin.
**Objetivo:** Crear, editar y configurar tipos de producto con sus condiciones de vencimiento.
**Disparador:** El usuario accede a `/admin` → Tipos de producto → nuevo/edición.

### Precondiciones

1. El usuario tiene permisos de staff/superuser.
2. Accede al panel `/admin/`.

### Flujo principal (éxito)

1. El usuario entra a `/admin/` y se autentica.
2. Abre el listado de Tipos de producto (busca por nombre si hace falta).
3. Crea un nuevo tipo (o abre uno existente).
4. Completa `nombre` y, en el inline `CondicionVencimiento`, agrega las condiciones por método (refrigerado, congelado, bodega, toppinera) con `anotacion`, `duracion_valor`, `duracion_unidad` o `especial`.
5. Guarda el formulario.
6. El caso de uso termina con éxito: el tipo y sus condiciones quedan persistidos.

**Postcondiciones (éxito):** el tipo aparece en la SPA (inventario/rótulos) con sus condiciones.

### Flujos alternativos

**FE-1 — Validación fallida**
- 4a. Si faltan campos obligatorios o hay datos inválidos, el admin muestra errores y no guarda.

---

## UC-02 — Gestionar productos

**Actor principal:** Usuario admin.
**Actor secundario:** Django Admin + `Producto.save()`.
**Objetivo:** Crear/editar lotes de producto, dejando que el sistema calcule el vencimiento.
**Disparador:** El usuario abre Productos → nuevo/edición.

### Precondiciones

1. Usuario con permisos.
2. Existe el tipo de producto y la condición correspondiente.

### Flujo principal (éxito)

1. El usuario crea un `Producto`: elige tipo, condición, fecha de elaboración, cantidad, costo y proveedor.
2. Guarda el formulario.
3. `Producto.save()` calcula `fecha_vencimiento` con `calcular_fecha_vencimiento` (si hay condición y fecha).
4. El registro queda persistido con el vencimiento calculado.
5. El caso de uso termina con éxito.

**Postcondiciones (éxito):** el producto figura en `GET /api/productos/` con su vencimiento.

### Flujos alternativos

**FE-1 — Condición PROVEEDOR o sin condición**
- 3a. `fecha_vencimiento` queda vacía.

**FE-2 — Edición**
- 1a. Al editar, si cambia la fecha o la condición, el vencimiento se recalcula al guardar.

---

## UC-03 — Gestionar ventas y desperdicios

**Actor principal:** Usuario admin.
**Actor secundario:** Django Admin.
**Objetivo:** Registrar ventas y productos desechados.
**Disparador:** El usuario abre Ventas o Desperdicios → nuevo/edición.

### Flujo principal (éxito)

1. El usuario crea una **Venta**: elige producto, fecha, cantidad y precio unitario; guarda.
2. El usuario crea un **Desperdicio**: elige producto, fecha, cantidad, motivo y costo perdido; guarda.
3. Los registros quedan persistidos.
4. El caso de uso termina con éxito.

**Postcondiciones (éxito):** los datos quedan disponibles vía `/api/ventas/` y `/api/desperdicios/`, y alimentan las métricas.

---

## UC-04 — Borrar registros

**Actor principal:** Usuario admin.
**Actor secundario:** Django Admin + reglas de FK.
**Objetivo:** Eliminar registros del sistema.
**Disparador:** El usuario borra un registro desde el admin.

### Precondiciones

1. El registro existe.

### Flujo principal (éxito)

1. El usuario selecciona borrar un registro (con confirmación del admin).
2. Django elimina el registro respetando las FK:
   - TipoProducto → borra en cascada sus condiciones y productos (CASCADE).
   - Producto → borra en cascada sus ventas y desperdicios (CASCADE).
   - CondicionVencimiento → si está en uso por un Producto, `PROTECT` bloquea el borrado.
3. El caso de uso termina con éxito.

**Postcondiciones (éxito):** el registro y sus dependencias en cascada desaparecen (o el borrado se bloquea si hay PROTECT).

### Flujos de excepción

**EX-1 — Borrar condición en uso**
- 1a. Si la condición tiene productos asociados, Django muestra un error (`ProtectedError`) y no permite borrarla hasta liberar los productos.

---

Volver a [`funcionalidades.md`](../specs/funcionalidades.md).