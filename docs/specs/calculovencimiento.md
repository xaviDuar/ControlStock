# Cálculo automático del vencimiento

Funcionalidad que **calcula la fecha de vencimiento de un producto a partir de su condición** (horas, días, meses, años, fin del día o fecha de proveedor) en **¿Cuándo Vence?**. Es la decimotercera funcionalidad listada en [`funcionalidades.md`](./funcionalidades.md).

> Casos de uso: [`docs/requerimientos/implementados/calculovencimientoCDS.md`](../requerimientos/implementados/calculovencimientoCDS.md)

---

## Qué hace

- Es la regla de negocio que, dados una **fecha de elaboración** y una **condición de vencimiento**, produce la **fecha de vencimiento**.
- Soporta duraciones en **horas**, **días**, **meses** y **años**, más dos especiales: **fin del día** (vence el mismo día) y **fecha de proveedor** (no se calcula; la define el proveedor).
- Se aplica en dos lugares:
  1. **Backend** (`calcular_fecha_vencimiento`): se ejecuta al guardar un `Producto` (en `Producto.save`) para rellenar `fecha_vencimiento`.
  2. **Frontend** (`calcularVencimiento`): se usa en la pantalla de rótulos para el preview en tiempo real.

## Experiencia de usuario

1. **En el panel admin (backend):** al crear/editar un `Producto` con `fecha_elaboracion` e `id_condicion`, el sistema calcula y guarda `fecha_vencimiento` automáticamente.
2. **En rótulos (frontend):** al cargar la fecha de elaboración con una condición, el usuario ve el vencimiento calculado al instante (preview).

## Cómo lo hace (implementación)

### Backend (Django)

| Parte | Archivo | Rol |
|---|---|---|
| Función | `src/backend/Inventory/models.py` | `calcular_fecha_vencimiento(fecha_elaboracion, condicion)` (líneas 18-35) |
| Helper de meses | `src/backend/Inventory/models.py` | `_sumar_meses(fecha, meses)` (líneas 7-15) con tabla `_DIAS_POR_MES` |
| Auto-guardado | `src/backend/Inventory/models.py` | `Producto.save()` (líneas 107-111): si hay `id_condicion` y fecha, recalcula `fecha_vencimiento` |

### Reglas de la función `calcular_fecha_vencimiento`

1. Sin `condicion` o sin `fecha_elaboracion` → `None`.
2. `especial == 'PROVEEDOR'` → `None` (la fecha la da el proveedor).
3. `especial == 'FIN_DEL_DIA'` → la misma `fecha_elaboracion`.
4. `duracion_valor` o `duracion_unidad` nulos → `None`.
5. `duracion_unidad == 'HS'` → `fecha + timedelta(hours=valor)`.
6. `duracion_unidad == 'DIAS'` → `fecha + timedelta(days=valor)`.
7. `duracion_unidad == 'MESES'` → `_sumar_meses(fecha, valor)`.
8. `duracion_unidad == 'ANIOS'` → `_sumar_meses(fecha, valor * 12)`.
9. Otro caso → `None`.

`_sumar_meses` maneja meses con distinta cantidad de días (ej. 31 de enero + 1 mes → 28/29 de febrero).

### Frontend (React)

| Parte | Archivo | Rol |
|---|---|---|
| Función espejo | `src/frontend/src/pages/RotulosPage.jsx` | `calcularVencimiento(fecha, c)` (líneas 18-32), con `setHours/setDate/setMonth/setFullYear` sobre `new Date(fecha + 'T12:00:00')` |
| Uso | `src/frontend/src/pages/RotulosPage.jsx` | Preview `→ vence …` en cada método con condición y fecha |

### Flujo de guardado (backend)

1. Se crea/edita un `Producto` con `id_condicion` y `fecha_elaboracion`.
2. `Producto.save()` busca la condición y llama a `calcular_fecha_vencimiento`.
3. El resultado se asigna a `self.fecha_vencimiento` antes del `super().save()`.
4. La fecha queda persistida en la base.

---

## Validaciones y casos límite

| Condición | Resultado |
|---|---|
| `HS` | Suma horas exactas |
| `DIAS` | Suma días |
| `MESES` | Suma meses con ajuste de fin de mes |
| `ANIOS` | Suma años (12 meses) |
| `FIN_DEL_DIA` | Misma fecha de elaboración |
| `PROVEEDOR` | `None` (la define el proveedor) |
| Sin condición o sin fecha | `None` |
| Valor o unidad nulos | `None` |

---

## Limitaciones conocidas

- Las funciones de backend y frontend son implementaciones separadas (duplicadas) y pueden divergir en bordes (ej. zonas horarias en el frontend con `toLocaleDateString`).
- No hay validación de que `fecha_elaboracion` sea anterior al vencimiento.
- No se exponen días hábiles ni reglas por tipo de producto adicionales a la condición.

---

Volver a [`funcionalidades.md`](./funcionalidades.md).