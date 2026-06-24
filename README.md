# ¿Cuándo Vence? — Sistema de Control de Vencimientos

## ¿Por qué esta aplicación?

Trabajo en una cafetería y detecté que el sistema de control de vencimientos de productos perecederos era **obsoleto y mejorable**. Dependíamos de planillas impresas, anotaciones manuscritas y la memoria de los compañeros para saber cuándo vencía cada producto. Esto generaba pérdidas por productos vencidos, riesgo de servir productos en mal estado y una gestión ineficiente del stock.

Después de analizar el flujo de trabajo en el local, decidí crear **¿Cuándo Vence?** para ayudar a mis compañeros y optimizar esta tarea diaria.

## ¿Qué hace ¿Cuándo Vence??

- **Catalogar tipos de producto** con sus tiempos de vencimiento según el método de conservación (refrigerado, congelado, bodega, toppinera)
- **Consultar el inventario** con una vista en tabla vertical y un buscador por nombre para filtrar rápido
- **Generar rótulos** seleccionando productos y asignando una fecha de elaboración, con una interfaz similar a un carrito de compras — pero en lugar de "comprar", el botón dice "Crear Rótulos"

## Stack tecnológico

| Componente | Tecnología |
|---|---|
| Backend | **Django 6.0.5** (Python 3.13) |
| Base de datos | **SQLite3** |
| Frontend | HTML, CSS vanilla, JavaScript |
| Estética | **Minimalista pixel art** — fondo claro, tipografía monospace, detalles pixelados, logo de pato en pixel art |
| Autenticación | Sistema de usuarios de Django con login por formulario y manejo de sesiones |

## Estructura del proyecto

```
proyectoStock/
├── controlStock/            # Configuración principal de Django
│   ├── settings.py          # Config general, BD, templates, static
│   ├── urls.py              # Routing raíz
│   └── wsgi.py / asgi.py    # Entrypoints de despliegue
├── core/                    # App principal
│   ├── views.py             # Home con login + logout
│   ├── urls.py              # Rutas de core
│   └── templates/
│       └── home.html        # Portada con login
├── Inventory/               # App de inventario
│   ├── models.py            # TipoProducto y Producto
│   ├── views.py             # Inventario (lista + búsqueda) y Rótulos
│   ├── urls.py              # Rutas de inventario
│   ├── admin.py             # Registro en el panel admin de Django
│   ├── templates/
│   │   ├── inventario.html  # Tabla vertical de productos con buscador
│   │   └── rotulos.html     # Carrito para crear rótulos
│   └── migrations/          # Migraciones de base de datos
├── templates/
│   └── base.html            # Template base con nav, logo pato y footer
├── static/
│   └── css/
│       └── style.css        # Estilo minimalista pixel art
├── vencimientos.db          # Base de datos SQLite con datos reales
└── manage.py                # CLI de Django
```

## Modelos de datos

### TipoProducto (`tipo_producto`)
Representa un tipo de producto con sus tiempos de vencimiento según el método de conservación:

| Campo | Tipo | Descripción |
|---|---|---|
| `nombre` | Texto (único) | Nombre del producto (ej: "ALFAJOR DE PISTACHO") |
| `vencimiento_refrigerado` | Texto | Tiempo en refrigerador (ej: "72 HS") |
| `vencimiento_congelado` | Texto | Tiempo en freezer (ej: "6 MESES") |
| `vencimiento_bodega` | Texto | Tiempo en bodega/despensa |
| `vencimiento_toppinera` | Texto | Tiempo en vidriera/salida |
| `observaciones` | Texto | Notas adicionales |

### Producto (`producto`)
Representa una unidad física de producto elaborado:

| Campo | Tipo | Descripción |
|---|---|---|
| `id_tipo_producto` | FK a TipoProducto | Qué tipo de producto es |
| `fecha_elaboracion` | Fecha | Cuándo se elaboró |
| `cantidad` | Decimal | Unidades producidas |
| `proveedor` | Texto | Origen / proveedor |

## Rutas

| URL | Vista | Requiere login | Descripción |
|---|---|---|---|
| `/` | `home` | No | Portada con login |
| `/inventario/` | `inventario` | Sí | Tabla vertical de tipos de producto con buscador |
| `/inventario/rotulos/` | `rotulos` | Sí | Carrito para armar lista de rótulos |
| `/admin/` | Admin Django | Sí (staff) | Panel de administración |
| `/logout/` | `logout_view` | No | Cierra sesión |

## Cómo usarlo

1. Cloná el repositorio
2. Instalá las dependencias: `pip install django`
3. Iniciá el servidor: `python manage.py runserver`
4. Ingresá a `http://127.0.0.1:8000/`
5. Iniciá sesión con:

   - **Usuario:** `admin`
   - **Contraseña:** `admin123`

6. Explorá el inventario y la sección de rótulos

## Próximos pasos (a implementar)

- [ ] Generación e impresión real de rótulos desde una plantilla
- [ ] Filtros avanzados por fecha de vencimiento
- [ ] Alertas de productos próximos a vencer
- [ ] Exportación de reportes
- [ ] Gestión de múltiples usuarios con roles

---

*Creado con el objetivo de mejorar el día a día en la cocina. Porque controlar los vencimientos no debería ser más difícil que hacer el producto.*
