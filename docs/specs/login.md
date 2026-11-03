# Login

Funcionalidad que **permite iniciar sesión con usuario y contraseña para acceder a las secciones protegidas de la página** en **¿Cuándo Vence?**. Es la primera funcionalidad listada en [`funcionalidades.md`](./funcionalidades.md).

---

## Qué hace

- Presenta el formulario de acceso con los campos **Usuario** y **Contraseña**, este último con un botón de ojo para mostrar u ocultar lo escrito.
- Valida que ambos campos estén completos antes de enviar: si falta uno, lo marca con un mensaje debajo del input; si faltan los dos, muestra una advertencia general. En ningún caso se envía el formulario incompleto.
- Envía las credenciales al backend (`POST /api/auth/login/`); con credenciales válidas obtiene el token de acceso.
- Guarda la sesión (token + usuario) en el estado de la aplicación y en `localStorage`, y redirige al usuario a `/inventario`.
- Si las credenciales son inválidas o falla la conexión, muestra una caja de error con el motivo y una ayuda para reintentar.

## Experiencia de usuario

1. Sin sesión iniciada, el usuario ve en la [portada](./portada.md) el formulario de acceso: campos **Usuario** y **Contraseña** y el botón **Acceder**.
2. Escribe su usuario y su contraseña. Puede revelar la contraseña temporalmente con el botón de ojo.
3. Presiona **Acceder** y ocurre una de estas cosas:
   - **Faltan campos**: el formulario no se envía y aparecen las alertas de validación (ámbar si faltan los dos, mensaje por campo si falta uno).
   - **Credenciales correctas**: la aplicación lo redirige a `/inventario`, donde ya puede trabajar; el Navbar aparece con *Inventario*, *Rótulos*, *Productos* y **Salir (usuario)**.
   - **Credenciales incorrectas**: aparece una caja roja *"Credenciales inválidas"* con la ayuda *"Revisá el usuario y la contraseña e intentá de nuevo."*
   - **Sin conexión / backend caído**: aparece una caja roja *"Error de red"* con la ayuda *"Revisá tu conexión e intentá de nuevo."*
4. La sesión queda guardada: si el usuario recarga la página no necesita volver a loguearse (ver [`sesionpersistente.md`](./sesionpersistente.md)).

---

## Cómo lo hace (implementación)

### Frontend (React + Vite)

| Parte | Archivo | Rol |
|---|---|---|
| Formulario de acceso | `src/frontend/src/pages/HomePage.jsx` | Renderiza el form en la portada (`/`), valida campos vacíos, llama al login y maneja los errores |
| Visor de contraseña | `src/frontend/src/components/EyeToggleBtn.jsx` | Botón de ojo que alterna el input entre `password` y `text`; su `aria-label` es "Mostrar contraseña"/"Ocultar contraseña" |
| Llamada al backend | `src/frontend/src/api/client.js` | `loginUser(username, password)` hace `POST /api/auth/login/` con body JSON `{username, password}` |
| Cliente HTTP | `src/frontend/src/api/client.js` | `api()` agrega `Authorization: Token <token>` a los requests autenticados y convierte las respuestas no-OK en `Error` con el mensaje del backend |
| Sesión | `src/frontend/src/context/AuthContext.jsx` | `login(token, userData)` actualiza el estado (`token`, `user`) y persiste `localStorage["auth"]` |
| Redirección | `src/frontend/src/pages/HomePage.jsx` | Tras el login exitoso hace `navigate('/inventario')` con `useNavigate` |
| Ruta | `src/frontend/src/App.jsx` | `/` renderiza `HomePage` sin protección (`ProtectedRoute`) |
| Estilos | `src/frontend/src/index.css` | Clases `login-form`, `password-wrap`, `eye-toggle`, `field-msg`, `warn-box`, `error-box` |

### Flujo paso a paso

1. El usuario completa **Usuario** y **Contraseña** y presiona **Acceder** (`handleSubmit` en `HomePage.jsx`).
2. **Validación de campos vacíos** (antes de cualquier llamada al backend):
   - Se chequea con `trim()` qué campos quedaron vacíos.
   - Si falta alguno: el/los campos pasan a borde rojo (`input-error`), el foco va al primer campo faltante y **no se envía el form**.
   - Si falta **un solo** campo: se muestra debajo el mensaje *"Por favor, rellená este campo."* (`role="alert"`).
   - Si faltan **los dos**: se muestra únicamente la caja general ámbar *"Campos incompletos"* + *"Por favor, completá los campos solicitados."* (sin mensajes por campo).
3. Con los campos completos, se llama `loginUser(username, password)` → `POST /api/auth/login/` con `Content-Type: application/json`.
4. El backend autentica las credenciales (ver "Nota sobre el backend") y responde `200 {"token": "<key>", "username": "<usuario>"}`.
5. `HomePage` ejecuta `login(data.token, { username: data.username })`:
   - `AuthContext.login()` hace `setToken(...)`, `setUser(...)` y `localStorage.setItem('auth', JSON.stringify({token, user}))`.
6. `navigate('/inventario')` lleva al usuario al inventario, ya con sesión iniciada.
7. Si la respuesta no es OK, `api()` lanza `Error(err.error || err.detail || 'Error de red')` y `handleSubmit` muestra la caja de error:
   - Mensaje `Error de red` (falló el `fetch` o la respuesta no trae cuerpo) → título *"Error de red"*, ayuda *"Revisá tu conexión e intentá de nuevo."*
   - Cualquier otro mensaje del backend (p. ej. *"Credenciales inválidas"*) → ese mensaje como título y ayuda *"Revisá el usuario y la contraseña e intentá de nuevo."*
   - La caja de error se limpia al iniciar un nuevo intento de envío.

### Nota sobre el backend

- **`POST /api/auth/login/`** (`src/backend/Inventory/api.py`, `login_api`; ruta en `src/backend/controlStock/urls.py`) es `AllowAny`: recibe `username`/`password` y valida con `django.contrib.auth.authenticate`.
- Credenciales válidas: `Token.objects.get_or_create(user=user)` — crea el token la primera vez y **reutiliza siempre el mismo** por usuario (no rota ni expira) — y responde `{'token': token.key, 'username': user.username}`.
- Credenciales inválidas: responde `400 {'error': 'Credenciales inválidas'}`; el frontend traduce ese `error` en el título de la caja roja.
- **`GET /api/auth/me/`** (`me`, requiere token) devuelve `{'username', 'id'}`, pero el frontend no lo consume.
- La API usa solo Token + Basic authentication (`SessionAuthentication` está excluido a propósito); ver `REST_FRAMEWORK` en `src/backend/controlStock/settings.py`.

---

## Validaciones y casos límite

| Situación | Comportamiento |
|---|---|
| Ambos campos vacíos | No se envía el form; solo la caja general ámbar *"Campos incompletos"*; el foco va a **Usuario** |
| Un solo campo vacío | No se envía el form; borde rojo + mensaje *"Por favor, rellená este campo."* debajo de ese campo; el foco va a él; sin caja general |
| Campo con solo espacios | `trim()` lo cuenta como vacío (aunque lo que se enviaría es el valor tal cual se escribió) |
| El usuario empieza a escribir en un campo marcado | El borde rojo desaparece al haber texto; el mensaje del campo se mantiene hasta el próximo intento de envío |
| Credenciales inválidas (400 del backend) | Caja de error roja *"Credenciales inválidas"* + *"Revisá el usuario y la contraseña e intentá de nuevo."* |
| Sin conexión / backend caído | Caja de error roja *"Error de red"* + *"Revisá tu conexión e intentá de nuevo."* |
| Login exitoso | Sesión guardada (`token` + `user` en `localStorage["auth"]`) y redirección a `/inventario` |
| Reintento tras un error | La caja de error o de advertencia se limpia al presionar **Acceder** de nuevo |

---

## Limitaciones conocidas

- No hay límite de intentos ni bloqueo ante credenciales incorrectas repetidas.
- El token no expira, el backend reutiliza siempre el mismo por usuario y el logout no lo invalida en el servidor (ver [`logout.md`](./logout.md)).
- No se usa `GET /api/auth/me/`: la sesión restaurada desde `localStorage` no se valida contra el servidor (ver [`sesionpersistente.md`](./sesionpersistente.md)).
- La contraseña viaja en JSON por HTTP; el proyecto no fuerza HTTPS.
- No hay "recordarme", recuperación de contraseña ni cambio de contraseña desde la app.
- El mensaje por campo vacío persiste mientras el usuario escribe; desaparece recién en el próximo envío.

---

Volver a [`funcionalidades.md`](./funcionalidades.md).
