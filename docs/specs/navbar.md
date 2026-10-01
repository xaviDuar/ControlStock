# Menú principal (Navbar)

Funcionalidad que **permite desplazarse entre las secciones disponibles según el estado de la sesión** en **¿Cuándo Vence?**. Es la quinta funcionalidad listada en [`funcionalidades.md`](./funcionalidades.md).

> Casos de uso: [`docs/requerimientos/implementados/navbarCDS.md`](../requerimientos/implementados/navbarCDS.md)

---

## Qué hace

- Muestra una barra de navegación fija (sticky) con el logo **¿CUÁNDO VENCE?** y los enlaces de las secciones.
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

- **Logo:** `<Link to="/" className="nav-logo">¿CUÁNDO VENCE?</Link>` — siempre visible, lleva a la portada.
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

Volver a [`funcionalidades.md`](./funcionalidades.md).