# Logout — Casos de uso

Requerimientos de la funcionalidad **Logout** de **¿Cuándo Vence?**, expresados como casos de uso en formato UML detallado.

> Volver a [`funcionalidades.md`](../specs/funcionalidades.md) · Especificación técnica: [`specs/logout.md`](../specs/logout.md)

---

## Tabla de casos de uso

| ID | Caso de uso | Actor principal | Disparador | Resultado |
|----|-------------|-----------------|------------|-----------|
| UC-01 | Cerrar sesión | Usuario autenticado | Presiona **Salir (usuario)** en el Navbar | Sesión eliminada y vuelta a la portada |

---

## UC-01 — Cerrar sesión

**Actor principal:** Usuario autenticado.
**Actor secundario:** Sistema (SPA React + `localStorage`).
**Objetivo:** Cerrar la sesión del usuario en la aplicación y volver a la portada.
**Disparador:** El usuario presiona el botón **Salir (usuario)** en el Navbar.

### Precondiciones

1. El usuario tiene una sesión iniciada (`localStorage["auth"]` presente y `user` no nulo en la SPA).
2. El Navbar muestra el botón **Salir (usuario)**.

### Flujo principal (éxito)

1. El usuario presiona **Salir (usuario)** en el Navbar.
2. El sistema ejecuta `AuthContext.logout()`.
3. El sistema elimina `localStorage["auth"]` y anula `token` y `user` en el estado global.
4. `ProtectedRoute` re-renderiza con `user=null` y redirige a la portada `/` mediante `<Navigate to="/" replace />`.
5. El Navbar pasa a mostrar solo el enlace *Acceder* (sin menú de sesión iniciada).
6. La portada muestra nuevamente el formulario de login.
7. El caso de uso termina con éxito: el usuario quedó sin sesión en la SPA.

**Postcondiciones (éxito):**
- No queda ninguna sesión guardada en `localStorage`.
- El usuario se encuentra en la portada y puede iniciar sesión de nuevo.
- Las rutas protegidas dejan de ser accesibles para esta sesión de navegación.

### Flujos alternativos

**FE-1 — Usuario sin sesión intenta salir** *(antes del paso 1)*
- 1a. Si no hay usuario identificado, el Navbar no muestra el botón **Salir** (solo *Acceder*): no existe forma de ejecutar el logout.
- El caso de uso no se dispara; el sistema se comporta como siempre (portada con formulario de login).

**FE-2 — Recarga de la página tras salir** *(después del paso 6)*
- 6a. Al recargar, `AuthProvider` no encuentra `localStorage["auth"]`: `user` queda nulo.
- 6b. Las rutas protegidas redirigen a la portada; el usuario sigue sin sesión.
- El caso de uso se considera cumplido: la salida fue efectiva.

### Flujos de excepción

**EX-1 — Token aún válido en el backend**
- El backend no tiene endpoint de logout: el token `rest_framework.authtoken` sigue siendo válido en el servidor tras la salida.
- 1a. Si ese token se reutiliza (p. ej. desde otra pestaña que no cerró sesión, o por un atacante), la API lo acepta y responde normalmente.
- 1b. No hay ninguna advertencia visible para el usuario en la SPA; la liberación es solo del lado del cliente.

### Postcondiciones (en general)

- **Éxito:** sesión liberada en la SPA y redirección a la portada.
- **Fallo:** no aplica en el flujo normal; la salida es local e inmediata y no depende del estado de la red.

---

Volver a [`funcionalidades.md`](../specs/funcionalidades.md).