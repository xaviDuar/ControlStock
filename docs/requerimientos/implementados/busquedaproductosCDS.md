# Búsqueda de productos — Casos de uso

Requerimientos de la funcionalidad **Búsqueda de productos** de **¿Cuándo Vence?**, expresados como casos de uso en formato UML detallado.

> Volver a [`funcionalidades.md`](../specs/funcionalidades.md) · Especificación técnica: [`specs/busquedaproductos.md`](../specs/busquedaproductos.md)

---

## Tabla de casos de uso

| ID | Caso de uso | Actor principal | Disparador | Resultado |
|----|-------------|-----------------|------------|-----------|
| UC-01 | Buscar productos por nombre | Usuario autenticado | Escribe en la barra de búsqueda | La lista se filtra por nombre |
| UC-02 | Buscar sin resultados | Usuario autenticado | Escribe un texto sin coincidencias | Ve el aviso de "no encontrado" |
| UC-03 | Limpiar el filtro | Usuario autenticado | Pulsa **Limpiar** o **Ver todos** | Vuelve a ver toda la lista |

---

## UC-01 — Buscar productos por nombre

**Actor principal:** Usuario autenticado.
**Actor secundario:** Sistema (SPA React + API Django/DRF).
**Objetivo:** Filtrar el inventario por nombre de producto.
**Disparador:** El usuario escribe un texto en la barra de búsqueda de `/inventario`.

### Precondiciones

1. El usuario está en `/inventario` con sesión.
2. Existen tipos de producto cargados.

### Flujo principal (éxito)

1. El usuario escribe un texto en el buscador.
2. El sistema actualiza `query` y vuelve a cargar: `GET /api/tipos/?search=<texto>`.
3. El backend filtra por nombre (`SearchFilter` sobre `nombre`) y devuelve los coincidentes.
4. El frontend aplica su filtro cliente (insensible a mayúsculas con `toLowerCase`).
5. La tabla muestra las filas coincidentes y el contador actualizado.
6. El caso de uso termina con éxito.

**Postcondiciones (éxito):** el usuario ve solo los tipos de producto que coinciden con la búsqueda.

### Flujos alternativos

**FE-1 — Backend no disponible** *(en el paso 2-3)*
- 2a. Si la API falla, se muestra la caja de error y no se ve la tabla (ver funcionalidad Consulta de inventario).

---

## UC-02 — Buscar sin resultados

**Actor principal:** Usuario autenticado.
**Actor secundario:** Sistema (SPA React).
**Objetivo:** Informar al usuario cuando ningún producto coincide con la búsqueda.
**Disparador:** El usuario escribe un texto que no coincide con ningún tipo de producto.

### Precondiciones

1. Existe `query` no vacío.
2. Ningún tipo de producto coincide (ni en backend ni en el filtro cliente).

### Flujo principal (éxito)

1. El usuario escribe un texto sin coincidencias.
2. La API responde sin resultados (o el filtro cliente los descarta).
3. La página muestra la tarjeta: *"No se encontraron productos para '<texto>'"* con el botón **Ver todos**.
4. El caso de uso termina con éxito.

**Postcondiciones (éxito):** el usuario sabe que no hay coincidencias y puede ver todos.

### Flujos alternativos

- No aplican; el botón **Ver todos** continúa en UC-03.

---

## UC-03 — Limpiar el filtro

**Actor principal:** Usuario autenticado.
**Actor secundario:** Sistema (SPA React).
**Objetivo:** Restablecer la vista completa del inventario.
**Disparador:** El usuario pulsa **Limpiar** (si hay texto) o **Ver todos** (en el aviso de sin resultados).

### Precondiciones

1. `query` no vacío (filtro activo).

### Flujo principal (éxito)

1. El usuario pulsa **Limpiar** o **Ver todos**.
2. El sistema ejecuta `setQuery('')`: el input queda vacío y se recarga `fetchTipos('')`.
3. La API devuelve toda la lista de tipos de producto.
4. La tabla muestra el inventario completo con su contador.
5. El caso de uso termina con éxito.

**Postcondiciones (éxito):** el buscador está vacío y la lista completa es visible.

### Flujos alternativos

- No aplican; el filtro desaparece y se restaura la vista completa.

---

Volver a [`funcionalidades.md`](../specs/funcionalidades.md).