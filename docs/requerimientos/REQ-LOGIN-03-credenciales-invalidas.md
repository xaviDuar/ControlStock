# REQ-LOGIN-03 — Manejo de credenciales inválidas

**Mockup:** `docs/pantallas.pen` → frame **`Portada — Credenciales inválidas`** (nodo `bbrH6`)
**Specs vigentes:** [`login.md`](../specs/login.md), [`portada.md`](../specs/portada.md)
**Archivos implicados:** `src/frontend/src/pages/HomePage.jsx`, `src/frontend/src/index.css`

---

## 1. Objetivo

Que, al fallar el inicio de sesión por credenciales incorrectas, la pantalla de acceso muestre una **caja de error** con el título **"Credenciales inválidas"** y un **texto de ayuda** **"Revisá el usuario y la contraseña e intentá de nuevo."**, tal como se ve en el mockup `Portada — Credenciales inválidas`.

## 2. Estado actual

- `POST /api/auth/login/` responde `400` con `{"error": "Credenciales inválidas"}` cuando `authenticate()` falla.
- `client.js` lanza un `Error` con ese mensaje y `HomePage.handleSubmit` lo guarda en `error`.
- Se renderiza una caja roja (`div.message.error`) que muestra **solo** el mensaje *"Credenciales inválidas"*: **no hay texto de ayuda**.
- La caja aparece arriba del formulario; los valores ingresados se conservan.

## 3. Estado objetivo (qué cambia)

| Elemento (mockup) | Contenido | Estado |
|---|---|---|
| `ErrorBox` → `ErrorText` | `Credenciales inválidas` | Se mantiene (viene del backend) |
| `ErrorBox` → `ErrorHint` | `Revisá el usuario y la contraseña e intentá de nuevo.` | **Nuevo** — texto de ayuda fijo bajo el título |
| Ubicación del `ErrorBox` | Dentro de `LoginForm`, entre `Group-Contraseña` y `AccederBtn` | **Cambia** — hoy la caja se renderiza arriba del form |

El único cambio funcional es la **línea de ayuda** y la **ubicación** de la caja dentro del formulario; el mensaje de error del backend y la conservación de los datos ingresados se mantienen.

## 4. Requerimientos funcionales

| ID | Requerimiento |
|---|---|
| RF-3.1 | Cuando el backend responde *"Credenciales inválidas"*, se muestra una caja de error con dos líneas: el título **"Credenciales inválidas"** y el texto de ayuda **"Revisá el usuario y la contraseña e intentá de nuevo."** |
| RF-3.2 | La caja de error se ubica dentro del formulario, entre el campo **Contraseña** y el botón **Acceder**, tal como el mockup. |
| RF-3.3 | El texto de ayuda es fijo (definido por el sistema): no cambia según el mensaje del backend. |
| RF-3.4 | Al mostrar el error, el usuario permanece en la pantalla de acceso y **conserva** lo escrito en Usuario y Contraseña, para corregir y reintentar. |
| RF-3.5 | Al reintentar (**Acceder**), la caja de error desaparece al iniciar el nuevo intento; si vuelve a fallar, se vuelve a mostrar. |
| RF-3.6 | El usuario puede editar ambos campos y reintentar las veces que sea necesario sin recargar la página. |
| RF-3.7 | Si falla la comunicación con el backend (fallo de red o servidor caído), se muestra la **misma caja de error** con el título **"Error de red"** y el texto de ayuda **"Revisá tu conexión e intentá de nuevo."** |

## 5. Requerimientos visuales / no funcionales

| ID | Requerimiento |
|---|---|
| RNF-3.1 | La caja de error conserva la estética actual de error (rojo: fondo `#2a1a1a`, borde y texto `#d45a5a`, fuente Courier New), acorde al mockup y al estilo pixel-art de la app. |
| RNF-3.2 | El título (`ErrorText`) y el texto de ayuda (`ErrorHint`) se visualizan como dos líneas jerarquizadas: el título con más peso visual que la ayuda. |
| RNF-3.3 | La aparición de la caja no desplaza el formulario de forma que tape el botón **Acceder** (el botón sigue visible y accesible). |
| RNF-3.4 | La caja de error se implementa con `role="alert"` para lectores de pantalla (el rol ya implica aria-live assertive; no se agrega `aria-live` explícito para no contradecirlo). |

## 6. Casos de uso

### UC-03.1 — Iniciar sesión con credenciales incorrectas

| | |
|---|---|
| **Actor** | Usuario, sin sesión iniciada |
| **Objetivo** | Corregir sus credenciales y volver a intentar acceder |
| **Precondiciones** | La pantalla de acceso está visible (UC-01.1) |
| **Disparador** | El usuario presiona **Acceder** con usuario y contraseña que el backend rechaza |

**Flujo principal:**
1. El usuario escribe un usuario y/o contraseña incorrectos y presiona **Acceder**.
2. El sistema envía `POST /api/auth/login/` con los datos ingresados.
3. El backend no autentica y responde `400` con `{"error": "Credenciales inválidas"}`.
4. El sistema muestra la caja de error dentro del formulario, entre **Contraseña** y **Acceder**:
   - Título: *"Credenciales inválidas"*.
   - Ayuda: *"Revisá el usuario y la contraseña e intentá de nuevo."*.
5. El usuario corrige el usuario y/o la contraseña (los valores previos siguen en los campos).
6. El usuario presiona **Acceder** nuevamente: la caja de error desaparece y el sistema reintenta la autenticación.

**Flujos alternativos y excepciones:**

| # | Caso | Resultado |
|---|---|---|
| 3a | Fallo de red / backend caído | El sistema muestra la misma caja de error con el título *"Error de red"* y la ayuda *"Revisá tu conexión e intentá de nuevo."* (RF-3.7) |
| 5a | El usuario no recuerda sus datos | Permanece en la pantalla de acceso (no hay recuperación de contraseña: fuera de alcance) |
| 6a | El segundo intento es válido | La sesión se inicia y se navega a `/inventario` (→ UC-01.2) |
| 6b | El segundo intento también falla | Se vuelve a mostrar la misma caja de error (paso 4) |

**Postcondiciones:** El usuario ve el error claramente identificado con una acción sugerida (revisar e intentar de nuevo); los datos ingresados quedan preservados para corregir; no se crea sesión ni se navega fuera de la pantalla de acceso.

## 7. Criterios de aceptación

| ID | Criterio (Given / When / Then) |
|---|---|
| CA-3.1 | **Given** un intento de login con contraseña incorrecta, **when** el backend responde 400, **then** se muestra la caja de error con *"Credenciales inválidas"* y *"Revisá el usuario y la contraseña e intentá de nuevo."*. |
| CA-3.2 | **Given** la caja de error visible, **when** se observa el formulario, **then** la caja está entre el campo **Contraseña** y el botón **Acceder**. |
| CA-3.3 | **Given** la caja de error visible, **when** se miran los campos, **then** el usuario y la contraseña escritos siguen en ellos. |
| CA-3.4 | **Given** la caja de error visible, **when** el usuario presiona **Acceder** otra vez, **then** la caja desaparece durante el nuevo intento. |
| CA-3.5 | **Given** un nuevo intento fallido, **when** llega la respuesta 400, **then** la caja de error vuelve a mostrarse con los mismos textos. |
| CA-3.6 | **Given** credenciales corregidas, **when** el usuario presiona **Acceder**, **then** se inicia la sesión y se navega a `/inventario` sin dejar rastro del error. |
| CA-3.7 | **Given** un intento de login sin conexión al backend, **when** falla la petición, **then** se muestra la caja de error con *"Error de red"* y *"Revisá tu conexión e intentá de nuevo."*, conservando los datos ingresados. |

## 8. Fuera de alcance

- Bloqueo de intentos, rate-limiting o captcha.
- Recuperación de contraseña.
- Mensajes de error provenientes de otras pantallas o endpoints.

## 9. Decisiones resueltas

| # | Punto | Decisión |
|---|---|---|
| 1 | Error de red | **Confirmado:** mismo formato de caja con título *"Error de red"* y ayuda *"Revisá tu conexión e intentá de nuevo."* (RF-3.7). |
| 2 | Accesibilidad | **Adoptado:** la caja de error se implementa con `role="alert"` / `aria-live` para lectores de pantalla (no visible en el mockup). |

---

Volver al [índice de requerimientos](./README.md).
