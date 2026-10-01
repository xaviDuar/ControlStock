# Selección de condición — Casos de uso

Requerimientos de la funcionalidad **Selección de condición** de **¿Cuándo Vence?**, expresados como casos de uso en formato UML detallado.

> Volver a [`funcionalidades.md`](../specs/funcionalidades.md) · Especificación técnica: [`specs/seleccioncondicion.md`](../specs/seleccioncondicion.md)

---

## Tabla de casos de uso

| ID | Caso de uso | Actor principal | Disparador | Resultado |
|----|-------------|-----------------|------------|-----------|
| UC-01 | Elegir condición por método | Usuario autenticado | Cambia la condición en el `<select>` de un método | La condición queda seleccionada y se usa al agregar al carrito |
| UC-02 | Ver producto sin condiciones | Usuario autenticado | Abre la tarjeta de un producto sin condiciones | Ve "Sin condiciones de vencimiento" |

---

## UC-01 — Elegir condición por método

**Actor principal:** Usuario autenticado.
**Actor secundario:** Sistema (SPA React).
**Objetivo:** Seleccionar la condición de vencimiento aplicable para cada método de conservación de un producto.
**Disparador:** El usuario cambia el valor del selector de condiciones de un método.

### Precondiciones

1. El usuario está en `/rotulos` con sesión.
2. El método del producto tiene al menos una condición (`condiciones` no vacías).
3. Los datos ya cargaron.

### Flujo principal (éxito)

1. El sistema carga los tipos con sus condiciones y preselecciona la primera condición de cada método (valor por defecto del `<select>`).
2. El usuario despliega el selector de un método (ej. Congelado) y elige otra condición (ej. `3 MESES (bolsa abierta)` en vez de `6 MESES (bolsa cerrada)`).
3. El sistema actualiza `selected[id_tipo_producto][metodo]` con la nueva `id_condicion`.
4. Si hay fecha de elaboración cargada, se recalcula y muestra el preview `→ vence {fecha}` con la nueva condición.
5. El caso de uso termina con éxito.

**Postcondiciones (éxito):** la condición elegida queda guardada y se aplicará al agregar el ítem al carrito.

### Flujos alternativos

**FE-1 — Sin fecha de elaboración** *(en el paso 4)*
- 4a. No hay preview (no se calcula vencimiento sin fecha), pero la selección igual queda guardada.

**FE-2 — Condición especial**
- 2a. Si la condición elegida es `Fin del día` (FIN_DEL_DIA), el preview muestra la misma fecha; si es `Fec. de proveedor` (PROVEEDOR), no hay preview calculable.

---

## UC-02 — Ver producto sin condiciones

**Actor principal:** Usuario autenticado.
**Actor secundario:** Sistema (SPA React).
**Objetivo:** Informar cuando un producto no tiene condiciones de vencimiento cargadas.
**Disparador:** El usuario ve en la grilla un producto cuyo `condiciones` está vacío.

### Precondiciones

1. El producto no tiene ninguna `CondicionVencimiento` asociada.

### Flujo principal (éxito)

1. El sistema detecta que todos los métodos del producto están sin condiciones (`hayCondiciones = false`).
2. La tarjeta del producto muestra el texto *"Sin condiciones de vencimiento"*.
3. No se muestran selectores ni el botón **+ Agregar** resulta útil (no hay condiciones para el rótulo).
4. El caso de uso termina con éxito: el usuario comprende que no puede preparar rótulos para ese producto.

**Postcondiciones (éxito):** el usuario ve el aviso; no se permite seleccionar condiciones inexistentes.

### Flujos alternativos

**FE-1 — Producto con algunas condiciones**
- 1a. Solo los métodos con condiciones muestran selector; los que no tienen, se omiten (sin romper la tarjeta).

---

Volver a [`funcionalidades.md`](../specs/funcionalidades.md).