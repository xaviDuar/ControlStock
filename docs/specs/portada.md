# Portada

Funcionalidad que constituye la **pantalla de acceso con la identidad del sistema y el formulario de login** en **¿Cuándo Vence?**. Es la sexta funcionalidad listada en [`funcionalidades.md`](./funcionalidades.md).

> Casos de uso: [`docs/requerimientos/implementados/homepageCDS.md`](../requerimientos/implementados/homepageCDS.md)

---

## Qué hace

- Es la ruta pública `/`, primera pantalla que ve el usuario (sin sesión).
- Muestra la identidad del sistema: título **¿CUÁNDO VENCE?**, subtítulo *Control de vencimientos para productos perecederos*, línea pixel y descripción del sistema.
- **Sin sesión:** muestra el formulario de login (Usuario, Contraseña, botón **Acceder**).
- **Con sesión:** reemplaza el formulario por dos atajos: **Ir al Inventario** y **Crear Rótulos**.

## Experiencia de usuario

1. El usuario entra a `/` sin sesión: ve el hero con la identidad del sistema y el formulario de acceso.
2. Completa usuario y contraseña y pulsa **Acceder**: si son válidas, navega a `/inventario`; si no, ve un mensaje de error.
3. Si el usuario ya tiene sesión y visita `/`, no ve el formulario: ve los botones **Ir al Inventario** y **Crear Rótulos**.
4. Si ocurre un fallo de red o credenciales inválidas, permanece en la portada con una caja de error.

## Cómo lo hace (implementación)

### Frontend (React + Vite)

| Parte | Archivo | Rol |
|---|---|---|
| Página | `src/frontend/src/pages/HomePage.jsx` | Renderiza hero + formulario (o atajos según sesión); maneja el submit |
| Ruta | `src/frontend/src/App.jsx` | `<Route path="/" element={<HomePage />} />` — pública, sin `ProtectedRoute` |
| Auth | `src/frontend/src/context/AuthContext.jsx` | Provee `user` y `login` |
| API | `src/frontend/src/api/client.js` | `loginUser()` → `POST /api/auth/login/` |
| Estilos | `src/frontend/src/index.css` | `.hero`, `.login-form`, `.message.error`, `.pixel-line`, `.btn` |

### Estructura de la página

1. **Hero** (`div.hero`):
   - `<h1>¿CUÁNDO VENCE?</h1>`
   - `<p class="hero-sub">Control de vencimientos para productos perecederos</p>`
   - `div.pixel-line` (línea verde pixel de 48px)
   - Párrafo descriptivo.
2. **Según sesión** (`{user ? ... : ...}`):
   - Con sesión → botón **Ir al Inventario** (`navigate("/inventario")`) y **Crear Rótulos** (`navigate("/rotulos")`).
   - Sin sesión → `<form onSubmit={handleSubmit} className="login-form card">` con:
     - Caja de error condicional (`div.message.error`).
     - Campo **Usuario** (`input type="text"`, `required`, placeholder "Ingresá tu usuario").
     - Campo **Contraseña** (`input type="password"`, `required`, placeholder "Ingresá tu contraseña").
     - Botón submit **Acceder** (`width:100%`).

### Flujo del submit (sin sesión)

1. `handleSubmit` hace `preventDefault()` y limpia `error`.
2. Llama a `loginUser(username, password)` → `POST /api/auth/login/`.
3. Éxito: `login(data.token, {username})` (persiste sesión) y `navigate("/inventario")`.
4. Error: `setError(err.message)` → se muestra la caja roja; el usuario permanece en la portada.

---

## Validaciones y casos límite

| Situación | Comportamiento |
|---|---|
| Sin sesión → `/` | Hero + formulario de login |
| Con sesión → `/` | Hero + atajos (Ir al Inventario, Crear Rótulos) |
| Campos vacíos | El navegador bloquea el envío (`required`) |
| Credenciales inválidas | Caja de error "Credenciales inválidas" en la portada |
| Fallo de red | Caja de error "Error de red" en la portada |
| Sesión restaurada tras recarga | Portada muestra los atajos (no el formulario) |

---

## Limitaciones conocidas

- No hay mensaje de éxito al iniciar sesión (navega directo a `/inventario`).
- No hay estado de "enviando" (spinner o botón deshabilitado) mientras se valida.

---

Volver a [`funcionalidades.md`](./funcionalidades.md).