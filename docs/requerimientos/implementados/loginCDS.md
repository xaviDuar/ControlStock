# Login — Casos de uso

Requerimientos de la funcionalidad **Login** de **¿Cuándo Vence?**, expresados como casos de uso en formato UML detallado.

> Volver a [`funcionalidades.md`](../specs/funcionalidades.md) · Especificación técnica: [`specs/login.md`](../specs/login.md)

---

## Tabla de casos de uso

| ID | Caso de uso | Actor principal | Disparador | Resultado |
|----|-------------|-----------------|------------|-----------|
| UC-01 | Iniciar sesión | Usuario (no autenticado) | Presiona **Acceder** en el formulario de la portada | Usuario identificado en la app con acceso a las rutas protegidas |

---

## UC-01 — Iniciar sesión

**Actor principal:** Usuario (visitante no autenticado).
**Actor secundario:** Sistema (SPA React + API Django/DRF en `POST /api/auth/login/`).
**Objetivo:** Que el usuario identifique su cuenta con usuario y contraseña para acceder a las secciones protegidas del sistema.
**Disparador:** El usuario ingresa a la portada (`/`) y presiona el botón **Acceder** del formulario.

### Precondiciones

1. El usuario no tiene una sesión iniciada en la aplicación (o ésta fue cerrada).
2. El backend está disponible y la API responde.
3. El usuario existe en el sistema y su cuenta está activa (para el flujo principal).
4. Los campos **Usuario** y **Contraseña** contienen valores no vacíos (validación `required` del HTML).

### Flujo principal (éxito)

1. El usuario carga su nombre de usuario en el campo **Usuario** y su clave en el campo **Contraseña**.
2. El usuario presiona **Acceder**; la SPA intercepta el envío del formulario (`preventDefault`) y limpia cualquier mensaje de error previo.
3. El frontend envía `POST /api/auth/login/` con el body JSON `{"username": "...", "password": "..."}` (sin header `Authorization`).
4. El backend valida las credenciales con `authenticate()` de Django.
5. Las credenciales son correctas: el servidor crea/obtiene el token DRF del usuario (`Token.objects.get_or_create`) y responde **HTTP 200** con `{"token": "<key>", "username": "<nombre>"}`.
6. La SPA guarda la sesión: actualiza el estado global de autenticación (`AuthContext`) y persiste `{"token", "user"}` en `localStorage["auth"]`.
7. El sistema navega al usuario a `/inventario`.
8. `ProtectedRoute` verifica que haya usuario identificado y permite el acceso a la ruta.
9. El Navbar actualiza el menú: aparecen *Inventario*, *Rótulos* y el botón **Salir (usuario)**; el formulario de la portada queda reemplazado por los atajos **Ir al Inventario** y **Crear Rótulos**.
10. El caso de uso termina con éxito: el usuario queda identificado y puede operar con el sistema.

**Postcondiciones (éxito):**
- El usuario está autenticado en la SPA; todos los requests a `/api/...` envían `Authorization: Token <token>`.
- La sesión persiste ante recargas de la página (hidratación desde `localStorage`).
- El token en el backend sigue siendo válido (es permanente: no expira).

### Flujos alternativos

**FE-1 — Campos vacíos** *(en el paso 2)*
- 2a. Si el usuario deja un campo sin completar y presiona **Acceder**, el navegador bloquea el envío y muestra su mensaje nativo (*"Por favor, rellena este campo."*).
- El flujo principal no continúa; no se realiza ninguna llamada al backend.

**FE-2 — Sesión ya iniciada** *(al acceder a la portada)*
- 1a. Si `localStorage["auth"]` contiene una sesión válida, la portada no muestra el formulario.
- 1b. Se muestran los botones **Ir al Inventario** y **Crear Rótulos**; el usuario puede entrar sin volver a autenticarse.
- El caso de uso queda satisfecho sin llegar al backend.

**FE-3 — Fallo de red / backend caído** *(en el paso 3 o 5)*
- 3a. Si la petición falla a nivel de red o el servidor no responde, el cliente lanza un error.
- 3b. La SPA muestra la caja de error con el mensaje **`Error de red`**; el usuario permanece en la portada y conserva lo escrito.

### Flujos de excepción

**EX-1 — Credenciales inválidas** *(en el paso 4)*
- 4a. Si `authenticate()` falla (usuario o clave incorrectos, cuenta inactiva), el servidor responde **HTTP 400** con `{"error": "Credenciales inválidas"}`.
- 4b. La SPA muestra ese mensaje en la caja roja de error (`div.message.error`).
- 4c. El usuario permanece sin sesión en la portada.
- 4d. El usuario puede reintentar: vuelve al paso 1 del flujo principal. *(No hay límite de intentos, rate-limiting ni bloqueo.)*

**EX-2 — Token inválido posterior a la sesión** *(fuera del flujo de login, efecto observable)*
- Si `localStorage["auth"]` contiene un token borrado o corrupto, la SPA deja entrar (no valida contra el servidor al arrancar), pero cualquier llamada a la API responde **HTTP 401** y la página afectada muestra el detalle de DRF (p. ej. *"Las credenciales de autenticación no se proveyeron."*).
- El usuario no queda identificado de forma efectiva y debe volver a iniciar sesión desde la portada.

### Postcondiciones (en general)

- **Éxito:** usuario identificado; acceso concedido a `/inventario` y `/rotulos`; menú personalizado visible.
- **Fallo:** el usuario sigue sin sesión; se informa el motivo en la portada y no se accede a rutas protegidas.
