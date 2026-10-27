# Login según requerimientos — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar los cambios de login definidos en REQ-LOGIN-01/02/03: identidad nueva de la portada (logo + título + tagline), validación de campos vacíos y caja de error con texto de ayuda.

**Architecture:** Cambios acotados al componente `HomePage.jsx` y `index.css` del frontend React. El logo se deriva por script desde el asset existente del manual. Los casos de uso se codifican como tests de componente con Vitest + Testing Library (infra nueva, mínima).

**Tech Stack:** React 19 + Vite 8, Vitest + @testing-library/react + jsdom, PowerShell (System.Drawing) para procesar el asset del logo.

**Spec:** [`docs/requerimientos/REQ-LOGIN-01-portada-acceso.md`](../../requerimientos/REQ-LOGIN-01-portada-acceso.md), [`docs/requerimientos/REQ-LOGIN-02-campos-vacios.md`](../../requerimientos/REQ-LOGIN-02-campos-vacios.md), [`docs/requerimientos/REQ-LOGIN-03-credenciales-invalidas.md`](../../requerimientos/REQ-LOGIN-03-credenciales-invalidas.md)

## Global Constraints

- Textos exactos (verbatim de los requerimientos):
  - Título: `¿Cuándo Vence?` (RF-1.8)
  - Tagline: `Control de vencimientos de productos perecederos` (RF-1.2)
  - Placeholders: `Ingresá tu usuario` / `Ingresá tu contraseña` (RF-2.4)
  - Botón: `Acceder` (RF-1.3)
  - Error credenciales: título `Credenciales inválidas`, ayuda `Revisá el usuario y la contraseña e intentá de nuevo.` (RF-3.1)
  - Error de red: título `Error de red`, ayuda `Revisá tu conexión e intentá de nuevo.` (RF-3.7)
- El párrafo descriptivo del hero se elimina (RF-1.7).
- La validación de campos vacíos es **nativa** (`required`); sin validación custom ni mensajes propios (RF-2.5).
- La caja de error va **dentro del form, entre el campo Contraseña y el botón Acceder** (RF-3.2) con `role="alert"` y `aria-live="polite"` (RNF-3.4).
- El backend no cambia: `POST /api/auth/login/` responde `{"token","username"}` o `{"error": "Credenciales inválidas"}` (400).
- Colores existentes del tema: accent `#4aaa8a`, danger `#d45a5a`, fondo error `#2a1a1a`, fuente Courier New.
- La sesión sigue en `localStorage["auth"]` con la forma `{"token","user"}` (sin cambios en `AuthContext` ni `client.js`).
- Plataforma: Windows (comandos npm/powershell).

## Review Focus

1. **Burbuja nativa de campos vacíos** — jsdom no ejecuta validación nativa; el test debe fijar el comportamiento vía atributos `required` + placeholders (REQ-LOGIN-02 CA-2.1..2.5).
2. **Distinción credenciales vs. red** — `client.js` lanza `Error` con mensaje; distinguir por `message === 'Error de red'` para elegir el texto de ayuda (RF-3.7). Test: CA-3.7.
3. **Conservación de datos tras error** — los valores escritos deben seguir en los campos al mostrar la caja (CA-3.3). Test correspondiente.
4. **Despeje del error al reintentar** — la caja desaparece al iniciar el nuevo intento y reaparece si vuelve a fallar (CA-3.4/3.5). Tests.
5. **Asset del logo en tema oscuro** — el JPG de origen tiene fondo blanco y trazo oscuro; el PNG resultante debe tener fondo transparente y trazo visible sobre `#111118` (RNF-1.4).

---

### Task 1: Infraestructura de tests + test de identidad (falla)

**Files:**
- Modify: `src/frontend/package.json` (deps dev + script `test`)
- Modify: `src/frontend/vite.config.js` (bloque `test` de Vitest)
- Create: `src/frontend/src/pages/HomePage.test.jsx`

**Interfaces:**
- Consumes: componente existente `HomePage` (default export) de `src/frontend/src/pages/HomePage.jsx`.
- Produces: entorno de test ejecutable con `npm run test`; los módulos mockeados `../api/client` (función `loginUser(username, password)`) y `../context/AuthContext` (hook `useAuth()` → `{ user, login }`).

- [ ] **Step 1: Instalar dependencias de test**

Run: `npm install -D vitest @testing-library/react jsdom` (en `src/frontend/`)
Expected: instalación sin errores de peer-deps; si los hay, `--legacy-peer-deps`.

- [ ] **Step 2: Configurar Vitest**

En `vite.config.js` agregar bloque `test: { environment: 'jsdom' }` (importar `defineConfig` de `vite/config` si hace falta) y en `package.json` el script `"test": "vitest run"`.

- [ ] **Step 3: Escribir el test de identidad (falla)**

`src/frontend/src/pages/HomePage.test.jsx` con mocks de `../api/client` y `../context/AuthContext` (`useAuth` → `{ user: null, login: vi.fn() }`), render de `<HomePage />` dentro de `<MemoryRouter>`:

```jsx
test('CA-1.1 muestra identidad y formulario sin párrafo descriptivo', () => {
  render(<MemoryRouter><HomePage /></MemoryRouter>);
  expect(screen.getByAltText('¿Cuándo Vence?')).toBeTruthy();
  expect(screen.getByText('¿Cuándo Vence?')).toBeTruthy();
  expect(screen.getByText('Control de vencimientos de productos perecederos')).toBeTruthy();
  expect(screen.getByLabelText('Usuario')).toBeTruthy();
  expect(screen.getByLabelText('Contraseña')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Acceder' })).toBeTruthy();
  expect(screen.queryByText(/Gestioná tu inventario/)).toBeNull();
});
```

- [ ] **Step 4: Ejecutar el test y verificar que falla**

Run: `npm run test` (en `src/frontend/`)
Expected: FALLA en `getByText('¿Cuándo Vence?')` (el título actual es `¿CUÁNDO VENCE?`).

- [ ] **Step 5: Commit**

```bash
git add src/frontend/package.json src/frontend/package-lock.json src/frontend/vite.config.js src/frontend/src/pages/HomePage.test.jsx
git commit -m "test: infra de tests frontend + test de identidad de portada"
```

### Task 2: Bloque de identidad + asset del logo (REQ-LOGIN-01)

**Files:**
- Create: `tools/preparar_logo.ps1`
- Create: `src/frontend/src/assets/logo.png`
- Modify: `src/frontend/src/pages/HomePage.jsx` (hero)
- Modify: `src/frontend/src/index.css` (estilos `.hero`)

**Interfaces:**
- Consumes: asset origen `src/frontend/manual/Gemini_Generated_Image_1zovis1zovis1zov (1).jpg`.
- Produces: `src/frontend/src/assets/logo.png` importado por `HomePage.jsx`; estructura DOM del hero: `<div class="hero-logo">` (img), `<h1>¿Cuándo Vence?</h1>`, `<p class="hero-sub">`, `div.pixel-line`, luego el form.

- [ ] **Step 1: Crear `tools/preparar_logo.ps1` y generar el logo**

Script (System.Drawing, LockBits): abre el JPG, calcula el bounding box de píxeles oscuros (luminancia < 128) solo en la región superior (`y < 0.65 * height`, donde está la taza; el texto incrustado queda abajo), recorta con padding ~8px, y exporta PNG 32bpp: luminancia > 200 → alfa 0; resto → RGB `#4aaa8a` con `alfa = 255 - luminancia` (antialias). Salida: `src/frontend/src/assets/logo.png`.

Run: `powershell -File tools/preparar_logo.ps1`
Expected: se crea `src/frontend/src/assets/logo.png` (~96x96 o mayor, fondo transparente, trazo verde).

- [ ] **Step 2: Implementar el bloque de identidad en `HomePage.jsx`**

Reemplazar el contenido del `div.hero` (rama sin sesión y con sesión comparten identidad): `import logo from '../assets/logo.png'`; render `<div className="hero-logo"><img src={logo} alt="¿Cuándo Vence?" /></div>`, `<h1>¿Cuándo Vence?</h1>`, `<p className="hero-sub">Control de vencimientos de productos perecederos</p>`, `div.pixel-line`. **Eliminar** el párrafo descriptivo. Mantener intacta la lógica de `handleSubmit` y la lógica `{user ? atajos : form}`.

- [ ] **Step 3: Ajustar estilos del hero en `index.css`**

`.hero-logo img { width: 96px; height: 96px; image-rendering: pixelated; margin: 0 auto 8px; display: block; }`; `.hero h1` sin `letter-spacing` excesivo (mantiene 2px), tamaño 2rem; borrar/neutralizar `.hero p` como selector global si solo aplicaba al párrafo eliminado (verificar que `.hero-sub` conserva su estilo).

- [ ] **Step 4: Ejecutar tests y verificar que pasan**

Run: `npm run test`
Expected: PASS del test de identidad de Task 1.

- [ ] **Step 5: Commit**

```bash
git add tools/preparar_logo.ps1 src/frontend/src/assets/logo.png src/frontend/src/pages/HomePage.jsx src/frontend/src/index.css
git commit -m "feat: identidad de portada segun REQ-LOGIN-01 (logo, titulo, tagline)"
```

### Task 3: Caja de error de login (REQ-LOGIN-03)

**Files:**
- Modify: `src/frontend/src/pages/HomePage.jsx` (render del error + estado)
- Modify: `src/frontend/src/index.css` (`.error-box`)
- Test: `src/frontend/src/pages/HomePage.test.jsx`

**Interfaces:**
- Consumes: `loginUser` mockeado (rechaza con `new Error('Credenciales inválidas')` o `new Error('Error de red')`).
- Produces: componente inline `ErrorBox({ title, hint })` dentro del form, entre el grupo Contraseña y el botón Acceder, con `role="alert"` y `aria-live="polite"`. Estado: `error` pasa a ser objeto `{ title, hint }` o `null`.

- [ ] **Step 1: Escribir los tests de error (fallan)**

```jsx
test('CA-3.1/3.2 credenciales invalidas muestran caja con titulo y ayuda entre password y boton', async () => { /* loginUser rechaza con Error('Credenciales inválidas'); enviar form; assert getByText('Credenciales inválidas') y getByText('Revisá el usuario y la contraseña e intentá de nuevo.'); assert orden DOM: el nodo del error aparece antes que el botón y después del input de contraseña */ });
test('CA-3.3 conserva los datos ingresados tras el error', async () => { /* assert value de ambos inputs igual a lo escrito */ });
test('CA-3.4/3.5 la caja desaparece al reintentar y reaparece si falla de nuevo', async () => { /* primer submit falla -> caja visible; segundo submit (loginUser sigue rechazando) -> tras el nuevo rechazo vuelve a estar visible */ });
test('CA-3.7 fallo de red muestra Error de red con su ayuda', async () => { /* loginUser rechaza Error('Error de red'); assert getByText('Error de red') y getByText('Revisá tu conexión e intentá de nuevo.') */ });
```

- [ ] **Step 2: Ejecutar tests y verificar que fallan**

Run: `npm run test`
Expected: FALLAN los 4 tests (no existe la caja ni los textos de ayuda).

- [ ] **Step 3: Implementar la caja de error en `HomePage.jsx`**

`handleSubmit`: `catch (err) { const esRed = err.message === 'Error de red'; setError({ title: err.message, hint: esRed ? 'Revisá tu conexión e intentá de nuevo.' : 'Revisá el usuario y la contraseña e intentá de nuevo.' }); }`; `setError(null)` al inicio del submit. Render, dentro del form y entre `Group-Contraseña` y el botón: `<div className="error-box" role="alert" aria-live="polite"><p className="error-title">{error.title}</p><p className="error-hint">{error.hint}</p></div>`.

- [ ] **Step 4: Estilos `.error-box` en `index.css`**

`.error-box` (fondo `#2a1a1a`, borde 2px `#d45a5a`, padding 10px 16px, margin-bottom 14px, text-align left), `.error-title` (color `#d45a5a`, font-weight bold, font-size 0.85rem), `.error-hint` (color `#d45a5a` con opacidad ~0.8, font-size 0.75rem, margin-top 4px).

- [ ] **Step 5: Ejecutar tests y verificar que pasan**

Run: `npm run test`
Expected: PASS de los 4 tests nuevos (y los previos siguen pasando).

- [ ] **Step 6: Commit**

```bash
git add src/frontend/src/pages/HomePage.jsx src/frontend/src/index.css src/frontend/src/pages/HomePage.test.jsx
git commit -m "feat: caja de error de login con ayuda segun REQ-LOGIN-03"
```

### Task 4: Tests de regresión de los casos de uso restantes (REQ-LOGIN-01/02)

**Files:**
- Test: `src/frontend/src/pages/HomePage.test.jsx`

**Interfaces:**
- Consumes: `loginUser` mockeado (resuelve `{"token":"t1","username":"admin"}`), `login` mockeado de `useAuth`, `useNavigate` de react-router (mock parcial con `vi.mock('react-router-dom', ...)` conservando `MemoryRouter`).
- Produces: cobertura de UC-01.2, UC-01.3 y REQ-02.

- [ ] **Step 1: Escribir los tests de regresión**

```jsx
test('CA-1.3 UC-01.2 login valido guarda sesion y navega a /inventario', async () => { /* loginUser resuelve; assert loginUser('admin','secret123'); assert login('t1', {username:'admin'}); assert navigate('/inventario') */ });
test('CA-2.1/2.4 REQ-02 ambos campos son requeridos con sus placeholders', () => { /* assert input Usuario: required + placeholder 'Ingresá tu usuario'; idem Contraseña con 'Ingresá tu contraseña' */ });
test('CA-1.4 UC-01.3 con sesion iniciada muestra atajos y no el formulario', () => { /* useAuth devuelve user; assert 'Ir al Inventario' y 'Crear Rótulos'; queryByLabelText('Usuario') === null */ });
```

- [ ] **Step 2: Ejecutar tests**

Run: `npm run test`
Expected: PASS (son tests de caracterización del comportamiento existente; si alguno falla, es un bug real que se corrige antes de continuar).

- [ ] **Step 3: Commit**

```bash
git add src/frontend/src/pages/HomePage.test.jsx
git commit -m "test: casos de uso de login (UC-01.2, UC-01.3, REQ-02)"
```

### Task 5: Actualizar specs y verificación final

**Files:**
- Modify: `docs/specs/login.md`
- Modify: `docs/specs/portada.md`

**Interfaces:**
- Consumes: el código implementado en Tasks 2-4.
- Produces: specs alineadas al comportamiento nuevo (identidad, textos, caja de error con ayuda, error de red).

- [ ] **Step 1: Actualizar `docs/specs/login.md` y `docs/specs/portada.md`**

Ajustar: identidad del hero (logo, `¿Cuándo Vence?`, tagline *Control de vencimientos de productos perecederos*, sin párrafo descriptivo); tabla de validaciones/mensajes con los textos de ayuda; ubicación de la caja de error dentro del form; mención de `role="alert"`; quitar la limitación de "sin tests" (ahora hay tests de componente).

- [ ] **Step 2: Verificación final**

Run: `npm run test` y `npm run build` (en `src/frontend/`); `npm run lint` sin errores nuevos.
Expected: tests PASS, build OK, lint OK.

- [ ] **Step 3: Commit**

```bash
git add docs/specs/login.md docs/specs/portada.md
git commit -m "docs: actualizar specs de login y portada"
```
