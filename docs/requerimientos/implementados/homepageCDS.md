# Portada — Casos de uso

Requerimientos de la funcionalidad **Portada** de **¿Cuándo Vence?**, expresados como casos de uso en formato UML detallado.

> Volver a [`funcionalidades.md`](../specs/funcionalidades.md) · Especificación técnica: [`specs/portada.md`](../specs/portada.md)

---

## Tabla de casos de uso

| ID | Caso de uso | Actor principal | Disparador | Resultado |
|----|-------------|-----------------|------------|-----------|
| UC-01 | Ver la portada sin sesión | Usuario no autenticado | Entra a `/` | Ve identidad del sistema + formulario de login |
| UC-02 | Ver la portada con sesión | Usuario autenticado | Entra a `/` | Ve los atajos Ir al Inventario / Crear Rótulos |
| UC-03 | Ir a una sección desde los atajos | Usuario autenticado | Pulsa un atajo | Navega a `/inventario` o `/rotulos` |

---

## UC-01 — Ver la portada sin sesión

**Actor principal:** Usuario no autenticado.
**Actor secundario:** Sistema (SPA React).
**Objetivo:** Presentar el sistema y permitir iniciar sesión.
**Disparador:** El usuario entra a `/` sin sesión (URL directa, recarga, o redirección de una ruta protegida).

### Precondiciones

1. `user` es nulo en la SPA.
2. El backend está disponible (para poder iniciar sesión).

### Flujo principal (éxito)

1. El usuario entra a `/`.
2. La portada muestra el hero: título **¿CUÁNDO VENCE?**, subtítulo, línea pixel y descripción.
3. Debajo se muestra el formulario de login (Usuario, Contraseña, botón **Acceder**).
4. El usuario puede completar sus credenciales y pulsar **Acceder** (continúa el flujo de Login).
5. El caso de uso termina con éxito: la portada está visible y lista para autenticar.

**Postcondiciones (éxito):** el usuario ve la identidad del sistema y el formulario de acceso.

### Flujos alternativos

**FE-1 — Campos vacíos y se pulsa Acceder** *(en el paso 4)*
- 4a. El navegador bloquea el envío por `required` y muestra su mensaje nativo; no hay llamada al backend.

**FE-2 — Credenciales inválidas / fallo de red** *(en el paso 4)*
- 4a. La SPA muestra la caja roja de error (*"Credenciales inválidas"* o *"Error de red"*).
- 4b. El usuario permanece en la portada y puede reintentar.

---

## UC-02 — Ver la portada con sesión

**Actor principal:** Usuario autenticado.
**Actor secundario:** Sistema (SPA React).
**Objetivo:** Mostrar la portada como punto de acceso a las secciones internas.
**Disparador:** El usuario con sesión entra a `/` (pulsa *Inicio* o el logo, o navega).

### Precondiciones

1. `user` no es nulo (sesión iniciada o restaurada).

### Flujo principal (éxito)

1. El usuario entra a `/` con sesión.
2. La portada muestra el hero con la identidad del sistema.
3. En lugar del formulario de login, se muestran los botones **Ir al Inventario** y **Crear Rótulos**.
4. El caso de uso termina con éxito.

**Postcondiciones (éxito):** el usuario ve los atajos; el formulario de login no se muestra.

---

## UC-03 — Ir a una sección desde los atajos

**Actor principal:** Usuario autenticado.
**Actor secundario:** Sistema (SPA React + React Router).
**Objetivo:** Acceder a una sección interna desde la portada.
**Disparador:** El usuario pulsa **Ir al Inventario** o **Crear Rótulos** en la portada.

### Precondiciones

1. El usuario tiene sesión (para que los atajos estén visibles).
2. `ProtectedRoute` deja pasar al tener `user`.

### Flujo principal (éxito)

1. El usuario pulsa **Ir al Inventario**.
2. La SPA navega a `/inventario` (`navigate`), `ProtectedRoute` valida la sesión y renderiza `InventoryPage`.
3. *(O bien)* el usuario pulsa **Crear Rótulos** → navega a `/rotulos` → `RotulosPage`.
4. El caso de uso termina con éxito: el usuario está en la sección elegida.

**Postcondiciones (éxito):** el usuario está en la sección interna correspondiente.

### Flujos alternativos

- No aplican en este flujo (los atajos solo existen con sesión activa).

---

Volver a [`funcionalidades.md`](../specs/funcionalidades.md).