# Fecha de elaboración con preview

Funcionalidad que **permite cargar la fecha de elaboración y ver al instante la fecha de vencimiento resultante** en **¿Cuándo Vence?**. Es la undécima funcionalidad listada en [`funcionalidades.md`](./funcionalidades.md).

> Casos de uso: [`docs/requerimientos/implementados/previewfechaCDS.md`](../requerimientos/implementados/previewfechaCDS.md)

---

## Qué hace

- En la pantalla **Crear Rótulos**, cada tarjeta de producto tiene un campo `<input type="date">` para la fecha de elaboración.
- Al cargar una fecha, si el método tiene una condición seleccionada, se muestra al instante `→ vence {fecha}` (formato local es-AR) al lado del selector.
- El cálculo se hace en el cliente según la condición (horas, días, meses, años, fin del día) y se actualiza en tiempo real al cambiar fecha o condición.
- La fecha cargada es la que se usa al agregar el producto al carrito (y se limpia después de agregarlo).

## Experiencia de usuario

1. En `/rotulos`, el usuario ve en cada tarjeta un campo de fecha de elaboración.
2. Escribe/elige una fecha (ej. 2026-10-01): al instante, junto a cada método con condición, aparece `→ vence 04/10/2026` (o según la condición).
3. Si cambia la condición o la fecha, el preview se recalcula.
4. Al pulsar **+ Agregar**, el ítem se suma al carrito con esa fecha y el campo se limpia.

## Cómo lo hace (implementación)

### Frontend (React + Vite)

| Parte | Archivo | Rol |
|---|---|---|
| Campo de fecha | `src/frontend/src/pages/RotulosPage.jsx` | `<input type="date" value={fecha} onChange={e => setDates(...)} />` en cada tarjeta |
| Estado | `src/frontend/src/pages/RotulosPage.jsx` | `dates[id_tipo_producto]` guarda la fecha por producto |
| Cálculo | `src/frontend/src/pages/RotulosPage.jsx` | `calcularVencimiento(fecha, c)` (líneas 18-32) |
| Formato | `src/frontend/src/pages/RotulosPage.jsx` | `vence.toLocaleDateString('es-AR')` |
| Preview | `src/frontend/src/pages/RotulosPage.jsx` | `{fecha && c && vence && (<span>→ vence …</span>)}` |

### Regla de cálculo (`calcularVencimiento`)

- `fecha` se interpreta a mediodía (`new Date(fecha + 'T12:00:00')`) para evitar desfases de zona horaria.
- `FIN_DEL_DIA` → misma fecha (base).
- `HS` → `base + N horas`.
- `DIAS` → `base + N días`.
- `MESES` → `base + N meses` (`setMonth`).
- `ANIOS` → `base + N años` (`setFullYear`).
- `PROVEEDOR` → `null` (no calculable).
- Sin fecha o sin condición → `null` (sin preview).

### Flujo paso a paso

1. El usuario carga la fecha → `setDates({...prev, [id]: valor})`.
2. En el render, `fecha = dates[id] || ''`.
3. Para cada método con condición, `c = condicionElegida(t, metodoId)` y `vence = calcularVencimiento(fecha, c)`.
4. Si `fecha && c && vence` → se renderiza `→ vence {formateada}`.
5. Al agregar al carrito, `addToCart` usa esa fecha como parte de la clave y del ítem; luego `setDates({...prev, [id]: ''})` limpia el campo.

---

## Validaciones y casos límite

| Situación | Comportamiento |
|---|---|
| Fecha cargada + condición normal | Preview con la fecha calculada |
| Sin fecha | No hay preview |
| Condición PROVEEDOR | Sin preview (no calculable) |
| Condición FIN_DEL_DIA | Preview = misma fecha |
| Cambio de fecha o condición | Preview recalculado al instante |
| Agregar al carrito | Usa la fecha y limpia el campo |
| Agregar sin fecha | Alert pidiendo fecha (ver Generador de rótulos) |

---

## Limitaciones conocidas

- El cálculo del preview es del cliente; no consulta el backend (podría diferir de `calcular_fecha_vencimiento` de `models.py` en los bordes de meses).
- No se muestra la hora en el preview (solo la fecha local es-AR).

---

Volver a [`funcionalidades.md`](./funcionalidades.md).