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
- El `<Footer />` se renderiza globalmente (fuera de `<Routes>` en `App.jsx`), por lo que **ya se muestra** en la pantalla de login: se mantiene (RF-1.12).
- **Se renderiza el Navbar en la pantalla de login (comportamiento actual que se elimina):** hoy `<Navbar />` está fuera de `<Routes>` en `App.jsx` y se muestra en todas las rutas, incluida la portada sin sesión. Este comportamiento queda **prohibido** por RF-1.11: en la pantalla de login no se muestra ningún Navbar (ver [`navbar.md`](../specs/navbar.md)).

## 3. Estado objetivo (qué cambia)

Según el mockup `Portada`, el bloque de identidad pasa a estar compuesto por:

| Elemento (mockup) | Contenido | Cambio respecto del actual |
|---|---|---|
| `Logo` → `LogoIcon` | Icono de la aplicación (taza de café pixel-art) | **Nuevo** — hoy no existe logo gráfico |
| `NameBlock` → `AppName` | `¿CUÁNDO VENCE?` (mayúsculas) | **Cambia** — se decide el título en mayúsculas; el mockup lo muestra *¿Cuándo Vence?* (ver RF-1.8) |
| `NameBlock` → `Tagline` | `Control de vencimientos de productos perecederos` | **Cambia** — hoy dice *"…para productos perecederos"* |
| `PixelLine` | Línea pixel decorativa | Se mantiene |
| `LoginForm` → `Group-Usuario` | Label **Usuario** + `Input-Usuario` | Se mantiene (ver REQ-LOGIN-02) |
| `LoginForm` → `Group-Contraseña` | Label **Contraseña** + `Input-Contraseña` (valor enmascarado `••••••••`) + `EyeToggleBtn` (icono de ojo pixel-art) | **Cambia** — se agrega el botón de ojo (ver RF-1.9) |
| `LoginForm` → `AccederBtn` | Botón con texto **Acceder** | Se mantiene |
| Navbar | — | **No se muestra** — el frame `Portada` del mockup no lo incluye (ver RF-1.11) |
| Párrafo descriptivo | — | **Se elimina** (decisión confirmada: el mockup no lo incluye) |
| Footer | Pie con copyright + línea *"Diseñado para mejorar la gestión de productos perecederos"* | **Se mantiene visible** en la pantalla de login (el frame del mockup no lo incluye, pero se acuerda mostrarlo — ver RF-1.12) |

## 4. Requerimientos funcionales

| ID | Requerimiento |
|---|---|
| RF-1.1 | La ruta `/` (pública) muestra la pantalla de acceso completa: identidad + formulario de login. |
| RF-1.2 | El bloque de identidad muestra: el **icono de la aplicación** (taza de café pixel-art), el nombre **¿CUÁNDO VENCE?**, el tagline **Control de vencimientos de productos perecederos** y la línea pixel, en ese orden. |
| RF-1.3 | El formulario muestra los campos **Usuario** (`type="text"`) y **Contraseña** (`type="password"`), cada uno con su etiqueta, y el botón **Acceder** que envía el formulario. |
| RF-1.4 | Al enviar el formulario con credenciales válidas, el sistema llama a `POST /api/auth/login/`, guarda la sesión (`AuthContext.login`) y navega a `/inventario` (comportamiento actual, sin cambio). |
| RF-1.5 | Mientras se valida, no hay spinner ni mensaje de éxito: la transición es directa al Inventario (comportamiento actual, sin cambio). |
| RF-1.6 | Con sesión iniciada, `/` sigue mostrando los atajos *Ir al Inventario* / *Crear Rótulos* (fuera del alcance del mockup; se mantiene el comportamiento actual). |
| RF-1.7 | El párrafo descriptivo actual del hero (*"Gestioná tu inventario, consultá fechas de expiración…"*) **se elimina**: el mockup no lo incluye. Nota: esto **no** afecta al Footer (ver RF-1.12), que sí se muestra. |
| RF-1.8 | El título se renderiza como **¿CUÁNDO VENCE?** en mayúsculas (se mantiene el estilo original). A diferencia del mockup —que lo muestra *¿Cuándo Vence?*— se decide mantener el título en mayúsculas (decisión del usuario, §9 #3). |
| RF-1.9 | El campo **Contraseña** incluye un botón de ojo (`EyeToggleBtn`, icono pixel-art) a la derecha, dentro del input. Al pulsarlo alterna la visibilidad del valor **mientras se escribe**: `type="text"` (visible) ↔ `type="password"` (enmascarado). No envía el formulario ni borra el valor. |
| RF-1.10 | El icono refleja el estado actual: **ojo abierto** = contraseña oculta (acción: mostrar), **ojo cerrado/tachado** = contraseña visible (acción: ocultar). El botón tiene `type="button"` y `aria-label` dinámico (*"Mostrar contraseña"* / *"Ocultar contraseña"*). |
| RF-1.11 | La pantalla de login (portada **sin sesión iniciada**) **no muestra el Navbar** ni ninguna barra de navegación: solo la identidad y el formulario, tal como el frame `Portada` del mockup. Con sesión iniciada, `/` mantiene el Navbar actual sin cambios. |
| RF-1.12 | La pantalla de login **sí muestra el Footer** (pie de página con copyright *"¿Cuándo Vence? © 2026 — Control de Vencimientos"* y la línea *"Diseñado para mejorar la gestión de productos perecederos"*), como el resto de la app. |

## 5. Requerimientos visuales / no funcionales

| ID | Requerimiento |
|---|---|
| RNF-1.1 | La composición, tipografía, colores y espaciados siguen el mockup `Portada` (`docs/pantallas.pen`), dentro de la estética pixel-art oscura de la aplicación (fuente **Pixelify Sans**, fondo `#111118`, acento verde `#4aaa8a`). |
| RNF-1.2 | El formulario mantiene un ancho acotado (~360px) y centrado; el botón **Acceder** ocupa el 100% del ancho del formulario. |
| RNF-1.3 | El campo **Contraseña** oculta el valor ingresado (máscara de puntos). |
| RNF-1.4 | El asset del logo es `src/frontend/src/assets/logo.png` (taza de café pixel-art recortada, trazo `#4aaa8a` sobre fondo transparente). Se usa **solo la taza**, sin el texto incrustado *¿cuándo vence? / Control de Stock*: el mockup muestra nombre y tagline como elementos de texto propios, con el tagline *Control de vencimientos de productos perecederos*. |
| RNF-1.5 | El icono del ojo (`EyeToggleBtn`) sigue la estética pixel-art de la app (trazo `#4aaa8a` o gris claro sobre fondo oscuro), tamaño acotado (~20px), alineado a la derecha dentro del input de contraseña, sin desplazar ni tapar el valor escrito. |
| RNF-1.6 | La tipografía de toda la app es **Pixelify Sans** (pixel-art), reemplazando a Courier New. Aplica a esta pantalla y al resto de la aplicación. |

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
2. El sistema muestra la pantalla **sin Navbar ni barra de navegación** (solo identidad + formulario); el **Footer** sí se muestra al pie.
3. El sistema muestra el bloque de identidad: icono, **¿CUÁNDO VENCE?**, tagline y línea pixel.
4. El sistema muestra el formulario: **Usuario**, **Contraseña** y botón **Acceder**.

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
| 4a | Hay campos vacíos | No se envía el form; alertas de validación ámbar (mensaje debajo del input vacío, o mensaje general si faltan los dos) → ver [REQ-LOGIN-02](./REQ-LOGIN-02-campos-vacios.md) |
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
| CA-1.1 | **Given** un usuario sin sesión, **when** navega a `/`, **then** ve el icono, el nombre *¿CUÁNDO VENCE?*, el tagline *Control de vencimientos de productos perecederos*, la línea pixel y el formulario con **Usuario**, **Contraseña** y **Acceder** — y no ve el párrafo descriptivo del hero. |
| CA-1.2 | **Given** un usuario sin sesión, **when** mira la pantalla de acceso, **then** los elementos aparecen en este orden vertical: icono → ¿CUÁNDO VENCE? → tagline → línea pixel → formulario (Usuario, Contraseña, Acceder) → Footer; y las únicas diferencias respecto del frame `Portada` son las acordadas: título en mayúsculas (RF-1.8), botón de ojo (RF-1.9) y Footer visible (RF-1.12). |
| CA-1.3 | **Given** credenciales válidas, **when** el usuario presiona **Acceder**, **then** la sesión se crea y la app navega a `/inventario`. |
| CA-1.4 | **Given** un usuario con sesión, **when** navega a `/`, **then** no ve el formulario sino los atajos actuales. |
| CA-1.5 | **Given** la pantalla de acceso con contraseña escrita y oculta (`••••`), **when** el usuario pulsa el botón de ojo, **then** el valor se muestra en texto plano sin perder lo escrito y el icono cambia a su estado "ocultar". |
| CA-1.6 | **Given** la contraseña visible, **when** el usuario vuelve a pulsar el botón de ojo, **then** el campo vuelve a enmascararse y el valor se conserva. |
| CA-1.7 | **Given** un usuario navegando la aplicación (en la pantalla de acceso o en cualquier otra), **when** observa los textos en pantalla, **then** la tipografía que ve es **Pixelify Sans**, sin rastros de la fuente anterior (Courier New). |
| CA-1.8 | **Given** un usuario sin sesión, **when** navega a `/`, **then** no ve ninguna barra de navegación (Navbar): la pantalla muestra solo identidad y formulario. |
| CA-1.9 | **Given** un usuario con sesión, **when** navega a `/`, **then** el Navbar se muestra normalmente (comportamiento actual, sin cambio). |
| CA-1.10 | **Given** un usuario sin sesión, **when** navega a `/`, **then** ve el Footer al pie de la pantalla (junto con identidad y formulario), y no ve el párrafo descriptivo del hero. |

## 8. Fuera de alcance

- Estados de error y validación del formulario (REQ-LOGIN-02 y REQ-LOGIN-03).
- Cambios en el backend, el token o la persistencia de sesión.

## 9. Decisiones resueltas

| # | Punto | Decisión |
|---|---|---|
| 1 | Párrafo descriptivo del hero | **Confirmado:** se elimina para alinearse al mockup (RF-1.7). |
| 2 | Icono del logo | **Confirmado:** asset `src/frontend/src/assets/logo.png` (taza de café pixel-art). Usar solo la taza, sin el texto incrustado (RNF-1.4). |
| 3 | Mayúsculas del título | **Decisión actualizada (usuario):** el título se muestra en mayúsculas **¿CUÁNDO VENCE?** (RF-1.8), a diferencia del mockup (*¿Cuándo Vence?*). Se revierte la decisión anterior, que adoptaba el texto del mockup. |
| 4 | Tipografía | **Confirmado (usuario):** se reemplaza Courier New por **Pixelify Sans** (pixel-art) en toda la app (RNF-1.6). |
| 5 | Ver/ocultar contraseña | **Confirmado (usuario):** botón de ojo pixel-art dentro del input de contraseña que alterna la visibilidad mientras se escribe (RF-1.9/1.10). **Nota:** el mockup `Portada` no incluye este botón — es un cambio acordado sobre el mockup. |
| 6 | Navbar en la pantalla de login | **Confirmado (usuario):** sin sesión iniciada, `/` no muestra el Navbar (igual que el frame `Portada` del mockup). Con sesión iniciada se mantiene. |
| 7 | Footer en la pantalla de login | **Confirmado (usuario):** el Footer **se muestra** en la pantalla de login (RF-1.12), aunque el frame `Portada` del mockup no lo incluya. La eliminación del párrafo descriptivo (RF-1.7) se refiere solo al párrafo del hero, **no** a la línea *"Diseñado para…"* del footer. |
