# Home (v2)

Funcionalidad que **muestra la pantalla de bienvenida del usuario tras iniciar sesión, con su foto de perfil, un saludo y los paneles de resumen del local** en **¿Cuándo Vence?**. Es una de las funcionalidades listadas en [`0000-index.md`](../0000-index.md).

---

## Qué hace

- Es la pantalla a la que llega el usuario después de iniciar sesión ([`login.md`](./login.md)): vive en la ruta `/home`, protegida — solo accesible con sesión iniciada ([`rutasprotegidas.md`](./rutasprotegidas.md)).
- Muestra el título **Home** y una tarjeta de bienvenida con el recuadro de la foto de perfil a la izquierda y, a su derecha, el saludo **Hola,** seguido del nombre de usuario.
- La foto se consulta al backend (`GET /api/auth/me/`); si la cuenta no tiene foto — o si la llamada falla —, el recuadro muestra un avatar genérico pixel-art.
- Debajo muestra la sección **Resumen del local** con dos paneles: **Vencimientos próximos** y **Último desperdicio**, cada uno con el aviso *“por implementar próximamente”* (no consultan datos de la API).
- La foto se administra únicamente desde Django Admin; el Home no permite cargarla ni editarla.

## Experiencia de usuario

1. Tras un login válido, la aplicación navega a `/home` (ver [`login.md`](./login.md)).
2. El Home muestra el título **Home** y la tarjeta de bienvenida: el recuadro con la foto de perfil y, a su derecha, **Hola,** seguido del nombre de usuario.
3. Debajo, la sección **Resumen del local** muestra los dos paneles, cada uno con el aviso *“por implementar próximamente”*.
4. El usuario puede seguir navegando a las otras secciones desde el Navbar.

## Cómo lo hace (implementación)

### Frontend (React + Vite)

| Parte | Archivo | Rol |
|---|---|---|
| Pantalla | `src/frontend/src/pages/HomePage.jsx` | Renderiza el Home en `/home`: pide la foto con `fetchMe()` y compone la bienvenida y el resumen |
| Recuadro de foto | `src/frontend/src/components/FotoPerfil.jsx` | Muestra la `<img>` si hay foto; si no, un `svg` genérico pixel-art |
| Panel | `src/frontend/src/components/PanelHome.jsx` | Recuadro genérico: `section.panel` + `h3.panel-title` con el título + contenido |
| Llamada al backend | `src/frontend/src/api/client.js` | `fetchMe()` hace `GET /api/auth/me/` con `Authorization: Token <token>` |
| Sesión | `src/frontend/src/context/AuthContext.jsx` | Provee `user` (para el saludo) |
| Ruta | `src/frontend/src/App.jsx` | `/home` está envuelta en `ProtectedRoute` |
| Estilos | `src/frontend/src/index.css` | Clases `home-main`, `home-title`, `welcome-card`, `foto-perfil`, `saludo`, `resumen`, `panel`, `panel-title`, `panel-aviso` |

### Flujo paso a paso

1. `ProtectedRoute` deja renderizar `HomePage` solo si hay `user`; sin sesión redirige a la portada.
2. `HomePage` lee `user` de `useAuth()` y, en un `useEffect`, llama `fetchMe()` → `GET /api/auth/me/`.
3. Con la respuesta `{username, id, foto_perfil}`, guarda `me.foto_perfil` en el estado `foto`; si la promesa falla, deja `foto` en `null`.
4. Renderiza: el título `Home`; la tarjeta `welcome-card` con `FotoPerfil(foto)` y el saludo **Hola,** + `user.username`; y la sección `resumen` con `Resumen del local` y los dos `PanelHome`, cada uno con el aviso *“por implementar próximamente”*.
5. `FotoPerfil` decide: si hay `foto`, una `<img src={foto} alt="Foto de perfil" />`; si no, un `svg` genérico (`role="img"`, `aria-label="Avatar genérico pixel-art"`).
6. `PanelHome` arma `section.panel` (más la variante `panel--vencimientos` o `panel--desperdicio`) con su `h3.panel-title` y el contenido.

### Nota sobre el backend

- **`GET /api/auth/me/`** (`me` en `src/backend/Inventory/api.py`; ruta en `src/backend/controlStock/urls.py`) exige token (`IsAuthenticated`) y responde `{username, id, foto_perfil}`.
- Para `foto_perfil` busca el `PerfilUsuario` del usuario (`related_name='perfil'`): si existe y tiene foto, devuelve su URL absoluta (`build_absolute_uri(foto.url)`); si no existe el perfil o no hay foto, devuelve `null`.
- `PerfilUsuario` (`src/backend/Inventory/models.py`) es un `OneToOneField` a usuario (`CASCADE`) con `foto_perfil` como `ImageField(upload_to='perfiles/', null=True, blank=True)`; la imagen se sirve desde `MEDIA`.
- La foto se carga desde Django Admin (inline `PerfilUsuarioInline` dentro del usuario); el Home solo la muestra.

## Validaciones y casos límite

| Situación | Comportamiento |
|---|---|
| Sin sesión → `/home` | `ProtectedRoute` redirige a `/` (portada de acceso) |
| Cuenta con foto | El recuadro muestra la imagen (URL absoluta devuelta por el backend) |
| Cuenta sin foto (`foto_perfil` null) | El recuadro muestra el avatar genérico pixel-art |
| `GET /api/auth/me/` falla (red o error) | El `catch` deja la foto en `null`: se muestra el avatar genérico y la sesión no se cierra |
| Usuario sin `PerfilUsuario` en la BD | El backend devuelve `foto_perfil: null` |
| Paneles de resumen | Muestran *“por implementar próximamente”*; no se consulta la API de vencimientos ni de desperdicios |

## Limitaciones conocidas

- La foto de perfil no se puede cargar ni editar desde el Home; se gestiona en Django Admin.
- El Home hace una única llamada (`GET /api/auth/me/`); si falla no muestra error, solo el avatar genérico, y la sesión sigue activa.
- Los paneles **Vencimientos próximos** y **Último desperdicio** son placeholders: no traen datos reales (quedan para una v2 de cada funcionalidad).

---

Volver a [`0000-index.md`](../0000-index.md).
