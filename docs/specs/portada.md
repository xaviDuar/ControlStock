# Portada (v2)

Funcionalidad que **muestra la pantalla de acceso con la identidad del sistema y el formulario de login** en **¿Cuándo Vence?**. Es la sexta funcionalidad listada en [`0000-index.md`](./0000-index.md).

---

## Qué hace

- Es la pantalla inicial (`/`) y el punto de entrada de la aplicación.
- Muestra la identidad de **¿Cuándo Vence?**: el logo, el título *¿CUÁNDO VENCE?*, el subtítulo *Control de vencimientos de productos perecederos* y una línea decorativa que los separa del contenido.
- Sin sesión iniciada, presenta el formulario de acceso ([`login.md`](./login.md)).
- Con sesión iniciada, la portada redirige a `/home` (el Home, ver requerimiento REQ-HOME-01) en lugar de mostrar el formulario.
- Es pública y funciona como destino de las redirecciones: cuando una ruta protegida se pide sin sesión ([`rutasprotegidas.md`](./rutasprotegidas.md)) y al cerrar sesión ([`logout.md`](./logout.md)).

## Experiencia de usuario

1. Al entrar a `/`, el usuario ve el logo, el título, el subtítulo y la línea decorativa.
2. **Sin sesión**: debajo se muestra el formulario de acceso (campos **Usuario** y **Contraseña** y el botón **Acceder**). El Navbar no aparece.
3. **Con sesión**: la portada redirige a `/home` (el Home, ver requerimiento REQ-HOME-01); el Navbar aparece arriba con el menú completo ([`navbar.md`](./navbar.md)).
4. Cualquier redirección por sesión faltante (rutas protegidas, logout) termina en esta pantalla.

---

## Cómo lo hace (implementación)

### Frontend (React + Vite)

| Parte | Archivo | Rol |
|---|---|---|
| Pantalla | `src/frontend/src/pages/PortadaPage.jsx` | Renderiza el bloque `hero` de la portada en la ruta `/` |
| Identidad | `src/frontend/src/pages/PortadaPage.jsx` + `src/frontend/src/assets/logo.png` | `<img>` del logo (alt *"¿Cuándo Vence?"*), `<h1>¿CUÁNDO VENCE?</h1>`, subtítulo `hero-sub` y la línea `pixel-line` |
| Contenido según sesión | `src/frontend/src/pages/PortadaPage.jsx` | Con `useAuth()`: si `user` existe renderiza `<Navigate to="/home" replace />`; si no, el formulario de login |
| Ruta | `src/frontend/src/App.jsx` | `<Route path="/" element={<PortadaPage />} />`, sin `ProtectedRoute` |
| Chrome de página | `src/frontend/src/App.jsx` | `Navbar` arriba y `Footer` abajo envuelven el contenido; el Navbar se oculta sin sesión (`Navbar.jsx` devuelve `null` si no hay `user`) |
| Estilos | `src/frontend/src/index.css` | Clases `hero`, `hero-logo`, `hero-sub`, `pixel-line`, `login-form`, `card` |
| Servirla en producción | `src/backend/controlStock/views.py` (`spa`) + `src/backend/controlStock/urls.py` | El catch-all devuelve el `index.html` del build de Vite para cualquier ruta que no sea `/api/`, `/admin/` ni `/assets/` |

### Flujo paso a paso

1. El usuario abre `/` (o llega redirigido desde una ruta protegida o tras el logout); en producción Django sirve `index.html` vía el catch-all SPA y se monta `App`.
2. `App` renderiza `Navbar`, el `main` con las rutas y `Footer`.
3. `PortadaPage` consulta el contexto de autenticación (`useAuth()`):
   - `user = null` → identidad + `login-form` con el formulario de acceso (ver [`login.md`](./login.md)).
   - `user` presente → renderiza `<Navigate to="/home" replace />` y el usuario termina en el Home (ver requerimiento REQ-HOME-01).
4. El Navbar, montado por encima, decide su propia visibilidad: sin sesión no se renderiza; con sesión muestra el menú.

### Nota sobre el backend

- No hay endpoint propio de la portada: la ruta `/` la resuelve Django como parte del catch-all SPA (`views.spa`) sirviendo el build estático de Vite; toda la lógica de la pantalla es del frontend.

---

## Validaciones y casos límite

| Situación | Comportamiento |
|---|---|
| Usuario sin sesión | Se muestra el formulario de acceso; el Navbar no se renderiza |
| Usuario con sesión | Redirige a `/home` sin mostrar atajos (ver requerimiento REQ-HOME-01); el Navbar aparece con el menú completo |
| Recarga de la portada | El catch-all de Django vuelve a servir `index.html`; si hay sesión guardada se restaura (ver [`sesionpersistente.md`](./sesionpersistente.md)) |
| Llegada desde una ruta protegida sin sesión | La portada recibe al usuario con el formulario de acceso (ver [`rutasprotegidas.md`](./rutasprotegidas.md)) |
| Llegada tras cerrar sesión | Vuelve a mostrarse el formulario de acceso (ver [`logout.md`](./logout.md)) |
| Login exitoso desde la portada | `PortadaPage` ejecuta `navigate('/home')` y el usuario llega al Home; la portada queda atrás |

---

## Limitaciones conocidas

- La portada no muestra mensajes contextuales (p. ej. *"sesión cerrada"* o *"debes iniciar sesión"*): las redirecciones llegan en silencio.
- Pantalla de acceso y portada son el mismo componente (`PortadaPage.jsx`): no existe una ruta `/login` propia.
- La portada con sesión redirige siempre a `/home`, venga de donde venga (login directo, recarga o redirección).

---

Volver a [`0000-index.md`](./0000-index.md).
