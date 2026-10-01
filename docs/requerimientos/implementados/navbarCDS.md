# Menú principal (Navbar) — Casos de uso

Requerimientos de la funcionalidad **Menú principal (Navbar)** de **¿Cuándo Vence?**, expresados como casos de uso en formato UML detallado.

> Volver a [`funcionalidades.md`](../specs/funcionalidades.md) · Especificación técnica: [`specs/navbar.md`](../specs/navbar.md)

---

## Tabla de casos de uso

| ID | Caso de uso | Actor principal | Disparador | Resultado |
|----|-------------|-----------------|------------|-----------|
| UC-01 | Navegar con sesión iniciada | Usuario autenticado | Pulsa *Inventario* o *Rótulos* en el Navbar | Navega a la sección correspondiente |
| UC-02 | Navegar sin sesión iniciada | Usuario no autenticado | Pulsa *Inicio* o *Acceder* | Va a la portada `/` |
| UC-03 | Salir de sesión desde el menú | Usuario autenticado | Pulsa **Salir (usuario)** | Cierra sesión y vuelve a la portada |

---

## UC-01 — Navegar con sesión iniciada

**Actor principal:** Usuario autenticado.
**Actor secundario:** Sistema (SPA React + React Router).
**Objetivo:** Desplazarse entre las secciones internas desde el menú.
**Disparador:** El usuario pulsa *Inventario* o *Rótulos* en el Navbar.

### Precondiciones

1. El usuario tiene sesión iniciada (`user` no nulo).
2. El Navbar muestra el menú completo.

### Flujo principal (éxito)

1. El usuario pulsa *Inventario* o *Rótulos* en el Navbar.
2. React Router navega a `/inventario` o `/rotulos` sin recargar la página.
3. `ProtectedRoute` verifica la sesión y renderiza la pantalla interna.
4. El caso de uso termina con éxito: el usuario está en la sección elegida.

**Postcondiciones (éxito):** el usuario ve la pantalla interna correspondiente.

### Flujos alternativos

**FE-1 — Pulsar *Inicio* con sesión** *(en el paso 1)*
- 1a. Si el usuario pulsa *Inicio* (logo o enlace), navega a `/` (portada), donde se muestran los atajos *Ir al Inventario* y *Crear Rótulos* (no el formulario de login).

---

## UC-02 — Navegar sin sesión iniciada

**Actor principal:** Usuario no autenticado.
**Actor secundario:** Sistema (SPA React + React Router).
**Objetivo:** Acceder a la portada para iniciar sesión.
**Disparador:** El usuario pulsa *Inicio* o *Acceder* sin tener sesión.

### Precondiciones

1. `user` es nulo.
2. El Navbar muestra el menú reducido (Inicio, Acceder).

### Flujo principal (éxito)

1. El usuario pulsa *Inicio* o *Acceder*.
2. React Router navega a `/`.
3. La portada muestra el formulario de login.
4. El caso de uso termina con éxito.

**Postcondiciones (éxito):** el usuario está en la portada y puede iniciar sesión.

### Flujos alternativos

- No aplican: sin sesión, el Navbar solo ofrece la portada.

---

## UC-03 — Salir de sesión desde el menú

**Actor principal:** Usuario autenticado.
**Actor secundario:** Sistema (SPA React + `localStorage`).
**Objetivo:** Cerrar la sesión desde la barra de navegación.
**Disparador:** El usuario pulsa el botón **Salir (usuario)** en el Navbar.

### Precondiciones

1. El usuario tiene sesión iniciada.
2. El Navbar muestra el botón **Salir (usuario)**.

### Flujo principal (éxito)

1. El usuario pulsa **Salir (usuario)**.
2. Se ejecuta `AuthContext.logout()`: borra `localStorage["auth"]`, anula `token` y `user`.
3. `ProtectedRoute` redirige a la portada `/`.
4. El Navbar pasa a mostrar el menú reducido (Inicio, Acceder).
5. El caso de uso termina con éxito: sesión cerrada y usuario en la portada.

**Postcondiciones (éxito):** sin sesión en la SPA; formulario de login visible en la portada.

### Flujos alternativos / excepción

- No hay confirmación previa: la salida es inmediata. El token del backend sigue válido (no hay endpoint de logout).

---

Volver a [`funcionalidades.md`](../specs/funcionalidades.md).