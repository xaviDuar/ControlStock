# Generador de rótulos — Casos de uso

Requerimientos de la funcionalidad **Generador de rótulos** de **¿Cuándo Vence?**, expresados como casos de uso en formato UML detallado.

> Volver a [`funcionalidades.md`](../specs/funcionalidades.md) · Especificación técnica: [`specs/generadorrotulos.md`](../specs/generadorrotulos.md)

---

## Tabla de casos de uso

| ID | Caso de uso | Actor principal | Disparador | Resultado |
|----|-------------|-----------------|------------|-----------|
| UC-01 | Seleccionar producto y condición | Usuario autenticado | Elige una condición de conservación | La condición queda aplicada (con preview de vencimiento si hay fecha) |
| UC-02 | Agregar producto al carrito | Usuario autenticado | Pulsa **+ Agregar** con fecha y sin duplicado | El ítem aparece en la Lista para rótulos |
| UC-03 | Agregar sin fecha de elaboración | Usuario autenticado | Pulsa **+ Agregar** sin fecha | Se muestra alert pidiendo la fecha; nada se agrega |
| UC-04 | Agregar producto duplicado | Usuario autenticado | Pulsa **+ Agregar** con un par producto+fecha ya existente | Se muestra alert de duplicado; nada se agrega |

---

## UC-01 — Seleccionar producto y condición

**Actor principal:** Usuario autenticado.
**Actor secundario:** Sistema (SPA React).
**Objetivo:** Elegir, para cada método de conservación del producto, la condición de vencimiento aplicable.
**Disparador:** El usuario cambia el `<select>` de una condición en la tarjeta del producto.

### Precondiciones

1. El usuario está en `/rotulos` con sesión.
2. El producto tiene al menos una condición en el método mostrado.
3. Los datos cargaron (las condiciones ya vienen en `fetchTipos()`).

### Flujo principal (éxito)

1. El usuario abre la tarjeta del producto y ve los métodos con condiciones (Refrigerado, Congelado, Bodega, Toppinera).
2. Cambia la condición en el `<select>` de un método.
3. El sistema actualiza `selected` con la nueva `id_condicion`.
4. Si hay fecha de elaboración cargada, se muestra el preview `→ vence {fecha}` calculado con esa condición.
5. El caso de uso termina con éxito: la condición elegida queda guardada en el estado.

**Postcondiciones (éxito):** la condición seleccionada se usará al agregar el producto al carrito.

### Flujos alternativos

**FE-1 — Producto sin condiciones** *(en el paso 1)*
- 1a. La tarjeta muestra "Sin condiciones de vencimiento"; no hay selectores ni se puede agregar nada útil.

**FE-2 — Sin fecha cargada** *(en el paso 4)*
- 2a. No se muestra preview; la condición igual queda guardada.

**FE-3 — Condición especial** *(en el paso 4)*
- 3a. Si la condición es PROVEEDOR, el preview es nulo (no se puede calcular); si es FIN_DEL_DIA, el preview es la misma fecha.

---

## UC-02 — Agregar producto al carrito

**Actor principal:** Usuario autenticado.
**Actor secundario:** Sistema (SPA React).
**Objetivo:** Acumular un producto en la **Lista para rótulos** con su fecha y condiciones.
**Disparador:** El usuario pulsa **+ Agregar** en una tarjeta de producto con fecha cargada y sin duplicado.

### Precondiciones

1. Existe una fecha de elaboración cargada para el producto.
2. No existe ya en el carrito un ítem con el mismo `producto + fecha`.

### Flujo principal (éxito)

1. El usuario pulsa **+ Agregar**.
2. `addToCart` lee la fecha; está presente.
3. Arma la clave `{nombre}__{fecha}`; no está en `cartItems`.
4. Agrega el ítem `{nombre, fecha, condiciones}` al carrito.
5. Limpia la fecha del producto (el campo `date` queda vacío).
6. La **Lista para rótulos** muestra el ítem con el nombre, la fecha de elaboración y sus condiciones.
7. El contador se actualiza ("N producto(s) seleccionado(s)").
8. El caso de uso termina con éxito.

**Postcondiciones (éxito):** el ítem está en el carrito listo para la generación de rótulos.

### Flujos alternativos

**FE-1 — Quitar el ítem** *(después del paso 6)*
- 6a. El usuario pulsa la **X** del ítem → `removeFromCart` lo elimina del carrito.

---

## UC-03 — Agregar sin fecha de elaboración

**Actor principal:** Usuario autenticado.
**Actor secundario:** Sistema (SPA React).
**Objetivo:** Evitar agregar productos sin fecha de elaboración.
**Disparador:** El usuario pulsa **+ Agregar** con el campo de fecha vacío.

### Precondiciones

1. `dates[id]` está vacío para el producto.

### Flujo principal (éxito)

1. El usuario pulsa **+ Agregar**.
2. `addToCart` no encuentra fecha.
3. El sistema muestra el alert: *"Por favor seleccioná una fecha de elaboración."*
4. Nada se agrega al carrito.
5. El caso de uso termina: se informó el requisito.

**Postcondiciones (éxito):** el carrito no se modifica; el usuario debe cargar la fecha.

---

## UC-04 — Agregar producto duplicado

**Actor principal:** Usuario autenticado.
**Actor secundario:** Sistema (SPA React).
**Objetivo:** Evitar duplicados de un mismo producto con la misma fecha en el carrito.
**Disparador:** El usuario pulsa **+ Agregar** para un par `producto + fecha` ya presente.

### Precondiciones

1. Ya existe `cartItems["{nombre}__{fecha}"]`.

### Flujo principal (éxito)

1. El usuario pulsa **+ Agregar** con la misma fecha de un producto ya agregado.
2. `addToCart` detecta la clave existente.
3. El sistema muestra el alert: *"Este producto con esa fecha ya está en la lista."*
4. Nada se agrega.
5. El caso de uso termina: se evitó el duplicado.

**Postcondiciones (éxito):** el carrito conserva un único ítem por `producto + fecha`.

### Flujos alternativos

**FE-1 — Agregar el mismo producto con otra fecha**
- 1a. Como la clave incluye la fecha, el mismo producto con otra fecha **sí** se agrega (son ítems distintos).

---

Volver a [`funcionalidades.md`](../specs/funcionalidades.md).