# AGENTS.md

## Estructura de carpetas

```text
proyectoStock/
├── docs/                        # documentación del proyecto
│   ├── architecture/            # arquitectura del sistema (capas, modelo de datos, decisiones)
│   ├── specs/                   # especificación funcional: una spec por funcionalidad + su índice
│   │   ├── aprobadas/           # specs aprobadas — reflejan el código implementado
│   │   └── por-aprobar/         # specs pendientes de aprobación
│   └── requerimientos/          # requerimientos funcionales del sistema
│       ├── implementados/       # ya implementados — SOLO USUARIO (acceso restringido)
│       └── por-implementar/     # pendientes de implementar
├── src/                         # código fuente
│   ├── backend/                 # backend Django (API REST en /api/ y admin; sirve el build del frontend)
│   │   ├── controlStock/        # configuración del proyecto Django
│   │   ├── Inventory/           # app principal (modelos, API REST, serializers, admin)
│   │   │   ├── migrations/      # migraciones de Django
│   │   │   └── management/      # comandos manage.py propios
│   │   ├── db/                  # base de datos SQLite con datos reales de producción
│   │   └── tools/               # scripts utilitarios independientes (un solo uso)
│   └── frontend/                # SPA React (Vite + React Router) — única fuente de HTML
│       ├── src/                 # código de la aplicación
│       │   ├── pages/           # páginas (portada, inventario, productos, rótulos)
│       │   ├── components/      # componentes reutilizables (navbar, footer, formularios)
│       │   ├── context/         # contexto de autenticación (token + usuario)
│       │   ├── api/             # cliente fetch centralizado (inyecta el token)
│       │   └── assets/          # imágenes (logo)
│       ├── public/              # estáticos (favicon, iconos)
│       ├── dist/                # build de producción (lo genera npm run build; gitignored)
│       └── node_modules/        # dependencias npm (gitignored)
└── entorno/                     # entorno virtual Python (gitignored; lo crea setup.bat)
```

## Proyecto

¿Cuándo Vence? — Sistema de Control de Vencimientos de productos perecederos para una cafetería. Django 6.0.5 + SQLite3 backend, React 19 + Vite frontend.

## Índice de documentación

- [`OVERVIEW.md`](./OVERVIEW.md) — objetivo del proyecto.
- [`docs/architecture/ARCHITECTURE.MD`](./docs/architecture/ARCHITECTURE.MD) — arquitectura del sistema: estructura del repositorio, modelo de datos, API REST, flujos y decisiones.
- [`docs/specs/0000-index.md`](./docs/specs/0000-index.md) — índice de specs; cada funcionalidad tiene su spec propia en `docs/specs/`.

## Restricción de acceso — `docs/requerimientos/implementados/`

`docs/requerimientos/implementados/` es **solo para el usuario**. La IA no puede leer esa carpeta — ni listar ni abrir sus archivos — a menos que el usuario lo permita explícitamente. La restricción aplica a cualquier herramienta de lectura (Read, Grep, Glob, scripts) y también a los subagentes. Si necesitás información que esté guardada ahí, pedila al usuario en lugar de leer los archivos.

## Requerimientos — formato obligatorio

Todos los requerimientos de `docs/requerimientos/` (tanto `implementados/` como `por-implementar/`) se redactan con el formato de los REQ-LOGIN (modelo: `docs/requerimientos/implementados/REQ-LOGIN-01-portada-acceso.md`), **un requerimiento por archivo**.

**Archivo y título**

- Archivo: `REQ-<ÁREA>-<NN>-<slug-en-kebab>.md` (ej. `REQ-LOGIN-02-campos-vacios.md`).
- Título: `# REQ-<ÁREA>-<NN> — <Título corto>`.

**Encabezado** — tres líneas en negrita, después del título y antes del primer `---`:

- `**Mockup:**` — frame de `docs/pantallas.pen` y su nodo (o "no aplica").
- `**Specs vigentes:**` — enlaces relativos a las specs afectadas de `docs/specs/` (ej. [`login.md`](../specs/aprobadas/login.md)).
- `**Archivos implicados:**` — archivos del código que toca.

**Cuerpo** — siempre estas 9 secciones numeradas, en este orden:

1. `## 1. Objetivo` — prosa breve: qué debe lograr el requerimiento.
2. `## 2. Estado actual` — cómo está hoy (bullets).
3. `## 3. Estado objetivo (qué cambia)` — tabla `| Elemento (mockup) | Contenido | Estado |`, con estados **Nuevo**, **Cambia**, Se mantiene, **Se elimina**.
4. `## 4. Requerimientos funcionales` — tabla `| ID | Requerimiento |` con IDs `RF-<N>.<M>`.
5. `## 5. Requerimientos visuales / no funcionales` — tabla `| ID | Requerimiento |` con IDs `RNF-<N>.<M>`.
6. `## 6. Casos de uso` — un `### UC-<N>.<M> — <Título>` por caso; cada uno con tabla de metadatos (Actor, Objetivo, Precondiciones, Disparador), **Flujo principal** numerado, **Flujos alternativos y excepciones** (tabla `| # | Caso | Resultado |`) y **Postcondiciones**.
7. `## 7. Criterios de aceptación` — tabla `| ID | Criterio (Given / When / Then) |` con IDs `CA-<N>.<M>`, redactados como **Given** …, **when** …, **then** ….
8. `## 8. Fuera de alcance` — bullets de lo que queda explícitamente afuera.
9. `## 9. Decisiones` (o *Decisiones resueltas*) — tabla `| # | Punto | Decisión |` con las decisiones acordadas y quién las tomó (p. ej. **Confirmado (usuario):**, **Decisión (mi llamada):**).

En los IDs, `<N>` es el número del requerimiento (`01`, `02`, …) y `<M>` un consecutivo interno del propio requerimiento (p. ej. `RF-2.7`, `UC-02.1`, `CA-2.4`). El encabezado y las 9 secciones se conservan también al actualizar un requerimiento existente. Las referencias a otros requerimientos se hacen con enlaces relativos entre archivos.

## Superpowers — archivos y skills globales

- Las skills de Superpowers y sus archivos de soporte deben permanecer en la instalación o configuración global del usuario, fuera de este repositorio. No copiarlos ni instalarlos dentro del proyecto.
- Los artefactos temporales generados al usar Superpowers —planes de implementación, diseños, notas y archivos auxiliares— deben guardarse fuera del repositorio, en una ubicación global del usuario, para que no aparezcan en GitHub.
- No crear carpetas `docs/superpowers/` ni otras carpetas de Superpowers en el proyecto. Si no hay una ubicación global adecuada disponible, mantener el contenido en la sesión y no escribirlo en el repositorio.
- Al terminar la implementación, eliminar los artefactos temporales de Superpowers que se hayan creado fuera del repositorio.
- Esta regla no aplica a la documentación funcional propia del proyecto, que se mantiene en las ubicaciones documentales indicadas en este archivo.

## Comandos de desarrollo

```bash
# Máquina nueva (Windows): setup una sola vez — crea entorno/, instala todo
setup.bat

# Uso diario (producción): Django sirve el build de Vite — UN solo comando
iniciar.bat                       # http://127.0.0.1:8000 (sirve app + API)

# Alternativa manual (con el entorno activado):
cd src/frontend && npm run build    # compilar el frontend (solo si cambió)
cd src/backend
python manage.py runserver          # http://127.0.0.1:8000 (sirve app + API)

# Desarrollo con HMR (Vite + Django por separado)
# Terminal 1 (Django):
cd src/backend
python manage.py runserver          # http://127.0.0.1:8000 (solo API)
# Terminal 2 (Vite):
cd src/frontend && npm install
npm run dev                        # http://localhost:5173 (proxies /api → Django)
npm run lint                       # oxlint

# Backend
pip install django djangorestframework django-cors-headers
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

## Advertencias

- La base de datos tiene datos reales — no borres ni reinicies `src/backend/db/vencimientos.db` a la ligera
- `CORS_ALLOW_ALL_ORIGINS = True` en settings (solo desarrollo)
- Usuario por defecto: `admin` / `admin123`
- Si instalás paquetes Python nuevos dentro del entorno, actualizá `requirements.txt` con `entorno\Scripts\python.exe -m pip freeze`
- `entorno/` (entorno virtual) no se sube a git a propósito — `requirements.txt` lo reconstruye idéntico en cualquier máquina
- Locale configurado en `es-ar` (español Argentina)
- El frontend corre en el puerto 5173, Django en el 8000 — ambos deben estar corriendo para la experiencia de desarrollo completa
- `src/backend/tools/inspect_venc.py` y `src/backend/tools/migrar_vencimientos.py` son scripts utilitarios independientes, no forman parte de la app Django
- `src/backend/tools/migrar_vencimientos.py` borra `condiciones_vencimiento` si se re-ejecuta — es de un solo uso (la migración real de 2026-06-24 ya se hizo; backup: `src/backend/db/vencimientos_backup_2026-06-24.db`)
