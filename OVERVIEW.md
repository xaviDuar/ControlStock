# ¿Cuándo Vence? — Overview

## Objetivo del proyecto

El objetivo de **¿Cuándo Vence?** es eliminar el sistema obsoleto de control de vencimientos de productos perecederos en una cafetería (planillas impresas, anotaciones manuscritas y memoria de los compañeros) y reemplazarlo por una herramienta digital centralizada que permita:

- **Saber al instante** cuándo vence cada producto elaborado según su método de conservación (refrigerado, congelado, bodega o toppinera).
- **Reducir pérdidas** por productos vencidos.
- **Evitar riesgos** de servir productos en mal estado.
- **Agilizar la tarea diaria** de control de stock del local.

El sistema cataloga tipos de producto con sus tiempos de vencimiento, consulta el inventario con búsqueda rápida y genera rótulos para marcar fechas de elaboración/vencimiento en cada producto.

## Alcance

- Backend: Django 6.0.5 + SQLite3 con API REST (DRF) en `/api/`.
- Frontend: React 19 + Vite (SPA) que consume la API de Django.
- Autenticación: sesiones + token (usuario por defecto: `admin` / `admin123`).
- Datos reales en `vencimientos.db` — no resetear ni borrar la base sin necesidad.

## Público / usuarios

Personal de cocina y servicio de la cafetería que elabora, rota y controla productos perecederos a diario.

Para más detalle técnico, consultá `README.md` y `AGENTS.md`.