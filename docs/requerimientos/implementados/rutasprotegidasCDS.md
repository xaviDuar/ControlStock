# Rutas protegidas — Casos de uso

Requerimientos de la funcionalidad **Rutas protegidas** de **¿Cuándo Vence?**, expresados como casos de uso en formato UML detallado.

> Volver a [`funcionalidades.md`](../specs/funcionalidades.md) · Especificación técnica: [`specs/rutasprotegidas.md`](../specs/rutasprotegidas.md)

---

## Tabla de casos de uso

| ID | Caso de uso | Actor principal | Disparador | Resultado |
|----|-------------|-----------------|------------|-----------|
| UC-01 | Acceder a una ruta protegida con sesión | Usuario autenticado | Navega a `/inventario` o `/rotulos` | La pantalla se muestra y los datos se cargan |
| UC-02 | Acceder a una ruta protegida sin sesión | Usuario no autenticado | Intenta abrir `/inventario` o `/rotulos` | Redirección a la portada `/` |

---

## UC-01 — Acceder a una ruta protegida con sesión

**Actor principal:** Usuario autenticado.
**Actor secundario:** Sistema (SPA React + API Django/DRF).
**Objetivo:** Que el usuario con sesión activa vea las pantallas internas y sus datos.
**Disparador:** El usuario navega a `/inventario` o `/rotulos` con sesión iniciada.

### Precondiciones

1. El usuario tiene sesión activa (`user` no nulo en la SPA).
2. El backend está disponible.

### Flujo principal (éxito)

1. El usuario navega a `/inventario` (o `/rotulos`).
2. `ProtectedRoute` evalúa `loading` (falso) y `user` (presente) → renderiza la página interna.
3. La página pide los datos a `/api/...` con `Authorization: Token <token>`.
4. El backend valida el token (`IsAuthenticated`) y responde los datos.
5. La pantalla muestra el contenido.
6. El caso de uso termina con éxito.

**Postcondiciones (éxito):** el usuario ve la pantalla interna con sus datos; el token se usó correctamente.

### Flujos alternativos

**FE-1 — Token inválido en el backend** *(en el paso 3-4)*
- 3a. El backend responde **HTTP 401** con el detalle de DRF.
- 3b. La página muestra el error en una caja roja; el usuario no ve los datos y debe volver a iniciar sesión.

---

## UC-02 — Acceder a una ruta protegida sin sesión

**Actor principal:** Usuario no autenticado (o con sesión liberada).
**Actor secundario:** Sistema (SPA React).
**Objetivo:** Evitar que un usuario sin sesión vea las pantallas internas.
**Disparador:** El usuario intenta abrir `/inventario` o `/rotulos` sin sesión (URL directa, recarga de favorito, historial o redirección interna).

### Precondiciones

1. `user` es nulo en la SPA (nunca inició sesión o cerró sesión).
2. El guard ya terminó de restaurar la sesión (`loading=false`).

### Flujo principal (éxito)

1. El usuario intenta abrir una ruta protegida sin sesión.
2. `ProtectedRoute` evalúa `user` (nulo) → devuelve `<Navigate to="/" replace />`.
3. El historial se reemplaza por `/` (no se puede "volver" a la ruta protegida).
4. La portada muestra el formulario de login.
5. El caso de uso termina: el acceso quedó bloqueado y el usuario fue redirigido.

**Postcondiciones (éxito):** el usuario queda en la portada sin acceso a las pantallas internas.

### Flujos alternativos

**FE-1 — Restaurando sesión (loading)** *(antes del paso 2)*
- 2a. Mientras `loading=true`, `ProtectedRoute` devuelve `null` (no renderiza nada ni redirige).
- 2b. Al terminar, re-evalúa: con sesión → UC-01; sin sesión → redirección (paso 2 de este caso).

### Flujos de excepción

**EX-1 — Intento de acceso directo a la API sin token**
- 1a. Un usuario sin sesión llama a un endpoint `/api/...` (p. ej. desde DevTools).
- 1b. El backend responde **HTTP 401** (*"Las credenciales de autenticación no se proveyeron."*) porque `DEFAULT_PERMISSION_CLASSES = IsAuthenticated`.
- 1c. No se entregan datos; la protección del backend permanece aunque se sortee la UI.

### Postcondiciones (en general)

- **Éxito:** sin sesión → portada; con sesión → pantalla interna.
- **Fallo:** la API rechaza con 401; no hay fuga de datos.

---

Volver a [`funcionalidades.md`](../specs/funcionalidades.md).