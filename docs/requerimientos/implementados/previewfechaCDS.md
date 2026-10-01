# Fecha de elaboración con preview — Casos de uso

Requerimientos de la funcionalidad **Fecha de elaboración con preview** de **¿Cuándo Vence?**, expresados como casos de uso en formato UML detallado.

> Volver a [`funcionalidades.md`](../specs/funcionalidades.md) · Especificación técnica: [`specs/previewfecha.md`](../specs/previewfecha.md)

---

## Tabla de casos de uso

| ID | Caso de uso | Actor principal | Disparador | Resultado |
|----|-------------|-----------------|------------|-----------|
| UC-01 | Cargar fecha y ver el preview | Usuario autenticado | Carga una fecha de elaboración | Ve al instante la fecha de vencimiento calculada |
| UC-02 | Cargar un producto sin fecha | Usuario autenticado | Deja el campo de fecha vacío | No hay preview; el agregado pide la fecha |
| UC-03 | Ver preview con condición especial | Usuario autenticado | Carga fecha con condición FIN_DEL_DIA o PROVEEDOR | Preview "mismo día" o sin preview |

---

## UC-01 — Cargar fecha y ver el preview

**Actor principal:** Usuario autenticado.
**Actor secundario:** Sistema (SPA React).
**Objetivo:** Visualizar al instante la fecha de vencimiento resultante de la fecha de elaboración y la condición elegida.
**Disparador:** El usuario elige una fecha en el campo de fecha de elaboración de una tarjeta de producto.

### Precondiciones

1. El usuario está en `/rotulos` con sesión.
2. El método del producto tiene una condición seleccionada.
3. La condición permite calcular vencimiento (no es PROVEEDOR).

### Flujo principal (éxito)

1. El usuario carga la fecha de elaboración en el `<input type="date">`.
2. El sistema guarda la fecha en `dates[id_tipo_producto]`.
3. Para cada método con condición, `calcularVencimiento(fecha, c)` calcula la fecha de vencimiento.
4. El sistema muestra junto al selector `→ vence {fecha}` en formato es-AR (p. ej. `04/10/2026`).
5. Si el usuario cambia la fecha o la condición, el preview se recalcula al instante.
6. El caso de uso termina con éxito.

**Postcondiciones (éxito):** el usuario conoce la fecha de vencimiento antes de agregar el rótulo.

### Flujos alternativos

**FE-1 — Cambio de condición** *(en el paso 5)*
- 5a. Al cambiar la condición, el preview se actualiza con el nuevo cálculo.

---

## UC-02 — Cargar un producto sin fecha

**Actor principal:** Usuario autenticado.
**Actor secundario:** Sistema (SPA React).
**Objetivo:** Manejar la ausencia de fecha de elaboración.
**Disparador:** El usuario deja el campo de fecha vacío.

### Precondiciones

1. `dates[id]` está vacío.

### Flujo principal (éxito)

1. El campo de fecha está vacío.
2. No se muestra ningún preview (`{fecha && c && vence}` es falso).
3. Si el usuario pulsa **+ Agregar**, se muestra el alert *"Por favor seleccioná una fecha de elaboración."* y no se agrega nada.
4. El caso de uso termina: el sistema exige la fecha.

**Postcondiciones (éxito):** no hay ítems agregados sin fecha; el usuario debe cargarla.

---

## UC-03 — Ver preview con condición especial

**Actor principal:** Usuario autenticado.
**Actor secundario:** Sistema (SPA React).
**Objetivo:** Mostrar el comportamiento del preview con condiciones especiales.
**Disparador:** El usuario carga fecha con una condición FIN_DEL_DIA o PROVEEDOR seleccionada.

### Flujo principal

**Sub-flujo A — FIN_DEL_DIA (Fin del día)**
1. El usuario carga la fecha.
2. `calcularVencimiento` devuelve la misma fecha (`base`).
3. El preview muestra `→ vence {misma fecha}`.

**Sub-flujo B — PROVEEDOR (Fec. de proveedor)**
1. El usuario carga la fecha.
2. `calcularVencimiento` devuelve `null`.
3. No se muestra preview (la fecha depende del proveedor, no se calcula).

**Postcondiciones:**
- FIN_DEL_DIA: preview visible con la misma fecha.
- PROVEEDOR: sin preview.

---

Volver a [`funcionalidades.md`](../specs/funcionalidades.md).