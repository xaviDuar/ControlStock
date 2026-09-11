# AGENTS.md

## Project

¿Cuándo Vence? — Sistema de Control de Vencimientos de productos perecederos para una cafetería. Django 6.0.5 + SQLite3 backend, React 19 + Vite frontend.

> Ver [`OVERVIEW.md`](./OVERVIEW.md) para la descripción del objetivo del proyecto.

## Dev commands

```bash
# Backend (Django)
pip install django djangorestframework django-cors-headers
python manage.py runserver          # http://127.0.0.1:8000
python manage.py makemigrations
python manage.py migrate

# Frontend (React + Vite)
cd frontend && npm install
npm run dev                        # http://localhost:5173 (proxies /api → Django)
npm run lint
npm run build
```

## Architecture

- `controlStock/` — Django project config (settings, root urls)
- `core/` — login/logout views, home template
- `Inventory/` — main app: models (TipoProducto, Producto), views (inventario, rotulos), REST API (DRF viewsets at `/api/`)
- `frontend/` — React SPA (Vite, React Router), talks to Django via `/api/` proxy
- `vencimientos.db` — SQLite database with real production data

## API

- `POST /api/auth/login/` — returns token (username + password)
- `GET /api/auth/me/` — current user info (requires auth)
- `GET /api/tipos/` — TipoProducto list (read-only)
- `GET /api/productos/` — Producto list (read-only)

Auth: `rest_framework` with Session + Token authentication. Frontend uses token-based auth.

## Gotchas

- Database has real data — do not drop or reset `vencimientos.db` casually
- `CORS_ALLOW_ALL_ORIGINS = True` in settings (dev only)
- Default user: `admin` / `admin123`
- Locale set to `es-ar` (Spanish Argentina)
- Frontend runs on port 5173, Django on 8000 — both must be running for full dev experience
- `inspect_venc.py` is a standalone utility script, not part of the Django app
