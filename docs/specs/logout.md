# Logout

Funcionalidad que **permite cerrar la sesión y volver a la portada** en **¿Cuándo Vence?**. Es la tercera funcionalidad listada en [`funcionalidades.md`](./funcionalidades.md).

> Casos de uso: [`docs/requerimientos/implementados/logoutCDS.md`](../requerimientos/implementados/logoutCDS.md)

---

## Qué hace

- Expone un botón **Salir (usuario)** en el Navbar para los usuarios con sesión iniciada.
- Al presionarlo, elimina la sesión guardada en el navegador (`localStorage["auth"]`) y anula al usuario en el estado de la aplicación.
- Redirige al usuario a la portada (`/`), donde vuelve a aparecer el formulario de login.
- La operación es local e inmediata: no hay llamada al backend y el token no se invalida en el servidor.

## Experiencia de usuario

1. Con la sesión iniciada, el usuario ve en el Navbar el botón **Salir (usuario)** (donde *usuario* es el nombre de la cuenta, p. ej. `Salir (admin)`).
2. Presiona **Salir (usuario)**.
3. La aplicación redirige instantáneamente a la portada `/`: el formulario de acceso vuelve a estar disponible y el menú del Navbar pasa a mostrar solo *Acceder*.
4. Si el usuario recarga la página ahora, no hay sesión guardada: las rutas protegidas lo redirigen a la portada.

No hay confirmación previa ni mensaje de éxito: la salida es inmediata.

---

## Cómo lo hace (implementación)

### Frontend (React + Vite)

| Parte | Archivo | Rol |
|---|---|---|
| Botón de salida | `src/frontend/src/components/Navbar.jsx` | Renderiza `<button onClick={logout}>Salir ({user.username})</button>` cuando hay sesión |
| Lógica de logout | `src/frontend/src/context/AuthContext.jsx` | `logout()` hace `localStorage.removeItem("auth")`, `setToken(null)` y `setUser(null)` |
| Redirección | `src/frontend/src/components/ProtectedRoute.jsx` | Al quedar `user=null`, re-renderiza y hace `<Navigate to="/" replace />` |
| Rutas | `src/frontend/src/App.jsx` | `/` es pública; las rutas protegidas están envueltas en `ProtectedRoute` |

### Flujo paso a paso

1. El usuario presiona **Salir (usuario)** en el Navbar.
2. Se ejecuta `AuthContext.logout()`:
   - `localStorage.removeItem("auth")` → borra la sesión persistida.
   - `setToken(null)` y `setUser(null)` → anula el estado global.
3. React re-renderiza la app: `ProtectedRoute` (que envuelve `/inventario` y `/rotulos`) ve `user=null` y emite `<Navigate to="/" replace />`.
4. El Navbar actualiza el menú: con `user=null` muestra únicamente *Acceder*.
5. La portada vuelve a mostrar el formulario de login.

### Nota sobre el backend

- **No hay endpoint de logout** en Django/DRF: la liberación es 100% del lado del cliente.
- El token (`rest_framework.authtoken`) **sigue siendo válido** en el backend después del logout; si se reutilizara (p. ej. desde otra pestaña que conservó el token), el servidor lo aceptaría.
- La sesión de Django/admin no interviene (la API usa solo Token + Basic authentication).

---

## Validaciones y casos límite

| Situación | Comportamiento |
|---|---|
| Usuario con sesión activa presiona Salir | Sesión borrada; redirección a la portada; formulario de login visible |
| Sin sesión iniciada | El botón **Salir** no existe en el Navbar (se muestra *Acceder*) |
| El token queda vigente en el backend | Sin efecto visible para el usuario; solo es relevante si el token se reutiliza externamente |
| Recarga tras logout | `localStorage` vacío → rutas protegidas redirigen a la portada |

---

## Limitaciones conocidas

- No hay confirmación ni doble clic; la salida es inmediata.
- No se invalida el token en el backend (un token robado o conservado seguiría siendo válido).
- No hay mensaje de éxito tras la salida.

---

Volver a [`funcionalidades.md`](./funcionalidades.md).