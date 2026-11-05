# REQ-HOME-01 — Bienvenida y perfil del usuario

**Mockup:** `docs/pantallas.pen` → frame **`Home`** (nodo `kibN3`)
**Specs vigentes:** [`login.md`](../../specs/login.md), [`portada.md`](../../specs/portada.md)
**Archivos implicados:** `src/frontend/src/App.jsx`, `src/frontend/src/pages/HomePage.jsx`, `src/frontend/src/context/AuthContext.jsx`, `src/frontend/src/components/Navbar.jsx`, `src/backend/Inventory/api.py`, perfil de usuario y Django Admin.

---

## 1. Objetivo

Al iniciar sesión, llevar al usuario a un Home protegido que lo identifique con un saludo y una imagen de perfil opcional, siguiendo el mockup. La portada pública conserva el formulario de acceso.

## 2. Estado actual

- `/` muestra el formulario de acceso si no hay sesión; con sesión muestra atajos.
- El login correcto navega a `/inventario`.
- El usuario disponible en frontend contiene `username`; la API `/api/auth/me/` devuelve `username` e `id`.
- No existe una foto de perfil asociada a la cuenta.

## 3. Estado objetivo

- `/` conserva el login para usuarios no autenticados.
- `/home` es la nueva pantalla inicial protegida. Una autenticación exitosa lleva allí; una persona con sesión que entra a `/` también llega allí.
- La bienvenida muestra **“Hola,”** y el nombre de usuario autenticado.
- El usuario puede tener una foto opcional administrada desde Django Admin. La imagen se guarda como archivo en el almacenamiento `MEDIA` y la base conserva su ruta; sin foto, se muestra el avatar pixelado del mockup.
- La opción **Inicio** de la navegación lleva a `/home`.

## 4. Requerimientos funcionales

| ID | Requerimiento |
|---|---|
| RF-1.1 | La ruta pública `/` muestra el login si no existe una sesión autenticada. |
| RF-1.2 | El Home vive en `/home` y requiere autenticación; una solicitud sin sesión redirige a la portada. |
| RF-1.3 | Tras un login válido, la aplicación navega a `/home` en lugar de `/inventario`. |
| RF-1.4 | Si una sesión válida abre `/`, la aplicación la lleva a `/home`, sin volver a mostrar el formulario ni los atajos antiguos. |
| RF-1.5 | El saludo muestra el nombre de usuario de la sesión actual, sin exponer credenciales. |
| RF-1.6 | Cada usuario puede tener una foto de perfil opcional asociada a su cuenta y administrada desde Django Admin; no se incorpora una función de carga de fotos en el frontend. |
| RF-1.7 | Si la cuenta no tiene foto, el Home muestra el avatar genérico pixelado del mockup. |
| RF-1.8 | La navegación autenticada incluye **Inicio**, con destino `/home`, además de los accesos independientes a Inventario y Productos. |

## 5. Requerimientos visuales / no funcionales

| ID | Requerimiento |
|---|---|
| RNF-1.1 | La composición sigue el frame `Home` y la estética pixel-art existente (Workbench, fondo oscuro y acentos verdes). |
| RNF-1.2 | La foto, si existe, se asocia al usuario autenticado; no se vincula ni se mezcla con la contraseña. |
| RNF-1.3 | El archivo de imagen debe servirse desde el almacenamiento `MEDIA`; SQLite conserva su ruta. Los respaldos y traslados del sistema deben conservar también esos archivos. |
| RNF-1.4 | Los datos de la cuenta se consultan de forma autenticada y corresponden únicamente al usuario actual. |

## 6. Casos de uso

### UC-01.1 — Entrar al Home luego del login

| | |
|---|---|
| **Actor** | Empleado sin sesión iniciada |
| **Objetivo** | Iniciar sesión y llegar al panel principal |
| **Precondiciones** | La portada de acceso está visible |
| **Disparador** | El usuario envía credenciales válidas |

**Flujo principal:**
1. El usuario completa el login.
2. El sistema valida las credenciales y crea la sesión.
3. El sistema navega a `/home`.
4. El Home muestra el saludo y la foto del usuario, o el avatar genérico si no hay foto.

**Postcondiciones:** El usuario autenticado queda en el Home y puede navegar a las otras secciones.

## 7. Criterios de aceptación

| ID | Criterio (Given / When / Then) |
|---|---|
| CA-1.1 | **Given** un login válido, **when** se crea la sesión, **then** la ruta final es `/home`. |
| CA-1.2 | **Given** una persona sin sesión, **when** abre `/home`, **then** se la redirige a `/`. |
| CA-1.3 | **Given** una persona con sesión, **when** abre `/`, **then** se la lleva a `/home`. |
| CA-1.4 | **Given** un usuario autenticado, **when** ve el Home, **then** aparece “Hola,” junto con su nombre de usuario. |
| CA-1.5 | **Given** una cuenta con foto configurada, **when** el Home carga, **then** se muestra esa foto; sin foto, se muestra el avatar genérico. |
| CA-1.6 | **Given** la navegación autenticada, **when** se selecciona Inicio, **then** se abre `/home`; Inventario y Productos conservan destinos separados. |

## 8. Fuera de alcance

- Cambiar la autenticación, la política de contraseñas o la forma en que se almacenan.
- Subir o editar la foto desde una pantalla del frontend.
- Administrar usuarios desde Home.

## 9. Decisiones

| # | Punto | Decisión |
|---|---|---|
| 1 | Foto de perfil | Confirmado por el usuario: opcional, asociada a cada usuario y gestionada desde Django Admin. |
| 2 | Almacenamiento de foto | Confirmado: archivo administrado por Django y ruta en SQLite; no se guardan los bytes de imagen dentro de SQLite. |
| 3 | Fallback visual | Confirmado: si no hay foto, se usa el avatar genérico pixelado del mockup. |
| 4 | Entrada tras autenticación | Confirmado: login exitoso y visita autenticada a `/` llevan a `/home`; `/` conserva el login para visitas sin sesión. |
