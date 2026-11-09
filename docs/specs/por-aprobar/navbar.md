# Menú principal (Navbar)

> ⚠️ **Cambio acordado (pendiente de implementar):** la pantalla de login (portada **sin sesión iniciada**) **no debe mostrar el Navbar** — ver [REQ-LOGIN-01](../../requerimientos/implementados/REQ-LOGIN-01-portada-acceso.md) RF-1.11. Este spec describe el comportamiento actual (Navbar en todas las rutas).
>
> ⚠️ **Cambio acordado (pendiente de implementar):** el **logo del Navbar** pasa a ser **icono + nombre**: la taza de café pixel-art (`src/frontend/src/assets/logo.png`, mismo asset que la portada) al lado del nombre *¿CUÁNDO VENCE?* (mayúsculas, igual que el título de la portada). El mockup `Navbar` muestra solo el texto en mixto — este es un cambio acordado sobre el mockup.

Funcionalidad que **permite desplazarse entre las secciones disponibles según el estado de la sesión** en **¿Cuándo Vence?**. Es la quinta funcionalidad listada en [`0000-index.md`](../0000-index.md).

---

## Qué hace

- Muestra una barra de navegación fija (sticky) con el logo (icono de taza + nombre **¿CUÁNDO VENCE?** en mayúsculas) y los enlaces de las secciones.
- El menú se adapta al estado de la sesión:
  - **Sin sesión:** *Inicio* y *Acceder* (llevan a la portada `/`).
  - **Con sesión:** *Inicio*, *Inventario*, *Rótulos* y el botón **Salir (usuario)**.
- Permite moverse entre portada, inventario y rótulos, y cerrar sesión directamente desde la barra.

## Experiencia de usuario

1. El usuario ve la barra fija arriba en todas las páginas (portada, inventario y rótulos).
2. Sin haber iniciado sesión: al pulsar *Inicio* o *Acceder* va a la portada `/` (formulario de login).
3. Con sesión iniciada: al pulsar *Inventario* va a `/inventario` y *Rótulos* a `/rotulos`; el botón **Salir (usuario)** cierra la sesión y lo devuelve a la portada.

## Cómo lo hace (implementación)

### Frontend (React + Vite)

| Parte | Archivo | Rol |
|---|---|---|
| Componente | `src/frontend/src/components/Navbar.jsx` | Renderiza la barra; usa `useAuth()` para `user` y `logout` |
| Enlaces | `react-router-dom` `<Link>` | Navegación cliente-side sin recargar la página |
| Estado de sesión | `src/frontend/src/context/AuthContext.jsx` | Provee `user` (para el menú) y `logout` (botón Salir) |
| Ubicación global | `src/frontend/src/App.jsx` | El `<Navbar />` se renderiza fuera de `<Routes>`, por eso está visible en todas las rutas |

### Estructura del menú

- **Logo:** `<Link to="/" className="nav-logo"><img src={logo} /> ¿CUÁNDO VENCE?</Link>` — icono de taza (`src/frontend/src/assets/logo.png`) + nombre en mayúsculas, siempre visibles, llevan a la portada. *(Cambio acordado — hoy es solo texto `¿CUÁNDO VENCE?`; ver aviso al inicio.)*
- **Sin sesión** (`user` nulo):
  - *Inicio* → `/`
  - *Acceder* → `/`
- **Con sesión** (`user` definido):
  - *Inicio* → `/`
  - *Inventario* → `/inventario`
  - *Rótulos* → `/rotulos`
  - `<button onClick={logout}>Salir ({user.username})</button>` → cierra la sesión

### Flujo paso a paso

1. `Navbar` se renderiza en cada ruta (está por fuera de `<Routes>` en `App.jsx`).
2. Lee `user` y `logout` del contexto de autenticación.
3. Si `user` es nulo → menú de invitado (Inicio + Acceder).
4. Si `user` existe → menú de usuario (Inicio, Inventario, Rótulos, Salir).
5. Al pulsar un `<Link>`, React Router navega sin recargar la página.
6. Al pulsar **Salir**, se ejecuta `logout()` (borra `localStorage["auth"]`, anula `user`) y `ProtectedRoute` redirige a `/`.

---

## Validaciones y casos límite

| Situación | Comportamiento |
|---|---|
| Sesión activa | Menú completo (Inventario, Rótulos, Salir) |
| Sin sesión | Menú reducido (Inicio, Acceder) |
| Sesión restaurada tras recarga | El Navbar se actualiza al hidratarse `AuthContext` |
| Pulsar Salir | Logout inmediato + redirección a la portada |
| Navegar con `<Link>` | No recarga la página (SPA) |

---

## Limitaciones conocidas

- El Navbar siempre muestra el logo que enlaza a la portada, incluso con sesión (no distingue la página activa con estilos).
- No hay un marcador visual del enlace activo (no usa `NavLink`).

---

Volver a [`0000-index.md`](../0000-index.md).