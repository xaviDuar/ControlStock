# Frontend — React + Vite

> Arquitectura general del sistema: [`docs/architecture/ARCHITECTURE.MD`](../../docs/architecture/ARCHITECTURE.MD).

Frontend de **¿Cuándo Vence?**: SPA con React 19 + Vite + React Router. Es la única fuente de HTML; consume la API REST de Django (`src/backend`) a través del proxy `/api`.

## Estructura

```
frontend/
├── public/                 # Assets estáticos (favicon, icons)
├── src/
│   ├── api/client.js       # Cliente HTTP centralizado (fetch + token auth)
│   ├── components/         # Navbar, Footer, DataCell, ProtectedRoute
│   ├── context/AuthContext.jsx  # Estado global de autenticación
│   ├── pages/              # HomePage, InventoryPage, RotulosPage
│   ├── App.jsx             # Rutas y layout principal
│   ├── index.css           # Estilo minimalista pixel art
│   └── main.jsx            # Entrypoint de React
├── index.html              # HTML raíz que renderiza Vite
├── package.json
└── vite.config.js          # Proxy /api → http://127.0.0.1:8000
```

## Rutas

| URL | Descripción |
|---|---|
| `/` | Portada con login |
| `/inventario` | Tabla vertical de tipos de producto con buscador (protegida) |
| `/rotulos` | Carrito para armar lista de rótulos (protegida) |

Las rutas protegidas usan `ProtectedRoute`, que redirige a `/` si no hay token en `localStorage`.

## Cómo funciona la conexión con el backend

- **Producción (uso diario):** `npm run build` genera `dist/` y Django lo sirve en `/` (no hace falta correr Vite).
- **Desarrollo:** Vite corre en `http://localhost:5173` y proxea `/api/*` a Django en `http://127.0.0.1:8000` (configurado en `vite.config.js`).
- `api/client.js` inyecta el header `Authorization: Token <token>` en cada request.
- `AuthContext` guarda token + usuario en `localStorage` bajo la clave `auth`.

## Comandos

```bash
npm install
npm run dev        # http://localhost:5173 (dev, con HMR)
npm run lint       # oxlint
npm run build      # build de producción a dist/ (lo sirve Django)
```

## Requisitos

- Backend Django corriendo en `http://127.0.0.1:8000` (ver `src/backend/README.md`).
- Usuario por defecto: `admin` / `admin123`.