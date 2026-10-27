# REQ-LOGIN-02 — Validación de campos vacíos

**Mockup:** `docs/pantallas.pen` → frame **`Portada — Campos vacíos`** (nodo `lKlaG`)
**Specs vigentes:** [`login.md`](../specs/login.md), [`portada.md`](../specs/portada.md)
**Archivos implicados:** `src/frontend/src/pages/HomePage.jsx`, `src/frontend/src/index.css`

---

## 1. Objetivo

Que el formulario de acceso **no se envíe** si el usuario deja **Usuario** o **Contraseña** vacíos, mostrando la **burbuja de validación nativa del navegador** (*"Por favor, rellena este campo."*) sobre el primer campo incompleto, tal como se ve en el mockup `Portada — Campos vacíos`.

## 2. Estado actual

- Ambos campos (`#username`, `#password`) ya tienen el atributo HTML `required` y los placeholders *"Ingresá tu usuario"* / *"Ingresá tu contraseña"*.
- Al enviar el form vacío, el navegador bloquea el `submit` con su burbuja nativa y **no se ejecuta** `handleSubmit` (no hay request al backend).
- No hay validación propia en JavaScript: la validación es 100% nativa del HTML.

## 3. Estado objetivo (qué cambia)

El mockup confirma y fija este comportamiento como requerimiento. El cambio respecto del estado actual es de **verificación y ajuste fino**, no de reescritura:

| Elemento (mockup) | Contenido | Estado |
|---|---|---|
| `Group-Usuario` → `Input-Usuario` | Placeholder `Ingresá tu usuario` | Se mantiene |
| `NativeBubble` → `NativeBubbleText` | `Por favor, rellena este campo.` | Burbuja **nativa** del navegador, anclada al campo **Usuario** |
| `Group-Contraseña` → `Input-Contraseña` | Placeholder `Ingresá tu contraseña` | Se mantiene |
| `AccederBtn` | **Acceder** | Se mantiene; no envía el form con campos vacíos |

Detalles clave del mockup:
- La burbuja se muestra sobre **Usuario** (el primer campo obligatorio vacío recibe el foco y la burbuja).
- El texto exacto de la burbuja lo define el navegador según su idioma (en es-AR: *"Por favor, rellena este campo."*); el sistema **no** puede garantizar el texto literal en todos los navegadores.

## 4. Requerimientos funcionales

| ID | Requerimiento |
|---|---|
| RF-2.1 | Los campos **Usuario** y **Contraseña** son obligatorios: ninguno puede enviarse vacío. |
| RF-2.2 | Al presionar **Acceder** con algún campo vacío, el navegador muestra su burbuja de validación nativa sobre el primer campo obligatorio vacío y **no se envía** el formulario. |
| RF-2.3 | Mientras la validación nativa esté pendiente, no se ejecuta `handleSubmit` ni se realiza ningún request a `/api/auth/login/`. |
| RF-2.4 | Los campos vacíos muestran sus placeholders: *"Ingresá tu usuario"* y *"Ingresá tu contraseña"*. |
| RF-2.5 | La validación es nativa del HTML (`required`); no se implementa validación custom en JavaScript ni mensajes de error propios para campos vacíos. |

## 5. Requerimientos visuales / no funcionales

| ID | Requerimiento |
|---|---|
| RNF-2.1 | No se estiliza ni se reemplaza la burbuja nativa del navegador (el mockup muestra `NativeBubble`, la burbuja del propio navegador). |
| RNF-2.2 | El foco pasa al primer campo vacío al intentar enviar el formulario (comportamiento nativo). |

## 6. Casos de uso

### UC-02.1 — Intentar acceder con campos vacíos

| | |
|---|---|
| **Actor** | Usuario, sin sesión iniciada |
| **Objetivo** | Completar los datos que faltan para poder iniciar sesión |
| **Precondiciones** | La pantalla de acceso está visible (UC-01.1) |
| **Disparador** | El usuario presiona **Acceder** sin completar Usuario y/o Contraseña |

**Flujo principal:**
1. El usuario deja vacío el campo **Usuario** (y/o **Contraseña**) y presiona **Acceder**.
2. El navegador intercepta el envío gracias a `required` y muestra la burbuja *"Por favor, rellena este campo."* sobre el primer campo obligatorio vacío.
3. El foco queda en ese campo, con el placeholder visible.
4. El usuario completa el campo faltante y vuelve a presionar **Acceder** (→ UC-01.2).

**Flujos alternativos y excepciones:**

| # | Caso | Resultado |
|---|---|---|
| 2a | Solo **Contraseña** está vacía | La burbuja se muestra sobre el campo **Contraseña** |
| 2b | Ambos campos están vacíos | La burbuja se muestra sobre **Usuario** (primer campo) |
| 2c | El usuario completa un campo y borra el otro | Al reenviar, la burbuja aparece sobre el campo vacío restante |
| 4a | El usuario completa ambos campos con credenciales incorrectas | El envío procede → ver [REQ-LOGIN-03](./REQ-LOGIN-03-credenciales-invalidas.md) |

**Postcondiciones:** No se envía ningún request; no se muestra la caja de error de credenciales; el usuario permanece en la pantalla de acceso con los datos ya ingresados conservados.

## 7. Criterios de aceptación

| ID | Criterio (Given / When / Then) |
|---|---|
| CA-2.1 | **Given** la pantalla de acceso con **Usuario** vacío, **when** el usuario presiona **Acceder**, **then** el navegador muestra la burbuja *"Por favor, rellena este campo."* sobre **Usuario** y no se realiza ningún request. |
| CA-2.2 | **Given** la pantalla de acceso con **Contraseña** vacía y **Usuario** completo, **when** el usuario presiona **Acceder**, **then** la burbuja se muestra sobre **Contraseña**. |
| CA-2.3 | **Given** ambos campos vacíos, **when** el usuario presiona **Acceder**, **then** la burbuja se muestra sobre **Usuario** y el formulario no se envía. |
| CA-2.4 | **Given** un campo vacío, **when** se muestra la burbuja, **then** el texto del placeholder del campo (*"Ingresá tu usuario"* / *"Ingresá tu contraseña"*) sigue visible. |
| CA-2.5 | **Given** los campos completos, **when** el usuario presiona **Acceder**, **then** el formulario se envía normalmente (sin burbujas). |

## 8. Fuera de alcance

- Mensajes de validación propios (custom) o validación en JavaScript.
- Validación de formato (longitud mínima, caracteres permitidos, fuerza de contraseña).
- Errores devueltos por el backend (REQ-LOGIN-03).

## 9. Decisiones

| # | Punto | Decisión |
|---|---|---|
| 1 | Texto literal de la burbuja | **Decisión (mi llamada):** se acepta el mensaje nativo del navegador tal cual (coincide con el mockup en es-AR: *"Por favor, rellena este campo."*); no se fuerza un texto propio. |

---

Volver al [índice de requerimientos](./README.md).
