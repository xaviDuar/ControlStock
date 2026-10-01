# Rutas protegidas

Funcionalidad que **impide entrar a las pantallas internas sin haber iniciado sesión, redirigiendo a la portada** en **¿Cuándo Vence?**. Es la cuarta funcionalidad listada en [`funcionalidades.md`](./funcionalidades.md).

> Casos de uso: [`docs/requerimientos/implementados/rutasprotegidasCDS.md`](../requerimientos/implementados/rutasprotegidasCDS.md)

---

## Qué hace

- Protege las pantallas internas (**Inventario** `/inventario` y **Rótulos** `/rotulos`): solo se pueden ver con sesión iniciada.
- Mientras el sistema restaura la sesión guardada, no renderiza la pantalla (evita parpadeos y accesos indebidos).
- Si el usuario no tiene sesión, lo redirige a la portada `/`, donde puede iniciar sesión.
- En el backend, todos los endpoints de `/api/` exigen autenticación por token: sin token (o con token inválido) responden **401**.

## Experiencia de usuario

1. Con sesión iniciada, el usuario entra a `/inventario` o `/rotulos` desde el menú: la pantalla se muestra normal.
2. Sin sesión (o con sesión cerrada), el usuario intenta ir directo a `/inventario` escribiendo la URL, recargando una ruta guardada en favoritos, o usando el historial: la aplicación lo lleva a la portada `/`, donde ve el formulario de login.
3. Un usuario sin sesión que llama a la API (p. ej. desde DevTools) recibe un error de autenticación del servidor.

## Cómo lo hace (implementación)

### Frontend (React + Vite)

| Parte | Archivo | Rol |
|---|---|---|
| Guard de rutas | `src/frontend/src/components/ProtectedRoute.jsx` | Devuelve `null` mientras `loading`; `<Navigate to="/" replace />` si no hay `user`; renderiza `children` si hay sesión |
| Rutas | `src/frontend/src/App.jsx` | `/` es pública; `/inventario` y `/rotulos` están envueltas en `<ProtectedRoute>` |
| Estado de sesión | `src/frontend/src/context/AuthContext.jsx` | Provee `user` y `loading` |

### Backend (Django + DRF)

| Parte | Archivo | Rol |
|---|---|---|
| Configuración global | `src/backend/controlStock/settings.py` | `DEFAULT_PERMISSION_CLASSES = IsAuthenticated` + `DEFAULT_AUTHENTICATION_CLASSES` con `TokenAuthentication`/`BasicAuthentication` |
| Viewsets y métricas | `src/backend/Inventory/api.py` | Todos los viewsets (`TipoProductoViewSet`, etc.), `metricas` y `me` declaran `IsAuthenticated` |
| Endpoints | `src/backend/controlStock/urls.py` | `/api/auth/login/` es el único `AllowAny` |

### Flujo paso a paso (acceso sin sesión)

1. El usuario (sin `user`) intenta abrir `/inventario`.
2. `ProtectedRoute` evalua `loading` (falso) y `user` (nulo).
3. Devuelve `<Navigate to="/" replace />`: el historial de navegación se reemplaza por `/` (no deja "volver" a la ruta protegida).
4. La portada muestra el formulario de login.
5. Si el usuario inicia sesión, `navigate("/inventario")` lo lleva directo.

### Flujo paso a paso (acceso con sesión)

1. El usuario con `user` definido abre `/inventario`.
2. `ProtectedRoute` ve `user` presente y renderiza `InventoryPage`.
3. `InventoryPage` pide `GET /api/tipos/` con `Authorization: Token <token>` (inyectado por `client.js`).
4. El backend valida el token y responde los datos.

### Segunda línea de defensa (backend)

- Aunque se sorteara el guard del frontend, la API no entrega datos sin token: los endpoints devuelven **401** (`Las credenciales de autenticación no se proveyeron.`) y la página muestra el mensaje de error en una caja roja.

---

## Validaciones y casos límite

| Situación | Comportamiento |
|---|---|
| Sesión activa → ruta protegida | Acceso permitido |
| Sin sesión → ruta protegida | Redirección a `/` |
| Restaurando sesión (loading) | No renderiza nada hasta terminar |
| Sin token / token inválido → API | HTTP 401 con detalle de DRF |
| `GET` a `/api/auth/login/` | 405 (solo acepta POST) |

---

## Limitaciones conocidas

- La protección del frontend es solo de UI; la seguridad real depende del 401 del backend (que sí está configurado).
- No valida el token contra el servidor al arrancar: un token inválido "deja entrar" visualmente hasta que la API responda 401.

---

Volver a [`funcionalidades.md`](./funcionalidades.md).