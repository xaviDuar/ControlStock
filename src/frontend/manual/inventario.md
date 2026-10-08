# Inventario

La pantalla **Inventario** muestra los lotes de producto que hay en el local, con su condición, fechas, cantidad y una alerta de color según su vencimiento.

## Qué ves en la pantalla

- El título **Inventario**.
- Una **barra de búsqueda** para filtrar por nombre de producto o proveedor.
- Una **tabla** con una fila por lote.

## Columnas de la tabla

- **Producto** — el nombre del producto.
- **Condición** — la condición de vencimiento del lote.
- **Duración** — cuánto dura según la condición.
- **Elaboración** — la fecha de elaboración.
- **Vencimiento** — la fecha de vencimiento.
- **Cantidad** — cuántas unidades hay.
- **Medición** — la unidad de medida.
- **Alerta** — una palabra con color según el estado del vencimiento.

## Alerta de color

Cada lote muestra una palabra con el color correspondiente a su estado:

- **Vencido** (rojo) — el lote ya venció.
- **Por vencer** (amarillo) — está por vencer (le queda poco tiempo).
- **Buen estado** (verde) — está en buen estado.

## Cargar un lote al carrito de rótulos

Arriba a la derecha de cada producto hay un **icono de lista**. Al tocarlo, se despliega un formulario en la misma fila que te pide la **cantidad de rótulos** a generar.

- La fecha de elaboración y la condición ya vienen del lote, no hace falta cargarlas.
- Al confirmar, el producto se agrega al **carrito de rótulos** (la Lista para rótulos de la pantalla Crear Rótulos).

## Buscar un lote

Escribí en el buscador el nombre del producto o el proveedor. La tabla se filtra a medida que escribís.

- Si no hay coincidencias, aparece un mensaje y un botón **Ver todos** para volver a la lista completa.
- Para limpiar el filtro, tocá el botón **Limpiar** que aparece al lado del buscador.

## Cantidad de lotes

Al pie de la tabla se muestra cuántos lotes hay (por ejemplo, "12 lote(s) de producto").

## Si no hay lotes cargados

Si todavía no hay lotes cargados, en lugar de la tabla se muestra el mensaje "No hay productos cargados."
