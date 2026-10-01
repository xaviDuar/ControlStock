# Carrito de rótulos — Casos de uso

Requerimientos de la funcionalidad **Carrito de rótulos** de **¿Cuándo Vence?**, expresados como casos de uso en formato UML detallado.

> Volver a [`funcionalidades.md`](../specs/funcionalidades.md) · Especificación técnica: [`specs/carritorotulos.md`](../specs/carritorotulos.md)

---

## Tabla de casos de uso

| ID | Caso de uso | Actor principal | Disparador | Resultado |
|----|-------------|-----------------|------------|-----------|
| UC-01 | Revisar el carrito de rótulos | Usuario autenticado | Abre la Lista para rótulos | Ve los productos acumulados con fecha y condiciones |
| UC-02 | Quitar un ítem del carrito | Usuario autenticado | Pulsa la **X** de un ítem | El ítem se elimina y el contador se actualiza |
| UC-03 | Generar los rótulos | Usuario autenticado | Pulsa **Crear Rótulos** | Se muestra aviso de funcionalidad en desarrollo |
| UC-04 | Ver carrito vacío | Usuario autenticado | Entra a `/rotulos` sin agregar nada | Ve el mensaje de carrito vacío |

---

## UC-01 — Revisar el carrito de rótulos

**Actor principal:** Usuario autenticado.
**Actor secundario:** Sistema (SPA React).
**Objetivo:** Revisar los rótulos acumulados antes de generarlos.
**Disparador:** El usuario mira la **Lista para rótulos** en `/rotulos`.

### Precondiciones

1. El usuario está en `/rotulos`.
2. Existe al menos un ítem en `cartItems`.

### Flujo principal (éxito)

1. El usuario abre/ve la sidebar **Lista para rótulos**.
2. Ve cada ítem con: nombre del producto, `Elab: {fecha}` y sus condiciones por método (`Refrigerado: …`, `Congelado: …`, etc.).
3. Ve el contador al pie: "N producto(s) seleccionado(s)".
4. El caso de uso termina con éxito.

**Postcondiciones (éxito):** el usuario puede verificar que los rótulos acumulados son los correctos.

### Flujos alternativos

**FE-1 — Ítem sin condiciones**
- 1a. Si un ítem no tiene condiciones, solo muestra nombre y fecha.

---

## UC-02 — Quitar un ítem del carrito

**Actor principal:** Usuario autenticado.
**Actor secundario:** Sistema (SPA React).
**Objetivo:** Descartar un rótulo que ya no se necesita.
**Disparador:** El usuario pulsa el botón **X** de un ítem del carrito.

### Precondiciones

1. El ítem está presente en `cartItems`.

### Flujo principal (éxito)

1. El usuario pulsa la **X** del ítem.
2. `removeFromCart(key)` elimina el ítem del estado.
3. La lista se re-renderiza sin ese ítem y el contador baja.
4. Si no quedan ítems, aparece el mensaje de carrito vacío.
5. El caso de uso termina con éxito.

**Postcondiciones (éxito):** el ítem ya no está en la lista para rótulos.

### Flujos alternativos

- No aplican; la operación es inmediata y sin confirmación.

---

## UC-03 — Generar los rótulos

**Actor principal:** Usuario autenticado.
**Actor secundario:** Sistema (SPA React).
**Objetivo:** Producir las etiquetas de vencimiento a partir del carrito.
**Disparador:** El usuario pulsa el botón **Crear Rótulos**.

### Precondiciones

1. Existe al menos un ítem en el carrito.

### Flujo principal (éxito)

1. El usuario pulsa **Crear Rótulos**.
2. El sistema muestra el alert: *"¡Rótulos generados! (Funcionalidad en desarrollo)"*.
3. No se genera ninguna etiqueta real (la funcionalidad no está implementada).
4. El caso de uso termina con el aviso.

**Postcondiciones (éxito):** el usuario queda informado de que la generación aún no está disponible.

### Flujos alternativos

**FE-1 — Carrito vacío y se pulsa Crear Rótulos**
- 1a. No hay botón **Crear Rótulos** visible con el carrito vacío (solo se ve el mensaje "Aún no agregaste productos...").

---

## UC-04 — Ver carrito vacío

**Actor principal:** Usuario autenticado.
**Actor secundario:** Sistema (SPA React).
**Objetivo:** Mostrar el estado sin elementos del carrito.
**Disparador:** El usuario entra a `/rotulos` sin haber agregado productos.

### Precondiciones

1. `cartItems` está vacío.

### Flujo principal (éxito)

1. El usuario abre la **Lista para rótulos**.
2. Ve el mensaje: *"Aún no agregaste productos. Seleccioná uno de la lista."*
3. No hay contador ni botón **Crear Rótulos**.
4. El caso de uso termina con éxito.

**Postcondiciones (éxito):** el usuario sabe que debe agregar productos desde la grilla.

---

Volver a [`funcionalidades.md`](../specs/funcionalidades.md).