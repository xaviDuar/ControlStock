# AGENTS.md

## Project

¿Cuándo Vence? — Sistema de Control de Vencimientos de productos perecederos para una cafetería. Django 6.0.5 + SQLite3 backend, React 19 + Vite frontend.

> Ver [`OVERVIEW.md`](./OVERVIEW.md) para la descripción del objetivo del proyecto.
> Arquitectura del sistema: [`docs/architecture/ARCHITECTURE.MD`](./docs/architecture/ARCHITECTURE.MD).
> Documentación por lado: [`src/backend/README.md`](./src/backend/README.md) y [`src/frontend/README.md`](./src/frontend/README.md).
> Especificaciones funcionales: [`docs/specs/funcionalidades.md`](./docs/specs/funcionalidades.md) (índice) y `docs/requerimientos/` (casos de uso, `*CDS.md` — archivos temporales para poder implementar las funcionalidades).

## Dev commands

```bash
# Uso diario (producción): Django sirve el build de Vite — UN solo comando
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

# Backend
pip install django djangorestframework django-cors-headers
python manage.py makemigrations
python manage.py migrate
```

## Architecture

- `src/backend/` — Django backend (sirve `/api/`, `/admin/` y el build de Vite en `/`)
- `src/backend/controlStock/` — Django project config (settings, root urls)
- `src/backend/Inventory/` — main app: models (TipoProducto, CondicionVencimiento, Producto, Venta, Desperdicio), REST API (DRF viewsets at `/api/`)
- `src/frontend/` — React SPA (Vite, React Router), única fuente de HTML; talks to Django via `/api/` proxy (dev) o es servido por Django (build)
- `src/backend/db/vencimientos.db` — SQLite database with real production data
- `docs/specs/` — especificación funcional + técnica por funcionalidad (`*.md`)
- `docs/requerimientos/` — casos de uso por funcionalidad (`*CDS.md`), archivos temporales para poder implementar las funcionalidades

El frontend React/Vite renderiza todo el HTML. En producción (uso diario), `npm run build` genera `src/frontend/dist/` y Django lo sirve en `/` (templates DIRS + static). Django no renderiza templates propios.

## API

- `POST /api/auth/login/` — returns token (username + password)
- `GET /api/auth/me/` — current user info (requires auth)
- `GET /api/tipos/` — TipoProducto list (read-only, incluye `condiciones`)
- `GET /api/condiciones/` — CondicionVencimiento list (read-only)
- `GET /api/productos/` — Producto list (read-only, incluye `condicion`)
- `GET /api/ventas/` — Venta list (read-only)
- `GET /api/desperdicios/` — Desperdicio list (read-only)
- `GET /api/metricas/` — rendimiento/desperdicio/ganancia por producto (read-only)

Auth: `rest_framework` with Token (+ Basic) authentication only — SessionAuthentication is excluded on purpose (same-origin SPA would send the session cookie and DRF would demand CSRF). Frontend uses token-based auth.

## Gotchas

- Database has real data — do not drop or reset `db/vencimientos.db` casually
- `CORS_ALLOW_ALL_ORIGINS = True` in settings (dev only)
- Default user: `admin` / `admin123`
- Locale set to `es-ar` (Spanish Argentina)
- Frontend runs on port 5173, Django on 8000 — both must be running for full dev experience
- `tools/inspect_venc.py` and `tools/migrar_vencimientos.py` are standalone utility scripts, not part of the Django app
- `tools/migrar_vencimientos.py` borra `condiciones_vencimiento` si se re-ejecuta — es de un solo uso (la migración real de 2026-06-24 ya se hizo; backup: `db/vencimientos_backup_2026-06-24.db`)
