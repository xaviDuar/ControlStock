# Cálculo automático del vencimiento — Casos de uso

Requerimientos de la funcionalidad **Cálculo automático del vencimiento** de **¿Cuándo Vence?**, expresados como casos de uso en formato UML detallado.

> Volver a [`funcionalidades.md`](../specs/funcionalidades.md) · Especificación técnica: [`specs/calculovencimiento.md`](../specs/calculovencimiento.md)

---

## Tabla de casos de uso

| ID | Caso de uso | Actor principal | Disparador | Resultado |
|----|-------------|-----------------|------------|-----------|
| UC-01 | Calcular vencimiento por duración | Usuario / Sistema | Existe condición con duración (HS/DIAS/MESES/ANIOS) y fecha | Se obtiene la fecha de vencimiento calculada |
| UC-02 | Calcular vencimiento con condición especial | Usuario / Sistema | Existe condición FIN_DEL_DIA o PROVEEDOR | Fin del día → misma fecha; Proveedor → sin cálculo |
| UC-03 | Guardar producto con cálculo automático | Usuario admin | Guarda un `Producto` con condición y fecha | `fecha_vencimiento` se rellena automáticamente |

---

## UC-01 — Calcular vencimiento por duración

**Actor principal:** Sistema (regla de negocio); usuario final indirecto.
**Actor secundario:** Backend (`calcular_fecha_vencimiento`) / Frontend (`calcularVencimiento`).
**Objetivo:** Calcular la fecha de vencimiento sumando la duración de la condición a la fecha de elaboración.
**Disparador:** Se pide el vencimiento con una condición que tiene `duracion_valor` y `duracion_unidad` en HS, DIAS, MESES o ANIOS.

### Precondiciones

1. La condición tiene `duracion_valor` y `duracion_unidad` válidos (no nulos).
2. Existe una `fecha_elaboracion`.

### Flujo principal (éxito)

1. El sistema recibe `fecha_elaboracion` y la `condicion`.
2. Lee `duracion_unidad`:
   - `HS` → suma `valor` horas.
   - `DIAS` → suma `valor` días.
   - `MESES` → suma `valor` meses (con ajuste de fin de mes en `_sumar_meses`).
   - `ANIOS` → suma `valor * 12` meses.
3. Devuelve la `fecha_vencimiento` calculada.
4. El caso de uso termina con éxito.

**Postcondiciones (éxito):** se obtiene una fecha de vencimiento precisa.

### Flujos alternativos

**FE-1 — Duración nula o inválida**
- 1a. Si `duracion_valor` o `duracion_unidad` son nulos → devuelve `None` (sin cálculo).

---

## UC-02 — Calcular vencimiento con condición especial

**Actor principal:** Sistema.
**Actor secundario:** Backend / Frontend.
**Objetivo:** Aplicar las condiciones especiales FIN_DEL_DIA y PROVEEDOR.
**Disparador:** La condición tiene `especial` distinto de null.

### Flujo principal

**Sub-flujo A — FIN_DEL_DIA**
1. El sistema detecta `especial == 'FIN_DEL_DIA'`.
2. Devuelve la misma `fecha_elaboracion` como vencimiento.
3. Fin: vence el mismo día de elaboración.

**Sub-flujo B — PROVEEDOR**
1. El sistema detecta `especial == 'PROVEEDOR'`.
2. Devuelve `None`: el vencimiento no se calcula, lo define el proveedor.
3. Fin: sin fecha de vencimiento automática.

**Postcondiciones:**
- FIN_DEL_DIA → fecha = elaboración.
- PROVEEDOR → sin vencimiento calculado.

---

## UC-03 — Guardar producto con cálculo automático

**Actor principal:** Usuario con acceso al admin (gestión de datos).
**Actor secundario:** Backend (`Producto.save`).
**Objetivo:** Que al guardar un producto con condición y fecha de elaboración, el sistema rellene automáticamente la fecha de vencimiento.
**Disparador:** Se crea o edita un `Producto` (con `id_condicion` y `fecha_elaboracion`) y se guarda.

### Precondiciones

1. El `Producto` tiene `id_condicion` seteado.
2. El `Producto` tiene `fecha_elaboracion`.

### Flujo principal (éxito)

1. El usuario guarda el `Producto`.
2. `Producto.save()` obtiene la `CondicionVencimiento` por `pk`.
3. Llama a `calcular_fecha_vencimiento(fecha_elaboracion, condicion)`.
4. Asigna el resultado a `self.fecha_vencimiento`.
5. Ejecuta `super().save()`: persiste el producto con su vencimiento.
6. El caso de uso termina con éxito.

**Postcondiciones (éxito):** `fecha_vencimiento` queda persistida en la base de datos.

### Flujos alternativos

**FE-1 — Producto sin condición o sin fecha**
- 1a. No se recalcula `fecha_vencimiento` (se guarda el valor que tenga, posiblemente nulo).

**FE-2 — Condición PROVEEDOR**
- 2a. `calcular_fecha_vencimiento` devuelve `None`; `fecha_vencimiento` queda vacía (el proveedor la completará).

---

Volver a [`funcionalidades.md`](../specs/funcionalidades.md).