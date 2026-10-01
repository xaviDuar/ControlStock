# Generador de rótulos

Funcionalidad que **permite elegir productos y sus condiciones de conservación para preparar las etiquetas de vencimiento** en **¿Cuándo Vence?**. Es la novena funcionalidad listada en [`funcionalidades.md`](./funcionalidades.md).

> Casos de uso: [`docs/requerimientos/generadorrotulosCDS.md`](../requerimientos/generadorrotulosCDS.md)

---

## Qué hace

- Muestra la pantalla **Crear Rótulos** (`/rotulos`) con la grilla de **Productos disponibles**.
- Por cada tipo de producto, muestra sus métodos de conservación (**Refrigerado**, **Congelado**, **Bodega**, **Toppinera**) con un selector de condición de vencimiento.
- Permite cargar una fecha de elaboración y ver al instante la fecha de vencimiento resultante (`→ vence …`).
- Un botón **+ Agregar** suma el producto (con sus condiciones y fecha) a la **Lista para rótulos** (carrito).
- Desde el carrito se pueden quitar productos, ver el contador y (eventualmente) generar los rótulos.

## Experiencia de usuario

1. El usuario entra a `/rotulos` con sesión.
2. Ve el título **Crear Rótulos**, la descripción de uso y la grilla de productos disponibles (cada uno en una tarjeta).
3. Para cada método con condiciones, elige una condición en el `<select>` (se preselecciona la primera por defecto).
4. Si carga la fecha de elaboración, al lado del selector aparece `→ vence {fecha}` calculada al instante.
5. Pulsa **+ Agregar**: si no hay fecha, ve un alert pidiéndola; si el producto con esa fecha ya está, ve otro alert; si todo está bien, el ítem aparece en la **Lista para rótulos**.
6. En el carrito puede quitar ítems con la **X**, ver cuántos hay y pulsar **Crear Rótulos** (por ahora muestra un aviso de funcionalidad en desarrollo).

## Cómo lo hace (implementación)

### Frontend (React + Vite)

| Parte | Archivo | Rol |
|---|---|---|
| Página | `src/frontend/src/pages/RotulosPage.jsx` | Todo el generador: estado (`tipos`, `cartItems`, `dates`, `selected`), render de tarjetas y carrito |
| Datos | `src/frontend/src/api/client.js` | `fetchTipos()` → `GET /api/tipos/` (trae `condiciones` anidadas) |
| Ruta protegida | `src/frontend/src/App.jsx` | `/rotulos` envuelta en `ProtectedRoute` |
| Modelo | `src/backend/Inventory/models.py` | `TipoProducto` + `CondicionVencimiento` (métodos: refrigerado/congelado/bodega/toppinera) |

### Constantes y helpers clave

- `METODOS` (líneas 4-9): los 4 métodos de conservación con su label.
- `formatearCondicion(c)` (11-16): texto legible de una condición (`72 HS (bolsa cerrada)`, `Fin del día`, `Fec. de proveedor`).
- `calcularVencimiento(fecha, c)` (18-32): calcula la fecha de vencimiento en el cliente (FIN_DEL_DIA = el mismo día; HS/DIAS/MESES/ANIOS suman; PROVEEDOR = null).
- `agruparCondiciones(t)` (34-39): arma los grupos por método con sus condiciones.

### Flujo de carga

1. `useEffect` inicial: `fetchTipos()` → `setTipos(data)`.
2. Para cada tipo, se preseleccionan las primeras condiciones de cada método (`defaults`) en `selected`.
3. `loading=false`.

### Flujo de agregar al carrito (`addToCart`)

1. Lee `fecha = dates[id]`.
2. Si no hay fecha → `alert('Por favor seleccioná una fecha de elaboración.')` y retorna.
3. Arma `key = ${nombre}__${fecha}`.
4. Si `cartItems[key]` existe → `alert('Este producto con esa fecha ya está en la lista.')` y retorna.
5. Si pasa todo: `setCartItems({...prev, [key]: {nombre, fecha, condiciones}})` y limpia la fecha (`setDates({...prev, [id]: ''})`).

### Flujo del carrito

- `removeFromCart(key)` elimina el ítem.
- `entries.length` muestra el contador; si es 0, se ve el mensaje vacío.
- Botón **Crear Rótulos**: `alert('¡Rótulos generados! (Funcionalidad en desarrollo)')`.

---

## Validaciones y casos límite

| Situación | Comportamiento |
|---|---|
| Producto sin condiciones | Tarjeta muestra "Sin condiciones de vencimiento" |
| Agregar sin fecha de elaboración | Alert pidiendo la fecha |
| Agregar duplicado (mismo producto + fecha) | Alert de "ya está en la lista" |
| Agregar con fecha válida | Ítem agregado al carrito y fecha limpiada |
| Condición PROVEEDOR | `formatearCondicion` → "Fec. de proveedor"; `calcularVencimiento` → null (sin preview) |
| Condición FIN_DEL_DIA | Preview muestra la misma fecha |
| Carrito vacío | Mensaje "Aún no agregaste productos..." |
| Generar rótulos | Alert de "funcionalidad en desarrollo" |

---

## Limitaciones conocidas

- El botón **Crear Rótulos** aún no genera etiquetas reales (es un aviso en desarrollo).
- La fecha de vencimiento se calcula en el cliente; no se valida contra `calcular_fecha_vencimiento` del backend en esta pantalla.
- No hay persistencia del carrito (se pierde al recargar).

---

Volver a [`funcionalidades.md`](./funcionalidades.md).