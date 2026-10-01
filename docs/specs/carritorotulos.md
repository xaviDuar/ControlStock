# Carrito de rótulos

Funcionalidad que **permite acumular los rótulos seleccionados, revisarlos y quitar los que ya no se necesiten** en **¿Cuándo Vence?**. Es la duodécima funcionalidad listada en [`funcionalidades.md`](./funcionalidades.md).

> Casos de uso: [`docs/requerimientos/carritoCDS.md`](../requerimientos/carritoCDS.md)

---

## Qué hace

- Muestra la **Lista para rótulos** (sidebar del carrito) en la pantalla **Crear Rótulos**.
- Acumula los productos agregados con su fecha de elaboración y sus condiciones.
- Permite **revisarlos** (nombre, fecha elab., condiciones por método), **quitarlos** con el botón **X**, y ver el contador de ítems.
- Ofrece el botón **Crear Rótulos** (por ahora muestra un aviso de funcionalidad en desarrollo).
- Si el carrito está vacío, muestra el mensaje "Aún no agregaste productos...".

## Experiencia de usuario

1. En `/rotulos`, el usuario ve a la derecha la **Lista para rótulos**.
2. Si no agregó nada, ve el mensaje de carrito vacío.
3. Al agregar productos, cada ítem muestra: nombre del producto, `Elab: {fecha}` y las condiciones por método (`Refrigerado: 72 HS (bolsa cerrada)`, etc.).
4. Puede quitar un ítem con el botón **X** (borde y texto rojos).
5. Al pie ve el contador ("N producto(s) seleccionado(s)") y el botón **Crear Rótulos**, que por ahora responde con el alert "¡Rótulos generados! (Funcionalidad en desarrollo)".

## Cómo lo hace (implementación)

### Frontend (React + Vite)

| Parte | Archivo | Rol |
|---|---|---|
| Estado del carrito | `src/frontend/src/pages/RotulosPage.jsx` | `cartItems` (objeto clave-valor) |
| Clave del ítem | `src/frontend/src/pages/RotulosPage.jsx` | `` `${nombre}__${fecha}` `` (evita duplicados de producto+fecha) |
| Agregar | `src/frontend/src/pages/RotulosPage.jsx` | `addToCart` (valida fecha y duplicado; limpia la fecha) |
| Quitar | `src/frontend/src/pages/RotulosPage.jsx` | `removeFromCart(key)` borra la clave |
| Render | `src/frontend/src/pages/RotulosPage.jsx` | `entries = Object.entries(cartItems)`; sidebar con ítems, contador y botón |
| Generar | `src/frontend/src/pages/RotulosPage.jsx` | `alert('¡Rótulos generados! (Funcionalidad en desarrollo)')` |

### Estructura del carrito

- **Vacío:** `entries.length === 0` → `<div className="cart-empty">Aún no agregaste productos.<br />Seleccioná uno de la lista.</div>`.
- **Con ítems:** por cada `[key, item]` un `<div className="cart-item">`:
  - `.cart-product-name` → nombre.
  - `.cart-date` → `Elab: {fecha}`.
  - condiciones → `{metodo}: {texto}` por cada una.
  - botón **X** → `removeFromCart(key)`.
- **Pie:** `.cart-total` con contador `{entries.length} producto(s) seleccionado(s)` y botón **Crear Rótulos** (`width:100%`).

### Flujo de quitar un ítem

1. El usuario pulsa la **X** de un ítem.
2. `removeFromCart(key)` clona `cartItems`, borra `next[key]` y actualiza el estado.
3. El ítem desaparece; si era el único, el carrito vuelve al mensaje vacío.

---

## Validaciones y casos límite

| Situación | Comportamiento |
|---|---|
| Carrito vacío | Mensaje "Aún no agregaste productos..." |
| Con ítems | Lista con nombre, fecha y condiciones por método |
| Quitar ítem | Desaparece al instante; contador se actualiza |
| Quitar el último ítem | Vuelve el mensaje de carrito vacío |
| Agregar duplicado (mismo producto+fecha) | Bloqueado por alert (ver Generador de rótulos) |
| Generar rótulos | Alert de funcionalidad en desarrollo |

---

## Limitaciones conocidas

- **La generación de rótulos no está implementada** (solo muestra un alert).
- El carrito no persiste: se pierde al recargar o salir de la página.
- No hay edición de fecha/condición desde el carrito (hay que quitar y volver a agregar).

---

Volver a [`funcionalidades.md`](./funcionalidades.md).