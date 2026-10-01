# Selección de condición

Funcionalidad que **permite elegir, para cada método de conservación, la condición de vencimiento aplicable** (ej. bolsa cerrada o abierta) en **¿Cuándo Vence?**. Es la décima funcionalidad listada en [`funcionalidades.md`](./funcionalidades.md).

> Casos de uso: [`docs/requerimientos/implementados/seleccioncondicionCDS.md`](../requerimientos/implementados/seleccioncondicionCDS.md)

---

## Qué hace

- En la pantalla **Crear Rótulos**, por cada método de conservación de un producto (**Refrigerado**, **Congelado**, **Bodega**, **Toppinera**), muestra un selector desplegable con las condiciones de vencimiento disponibles.
- Preselecciona automáticamente la primera condición de cada método al cargar.
- Permite cambiar la condición y muestra el preview de vencimiento si hay fecha de elaboración cargada.
- Si el producto no tiene condiciones en un método, no muestra selector (y si no tiene en ningún método, avisa "Sin condiciones de vencimiento").

## Experiencia de usuario

1. En `/rotulos`, el usuario ve en cada tarjeta de producto los métodos con condiciones.
2. Para cada método (ej. Congelado) hay un `<select>` con las opciones (ej. `6 MESES (bolsa cerrada)`, `3 MESES (bolsa abierta)`).
3. Al cargar la página, cada selector ya tiene elegida la primera condición del método.
4. El usuario puede cambiar la condición: si ya cargó la fecha de elaboración, el preview `→ vence …` se recalcula al instante.

## Cómo lo hace (implementación)

### Frontend (React + Vite)

| Parte | Archivo | Rol |
|---|---|---|
| Selectores | `src/frontend/src/pages/RotulosPage.jsx` | Por cada grupo de método con condiciones renderiza un `<select>` ligado a `selected` |
| Preselección | `src/frontend/src/pages/RotulosPage.jsx` | En el `useEffect` inicial: `defaults[id_tipo][metodo] = condiciones[0].id_condicion` |
| Agrupación | `src/frontend/src/pages/RotulosPage.jsx` | `agruparCondiciones(t)` → 4 grupos con sus condiciones filtradas por `c.metodo` |
| Texto de opción | `src/frontend/src/pages/RotulosPage.jsx` | `formatearCondicion(c)` → "72 HS (bolsa cerrada)", "Fin del día", "Fec. de proveedor" |
| Datos | `src/backend/Inventory/api.py` + `serializers.py` | `GET /api/tipos/` devuelve `condiciones` anidadas por tipo |
| Modelo | `src/backend/Inventory/models.py` | `CondicionVencimiento`: `metodo`, `anotacion`, `duracion_valor`, `duracion_unidad`, `especial` |

### Flujo paso a paso

1. `fetchTipos()` devuelve los tipos con sus `condiciones`.
2. `agruparCondiciones(t)` arma, para cada método, el array de condiciones cuyo `metodo` coincide.
3. `condicionElegida(t, metodoId)` resuelve la condición activa a partir de `selected` (o null).
4. Se renderiza el `<select>`:
   - `value = selected[t.id]?.[g.id] ?? ''`.
   - `onChange` actualiza `selected`.
5. Si hay `fecha` y la condición activa produce `vence`, se muestra `→ vence {vence.toLocaleDateString('es-AR')}`.

---

## Validaciones y casos límite

| Situación | Comportamiento |
|---|---|
| Método con condiciones | Selector con preselección de la primera opción |
| Método sin condiciones | No se muestra selector para ese método |
| Producto sin ninguna condición | Mensaje "Sin condiciones de vencimiento" |
| Cambiar condición con fecha cargada | Preview de vencimiento recalculado |
| Condición especial (FIN_DEL_DIA / PROVEEDOR) | Se listan como opción; el preview según corresponda |
| Datos sin cargar / error | "Cargando..." o caja de error |

---

## Limitaciones conocidas

- No hay selector de condición fuera de la pantalla de rótulos (solo aplica al generador).
- Las condiciones no se pueden crear/editar desde esta pantalla (eso es la gestión admin).

---

Volver a [`funcionalidades.md`](./funcionalidades.md).