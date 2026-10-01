# Sesión persistente

Funcionalidad que **mantiene al usuario identificado aunque recargue la página** y **lo libera al salir** en **¿Cuándo Vence?**. Es la segunda funcionalidad listada en [`funcionalidades.md`](./funcionalidades.md).

> Casos de uso: [`docs/requerimientos/implementados/sesionpersistenteCDS.md`](../requerimientos/implementados/sesionpersistenteCDS.md)

---

## Qué hace

- Restaura la sesión del usuario automáticamente al cargar o recargar la aplicación: no hace falta volver a iniciar sesión si ya se inició antes.
- Mientras restaura la sesión, las rutas protegidas no renderizan contenido (evita un "parpadeo" o una redirección equivocada).
- Si no hay sesión guardada, las rutas protegidas redirigen a la portada.
- Al salir (logout), la sesión guardada se elimina y el usuario vuelve a la portada.

## Experiencia de usuario

1. El usuario inicia sesión y navega a `/inventario` (o `/rotulos`).
2. Recarga la página (F5, o refresh del navegador): la URL se vuelve a pedir al servidor (Django la resuelve con el catch-all SPA) y la SPA se monta de nuevo.
3. Al montarse, la aplicación detecta la sesión guardada y restaura al usuario: sigue logueado, el menú del Navbar muestra *Inventario*, *Rótulos* y **Salir (usuario)**, y puede seguir navegando sin volver a escribir usuario y contraseña.
4. Si en cambio el usuario estaba sin sesión (o cerró sesión) y recarga una ruta protegida, la aplicación lo redirige a la portada `/`.
5. Al presionar **Salir (usuario)**, la sesión se libera: vuelve a la portada y el formulario de login vuelve a estar disponible.

No hay mensaje visual de "restaurando sesión": el proceso es transparente y casi instantáneo.

---

## Cómo lo hace (implementación)

### Frontend (React + Vite)

| Parte | Archivo | Rol |
|---|---|---|
| Hidratación de la sesión | `src/frontend/src/context/AuthContext.jsx` | En el `useEffect` inicial lee `localStorage["auth"]`, restaura `token` y `user`, y pone `loading=false` |
| Guard de rutas | `src/frontend/src/components/ProtectedRoute.jsx` | Devuelve `null` mientras `loading=true`; si no hay `user` hace `<Navigate to="/" replace />`; si hay sesión, renderiza la ruta |
| Persistencia al loguear | `src/frontend/src/context/AuthContext.jsx` | `login()` guarda `{token, user}` en `localStorage["auth"]` |
| Liberación al salir | `src/frontend/src/context/AuthContext.jsx` | `logout()` hace `localStorage.removeItem("auth")` y anula `token`/`user` |
| Servir la ruta al recargar | `src/backend/controlStock/views.py` (`spa`) + `urls.py` (catch-all `re_path`) | Devuelve `index.html` del build de Vite para cualquier ruta que no sea `/api/`, `/admin/` ni `/assets/` |

### Clave de almacenamiento

- **`localStorage["auth"]`** con valor JSON: `{"token": "<key DRF>", "user": {"username": "<nombre>"}}`.
- El token es el mismo de `rest_framework.authtoken`, **permanente** (no expira). No hay refresh token ni expiración.
- No se usa `sessionStorage`.

### Flujo paso a paso (recarga de la página)

1. El navegador pide la URL (p. ej. `/inventario`); en producción Django la sirve con `index.html` vía el catch-all de `urls.py`.
2. `main.jsx` monta `<App/>` con `<AuthProvider>`.
3. `AuthProvider` ejecuta su `useEffect` (una sola vez, `[]`):
   - Lee `localStorage.getItem("auth")`.
   - Si existe, hace `JSON.parse` y `setToken(parsed.token)` / `setUser(parsed.user)`.
   - En todos los casos hace `setLoading(false)`.
4. `ProtectedRoute`:
   - Mientras `loading=true` → devuelve `null` (no renderiza nada).
   - Cuando `loading=false`:
     - `user` restaurado → renderiza `children` (acceso concedido).
     - `user` nulo → `<Navigate to="/" replace />` (redirección a la portada).
5. Los requests a `/api/...` toman el token de `localStorage["auth"]` en `src/frontend/src/api/client.js` y agregan `Authorization: Token <token>`.

### Liberación al salir

1. El usuario presiona **Salir (usuario)** en `Navbar.jsx`.
2. `AuthContext.logout()` borra `localStorage["auth"]` y anula `token`/`user`.
3. `ProtectedRoute` re-renderiza con `user=null` → redirección a `/`.
4. La portada muestra nuevamente el formulario de login.

---

## Validaciones y casos límite

| Situación | Comportamiento |
|---|---|
| `localStorage["auth"]` no existe | `user=null`; rutas protegidas redirigen a `/` |
| Sesión guardada con token válido | Se restaura y el acceso a la API funciona |
| Token borrado/inválido en el backend | La UI restaura la sesión igual (no se valida contra el servidor al arrancar); el primer request a la API responde 401 y la página muestra el error de DRF |
| `localStorage["auth"]` con JSON corrupto | `JSON.parse` lanza excepción en el `useEffect` (no está envuelto en `try/catch`) → el arranque puede fallar; sesión no restaurada |
| Logout | La sesión guardada se elimina y el usuario queda sin identificar en la SPA (el token en el backend sigue válido) |

---

## Limitaciones conocidas

- El token no se valida contra el servidor al cargar la SPA (el endpoint `GET /api/auth/me/` existe en el backend pero el frontend no lo consume).
- `JSON.parse` de `localStorage["auth"]` no está protegido contra datos corruptos.
- No hay expiración de sesión por tiempo ni renovación de token.
- El logout no invalida el token en el backend.

---

Volver a [`funcionalidades.md`](./funcionalidades.md).