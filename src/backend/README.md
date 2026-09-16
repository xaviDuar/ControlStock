# Backend — Django

Backend de **¿Cuándo Vence?**: Django 6.0.5 + Django REST Framework + SQLite3. Sirve la API en `/api/`, el admin en `/admin/` **y el build de producción del frontend** (React/Vite) en `/`.

## Uso diario (un solo comando)

```bash
python manage.py runserver    # http://127.0.0.1:8000 (sirve app + API)
```

> El frontend debe estar compilado en `src/frontend/dist/` (`npm run build` desde `src/frontend`). Los templates y assets apuntan ahí via `FRONTEND_DIST`.

## Estructura

```
backend/
├── controlStock/          # Configuración del proyecto Django
│   ├── settings.py        # Config general, BD
│   ├── urls.py            # Routing raíz (/api/, /admin/)
│   └── wsgi.py / asgi.py  # Entrypoints de despliegue
├── Inventory/             # App principal
│   ├── models.py          # TipoProducto, CondicionVencimiento, Producto, Venta, Desperdicio
│   ├── api.py             # DRF viewsets + auth + métricas
│   ├── serializers.py
│   ├── admin.py
│   └── migrations/        # Migraciones de base de datos
├── vencimientos.db        # Base de datos SQLite con datos reales
├── manage.py              # CLI de Django
├── inspect_venc.py        # Script utilitario (no parte del app)
└── migrar_vencimientos.py # Script de migración legacy (un solo uso)
```

## Modelos de datos

### TipoProducto (`tipo_producto`)
Representa un tipo de producto con sus tiempos de vencimiento según el método de conservación:

| Campo | Tipo | Descripción |
|---|---|---|
| `nombre` | Texto (único) | Nombre del producto (ej: "ALFAJOR DE PISTACHO") |
| `vencimiento_refrigerado` | Texto | Tiempo en refrigerador (ej: "72 HS") — legacy |
| `vencimiento_congelado` | Texto | Tiempo en freezer (ej: "6 MESES") — legacy |
| `vencimiento_bodega` | Texto | Tiempo en bodega/despensa — legacy |
| `vencimiento_toppinera` | Texto | Tiempo en vidriera/salida — legacy |
| `observaciones` | Texto | Notas adicionales |

> La fuente de verdad de vencimientos es `CondicionVencimiento`; los campos `vencimiento_*` son solo referencia/exportación.

### CondicionVencimiento (`condiciones_vencimiento`)
Duración de vencimiento para un método de conservación específico (un tipo puede tener varias: ej. congelado "bolsa cerrada" 6 MESES / "bolsa abierta" 3 MESES).

| Campo | Tipo | Descripción |
|---|---|---|
| `id_tipo_producto` | FK a TipoProducto | A qué tipo pertenece |
| `metodo` | Texto | refrigerado \| congelado \| bodega \| toppinera |
| `anotacion` | Texto | "bolsa cerrada", etc. |
| `duracion_valor` | Entero | 72, 6, 1... |
| `duracion_unidad` | Texto | HS \| DIAS \| MESES \| ANIOS |
| `especial` | Texto | null \| FIN_DEL_DIA \| PROVEEDOR |

### Producto (`producto`)
Representa una unidad física de producto elaborado. Al guardar con `id_condicion` y `fecha_elaboracion`, calcula `fecha_vencimiento` automáticamente.

| Campo | Tipo | Descripción |
|---|---|---|
| `id_tipo_producto` | FK a TipoProducto | Qué tipo de producto es |
| `id_condicion` | FK a CondicionVencimiento | Condición aplicada |
| `fecha_elaboracion` | Fecha | Cuándo se elaboró |
| `fecha_vencimiento` | Fecha | Calculada al guardar |
| `cantidad` | Decimal | Unidades producidas |
| `costo_unitario` | Decimal | Costo por unidad |
| `proveedor` | Texto | Origen / proveedor |

### Venta (`venta`)
| Campo | Tipo | Descripción |
|---|---|---|
| `id_producto` | FK a Producto | Producto vendido |
| `fecha` | Fecha | Cuándo se vendió |
| `cantidad` | Float | Unidades vendidas |
| `precio_unitario` | Decimal | Precio por unidad |

### Desperdicio (`desperdicio`)
| Campo | Tipo | Descripción |
|---|---|---|
| `id_producto` | FK a Producto | Producto descartado |
| `fecha` | Fecha | Cuándo se descartó |
| `cantidad` | Float | Unidades descartadas |
| `motivo` | Texto | vencido \| mal estado \| error cocina... |
| `costo_perdido` | Decimal | Costo perdido |

## API

Todas las rutas requieren autenticación (token) salvo `/api/auth/login/`.

| Método | URL | Descripción |
|---|---|---|
| POST | `/api/auth/login/` | Login, devuelve token + username |
| GET | `/api/auth/me/` | Usuario actual |
| GET | `/api/tipos/` | TipoProducto list (incluye `condiciones`), búsqueda por `?search=` |
| GET | `/api/condiciones/` | CondicionVencimiento list |
| GET | `/api/productos/` | Producto list (incluye `condicion`), búsqueda por `?search=` |
| GET | `/api/ventas/` | Venta list |
| GET | `/api/desperdicios/` | Desperdicio list |
| GET | `/api/metricas/` | Rendimiento / desperdicio / ganancia por producto |

Auth: `rest_framework` con Session + Basic + Token. El frontend usa token-based auth.

## Comandos

```bash
pip install django djangorestframework django-cors-headers
python manage.py runserver          # http://127.0.0.1:8000
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

## Desarrollo con HMR

En desarrollo se corre Vite aparte (http://localhost:5173) que proxea `/api` a este backend. Ver `src/frontend/README.md`.

## Gotchas

- `vencimientos.db` tiene datos reales — no borrarla/resetear casualmente.
- `CORS_ALLOW_ALL_ORIGINS = True` en settings (dev only).
- Default user: `admin` / `admin123`.
- Locale `es-ar`.
- `migrar_vencimientos.py` borra `condiciones_vencimiento` si se re-ejecuta — es de un solo uso (migración real de 2026-06-24 ya hecha; backup: `vencimientos_backup_2026-06-24.db`).