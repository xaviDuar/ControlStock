# REQ-LOGIN-01 — Pantalla de acceso (identidad + formulario)

**Mockup:** `docs/pantallas.pen` → frame **`Portada`** (nodo `IyMfM`)
**Specs vigentes:** [`login.md`](../specs/login.md), [`portada.md`](../specs/portada.md)
**Archivos implicados:** `src/frontend/src/pages/HomePage.jsx`, `src/frontend/src/index.css`

---

## 1. Objetivo

Rediseñar la pantalla de acceso (`/`) para que muestre la **identidad del sistema** (logo + nombre + tagline + línea pixel) y el **formulario de login** (Usuario, Contraseña, botón **Acceder**), tal como se ve en el mockup `Portada`.

## 2. Estado actual

- Hero (`div.hero`) con `<h1>¿CUÁNDO VENCE?</h1>` (mayúsculas), subtítulo *"Control de vencimientos para productos perecederos"*, `div.pixel-line` y un **párrafo descriptivo** (*"Gestioná tu inventario, consultá fechas de expiración y generá rótulos de forma simple y organizada."*).
- Debajo, el form `login-form card` con los campos **Usuario** y **Contraseña** y el botón **Acceder**.
- No hay icono/logo gráfico.

## 3. Estado objetivo (qué cambia)

Según el mockup `Portada`, el bloque de identidad pasa a estar compuesto por:

| Elemento (mockup) | Contenido | Cambio respecto del actual |
|---|---|---|
| `Logo` → `LogoIcon` | Icono de la aplicación (taza de café pixel-art) | **Nuevo** — hoy no existe logo gráfico |
| `NameBlock` → `AppName` | `¿Cuándo Vence?` | **Cambia** — hoy es `¿CUÁNDO VENCE?` en mayúsculas |
| `NameBlock` → `Tagline` | `Control de vencimientos de productos perecederos` | **Cambia** — hoy dice *"…para productos perecederos"* |
| `PixelLine` | Línea pixel decorativa | Se mantiene |
| `LoginForm` → `Group-Usuario` | Label **Usuario** + `Input-Usuario` | Se mantiene (ver REQ-LOGIN-02) |
| `LoginForm` → `Group-Contraseña` | Label **Contraseña** + `Input-Contraseña` (valor enmascarado `••••••••`) | Se mantiene (`type="password"`) |
| `LoginForm` → `AccederBtn` | Botón con texto **Acceder** | Se mantiene |
| Párrafo descriptivo | — | **Se elimina** (decisión confirmada: el mockup no lo incluye) |

## 4. Requerimientos funcionales

| ID | Requerimiento |
|---|---|
| RF-1.1 | La ruta `/` (pública) muestra la pantalla de acceso completa: identidad + formulario de login. |
| RF-1.2 | El bloque de identidad muestra: el **icono de la aplicación** (taza de café pixel-art), el nombre **¿Cuándo Vence?**, el tagline **Control de vencimientos de productos perecederos** y la línea pixel, en ese orden. |
| RF-1.3 | El formulario muestra los campos **Usuario** (`type="text"`) y **Contraseña** (`type="password"`), cada uno con su etiqueta, y el botón **Acceder** que envía el formulario. |
| RF-1.4 | Al enviar el formulario con credenciales válidas, el sistema llama a `POST /api/auth/login/`, guarda la sesión (`AuthContext.login`) y navega a `/inventario` (comportamiento actual, sin cambio). |
| RF-1.5 | Mientras se valida, no hay spinner ni mensaje de éxito: la transición es directa al Inventario (comportamiento actual, sin cambio). |
| RF-1.6 | Con sesión iniciada, `/` sigue mostrando los atajos *Ir al Inventario* / *Crear Rótulos* (fuera del alcance del mockup; se mantiene el comportamiento actual). |
| RF-1.7 | El párrafo descriptivo actual del hero (*"Gestioná tu inventario, consultá fechas de expiración…"*) **se elimina**: el mockup no lo incluye. |
| RF-1.8 | El título se renderiza como **¿Cuándo Vence?** (tal como el mockup), reemplazando el actual *¿CUÁNDO VENCE?* en mayúsculas. |

## 5. Requerimientos visuales / no funcionales

| ID | Requerimiento |
|---|---|
| RNF-1.1 | La composición, tipografía, colores y espaciados siguen el mockup `Portada` (`docs/pantallas.pen`), dentro de la estética pixel-art oscura de la aplicación (fuente Courier New, fondo `#111118`, acento verde `#4aaa8a`). |
| RNF-1.2 | El formulario mantiene un ancho acotado (~360px) y centrado; el botón **Acceder** ocupa el 100% del ancho del formulario. |
| RNF-1.3 | El campo **Contraseña** oculta el valor ingresado (máscara de puntos). |
| RNF-1.4 | El asset del logo es `src/frontend/manual/Gemini_Generated_Image_1zovis1zovis1zov (1).jpg` (pixel-art de taza de café, línea oscura sobre fondo claro). Como la imagen tiene el texto *¿cuándo vence? / Control de Stock* incorporado y el mockup muestra nombre y tagline como elementos de texto propios, se usa **solo la taza** (recorte del asset); si se prefiriera la imagen completa, el tagline del mockup (*Control de vencimientos de productos perecederos*) tiene prioridad sobre el texto incrustado (*Control de Stock*). |

## 6. Casos de uso

### UC-01.1 — Visualizar la pantalla de acceso

| | |
|---|---|
| **Actor** | Usuario (cajero/encargado de la cafetería), sin sesión iniciada |
| **Objetivo** | Ver la identidad del sistema y el formulario para iniciar sesión |
| **Precondiciones** | El usuario no tiene sesión iniciada |
| **Disparador** | El usuario navega a `/` (entrada al sistema o redirección de `ProtectedRoute`) |

**Flujo principal:**
1. El usuario abre la URL `/`.
2. El sistema muestra el bloque de identidad: icono, **¿Cuándo Vence?**, tagline y línea pixel.
3. El sistema muestra el formulario: **Usuario**, **Contraseña** y botón **Acceder**.

**Postcondiciones:** El usuario ve la pantalla de acceso lista para completar sus credenciales.

---

### UC-01.2 — Iniciar sesión con credenciales válidas

| | |
|---|---|
| **Actor** | Usuario, sin sesión iniciada |
| **Objetivo** | Autenticarse para acceder a las secciones protegidas |
| **Precondiciones** | La pantalla de acceso está visible (UC-01.1) |
| **Disparador** | El usuario presiona **Acceder** con usuario y contraseña completos |

**Flujo principal:**
1. El usuario escribe su nombre en **Usuario**.
2. El usuario escribe su contraseña en **Contraseña**.
3. El usuario presiona **Acceder**.
4. El sistema envía `POST /api/auth/login/` con `{"username", "password"}`.
5. El backend valida las credenciales y responde `200` con `{"token", "username"}`.
6. El sistema guarda la sesión (estado React + `localStorage["auth"]`).
7. El sistema navega a `/inventario`.

**Flujos alternativos y excepciones:**

| # | Caso | Resultado |
|---|---|---|
| 4a | Hay campos vacíos | El navegador bloquea el envío → ver [REQ-LOGIN-02](./REQ-LOGIN-02-campos-vacios.md) |
| 5a | Credenciales incorrectas | El backend responde `400` → ver [REQ-LOGIN-03](./REQ-LOGIN-03-credenciales-invalidas.md) |
| 5b | Fallo de red / backend caído | Se muestra la caja de error *"Error de red"* con texto de ayuda → ver [REQ-LOGIN-03](./REQ-LOGIN-03-credenciales-invalidas.md) (RF-3.7) |

**Postcondiciones:** La sesión queda iniciada; las rutas protegidas quedan accesibles; el Navbar muestra el menú de usuario.

---

### UC-01.3 — Visualizar la portada con sesión iniciada

| | |
|---|---|
| **Actor** | Usuario con sesión iniciada |
| **Objetivo** | Acceder rápidamente a las secciones principales |
| **Precondiciones** | Existe sesión persistida (`localStorage["auth"]`) |
| **Disparador** | El usuario navega a `/` |

**Flujo principal:**
1. El usuario abre `/`.
2. El sistema detecta la sesión y, en lugar del formulario, muestra los atajos **Ir al Inventario** y **Crear Rótulos** (comportamiento actual, no cubierto por el mockup).

**Postcondiciones:** El usuario accede directamente a la sección elegida.

## 7. Criterios de aceptación

| ID | Criterio (Given / When / Then) |
|---|---|
| CA-1.1 | **Given** un usuario sin sesión, **when** navega a `/`, **then** ve el icono, el nombre *¿Cuándo Vence?*, el tagline *Control de vencimientos de productos perecederos*, la línea pixel y el formulario con **Usuario**, **Contraseña** y **Acceder** — y no ve el párrafo descriptivo del hero. |
| CA-1.2 | **Given** la pantalla de acceso, **when** se compara con el mockup `Portada`, **then** el orden de los elementos y la identidad coinciden con el frame. |
| CA-1.3 | **Given** credenciales válidas, **when** el usuario presiona **Acceder**, **then** la sesión se crea y la app navega a `/inventario`. |
| CA-1.4 | **Given** un usuario con sesión, **when** navega a `/`, **then** no ve el formulario sino los atajos actuales. |

## 8. Fuera de alcance

- Estados de error y validación del formulario (REQ-LOGIN-02 y REQ-LOGIN-03).
- Cambios en el backend, el token o la persistencia de sesión.

## 9. Decisiones resueltas

| # | Punto | Decisión |
|---|---|---|
| 1 | Párrafo descriptivo del hero | **Confirmado:** se elimina para alinearse al mockup (RF-1.7). |
| 2 | Icono del logo | **Confirmado:** asset existente `src/frontend/manual/Gemini_Generated_Image_1zovis1zovis1zov (1).jpg` (taza de café pixel-art). Usar solo la taza, sin el texto incrustado (RNF-1.4). |
| 3 | Mayúsculas del título | **Confirmado:** se adopta el texto del mockup *¿Cuándo Vence?* (RF-1.8). |

---

Volver al [índice de requerimientos](./README.md).
