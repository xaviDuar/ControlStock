# Consulta de inventario — Casos de uso

Requerimientos de la funcionalidad **Consulta de inventario** de **¿Cuándo Vence?**, expresados como casos de uso en formato UML detallado.

> Volver a [`funcionalidades.md`](../specs/funcionalidades.md) · Especificación técnica: [`specs/consultainventario.md`](../specs/consultainventario.md)

---

## Tabla de casos de uso

| ID | Caso de uso | Actor principal | Disparador | Resultado |
|----|-------------|-----------------|------------|-----------|
| UC-01 | Ver la lista de tipos de producto | Usuario autenticado | Entra a `/inventario` | Ve la tabla de tipos con ubicaciones y observaciones |
| UC-02 | Manejar error de carga del inventario | Usuario autenticado | La API falla o rechaza la petición | Ve el mensaje de error en la pantalla |

---

## UC-01 — Ver la lista de tipos de producto

**Actor principal:** Usuario autenticado.
**Actor secundario:** Sistema (SPA React + API Django/DRF).
**Objetivo:** Visualizar la lista completa de tipos de producto con sus ubicaciones y observaciones.
**Disparador:** El usuario entra a `/inventario` con sesión.

### Precondiciones

1. El usuario tiene sesión iniciada (token válido).
2. El backend está disponible y responde `GET /api/tipos/`.

### Flujo principal (éxito)

1. El usuario entra a `/inventario`.
2. La página muestra el título **Inventario**, la barra de búsqueda y el indicador "Cargando...".
3. El sistema llama a `GET /api/tipos/` con `Authorization: Token <token>`.
4. El backend valida el token (`IsAuthenticated`) y responde la lista de tipos de producto (JSON).
5. La página renderiza una fila por tipo de producto con columnas: **Producto**, **Refrigerado**, **Congelado**, **Bodega**, **Toppinera** y **Obs.**.
6. Al pie se muestra el contador de resultados (p. ej. "3 tipo(s) de producto").
7. El caso de uso termina con éxito.

**Postcondiciones (éxito):** el usuario ve el inventario completo con sus observaciones.

### Flujos alternativos

**FE-1 — Filtro de búsqueda activo** *(en el paso 5)*
- 5a. Si el usuario escribió en el buscador, la tabla muestra solo los tipos cuyo nombre coincida (sin resultados → tarjeta *"No se encontraron productos para..."* con botón **Ver todos**).
- (Se detalla en la funcionalidad **Búsqueda de productos**.)

**FE-2 — Observaciones vacías** *(en el paso 5)*
- 5a. Si un tipo no tiene observaciones, la columna **Obs.** muestra `—`.

---

## UC-02 — Manejar error de carga del inventario

**Actor principal:** Usuario autenticado.
**Actor secundario:** Sistema (SPA React + API).
**Objetivo:** Informar al usuario cuando no se puede cargar el inventario.
**Disparador:** La llamada a `GET /api/tipos/` falla (red, servidor o token inválido).

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

Volver a [`funcionalidades.md`](../specs/funcionalidades.md).