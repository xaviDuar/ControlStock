# REQ-INVENTARIO-01 — Cargar un lote al inventario

**Mockup:** `docs/pantallas.pen` → frame **`Inventario`** (nodo `pfMqI`) y estado **`Inventario — Cargar lote`** (nodo `spCSJ`)
**Specs vigentes:** [`calculovencimiento.md`](../../specs/calculovencimiento.md), [`seleccioncondicion.md`](../../specs/seleccioncondicion.md), [`previewfecha.md`](../../specs/previewfecha.md)
**Archivos implicados:** `src/frontend/src/pages/InventoryPage.jsx`, `src/frontend/src/api/client.js`, `src/backend/Inventory/models.py`, `serializers.py`, `api.py`, `admin.py` y migraciones.

---

## 1. Objetivo

Permitir registrar desde Inventario una nueva partida física, con su producto, condición, fechas, cantidad y unidad. La fecha de vencimiento se sugiere según la condición elegida, pero el usuario puede corregirla antes de guardar.

## 2. Estado actual

- No hay un formulario de alta de lotes en Inventario; las vistas actuales son de consulta.
- `Producto` ya representa un lote y guarda tipo, condición, fechas, cantidad, proveedor y costo unitario.
- `Producto.save()` calcula el vencimiento desde la condición; el modelo actual vuelve a calcularlo al guardar.
- El endpoint de productos es de solo lectura y no existe `unidad_medida`.

## 3. Estado objetivo

- Un botón **+** ubicado a la misma altura que la barra de búsqueda abre/cierra un panel desplegable **Nuevo lote de inventario**.
- El formulario permite elegir un tipo de producto y una condición aplicable, cargar manualmente la fecha de elaboración y cantidad/unidad, y revisar el vencimiento sugerido antes de confirmar.
- El vencimiento sugerido queda en un campo editable. La fecha final, sea calculada o corregida por el usuario, es obligatoria y se guarda exactamente como fue confirmada.
- Para una condición **Fecha de proveedor**, no hay sugerencia automática: el usuario ingresa manualmente la fecha que figura en el envase.
- Al guardar correctamente, la nueva partida queda en Inventario y el panel informa el resultado.

## 4. Requerimientos funcionales

| ID | Requerimiento |
|---|---|
| RF-1.1 | La ruta protegida `/inventario` muestra el botón **+** al mismo nivel vertical que el buscador, tanto en el listado como en el mockup del panel abierto. |
| RF-1.2 | Al activar **+**, se despliega el formulario sin abandonar Inventario; **Cancelar** lo cierra sin guardar. |
| RF-1.3 | El formulario permite seleccionar un `TipoProducto` del catálogo y una `CondicionVencimiento` perteneciente a ese tipo. |
| RF-1.4 | La fecha de elaboración se ingresa manualmente y es obligatoria. |
| RF-1.5 | Al elegir una condición y una fecha de elaboración, el sistema calcula y sugiere un vencimiento según las reglas existentes. La sugerencia se muestra en el campo **Vencimiento**. |
| RF-1.6 | El usuario puede editar manualmente el vencimiento sugerido para cualquier condición; la fecha confirmada debe persistir sin que el guardado del backend la reemplace por otro cálculo. |
| RF-1.7 | Si la condición es **Fecha de proveedor**, el sistema no inventa una fecha sugerida y requiere que el usuario ingrese manualmente el vencimiento indicado en el envase. |
| RF-1.8 | Si cambia la condición o la fecha de elaboración antes de guardar, se actualiza la sugerencia; el usuario puede volver a corregir el vencimiento antes de confirmar. |
| RF-1.9 | El formulario requiere cantidad positiva y una unidad de medición seleccionada para esa partida. Las unidades iniciales son `g`, `kg`, `ml`, `l`, `unidad` y `paquete`. |
| RF-1.10 | El proveedor y el costo unitario se pueden cargar como datos opcionales. |
| RF-1.11 | El sistema no guarda la partida si falta tipo, condición, fecha de elaboración, fecha final de vencimiento, cantidad o unidad; informa qué dato se debe completar/corregir. |
| RF-1.12 | Al confirmar datos válidos, el sistema crea la partida mediante una operación autenticada de escritura, actualiza el listado y el contador, y confirma el alta. |
| RF-1.13 | Si falla el guardado, se conserva lo cargado en el formulario y se informa el error sin crear una fila ficticia. |
| RF-1.14 | La migración agrega la unidad sin borrar ni alterar los demás datos de las partidas existentes. Todas las partidas previas deben tener su unidad real asignada explícitamente por el responsable del local desde Django Admin antes de cerrar el cambio. |

## 5. Requerimientos visuales / no funcionales

| ID | Requerimiento |
|---|---|
| RNF-1.1 | El botón **+** queda en la misma fila y altura que la barra de búsqueda; se refleja así en todos los mockups de Inventario. |
| RNF-1.2 | El panel, los campos y botones siguen la estética pixel-art, tipografía Workbench y colores del mockup `Inventario`. |
| RNF-1.3 | Las etiquetas identifican claramente **Fecha de elaboración**, **Vencimiento (sugerido, editable)**, **Cantidad** y **Unidad**. |
| RNF-1.4 | La API de alta exige sesión autenticada y valida los datos antes de escribir. |

## 6. Casos de uso

### UC-01.1 — Cargar una partida

| | |
|---|---|
| **Actor** | Empleado autenticado |
| **Objetivo** | Registrar un lote disponible en el local |
| **Precondiciones** | Sesión iniciada; el tipo y sus condiciones están cargados en el catálogo |
| **Disparador** | El usuario pulsa **+** en Inventario |

**Flujo principal:**
1. El usuario abre el panel **Nuevo lote de inventario**.
2. Selecciona producto y condición.
3. Ingresa fecha de elaboración, cantidad y unidad.
4. El sistema propone el vencimiento según la condición; el usuario lo revisa y puede cambiarlo.
5. El usuario confirma **Agregar al inventario**.
6. El sistema guarda la partida y actualiza la tabla.

**Flujos alternativos y excepciones:**

| # | Caso | Resultado |
|---|---|---|
| 4a | Condición **Fecha de proveedor** | No se presenta sugerencia calculada; el usuario ingresa el vencimiento del envase. |
| 5a | Falta un dato obligatorio o es inválido | Se marca el campo y no se envía/guarda la partida. |
| 6a | Error de API o de red | Se informa el error y se conservan los datos del formulario. |

**Postcondiciones:** La nueva partida figura en Inventario con la fecha final elegida y la unidad indicada.

## 7. Criterios de aceptación

| ID | Criterio (Given / When / Then) |
|---|---|
| CA-1.1 | **Given** Inventario visible, **when** se observa el buscador, **then** el botón **+** está a su misma altura en todas las variantes de la pantalla. |
| CA-1.2 | **Given** una condición calculable y fecha de elaboración, **when** se seleccionan ambas, **then** el formulario muestra la fecha de vencimiento sugerida. |
| CA-1.3 | **Given** una fecha sugerida, **when** el usuario la cambia y guarda, **then** se conserva la fecha elegida, no se reemplaza por el cálculo original. |
| CA-1.4 | **Given** condición Fecha de proveedor, **when** se carga el lote, **then** se puede ingresar manualmente la fecha del envase y no se acepta guardar sin ella. |
| CA-1.5 | **Given** un alta válida, **when** se confirma, **then** aparece una nueva fila con las fechas, cantidad y unidad ingresadas. |
| CA-1.6 | **Given** un dato obligatorio faltante, **when** se intenta guardar, **then** no se crea la partida y se indica qué falta. |
| CA-1.7 | **Given** unidades de partidas existentes sin clasificar, **when** se prepara la puesta en producción, **then** todas deben tener la unidad real asignada antes de considerar terminado el cambio. |

## 8. Fuera de alcance

- Editar o eliminar partidas ya existentes desde esta pantalla.
- Crear o modificar tipos y condiciones del catálogo; esa gestión sigue en Django Admin/Productos.
- Generar, descargar o imprimir la etiqueta (ver `REQ-INVENTARIO-02`, que solo prepara el carrito).
- Convertir automáticamente cantidades entre unidades.

## 9. Decisiones

| # | Punto | Decisión |
|---|---|---|
| 1 | Fecha de elaboración | Confirmado por el usuario: se carga manualmente en cada lote. |
| 2 | Vencimiento | Confirmado: el sistema lo sugiere según la condición y el usuario puede introducir/corregir manualmente el valor final. |
| 3 | Fecha de proveedor | Confirmado: al no existir cálculo, se ingresa manualmente la fecha del envase. |
| 4 | Campos de proveedor y costo | Llamada de diseño: quedan opcionales, acorde al modelo actual y a la variante del mockup. |
| 5 | Unidades | Confirmado: unidad controlada por partida; valores iniciales `g`, `kg`, `ml`, `l`, `unidad`, `paquete`. |
| 6 | Cambio de condición/fecha | Llamada de diseño: recalcular la sugerencia cuando cambie cualquiera de los datos que la determina; luego el usuario puede volver a editarla. |
| 7 | API | Debe permitir alta autenticada y preservar la fecha final manual; el endpoint actual es de solo lectura. |
