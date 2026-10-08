# Consulta de inventario — Casos de uso

Requerimientos de la funcionalidad **Consulta de inventario** de **¿Cuándo Vence?**, expresados como casos de uso en formato UML detallado.

> Volver a [`funcionalidades.md`](../../specs/funcionalidades.md) · Especificación técnica: [`specs/consultainventario.md`](../../specs/consultainventario.md)

---

## Tabla de casos de uso

| ID | Caso de uso | Actor principal | Disparador | Resultado |
|----|-------------|-----------------|------------|-----------|
| UC-01 | Ver los lotes de producto (inventario) | Usuario autenticado | Entra a `/inventario` | Ve la tabla de lotes con condición, duración, fechas, cantidad, medición y alerta de color |
| UC-02 | Buscar lotes por nombre o proveedor | Usuario autenticado | Escribe en la barra de búsqueda | Ve solo los lotes coincidentes |
| UC-03 | Manejar error de carga del inventario | Usuario autenticado | La API falla o rechaza la petición | Ve el mensaje de error en la pantalla |
| UC-04 | Cargar un lote al carrito de rótulos | Usuario autenticado | Toca el icono de lista de un lote | El lote se agrega al carrito de rótulos con la cantidad indicada |

---

## UC-01 — Ver los lotes de producto (inventario)

**Actor principal:** Usuario autenticado.
**Actor secundario:** Sistema (SPA React + API Django/DRF).
**Objetivo:** Visualizar los lotes de producto que están en el local, con su condición, duración, fechas, cantidad, medición y una alerta de color según su vencimiento.
**Disparador:** El usuario entra a `/inventario` con sesión.

### Precondiciones

1. El usuario tiene sesión iniciada (token válido).
2. El backend está disponible y responde `GET /api/productos/`.
3. Existen lotes de producto cargados.

### Flujo principal (éxito)

1. El usuario entra a `/inventario`.
2. La página muestra el título **Inventario**, la barra de búsqueda y el indicador "Cargando...".
3. El sistema llama a `GET /api/productos/` con `Authorization: Token <token>`.
4. El backend valida el token (`IsAuthenticated`) y responde la lista de lotes (JSON) con `select_related('id_tipo_producto', 'id_condicion')`.
5. La página renderiza una fila por lote con columnas: **Producto**, **Condición**, **Duración**, **Elaboración**, **Vencimiento**, **Cantidad**, **Medición** y **Alerta**.
6. La columna **Alerta** muestra una palabra con color según el estado del vencimiento:
   - **Vencido** (rojo) si el lote ya venció (`fecha_vencimiento` anterior a hoy).
   - **Por vencer** (amarillo) si está por vencer (el tiempo restante hasta el vencimiento es menor o igual al 10% de la duración total de la condición).
   - **Buen estado** (verde) en el resto de los casos.
7. Al pie se muestra el contador de resultados (p. ej. "12 lote(s) de producto").
8. El caso de uso termina con éxito.

**Postcondiciones (éxito):** el usuario ve el inventario completo (lotes) con sus fechas de vencimiento y la alerta de color de cada lote.

### Flujos alternativos

**FE-1 — Lote sin condición** *(en el paso 5)*
- 5a. Si un lote no tiene condición asociada, las columnas **Condición** y **Duración** muestran `—`, **Vencimiento** puede quedar vacío (`—`) y la **Alerta** no aplica (sin color).

**FE-2 — Condición especial** *(en el paso 5-6)*
- 5a. Si la condición es especial (`FIN_DEL_DIA` o `PROVEEDOR`), la **Duración** muestra la etiqueta correspondiente ("Fin del día" / "Fec. de proveedor") y la **Alerta** se calcula sobre la `fecha_vencimiento` resultante.

**FE-3 — Filtro de búsqueda activo** *(en el paso 5)*
- 5a. Si el usuario escribió en el buscador, la tabla muestra solo los lotes coincidentes (ver UC-02).

**FE-4 — Sin lotes cargados** *(en el paso 5)*
- 5a. Si no hay lotes cargados (y no hay búsqueda activa), se muestra la tarjeta *"No hay productos cargados."* en lugar de la tabla.

---

## UC-02 — Buscar lotes por nombre o proveedor

**Actor principal:** Usuario autenticado.
**Actor secundario:** Sistema (SPA React + API Django/DRF).
**Objetivo:** Filtrar los lotes por nombre de producto o por proveedor.
**Disparador:** El usuario escribe un texto en la barra de búsqueda de `/inventario`.

### Precondiciones

1. El usuario está en `/inventario` con sesión.
2. Existen lotes cargados.

### Flujo principal (éxito)

1. El usuario escribe un texto en el buscador (p. ej. "crema" o un proveedor).
2. El sistema actualiza `query` y vuelve a cargar: `GET /api/productos/?search=<texto>`.
3. El backend filtra por `id_tipo_producto__nombre` o `proveedor` (`SearchFilter`).
4. La tabla muestra solo los lotes coincidentes y el contador actualizado.
5. El caso de uso termina con éxito.

**Postcondiciones (éxito):** el usuario ve solo los lotes que coinciden con la búsqueda.

### Flujos alternativos

**FE-1 — Sin coincidencias** *(en el paso 4)*
- 4a. Si no hay coincidencias, se muestra la tarjeta *"No se encontraron productos para '<texto>'"* con el botón **Ver todos**.

**FE-2 — Limpiar el filtro**
- 4b. Al pulsar **Limpiar** (o **Ver todos**), `query` se vacía y se recarga la lista completa.

---

## UC-03 — Manejar error de carga del inventario

**Actor principal:** Usuario autenticado.
**Actor secundario:** Sistema (SPA React + API).
**Objetivo:** Informar al usuario cuando no se puede cargar el inventario.
**Disparador:** La llamada a `GET /api/productos/` falla (red, servidor o token inválido).

### Precondiciones

1. El usuario está en `/inventario` (o entró a él).
2. La petición a la API falla.

### Flujo principal (éxito)

1. El sistema recibe un error de la API (red caída, HTTP 401, 500, etc.).
2. `client.js` extrae el mensaje (`err.error` → `err.detail` → `"Error de red"`) y lanza un `Error`.
3. La página captura el error y muestra la caja roja `div.message.error` con el mensaje.
4. La tabla no se renderiza.
5. El caso de uso termina: el usuario ve el error y puede reintentar (recargar o volver a entrar).

**Postcondiciones (éxito):** el usuario conoce el motivo del fallo; no ve datos incorrectos.

### Flujos alternativos

**FE-1 — Error transitorio y reintento**
- 1a. Si el problema es temporal (p. ej. backend reiniciándose), al volver a cargar la página la petición puede tener éxito y mostrar la lista.

---

## UC-04 — Cargar un lote al carrito de rótulos

**Actor principal:** Usuario autenticado.
**Actor secundario:** Sistema (SPA React).
**Objetivo:** Agregar un lote del inventario al carrito de rótulos indicando cuántos rótulos generar.
**Disparador:** El usuario toca el icono de lista (arriba a la derecha) de un lote.

### Precondiciones

1. El usuario está en `/inventario` con sesión.
2. Existe al menos un lote cargado.

### Flujo principal (éxito)

1. El usuario toca el icono de lista de un lote.
2. Se despliega un formulario en la misma fila con un campo **Cantidad** (número de rótulos a generar).
3. El usuario ingresa la cantidad y confirma.
4. El sistema toma la fecha de elaboración y la condición del lote (no se piden de nuevo) y agrega el ítem al carrito de rótulos.
5. El caso de uso termina con éxito.

**Postcondiciones (éxito):** el lote queda en el carrito de rótulos (Lista para rótulos) con su cantidad.

### Flujos alternativos

**FE-1 — Cantidad vacía o inválida** *(en el paso 3)*
- 3a. Si no se ingresa una cantidad válida, el sistema pide completarla y no agrega nada.

---

Volver a [`funcionalidades.md`](../../specs/funcionalidades.md).
