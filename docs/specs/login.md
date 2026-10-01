# Login

Funcionalidad de **autenticación de usuario**: permite iniciar sesión con usuario y contraseña para acceder a las secciones protegidas de **¿Cuándo Vence?**. Es la primera funcionalidad listada en [`funcionalidades.md`](./funcionalidades.md).

> Casos de uso: [`docs/requerimientos/implementados/loginCDS.md`](../requerimientos/implementados/loginCDS.md)

---

## Qué hace

- Muestra un formulario de acceso en la portada (`/`) con dos campos: **Usuario** y **Contraseña**, y un botón **Acceder**.
- Valida las credenciales contra el backend y, si son correctas, identifica al usuario en la aplicación: guarda su sesión, muestra el menú personalizado en el Navbar y lo redirige al Inventario.
- Si las credenciales son incorrectas, muestra un mensaje de error sin perder lo escrito en el formulario.
- Si el usuario ya tiene sesión iniciada, el formulario se reemplaza por dos atajos: **Ir al Inventario** y **Crear Rótulos**.

## Experiencia de usuario

1. El usuario entra a la portada (`/`): ve el hero con el título **¿CUÁNDO VENCE?** y, debajo, el formulario `login-form card`.
2. Completa los campos:
   - **Usuario** — placeholder *"Ingresá tu usuario"* (`input type="text"`, `required`).
   - **Contraseña** — placeholder *"Ingresá tu contraseña"* (`input type="password"`, `required`).
3. Presiona **Acceder**:
   - **Si las credenciales son válidas:** navega a `/inventario` y el Navbar pasa a mostrar *Inventario*, *Rótulos* y el botón **Salir (usuario)**.
   - **Si no lo son:** aparece una caja roja de error con el mensaje *"Credenciales inválidas"* y el usuario permanece en la portada.
4. Si los campos están vacíos, el navegador bloquea el envío con su mensaje nativo (*"Por favor, rellena este campo."*) mediante el atributo `required` del HTML.

No hay mensaje de éxito ni spinner de carga: en caso correcto la transición es directa al Inventario.

---

## Cómo lo hace (implementación)

### Frontend (React + Vite)

| Parte | Archivo | Rol |
|---|---|---|
| Formulario y portada | `src/frontend/src/pages/HomePage.jsx` | Renderiza el form (o los atajos si ya hay sesión) y maneja el submit (`handleSubmit`) |
| Estado global de auth | `src/frontend/src/context/AuthContext.jsx` | Guarda/restaura `token` y `user`; expone `login()`, `logout()` y `loading` |
| Cliente HTTP | `src/frontend/src/api/client.js` | Envía el `POST` a `/auth/login/` e inyecta `Authorization: Token <token>` en todos los requests posteriores |
| Guard de rutas | `src/frontend/src/components/ProtectedRoute.jsx` | Bloquea `/inventario` y `/rotulos` si no hay usuario, redirigiendo a `/` |
| Rutas | `src/frontend/src/App.jsx` | `/` es pública; las demás rutas van envueltas en `ProtectedRoute` |
| Navbar | `src/frontend/src/components/Navbar.jsx` | Cambia el menú según la sesión y ofrece el botón de logout |

### Backend (Django + DRF)

- **Endpoint:** `POST /api/auth/login/` → `login_api` en `src/backend/Inventory/api.py`, registrado en `src/backend/controlStock/urls.py`. Es `AllowAny` (no requiere token previo).
- **No hay serializer:** el view lee `username` y `password` del body JSON a mano y valida con `django.contrib.auth.authenticate()`.
- **Token:** si la autenticación sale bien, hace `Token.objects.get_or_create(user=user)` (modelo `rest_framework.authtoken`) y responde `{"token": "<key>", "username": "<nombre>"}`. El token es **permanente** (no expira) y se reutiliza entre sesiones.
- **Usuario:** se usa el modelo estándar `django.contrib.auth.models.User` (no hay usuario custom).
- **Autenticación global:** `settings.py` configura DRF con `TokenAuthentication` (+ `Basic`) y `IsAuthenticated` por defecto; `SessionAuthentication` está excluida a propósito para evitar CSRF en la SPA same-origin.

### Flujo paso a paso

1. **Carga de la página:** `AuthContext` ejecuta un `useEffect` que lee `localStorage["auth"]`; si existe, restaura `token` y `user`; luego pone `loading=false`. Mientras `loading=true`, `ProtectedRoute` no renderiza nada.
2. **Submit:** `HomePage.handleSubmit` hace `preventDefault()`, limpia el error y llama a `loginUser(username, password)`.
3. **Request:** `client.js` hace `POST /api/auth/login/` con body `{"username": "...", "password": "..."}` (sin header `Authorization`). En dev el proxy de Vite (`vite.config.js`) lo redirige a `http://127.0.0.1:8000`; en prod lo resuelve el mismo Django.
4. **Respuesta del servidor:**
   - **200** con `{"token", "username"}` → el frontend llama a `login(token, {username})`, que actualiza el estado React y persiste `{"token", "user"}` en `localStorage["auth"]`.
   - **400** con `{"error": "Credenciales inválidas"}` → `client.js` lanza un `Error` que `handleSubmit` muestra en la caja roja.
5. **Redirección:** `navigate("/inventario")`; `ProtectedRoute` verifica `user` y deja pasar.
6. **Requests autenticados:** a partir de ahí, `client.js` lee `localStorage["auth"]` y agrega `Authorization: Token <token>` a cada llamada a `/api/...`.

### Recarga y cierre de sesión

- **Recargar la página:** `localStorage` conserva `auth`, así que `AuthContext` se rehidrata y las rutas protegidas siguen accesibles. *Nota:* el token no se valida contra el servidor al arrancar (el endpoint `GET /api/auth/me/` existe pero el frontend no lo consume); un token inválido recién fallará con un 401 al pedir datos, mostrándose como mensaje de error en la página correspondiente.
- **Logout:** el botón **Salir (usuario)** del Navbar llama a `AuthContext.logout()`, que borra `localStorage["auth"]` y anula el estado; `ProtectedRoute` redirige a `/`. *Nota:* no hay endpoint de logout: el token sigue siendo válido en el backend.

### Validaciones y mensajes

| Situación | Mensaje mostrado | Origen |
|---|---|---|
| Campos vacíos | Mensaje nativo del navegador (*"Por favor, rellena este campo."*) | Atributo `required` del HTML |
| Credenciales incorrectas | `Credenciales inválidas` | `login_api` → HTTP 400 |
| Sin token o token inválido en una API | `Las credenciales de autenticación no se proveyeron.` (u otro detalle de DRF) | DRF 401 → `client.js` |
| Backend caído / fallo de red | `Error de red` | Fallback de `client.js` |

Orden de prioridad del error en `client.js`: `err.error` → `err.detail` → `"Error de red"`.

### Detalles visuales

- Estética pixel-art oscura: fuente Courier New, fondo `#111118`, acento verde `#4aaa8a`, errores en rojo (`#d45a5a`).
- Formulario: `login-form card` con ancho máximo de 360px, centrado; botón **Acceder** al 100% del ancho.
- Caja de error: `div.message.error` (fondo `#2a1a1a`, borde y texto rojos).

---

## Limitaciones conocidas

- Sin rate-limiting, captcha ni bloqueo de intentos fallidos.
- Sin expiración ni renovación (refresh) del token; sin invalidación al hacer logout.
- Sin validación del token contra el servidor al cargar la SPA ni sin "recordar usuario".
- No existen tests de autenticación (`Inventory/tests.py` está vacío).

---

Volver a [`funcionalidades.md`](./funcionalidades.md).
