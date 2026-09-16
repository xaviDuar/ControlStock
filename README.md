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
| Backend | **Django 6.0.5** (Python 3.13) — API REST (DRF) |
| Base de datos | **SQLite3** |
| Frontend | **React 19 + Vite** (SPA, renderiza todo el HTML) |
| Estética | **Minimalista pixel art** — fondo claro, tipografía monospace, detalles pixelados, logo de pato en pixel art |
| Autenticación | Token-based (login vía API con `admin` / `admin123`) |

## Estructura del proyecto

```
proyectoStock/
├── src/
│   ├── backend/             # Backend Django — sirve app + API — ver src/backend/README.md
│   │   ├── controlStock/    # Configuración principal de Django
│   │   ├── Inventory/       # App de inventario (modelos + API REST)
│   │   ├── vencimientos.db  # Base de datos SQLite con datos reales
│   │   └── manage.py        # CLI de Django
│   └── frontend/            # Frontend React (Vite) — única fuente de HTML — ver src/frontend/README.md
│       ├── src/             # App.jsx, pages/, components/, context/, api/
│       ├── public/          # Assets estáticos
│       ├── index.html
│       └── dist/            # Build de producción que sirve Django
├── AGENTS.md                # Instrucciones de desarrollo para agentes/IA
└── OVERVIEW.md              # Descripción del objetivo del proyecto
```

## Documentación por lado

- [**Backend**](./src/backend/README.md) — modelos de datos, API REST, comandos Django, gotchas.
- [**Frontend**](./src/frontend/README.md) — rutas, estructura de componentes, conexión con la API, comandos Vite.

## Cómo usarlo

### Uso diario (un solo comando)

Django sirve la aplicación y la API; no hay que levantar Vite aparte.

```bash
cd src/backend
python manage.py runserver    # http://127.0.0.1:8000
```

> Si cambiás el frontend, primero compilalo: `cd src/frontend && npm run build`.

### Desarrollo (con HMR)

1. Backend: `cd src/backend && python manage.py runserver` (http://127.0.0.1:8000, solo API)
2. Frontend: `cd src/frontend && npm run dev` (http://localhost:5173, proxies `/api` → Django)

### Login

1. Ingresá a `http://127.0.0.1:8000/` (o `http://localhost:5173/` en dev)
2. Iniciá sesión con:

   - **Usuario:** `admin`
   - **Contraseña:** `admin123`

3. Explorá el inventario y la sección de rótulos

## Próximos pasos (a implementar)

- [ ] Generación e impresión real de rótulos desde una plantilla
- [ ] Filtros avanzados por fecha de vencimiento
- [ ] Alertas de productos próximos a vencer
- [ ] Exportación de reportes
- [ ] Gestión de múltiples usuarios con roles

---

*Creado con el objetivo de mejorar el día a día en la cocina. Porque controlar los vencimientos no debería ser más difícil que hacer el producto.*