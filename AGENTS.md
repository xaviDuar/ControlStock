# AGENTS.md

## Proyecto

¿Cuándo Vence? — Sistema de Control de Vencimientos de productos perecederos para una cafetería. Django 6.0.5 + SQLite3 backend, React 19 + Vite frontend.

> Ver [`OVERVIEW.md`](./OVERVIEW.md) para la descripción del objetivo del proyecto.
> Arquitectura del sistema: [`docs/architecture/ARCHITECTURE.MD`](./docs/architecture/ARCHITECTURE.MD).
> Requerimientos de login: `docs/requerimientos/implementados/` — REQ-LOGIN-01/02/03, derivados de los mockups de `docs/pantallas.pen`. Carpeta **solo para el usuario** (ver *Restricción de acceso*).
> Especificaciones funcionales: [`docs/specs/funcionalidades.md`](./docs/specs/funcionalidades.md) — índice de specs, lista cada funcionalidad con su spec propia en `docs/specs/`.

## Restricción de acceso — `docs/requerimientos/implementados/`

`docs/requerimientos/implementados/` es **solo para el usuario**. La IA no puede leer esa carpeta — ni listar ni abrir sus archivos — a menos que el usuario lo permita explícitamente. La restricción aplica a cualquier herramienta de lectura (Read, Grep, Glob, scripts) y también a los subagentes. Si necesitás información que esté guardada ahí, pedila al usuario en lugar de leer los archivos.

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

## Arquitectura

- `src/backend/` — backend de Django (sirve `/api/`, `/admin/` y el build de Vite en `/`)
- `src/backend/controlStock/` — configuración del proyecto Django (settings, urls raíz)
- `src/backend/Inventory/` — app principal: modelos (TipoProducto, CondicionVencimiento, Producto, Venta, Desperdicio), API REST (viewsets de DRF en `/api/`)
- `src/frontend/` — React SPA (Vite, React Router), única fuente de HTML; se comunica con Django mediante el proxy `/api/` (dev) o es servido por Django (build)
- `src/backend/db/vencimientos.db` — base de datos SQLite con datos reales de producción
- `requirements.txt` — dependencias de Python con versiones fijadas (lo instala `setup.bat`)
- `setup.bat` — setup de una máquina nueva (crea `entorno/`, instala dependencias, build del frontend, migraciones; requiere Python 3.13 y Node.js instalados)
- `iniciar.bat` — arranca la app en http://127.0.0.1:8000
- `docs/specs/` — especificación funcional + técnica por funcionalidad (`*.md`); el índice es `docs/specs/funcionalidades.md`

El frontend React/Vite renderiza todo el HTML. En producción (uso diario), `npm run build` genera `src/frontend/dist/` y Django lo sirve en `/` (templates DIRS + static). Django no renderiza templates propios.

## API

- `POST /api/auth/login/` — devuelve un token (usuario + contraseña)
- `GET /api/auth/me/` — información del usuario actual (requiere autenticación)
- `GET /api/tipos/` — lista de TipoProducto (solo lectura, incluye `condiciones`)
- `GET /api/condiciones/` — lista de CondicionVencimiento (solo lectura)
- `GET /api/productos/` — lista de Producto (solo lectura, incluye `condicion`)
- `GET /api/ventas/` — lista de Venta (solo lectura)
- `GET /api/desperdicios/` — lista de Desperdicio (solo lectura)
- `GET /api/metricas/` — rendimiento/desperdicio/ganancia por producto (solo lectura)

Autenticación: `rest_framework` solo con autenticación por Token (+ Basic) — SessionAuthentication se excluye a propósito (la SPA del mismo origen enviaría la cookie de sesión y DRF exigiría CSRF). El frontend usa autenticación por token.

## Advertencias

- La base de datos tiene datos reales — no borres ni reinicies `db/vencimientos.db` a la ligera
- `CORS_ALLOW_ALL_ORIGINS = True` en settings (solo desarrollo)
- Usuario por defecto: `admin` / `admin123`
- Si instalás paquetes Python nuevos dentro del entorno, actualizá `requirements.txt` con `entorno\Scripts\python.exe -m pip freeze`
- `entorno/` (entorno virtual) no se sube a git a propósito — `requirements.txt` lo reconstruye idéntico en cualquier máquina
- Locale configurado en `es-ar` (español Argentina)
- El frontend corre en el puerto 5173, Django en el 8000 — ambos deben estar corriendo para la experiencia de desarrollo completa
- `tools/inspect_venc.py` y `tools/migrar_vencimientos.py` son scripts utilitarios independientes, no forman parte de la app Django
- `tools/migrar_vencimientos.py` borra `condiciones_vencimiento` si se re-ejecuta — es de un solo uso (la migración real de 2026-06-24 ya se hizo; backup: `db/vencimientos_backup_2026-06-24.db`)
