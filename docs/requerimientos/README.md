# Requerimientos — Cambios en el Login

Requerimientos para **cambiar e implementar las funcionalidades de login** de **¿Cuándo Vence?**, derivados de los mockups **Portada** del archivo de diseño [`docs/pantallas.pen`](../pantallas.pen).

Cada archivo contiene: objetivo, estado actual vs. estado objetivo, requerimientos funcionales, **casos de uso** y criterios de aceptación.

---

## Índice

| ID | Requerimiento | Mockup de referencia | Archivo |
|---|---|---|---|
| REQ-LOGIN-01 | Pantalla de acceso (identidad + formulario) | `Portada` | [REQ-LOGIN-01-portada-acceso.md](./REQ-LOGIN-01-portada-acceso.md) |
| REQ-LOGIN-02 | Validación de campos vacíos | `Portada — Campos vacíos` | [REQ-LOGIN-02-campos-vacios.md](./REQ-LOGIN-02-campos-vacios.md) |
| REQ-LOGIN-03 | Manejo de credenciales inválidas | `Portada — Credenciales inválidas` | [REQ-LOGIN-03-credenciales-invalidas.md](./REQ-LOGIN-03-credenciales-invalidas.md) |

---

## Mockups de origen

Los tres frames viven en [`docs/pantallas.pen`](../pantallas.pen) (lienzo activo del editor pen.dev):

| Frame | Nodo | Muestra |
|---|---|---|
| `Portada` | `IyMfM` | Pantalla de acceso completa: identidad, formulario cargado y botón **Acceder** |
| `Portada — Campos vacíos` | `lKlaG` | Formulario vacío con la burbuja nativa *"Por favor, rellena este campo."* en el campo **Usuario** |
| `Portada — Credenciales inválidas` | `bbrH6` | Formulario con la caja de error *"Credenciales inválidas"* + texto de ayuda |

## Assets de diseño

- **Logo:** `src/frontend/manual/Gemini_Generated_Image_1zovis1zovis1zov (1).jpg` — pixel-art de taza de café (ver [REQ-LOGIN-01](./REQ-LOGIN-01-portada-acceso.md), RNF-1.4).

## Estado actual (resumen)

- **Frontend:** [`src/frontend/src/pages/HomePage.jsx`](../../src/frontend/src/pages/HomePage.jsx) renderiza el hero (`div.hero`) y el form `login-form card` (campos `required`, placeholders *"Ingresá tu usuario"* / *"Ingresá tu contraseña"*). Los estilos están en `src/frontend/src/index.css`.
- **Backend:** `POST /api/auth/login/` (`login_api` en `src/backend/Inventory/api.py`) responde `{"token", "username"}` o `{"error": "Credenciales inválidas"}` con HTTP 400.
- **Sesión:** `src/frontend/src/context/AuthContext.jsx` persiste `localStorage["auth"]`; las rutas van protegidas por `ProtectedRoute`.
- **Specs vigentes:** [`docs/specs/login.md`](../specs/login.md) y [`docs/specs/portada.md`](../specs/portada.md).

## Convenciones de los documentos

- **RF-xx** — requerimiento funcional (qué debe hacer el sistema).
- **UC-xx** — caso de uso (actor, precondiciones, flujo principal, alternativas, postcondiciones).
- **CA-xx** — criterio de aceptación (Given / When / Then).
- **Decisión pendiente** — punto que los mockups no cubren y requiere confirmación antes de implementar.

## Fuera de alcance general

Los mockups "Portada" solo cubren la pantalla de acceso **sin sesión iniciada**. Quedan fuera de estos requerimientos:

- Pantalla de portada con sesión iniciada (atajos *Ir al Inventario* / *Crear Rótulos*) — se mantiene el comportamiento actual.
- Logout, persistencia de sesión y rutas protegidas (ver [`docs/specs/logout.md`](../specs/logout.md), [`docs/specs/sesionpersistente.md`](../specs/sesionpersistente.md), [`docs/specs/rutasprotegidas.md`](../specs/rutasprotegidas.md)).
- Seguridad del token (expiración, rate-limiting, bloqueo de intentos).
