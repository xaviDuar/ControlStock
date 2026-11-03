# REQ-LOGIN-02 — Validación de campos vacíos

**Mockup:** `docs/pantallas.pen` → frame **`Portada — Campos vacíos`** (nodo `lKlaG`) — *la ubicación del mensaje (debajo del input) sigue el mockup; la burbuja nativa se reemplaza por un mensaje propio, ver §9*
**Specs vigentes:** [`login.md`](../specs/login.md), [`portada.md`](../specs/portada.md) *(describen el comportamiento actual con `required`; actualizar al implementar)*
**Archivos implicados:** `src/frontend/src/pages/HomePage.jsx`, `src/frontend/src/pages/HomePage.test.jsx`, `src/frontend/src/index.css`

---

## 1. Objetivo

Que el formulario de acceso **no se envíe** si el usuario deja **Usuario** o **Contraseña** vacíos, mostrando la alerta de validación correspondiente según cuántos campos faltan, con validación propia en JavaScript:

- **Un solo campo vacío** → mensaje de advertencia **debajo de ese input** (como en el mockup `Portada — Campos vacíos`).
- **Los dos campos vacíos** → **mensaje general grande** en la parte baja del formulario: *"Campos incompletos"* + *"Por favor, completá los campos solicitados."*

La validación es **consistente** con el manejo de credenciales inválidas ([REQ-LOGIN-03](./REQ-LOGIN-03-credenciales-invalidas.md)): en lugar de la burbuja nativa del navegador, la app muestra sus propias alertas — **ámbar** para datos faltantes (advertencia) y **rojo** para errores de autenticación.

## 2. Estado actual

- Ambos campos (`#username`, `#password`) tienen el atributo HTML `required`.
- Al enviar el form vacío, el navegador bloquea el `submit` con su burbuja nativa (*"Por favor, rellena este campo."*) y **no se ejecuta** `handleSubmit`.
- No hay validación propia en JavaScript: la validación es 100% nativa del HTML.
- `HomePage.test.jsx` verifica que ambos inputs tengan `required` (ese test cambia junto con la implementación).

## 3. Estado objetivo (qué cambia)

Se elimina la validación nativa del navegador y se reemplaza por validación propia con dos tipos de alerta ámbar, mutuamente excluyentes:

| Elemento | Contenido | Estado |
|---|---|---|
| `FieldMsg` → mensaje por campo | `Por favor, rellená este campo.` — debajo del input vacío | **Nuevo** — se muestra solo cuando ese campo es el **único** faltante |
| `WarnBox` → `WarnText` | `Campos incompletos` | **Nuevo** — mensaje general grande |
| `WarnBox` → `WarnHint` | `Por favor, completá los campos solicitados.` | **Nuevo** |
| Ubicación del `WarnBox` | Dentro de `LoginForm`, entre `Group-Contraseña` y `AccederBtn` (misma posición que `ErrorBox` de REQ-LOGIN-03) | **Nuevo** — se muestra solo cuando faltan **ambos** campos |
| Campos vacíos | Borde ámbar en los inputs faltantes (en ambos casos) | **Nuevo** |
| `NativeBubble` (burbuja nativa) | — | **Se elimina** — ya no se usa `required` ni la burbuja del navegador |
| `Group-Usuario` → `Input-Usuario` | Placeholder `Ingresá tu usuario` | Se mantiene |
| `Group-Contraseña` → `Input-Contraseña` | Placeholder `Ingresá tu contraseña` + botón de ojo (ver [REQ-LOGIN-01](./REQ-LOGIN-01-portada-acceso.md) RF-1.9) | Se mantiene |
| `AccederBtn` | **Acceder** | Se mantiene; no envía el form con campos vacíos |

## 4. Requerimientos funcionales

| ID | Requerimiento |
|---|---|
| RF-2.1 | Los campos **Usuario** y **Contraseña** son obligatorios: ninguno puede enviarse vacío. |
| RF-2.2 | Al presionar **Acceder** con **un solo campo vacío**, se muestra el mensaje *"Por favor, rellená este campo."* **debajo de ese input** y **no se envía** el formulario. |
| RF-2.3 | Al presionar **Acceder** con **los dos campos vacíos**, se muestra **solo** el mensaje general grande (título *"Campos incompletos"* + ayuda *"Por favor, completá los campos solicitados."*) en la parte baja del formulario; **no** se muestran los mensajes individuales bajo los inputs. |
| RF-2.4 | Mientras la validación de campos vacíos no pase, no se ejecuta `loginUser` ni se realiza ningún request a `/api/auth/login/`. |
| RF-2.5 | La validación es propia en JavaScript (en `handleSubmit`); **no** se usa la validación nativa del HTML (`required` / burbuja del navegador). |
| RF-2.6 | Los inputs vacíos quedan marcados con borde ámbar, tanto si falta un campo como si faltan los dos. |
| RF-2.7 | El foco pasa al primer campo vacío al intentar enviar el formulario. |
| RF-2.8 | Los mensajes de advertencia desaparecen al iniciar un nuevo intento de envío y se re-evalúan según los campos en ese momento. |
| RF-2.9 | Al completar los campos faltantes y reintentar, el envío procede y la pantalla pasa a los estados de [REQ-LOGIN-01](./REQ-LOGIN-01-portada-acceso.md) o [REQ-LOGIN-03](./REQ-LOGIN-03-credenciales-invalidas.md). |
| RF-2.10 | Los mensajes no aparecen mientras se escribe: solo al presionar **Acceder**. |

## 5. Requerimientos visuales / no funcionales

| ID | Requerimiento |
|---|---|
| RNF-2.1 | El mensaje por campo (`FieldMsg`) es una línea de texto ámbar (`#d9b04a`) justo debajo del input, fuente Workbench, con `role="alert"` y asociada a su input mediante `aria-describedby`. |
| RNF-2.2 | El mensaje general (`WarnBox`) usa el mismo patrón visual que la caja de error de REQ-LOGIN-03 (dos líneas jerarquizadas: título + ayuda, `role="alert"`), pero en **ámbar**: fondo `#2a2410`, borde y título `#d9b04a`, ayuda `#e8cf8f`, fuente Workbench. |
| RNF-2.3 | Los inputs con campo vacío se resaltan con borde ámbar (`#d9b04a`); al completarlos, el borde vuelve al estilo normal. |
| RNF-2.4 | La aparición de cualquier mensaje no desplaza el formulario de forma que tape el botón **Acceder** (el botón sigue visible y accesible). |
| RNF-2.5 | El foco pasa al primer campo vacío al intentar enviar el formulario. |
| RNF-2.6 | Los mensajes desaparecen al iniciar un nuevo intento de envío (misma dinámica que la caja de error de REQ-LOGIN-03). |

## 6. Casos de uso

### UC-02.1 — Acceder con un solo campo vacío

| | |
|---|---|
| **Actor** | Usuario, sin sesión iniciada |
| **Objetivo** | Completar el dato que falta para poder iniciar sesión |
| **Precondiciones** | La pantalla de acceso está visible (UC-01.1) |
| **Disparador** | El usuario presiona **Acceder** dejando vacío **Usuario** o **Contraseña** |

**Flujo principal:**
1. El usuario deja vacío el campo **Contraseña** y presiona **Acceder**.
2. La validación propia detecta el campo vacío y **no envía** el formulario.
3. El sistema muestra el mensaje *"Por favor, rellená este campo."* **debajo del input Contraseña**.
4. El input vacío queda con borde ámbar y el foco pasa a **Contraseña**.
5. El usuario completa el campo y vuelve a presionar **Acceder** (→ UC-01.2).

**Flujos alternativos y excepciones:**

| # | Caso | Resultado |
|---|---|---|
| 3a | Solo **Usuario** está vacío | El mensaje aparece debajo del input **Usuario** y el foco va a **Usuario** |
| 3b | El usuario completa un campo y borra el otro | Al reenviar, el mensaje aparece debajo del campo vacío restante |
| 5a | El usuario completa ambos campos con credenciales incorrectas | El envío procede → ver [REQ-LOGIN-03](./REQ-LOGIN-03-credenciales-invalidas.md) |

**Postcondiciones:** No se envía ningún request; no se muestra la caja de error de credenciales; el usuario permanece en la pantalla de acceso con los datos ya ingresados conservados.

### UC-02.2 — Acceder con los dos campos vacíos

| | |
|---|---|
| **Actor** | Usuario, sin sesión iniciada |
| **Objetivo** | Completar los datos que faltan para poder iniciar sesión |
| **Precondiciones** | La pantalla de acceso está visible (UC-01.1) |
| **Disparador** | El usuario presiona **Acceder** dejando vacíos **Usuario** y **Contraseña** |

**Flujo principal:**
1. El usuario deja vacíos **Usuario** y **Contraseña** y presiona **Acceder**.
2. La validación propia detecta los dos campos vacíos y **no envía** el formulario.
3. El sistema muestra **solo** el mensaje general grande en la parte baja del formulario: título *"Campos incompletos"* + ayuda *"Por favor, completá los campos solicitados."* (sin mensajes individuales bajo los inputs).
4. Ambos inputs quedan con borde ámbar y el foco pasa a **Usuario** (primer campo faltante).
5. El usuario completa los campos y presiona **Acceder** (→ UC-01.2).

**Flujos alternativos y excepciones:**

| # | Caso | Resultado |
|---|---|---|
| 3a | El usuario completa un solo campo y vuelve a presionar **Acceder** | Desaparece el mensaje general y aparece el mensaje individual debajo del campo que sigue vacío (→ UC-02.1) |
| 5a | El usuario completa ambos campos con credenciales incorrectas | El envío procede → ver [REQ-LOGIN-03](./REQ-LOGIN-03-credenciales-invalidas.md) |

**Postcondiciones:** No se envía ningún request; no se muestra la caja de error de credenciales; el usuario permanece en la pantalla de acceso con los datos ya ingresados conservados.

## 7. Criterios de aceptación

| ID | Criterio (Given / When / Then) |
|---|---|
| CA-2.1 | **Given** la pantalla de acceso con **Usuario** completo y **Contraseña** vacía, **when** el usuario presiona **Acceder**, **then** se muestra *"Por favor, rellená este campo."* debajo del input **Contraseña**, sin mensaje general, y no se realiza ningún request. |
| CA-2.2 | **Given** la pantalla de acceso con **Usuario** vacío y **Contraseña** completa, **when** el usuario presiona **Acceder**, **then** el mensaje aparece debajo del input **Usuario** y el foco va a **Usuario**. |
| CA-2.3 | **Given** ambos campos vacíos, **when** el usuario presiona **Acceder**, **then** se muestra **solo** el mensaje general (*"Campos incompletos"* + *"Por favor, completá los campos solicitados."*), sin mensajes individuales, y el formulario no se envía. |
| CA-2.4 | **Given** un mensaje visible, **when** se muestra, **then** el placeholder del campo sigue visible y el input vacío queda con borde ámbar. |
| CA-2.5 | **Given** los campos completos, **when** el usuario presiona **Acceder**, **then** el formulario se envía normalmente (sin ningún mensaje de advertencia). |
| CA-2.6 | **Given** algún mensaje de advertencia visible, **when** el usuario completa los campos y presiona **Acceder**, **then** los mensajes desaparecen y el envío procede. |
| CA-2.7 | **Given** algún campo vacío, **when** se intenta enviar, **then** no se emite ningún request a `/api/auth/login/`. |

## 8. Fuera de alcance

- Burbuja nativa del navegador y atributo `required` como mecanismo de validación (**eliminados** a propósito por consistencia con REQ-LOGIN-03).
- Validación en vivo mientras se escribe (los mensajes aparecen solo al presionar **Acceder**).
- Validación de formato (longitud mínima, caracteres permitidos, fuerza de contraseña).
- Errores devueltos por el backend (REQ-LOGIN-03).

## 9. Decisiones

| # | Punto | Decisión |
|---|---|---|
| 1 | Mecanismo de validación | **Confirmado (usuario):** se elimina la validación nativa del navegador (`required` + burbuja) y se implementa validación propia en JavaScript, para ser consistente con el manejo de credenciales inválidas, que ya es propio (REQ-LOGIN-03). |
| 2 | Color del mensaje | **Confirmado (usuario):** campos vacíos = **ámbar** (advertencia); credenciales inválidas / error de red = **rojo** (error). Mismo patrón visual, distinto color. |
| 3 | Ubicación de los mensajes | **Confirmado (usuario):** un solo campo vacío → mensaje **debajo de ese input** (como el mockup `Portada — Campos vacíos`); los dos campos vacíos → **mensaje general grande abajo del formulario** (*"Por favor, completá los campos solicitados."*). |
| 4 | Mensajes simultáneos | **Confirmado (usuario):** cuando faltan los dos campos se muestra **solo** el mensaje general; los mensajes individuales no aparecen en ese caso. Decisión tomada por prolijidad estética. |
| 5 | Ubicación del mensaje general | **Decisión (mi llamada):** entre `Group-Contraseña` y `AccederBtn` (slot de alertas del formulario, misma posición que `ErrorBox` de REQ-LOGIN-03). Si lo preferís más abajo (bajo el botón **Acceder**), se ajusta. |
| 6 | Textos | **Decisión (mi llamada):** por campo, *"Por favor, rellená este campo."* (texto del mockup, adaptado al voseo de la app); general, título *"Campos incompletos"* + ayuda *"Por favor, completá los campos solicitados."* (misma jerarquía título+ayuda que REQ-LOGIN-03). Textos ajustables. |
| 7 | Marca de campos vacíos | **Decisión (mi llamada):** borde ámbar en los inputs faltantes + foco en el primer campo vacío, en ambos casos (uno o dos campos faltantes). |
| 8 | Mockup | El frame `Portada — Campos vacíos` muestra la burbuja nativa (`NativeBubble`); se conserva su **ubicación** (mensaje debajo del input) pero se reemplaza la burbuja por un mensaje propio. El frame podría actualizarse para reflejarlo. |
