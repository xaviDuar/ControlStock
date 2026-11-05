# Logout

Funcionalidad que **permite cerrar la sesión y volver a la portada** en **¿Cuándo Vence?**. Es la tercera funcionalidad listada en [`0000-index.md`](./0000-index.md).

---

## Qué hace

- Expone el botón **Salir (usuario)** en el Navbar (donde *usuario* es el nombre de la cuenta, p. ej. **Salir (admin)**).
- Al presionarlo, libera la sesión: anula el token y el usuario en el estado de la aplicación y borra la sesión guardada en el navegador (`localStorage["auth"]`).
- Como el Navbar solo se renderiza cuando hay sesión, al salir la barra de navegación **desaparece por completo** (no queda ningún menú).
- Si el usuario estaba en una ruta protegida (`/inventario`, `/rotulos`, `/productos`), la aplicación lo redirige a la portada `/`, donde vuelve a aparecer el formulario de login.
- La operación es local e inmediata: no hay llamada al backend y el token no se invalida en el servidor. No hay confirmación previa ni mensaje de éxito.

## Experiencia de usuario

1. Con sesión iniciada, el usuario ve el Navbar con *Inicio*, *Inventario*, *Rótulos*, *Productos* y el botón **Salir (usuario)**.
2. Presiona **Salir (usuario)**.
3. La barra de navegación desaparece y la aplicación vuelve a la portada `/`: el formulario de acceso ocupa el lugar de los accesos directos.
4. Si ahora recarga la página, no hay sesión guardada: las rutas protegidas lo redirigen a la portada.

No hay confirmación previa ni mensaje de éxito: la salida es inmediata.

---

## Cómo lo hace (implementación)

### Frontend (React + Vite)

| Parte | Archivo | Rol |
|---|---|---|
| Botón de salida | `src/frontend/src/components/Navbar.jsx` | Renderiza `<button onClick={logout}>Salir ({user.username})</button>` en el menú; el Navbar completo solo se renderiza si hay `user` (si no, devuelve `null`) |
| Lógica de logout | `src/frontend/src/context/AuthContext.jsx` | `logout()` hace `setToken(null)`, `setUser(null)` y `localStorage.removeItem("auth")` |
| Redirección | `src/frontend/src/components/ProtectedRoute.jsx` | Al quedar `user=null`, devuelve `<Navigate to="/" replace />` en las rutas protegidas |
| Rutas | `src/frontend/src/App.jsx` | `/inventario`, `/rotulos` y `/productos` están envueltas en `ProtectedRoute`; `/` es pública |

### Flujo paso a paso

1. El usuario presiona **Salir (usuario)** en el Navbar (único disparador del logout: no hay otro acceso ni atajo).
2. Se ejecuta `AuthContext.logout()`:
   - `setToken(null)` y `setUser(null)` → anula el estado global de sesión.
   - `localStorage.removeItem("auth")` → borra la sesión persistida.
3. React re-renderiza la aplicación con `user=null`:
   - `Navbar` devuelve `null`: la barra de navegación desaparece.
   - `ProtectedRoute` (que envuelve `/inventario`, `/rotulos` y `/productos`) devuelve `<Navigate to="/" replace />`.
4. En la portada `/`, `HomePage` re-renderiza con `user=null`: el formulario de login reemplaza a los botones **Ir al Inventario** / **Crear Rótulos**.

**Variante:** si el usuario estaba en la portada `/` al presionar **Salir**, no hay redirección (ya está ahí): el formulario reemplaza a los accesos directos y el Navbar desaparece.

### Nota sobre el backend

- **No hay endpoint de logout** en Django/DRF: la liberación es 100% del lado del cliente.
- El token (`rest_framework.authtoken`) **sigue siendo válido** en el backend después del logout; si se reutilizara (p. ej. desde otra pestaña o pestaña cerrada que lo conserve), el servidor lo aceptaría.
- La sesión de Django/admin no interviene: la API usa solo Token + Basic authentication (`SessionAuthentication` está excluido en `src/backend/controlStock/settings.py`).

---

## Validaciones y casos límite

| Situación | Comportamiento |
|---|---|
| Sesión activa en una ruta protegida | **Salir** borra la sesión, oculta el Navbar y redirige a `/` con el formulario de login |
| Sesión activa en la portada | **Salir** borra la sesión sin navegar: el formulario de login reemplaza a los accesos directos |
| Sin sesión iniciada | No existe el Navbar ni el botón **Salir**: el componente devuelve `null` |
| Recarga tras logout | `localStorage` sin `auth` → las rutas protegidas redirigen a la portada |
| Token conservado fuera de la pestaña | Sigue siendo válido para el backend; esta pestaña ya no lo usa (borró `localStorage["auth"]`) |
| Peticiones API en curso al salir | Pierden el token para los próximos requests (`api()` ya no encuentra `localStorage["auth"]`); los requests futuros sin token reciben `401` |

---

## Limitaciones conocidas

- No hay confirmación ni doble clic; la salida es inmediata.
- No se invalida el token en el backend (un token robado o conservado seguiría siendo válido).
- No hay mensaje de éxito ni aviso tras la salida.
- La "vuelta a la portada" no la ejecuta el logout sino `ProtectedRoute`: quien estaba en `/` se queda en `/` (comportamiento deseable, pero sin navegación programática).
- En `Navbar.jsx` existe la rama `user ? … : <li><Link to="/">Acceder</Link></li>`, pero es **código muerto**: el `if (!user) return null` del inicio impide que el link *Acceder* se muestre alguna vez. Sin sesión simplemente no hay barra de navegación.

---

Volver a [`0000-index.md`](./0000-index.md).
