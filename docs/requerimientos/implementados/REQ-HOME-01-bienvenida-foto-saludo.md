# REQ-HOME-01 — Bienvenida, foto y saludo

**Mockup:** `docs/pantallas.pen` → frame **`Home`** (nodo `kibN3`)
**Specs vigentes:** [`login.md`](../../specs/aprobadas/login.md), [`portada.md`](../../specs/aprobadas/portada.md), [`rutasprotegidas.md`](../../specs/aprobadas/rutasprotegidas.md)
**Archivos implicados:** `src/frontend/src/App.jsx`, `src/frontend/src/pages/HomePage.jsx`, nueva página del Home en `src/frontend/src/pages/`, `src/frontend/src/context/AuthContext.jsx`, `src/frontend/src/components/ProtectedRoute.jsx`

---

## 1. Objetivo

Tras iniciar sesión, llevar al usuario a un Home protegido que lo identifique con un recuadro de foto de perfil y, a su derecha, un saludo con su nombre, siguiendo el mockup. La portada pública conserva el formulario de acceso.

## 2. Estado actual

- `/` muestra el formulario de acceso si no hay sesión; con sesión muestra atajos.
- El login correcto navega a `/inventario`.
- No existe una pantalla de Home ni la ruta `/home`.
- El backend ya soporta la foto de perfil: modelo `PerfilUsuario` con `foto_perfil` (editable desde Django Admin dentro del usuario) y `/api/auth/me/` devuelve `username`, `id` y `foto_perfil`.
- No existe un avatar genérico para cuentas sin foto.

## 3. Estado objetivo (qué cambia)

| Elemento (mockup) | Contenido | Estado |
|---|---|---|
| Ruta `/home` | Pantalla Home protegida; destino del login | **Nuevo** |
| Recuadro de foto | Foto de perfil del usuario; avatar genérico pixel-art si la cuenta no tiene foto | **Nuevo** |
| Saludo | “Hola,” + nombre de usuario, a la derecha del recuadro de foto | **Nuevo** |
| Destino tras el login | El login exitoso navega a `/home` en lugar de `/inventario` | **Cambia** |
| Portada `/` con sesión | Redirige a `/home` en lugar de mostrar atajos | **Cambia** |
| Atajos de sesión en `/` | Se reemplazan por el Home | **Se elimina** |
| Formulario de acceso en `/` | Se mantiene para visitas sin sesión | Se mantiene |

## 4. Requerimientos funcionales

| ID | Requerimiento |
|---|---|
| RF-1.1 | El Home se muestra en la ruta `/home` y requiere sesión iniciada; una solicitud sin sesión redirige a la portada de acceso. |
| RF-1.2 | Tras un login válido, la aplicación navega a `/home` en lugar de `/inventario`. |
| RF-1.3 | Si una persona con sesión abre `/`, la aplicación la redirige a `/home`. |
| RF-1.4 | El Home muestra un recuadro con la foto de perfil de la cuenta, cargada desde Django Admin. |
| RF-1.5 | A la derecha del recuadro de foto se muestra el saludo “Hola,” seguido del nombre de usuario de la sesión. |
| RF-1.6 | Si la cuenta no tiene foto, el recuadro muestra un avatar genérico pixel-art. |
| RF-1.7 | La foto se administra únicamente desde Django Admin; el Home no permite cargarla ni editarla. |

## 5. Requerimientos visuales / no funcionales

| ID | Requerimiento |
|---|---|
| RNF-1.1 | La composición sigue el frame `Home` del mockup y la estética pixel-art de la aplicación (fondo oscuro y acentos verdes). |
| RNF-1.2 | La foto se sirve desde el almacenamiento `MEDIA`; la base de datos conserva solo su ruta. |
| RNF-1.3 | El saludo muestra únicamente el nombre de usuario, sin exponer datos sensibles de la cuenta. |
| RNF-1.4 | Los datos de la cuenta se consultan de forma autenticada y corresponden únicamente al usuario de la sesión. |

## 6. Casos de uso

### UC-01.1 — Entrar al Home luego del login

| | |
|---|---|
| **Actor** | Empleado sin sesión iniciada |
| **Objetivo** | Iniciar sesión y llegar al Home |
| **Precondiciones** | La portada de acceso está visible |
| **Disparador** | El usuario envía credenciales válidas |

**Flujo principal:**
1. El usuario completa el formulario de acceso.
2. El sistema valida las credenciales y crea la sesión.
3. El sistema navega a `/home`.
4. El Home muestra el recuadro con la foto de perfil (o el avatar genérico) y, a su derecha, el saludo con el nombre de usuario.

**Flujos alternativos y excepciones:**

| # | Caso | Resultado |
|---|---|---|
| 1 | Credenciales inválidas | Se muestra el error en la portada y no se accede al Home |
| 2 | La cuenta no tiene foto de perfil | El recuadro muestra el avatar genérico pixel-art |
| 3 | La sesión no llega a crearse | Se muestra el error correspondiente y el usuario permanece en la portada |

**Postcondiciones:** El usuario autenticado queda en el Home y puede navegar a las otras secciones.

### UC-01.2 — Abrir la aplicación con sesión iniciada

| | |
|---|---|
| **Actor** | Empleado con sesión iniciada |
| **Objetivo** | Volver al Home tras recargar o al entrar a la raíz del sitio |
| **Precondiciones** | Existe una sesión válida en el navegador |
| **Disparador** | La persona abre `/` o `/home` |

**Flujo principal:**
1. El sistema detecta la sesión iniciada.
2. Si la persona abrió `/`, la redirige a `/home`.
3. El Home muestra el recuadro de foto y el saludo con el nombre de usuario.

**Flujos alternativos y excepciones:**

| # | Caso | Resultado |
|---|---|---|
| 1 | No hay sesión válida | Se redirige a la portada de acceso |
| 2 | La cuenta no tiene foto de perfil | El recuadro muestra el avatar genérico pixel-art |

**Postcondiciones:** El usuario queda en el Home autenticado.

## 7. Criterios de aceptación

| ID | Criterio (Given / When / Then) |
|---|---|
| CA-1.1 | **Given** un login válido, **when** se crea la sesión, **then** la ruta final es `/home`. |
| CA-1.2 | **Given** una persona sin sesión, **when** abre `/home`, **then** se la redirige a la portada de acceso. |
| CA-1.3 | **Given** una persona con sesión, **when** abre `/`, **then** se la redirige a `/home`. |
| CA-1.4 | **Given** una cuenta con foto configurada desde Django Admin, **when** carga el Home, **then** el recuadro muestra esa foto. |
| CA-1.5 | **Given** una cuenta sin foto, **when** carga el Home, **then** el recuadro muestra el avatar genérico pixel-art. |
| CA-1.6 | **Given** un usuario autenticado, **when** carga el Home, **then** aparece “Hola,” junto a su nombre de usuario a la derecha de la foto. |
| CA-1.7 | **Given** la portada con sesión iniciada, **when** se carga `/`, **then** no se muestran los atajos antiguos y se redirige al Home. |

## 8. Fuera de alcance

- Cargar o editar la foto de perfil desde el frontend.
- Administrar usuarios desde el Home.
- Cambiar la autenticación, la política de contraseñas o la forma en que se almacenan.
- Los paneles de vencimientos y desperdicio (REQ-HOME-02).
- Accesos de navegación al Home desde el navbar.

## 9. Decisiones

| # | Punto | Decisión |
|---|---|---|
| 1 | Contenido del Home | Confirmado (usuario): recuadro con la foto a la izquierda y, a la derecha, un saludo con “Hola” y el nombre de usuario. |
| 2 | Foto de perfil | Confirmado (usuario): se carga desde Django Admin, junto con el alta de usuarios; el Home solo la muestra. |
| 3 | Avatar sin foto | Decisión (mi llamada): si la cuenta no tiene foto se muestra un avatar genérico pixel-art. |
| 4 | Entrada al Home | Decisión (mi llamada): login exitoso y visita autenticada a `/` llevan a `/home`; `/` conserva el login para visitas sin sesión. |
| 5 | Backend de la foto | Decisión (mi llamada): se reutiliza el modelo `PerfilUsuario` y `/api/auth/me/` existentes; no hay cambios de backend en este requerimiento. |
