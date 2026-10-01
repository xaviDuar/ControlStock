# Sesión persistente — Casos de uso

Requerimientos de la funcionalidad **Sesión persistente** de **¿Cuándo Vence?**, expresados como casos de uso en formato UML detallado.

> Volver a [`funcionalidades.md`](../specs/funcionalidades.md) · Especificación técnica: [`specs/sesionpersistente.md`](../specs/sesionpersistente.md)

---

## Tabla de casos de uso

| ID | Caso de uso | Actor principal | Disparador | Resultado |
|----|-------------|-----------------|------------|-----------|
| UC-01 | Mantener sesión al recargar la página | Usuario autenticado | Recarga la página en una ruta protegida | El usuario sigue identificado sin volver a iniciar sesión |
| UC-02 | Liberar sesión al salir | Usuario autenticado | Presiona **Salir (usuario)** en el Navbar | La sesión guardada se elimina y el usuario vuelve a la portada |

---

## UC-01 — Mantener sesión al recargar la página

**Actor principal:** Usuario autenticado.
**Actor secundario:** Sistema (SPA React + `localStorage["auth"]` + backend Django que sirve el `index.html`).
**Objetivo:** Que el usuario siga identificado y con acceso a las rutas protegidas después de recargar la página, sin tener que iniciar sesión de nuevo.
**Disparador:** El usuario con sesión activa recarga la página mientras está en una ruta protegida (p. ej. `/inventario`).

### Precondiciones

1. El usuario inició sesión previamente: existe `localStorage["auth"]` con un JSON válido `{"token": ..., "user": {...}}`.
2. El backend responde el `index.html` del build de Vite para la ruta pedida (catch-all SPA).

### Flujo principal (éxito)

1. El usuario recarga la página en una ruta protegida (F5, refresh, o reapertura del navegador).
2. El servidor responde `index.html` (la SPA se monta de nuevo) y se ejecuta `AuthProvider`.
3. El `useEffect` inicial lee `localStorage.getItem("auth")`; encuentra la sesión guardada.
4. El sistema hace `JSON.parse` y restaura `token` y `user` en el estado global; luego marca `loading=false`.
5. `ProtectedRoute` verifica: mientras `loading=true` no renderiza contenido; al terminar, con `user` presente, deja pasar a `children`.
6. El Navbar muestra el menú de sesión iniciada (*Inventario*, *Rótulos*, **Salir (usuario)**).
7. Los requests a la API incluyen `Authorization: Token <token>`.
8. El caso de uso termina con éxito: el usuario sigue identificado y puede operar sin volver a loguearse.

**Postcondiciones (éxito):**
- El usuario queda identificado en la SPA con la misma sesión previa.
- El acceso a las rutas protegidas se mantiene.
- El token de la API sigue siendo el mismo (persistente).

### Flujos alternativos

**FE-1 — No hay sesión guardada** *(en el paso 3)*
- 3a. Si `localStorage["auth"]` no existe (nunca inició sesión, o cerró sesión), no se restaura usuario: `user` queda `null`.
- 3b. Al terminar `loading`, `ProtectedRoute` redirige al usuario a la portada `/` con `<Navigate to="/" replace />`.
- 3c. El caso de uso termina: el usuario ve el formulario de login.

**FE-2 — Sesión guardada pero token inválido en el backend** *(en el paso 5)*
- 5a. La SPA restaura la sesión igual (no valida el token contra el servidor al arrancar).
- 5b. El primer request a una API protegida responde **HTTP 401** con el detalle de DRF (p. ej. *"Las credenciales de autenticación no se proveyeron."*).
- 5c. La página afectada muestra el mensaje de error; el usuario debe volver a iniciar sesión para operar.

### Flujos de excepción

**EX-1 — Datos corruptos en `localStorage["auth"]`** *(en el paso 3)*
- 3a. Si el valor almacenado no es un JSON válido, el `JSON.parse` lanza una excepción dentro del `useEffect` (no está envuelto en `try/catch`).
- 3b. La sesión no se restaura y el arranque de la aplicación puede quedar interrumpido.
- 3c. *(No hay manejo de este caso en la implementación actual.)*

### Postcondiciones (en general)

- **Éxito:** el usuario conserva la sesión a través de recargas.
- **Fallo:** sin sesión o con sesión corrupta, el usuario queda en la portada (o con error) y no accede a las rutas protegidas.

---

## UC-02 — Liberar sesión al salir

**Actor principal:** Usuario autenticado.
**Actor secundario:** Sistema (SPA React + `localStorage`).
**Objetivo:** Cerrar la sesión del usuario y volver a la portada.
**Disparador:** El usuario presiona el botón **Salir (usuario)** en el Navbar.

### Precondiciones

1. El usuario tiene una sesión activa (restaurada o recién iniciada).

### Flujo principal (éxito)

1. El usuario presiona **Salir (usuario)** en el Navbar.
2. El sistema llama a `AuthContext.logout()`.
3. El sistema elimina `localStorage["auth"]` y anula `token` y `user` en el estado global.
4. `ProtectedRoute` re-renderiza con `user=null` y redirige a la portada `/` (`<Navigate to="/" replace />`).
5. La portada muestra nuevamente el formulario de login.
6. El caso de uso termina con éxito: el usuario quedó sin sesión en la SPA.

**Postcondiciones (éxito):**
- No queda sesión guardada en `localStorage`.
- El usuario está en la portada y puede iniciar sesión de nuevo.
- *Nota:* el token del backend sigue siendo válido (no hay endpoint de logout que lo invalide).

### Flujos de excepción

**EX-1 — Token sigue siendo válido en el backend**
- Si el mismo usuario vuelve a usar ese token (p. ej. desde otra pestaña que no cerró sesión), el backend lo acepta: la liberación es solo del lado de la SPA. No hay excepción visible para el usuario.

### Postcondiciones (en general)

- **Éxito:** sesión liberada en la SPA y redirección a la portada.
- **Fallo:** no aplica en el flujo normal; la liberación es local e inmediata.

---

Volver a [`funcionalidades.md`](../specs/funcionalidades.md).