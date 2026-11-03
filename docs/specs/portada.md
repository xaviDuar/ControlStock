# Portada

Funcionalidad que **muestra la pantalla de acceso con la identidad del sistema y el formulario de login** en **¿Cuándo Vence?**. Es la sexta funcionalidad listada en [`funcionalidades.md`](./funcionalidades.md).

---

## Qué hace

- Es la pantalla inicial (`/`) y el punto de entrada de la aplicación.
- Muestra la identidad de **¿Cuándo Vence?**: el logo, el título *¿CUÁNDO VENCE?*, el subtítulo *Control de vencimientos de productos perecederos* y una línea decorativa que los separa del contenido.
- Sin sesión iniciada, presenta el formulario de acceso ([`login.md`](./login.md)).
- Con sesión iniciada, reemplaza el formulario por dos accesos directos: **Ir al Inventario** y **Crear Rótulos**.
- Es pública y funciona como destino de las redirecciones: cuando una ruta protegida se pide sin sesión ([`rutasprotegidas.md`](./rutasprotegidas.md)) y al cerrar sesión ([`logout.md`](./logout.md)).

## Experiencia de usuario

1. Al entrar a `/`, el usuario ve el logo, el título, el subtítulo y la línea decorativa.
2. **Sin sesión**: debajo se muestra el formulario de acceso (campos **Usuario** y **Contraseña** y el botón **Acceder**). El Navbar no aparece.
3. **Con sesión**: el formulario se reemplaza por los botones **Ir al Inventario** y **Crear Rótulos**; el Navbar aparece arriba con el menú completo ([`navbar.md`](./navbar.md)).
4. Presionar **Ir al Inventario** lleva a `/inventario`; **Crear Rótulos** lleva a `/rotulos`.
5. Cualquier redirección por sesión faltante (rutas protegidas, logout) termina en esta pantalla.

---

## Cómo lo hace (implementación)

### Frontend (React + Vite)

| Parte | Archivo | Rol |
|---|---|---|
| Pantalla | `src/frontend/src/pages/HomePage.jsx` | Renderiza el bloque `hero` de la portada en la ruta `/` |
| Identidad | `src/frontend/src/pages/HomePage.jsx` + `src/frontend/src/assets/logo.png` | `<img>` del logo (alt *"¿Cuándo Vence?"*), `<h1>¿CUÁNDO VENCE?</h1>`, subtítulo `hero-sub` y la línea `pixel-line` |
| Contenido según sesión | `src/frontend/src/pages/HomePage.jsx` | Con `useAuth()`: si `user` existe muestra los accesos directos; si no, el formulario de login |
| Accesos directos | `src/frontend/src/pages/HomePage.jsx` | Botones **Ir al Inventario** y **Crear Rótulos** → `navigate('/inventario')` / `navigate('/rotulos')` con `useNavigate` |
| Ruta | `src/frontend/src/App.jsx` | `<Route path="/" element={<HomePage />} />`, sin `ProtectedRoute` |
| Chrome de página | `src/frontend/src/App.jsx` | `Navbar` arriba y `Footer` abajo envuelven el contenido; el Navbar se oculta sin sesión (`Navbar.jsx` devuelve `null` si no hay `user`) |
| Estilos | `src/frontend/src/index.css` | Clases `hero`, `hero-logo`, `hero-sub`, `pixel-line`, `login-form`, `card`, `btn`, `btn-secondary` |
| Servirla en producción | `src/backend/controlStock/views.py` (`spa`) + `src/backend/controlStock/urls.py` | El catch-all devuelve el `index.html` del build de Vite para cualquier ruta que no sea `/api/`, `/admin/` ni `/assets/` |

### Flujo paso a paso

1. El usuario abre `/` (o llega redirigido desde una ruta protegida o tras el logout); en producción Django sirve `index.html` vía el catch-all SPA y se monta `App`.
2. `App` renderiza `Navbar`, el `main` con las rutas y `Footer`.
3. `HomePage` consulta el contexto de autenticación (`useAuth()`):
   - `user = null` → identidad + `login-form` con el formulario de acceso (ver [`login.md`](./login.md)).
   - `user` presente → identidad + botones **Ir al Inventario** y **Crear Rótulos**.
4. El Navbar, montado por encima, decide su propia visibilidad: sin sesión no se renderiza; con sesión muestra el menú.

### Nota sobre el backend

- No hay endpoint propio de la portada: la ruta `/` la resuelve Django como parte del catch-all SPA (`views.spa`) sirviendo el build estático de Vite; toda la lógica de la pantalla es del frontend.

---

## Validaciones y casos límite

| Situación | Comportamiento |
|---|---|
| Usuario sin sesión | Se muestra el formulario de acceso; el Navbar no se renderiza |
| Usuario con sesión | El formulario se reemplaza por **Ir al Inventario** y **Crear Rótulos**; el Navbar aparece con el menú completo |
| Recarga de la portada | El catch-all de Django vuelve a servir `index.html`; si hay sesión guardada se restaura (ver [`sesionpersistente.md`](./sesionpersistente.md)) |
| Llegada desde una ruta protegida sin sesión | La portada recibe al usuario con el formulario de acceso (ver [`rutasprotegidas.md`](./rutasprotegidas.md)) |
| Llegada tras cerrar sesión | Vuelve a mostrarse el formulario de acceso (ver [`logout.md`](./logout.md)) |
| Login exitoso desde la portada | `HomePage` navega a `/inventario`; la portada queda atrás con los accesos directos para cuando se vuelva (`/`) |

---

## Limitaciones conocidas

- La portada no muestra mensajes contextuales (p. ej. *"sesión cerrada"* o *"debes iniciar sesión"*): las redirecciones llegan en silencio.
- Pantalla de acceso y portada son el mismo componente (`HomePage.jsx`): no existe una ruta `/login` propia.
- Los accesos directos del estado con sesión son solo **Ir al Inventario** y **Crear Rótulos**; no incluyen **Productos** (`/rotulos` y `/inventario` sí), aunque la ruta `/productos` existe.
- El estado con sesión de la portada se ve igual venga de donde venga (login directo, recarga o redirección).

---

Volver a [`funcionalidades.md`](./funcionalidades.md).
