# Funcionalidades

Listado general de las funcionalidades implementadas en **¿Cuándo Vence?**, con una descripción breve de lo que permiten hacer.

> Cada funcionalidad se detallará en un archivo propio dentro de `docs/specs/`.

---

## Autenticación y sesión

- [**Login**](./login.md) — Permite iniciar sesión con usuario y contraseña para acceder a las secciones protegidas de la página.
- [**Sesión persistente**](./sesionpersistente.md) — Mantiene al usuario identificado aunque recargue la página, y lo libera al salir.
- [**Logout**](./logout.md) — Permite cerrar la sesión y volver a la portada.
- [**Rutas protegidas**](./rutasprotegidas.md) — Impide entrar a las pantallas internas sin haber iniciado sesión, redirigiendo a la portada.

## Navegación

- [**Menú principal (Navbar)**](./navbar.md) — Permite desplazarse entre las secciones disponibles según el estado de la sesión.
- [**Portada**](./portada.md) — Pantalla de acceso con la identidad del sistema y el formulario de login.

## Inventario

- [**Consulta de inventario**](./consultainventario.md) — Permite ver los lotes de producto que están en el local, con su condición y fecha de vencimiento.

## Vencimientos y rótulos

- [**Generador de rótulos**](./generadorrotulos.md) — Permite elegir productos y sus condiciones de conservación para preparar las etiquetas de vencimiento.
- [**Selección de condición**](./seleccioncondicion.md) — Permite elegir, para cada método de conservación, la condición de vencimiento aplicable (ej. bolsa cerrada o abierta).
- [**Fecha de elaboración con preview**](./previewfecha.md) — Permite cargar la fecha de elaboración y ver al instante la fecha de vencimiento resultante.
- [**Carrito de rótulos**](./carritorotulos.md) — Permite acumular los rótulos seleccionados, revisarlos y quitar los que ya no se necesiten.

## Cálculo de vencimientos

- [**Cálculo automático del vencimiento**](./calculovencimiento.md) — Calcula la fecha de vencimiento de un producto a partir de su condición (horas, días, meses, años, fin del día o fecha de proveedor).

## Productos, ventas y desperdicios

- [**Consulta de productos**](./consultaproductos.md) — Permite ver el catálogo de productos de la franquicia con sus reglas de vencimiento por estado.
- [**Búsqueda de productos**](./busquedaproductos.md) — Permite filtrar el catálogo de productos por nombre y limpiar el filtro para ver todo de nuevo.
- [**Consulta de ventas**](./consultaventas.md) — Permite ver el registro de ventas realizadas.
- [**Consulta de desperdicios**](./consultadesperdicios.md) — Permite ver el registro de productos desechados y sus motivos.
- [**Gestión de datos (admin)**](./administrador.md) — Permite crear, editar y borrar productos, ventas, desperdicios, tipos y condiciones desde el panel de administración de Django.

## Reportes y métricas

- [**Métricas por producto**](./metricas.md) — Calcula por cada producto su rendimiento, ingresos, costos y ganancia en función de ventas y desperdicios.
