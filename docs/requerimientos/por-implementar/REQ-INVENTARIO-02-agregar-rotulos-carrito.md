# REQ-INVENTARIO-02 — Agregar rótulos al carrito

**Mockup:** `docs/pantallas.pen` → frame **`Inventario`** (nodo `pfMqI`), botón de lista al extremo derecho de cada lote
**Specs vigentes:** [`consultainventario.md`](../../specs/consultainventario.md), [`carritorotulos.md`](../../specs/carritorotulos.md)
**Archivos implicados:** pantalla Inventario, estado compartido del carrito y `src/frontend/src/pages/RotulosPage.jsx`.

---

## 1. Objetivo

Desde una fila de Inventario, indicar cuántas copias se necesitan y agregar al carrito el lote con sus fechas ya definidas. Esta funcionalidad prepara los datos para una futura generación de rótulos, pero no produce ni imprime la etiqueta.

## 2. Estado actual

- El carrito de `/rotulos` acumula ítems en memoria y permite quitar productos.
- El inventario actual no agrega un lote existente al carrito ni guarda la cantidad de copias.
- La fecha de elaboración y el vencimiento ya pertenecen al lote seleccionado.

## 3. Estado objetivo

- Cada fila de lote tiene un botón de lista.
- Al pulsarlo, el usuario indica la cantidad de rótulos, independiente del stock.
- El carrito conserva la cantidad solicitada junto al identificador del lote y sus fechas/condición.
- La aplicación bloquea volver a agregar el mismo lote; para cambiar su cantidad, el usuario lo quita del carrito y lo agrega de nuevo.

## 4. Requerimientos funcionales

| ID | Requerimiento |
|---|---|
| RF-2.1 | La acción de una fila permite indicar cuántos rótulos preparar para ese lote. |
| RF-2.2 | La cantidad de rótulos es un entero positivo e independiente de la cantidad/unidad de stock. |
| RF-2.3 | No se acepta cantidad vacía, cero, negativa o fraccionaria; en esos casos no se agrega nada y se solicita corregir el valor. |
| RF-2.4 | Al confirmar, el carrito recibe el identificador del lote, el número de copias, producto, condición, fecha de elaboración y vencimiento guardados en la fila. |
| RF-2.5 | Este flujo no permite modificar las fechas/condición ni volver a calcular vencimientos. |
| RF-2.6 | Agregar rótulos no cambia el stock ni crea/actualiza un lote. |
| RF-2.7 | Si el mismo lote ya está en el carrito, se informa el duplicado y no se agrega otra entrada. Para cambiar la cantidad debe quitarse y volver a agregarse. Otros lotes del mismo tipo son entradas distintas. |
| RF-2.8 | La aplicación confirma que el lote se agregó y mantiene al usuario en Inventario. |
| RF-2.9 | El carrito conserva la cantidad para una futura generación, sin cambiar el comportamiento actual de quitar ítems. |

## 5. Requerimientos visuales / no funcionales

| ID | Requerimiento |
|---|---|
| RNF-2.1 | El botón de cada lote conserva el estilo pixel-art y su ubicación al extremo derecho de la fila. |
| RNF-2.2 | El control identifica el producto/lote al que corresponde la cantidad ingresada. |

## 6. Casos de uso

### UC-02.1 — Encolar una cantidad de rótulos

| | |
|---|---|
| **Actor** | Empleado autenticado |
| **Objetivo** | Dejar preparado en el carrito un lote y la cantidad de copias necesarias |
| **Precondiciones** | Inventario cargado; lote con vencimiento definido |
| **Disparador** | El usuario pulsa el botón de lista de una fila |

**Flujo principal:**
1. El usuario activa el botón del lote.
2. Ingresa una cantidad positiva entera y confirma.
3. El sistema agrega al carrito el lote y la cantidad, usando las fechas existentes.
4. El sistema confirma la acción sin alterar el stock y permanece en Inventario.

**Flujos alternativos y excepciones:**

| # | Caso | Resultado |
|---|---|---|
| 2a | Cantidad inválida | Se muestra validación y no se agrega el lote. |
| 3a | El mismo lote ya está en el carrito | Se informa el duplicado; no se modifica la entrada existente. |

## 7. Criterios de aceptación

| ID | Criterio (Given / When / Then) |
|---|---|
| CA-2.1 | **Given** un lote con stock 1 kg, **when** el usuario agrega 5 rótulos, **then** el carrito conserva cinco copias y el stock sigue siendo 1 kg. |
| CA-2.2 | **Given** un lote con fechas visibles, **when** se agrega al carrito, **then** se conservan exactamente las fechas y condición de la fila. |
| CA-2.3 | **Given** cantidad cero, decimal o vacía, **when** se confirma, **then** no se agrega el ítem y se informa el error. |
| CA-2.4 | **Given** un lote ya agregado, **when** se vuelve a elegir, **then** se bloquea el duplicado y se indica que debe quitarse para cambiar la cantidad. |
| CA-2.5 | **Given** dos lotes distintos del mismo producto, **when** se agrega cada lote, **then** quedan como entradas separadas. |
| CA-2.6 | **Given** la acción exitosa, **when** termina, **then** el usuario permanece en Inventario y el stock no cambia. |

## 8. Fuera de alcance

- Componer, generar, descargar o imprimir rótulos.
- Editar desde el carrito la fecha o condición del lote.
- Persistir el carrito en backend o cambiar su ciclo de vida actual.

## 9. Decisiones

| # | Punto | Decisión |
|---|---|---|
| 1 | Cantidad | Confirmado: se elige por usuario y no deriva del stock. |
| 2 | Fechas y condición | Confirmado: se toman del lote seleccionado; no se editan desde este flujo. |
| 3 | Duplicados | Confirmado: mismo lote no puede agregarse dos veces; se quita y vuelve a agregar para cambiar la cantidad. |
| 4 | Generación | Confirmado: generar/imprimir rótulos queda para una etapa futura. |
