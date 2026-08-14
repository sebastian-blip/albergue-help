# Albergue Help

Aplicación web/PWA para encontrar albergues disponibles durante situaciones de emergencia en Colombia.

## Arquitectura inicial

```text
Frontend
   |
   v
FastAPI
   |
   v
PostgreSQL
```

## Stack

```text
Frontend
- React
- Vite
- TypeScript
- Tailwind CSS

Backend
- Python
- FastAPI
- SQLAlchemy
- PostgreSQL
- Alembic
- uv

Infrastructure
- Docker
- Docker Compose
```

## Estructura

```text
albergue-help/
├── backend/          # API construida con FastAPI
│   ├── app/          # Código fuente del backend
│   ├── tests/        # Pruebas con pytest
│   ├── Dockerfile    # Imagen Docker basada en uv
│   ├── pyproject.toml
│   └── uv.lock
├── frontend/         # Aplicación React/Vite/TypeScript
│   ├── src/          # Código fuente del frontend
│   ├── public/       # Archivos estáticos
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

### `backend/`

Contiene el proyecto Python gestionado con `uv`. Incluye la estructura de carpetas preparada para `api`, `core`, `models`, `repositories`, `schemas`, `services` y `utils`.

### `frontend/`

Contiene la aplicación React inicializada con Vite y configurada con TypeScript y Tailwind CSS. Incluye la estructura de carpetas preparada para `components`, `pages`, `services`, `types` y `utils`.

### `docker-compose.yml`

Orquesta los servicios `frontend`, `backend` y `postgres`. Las variables de entorno se cargan desde un archivo `.env` basado en `.env.example`.

## Configuración inicial

1. Copiar `.env.example` a `.env` y completar los valores:

   ```bash
   cp .env.example .env
   ```

2. Levantar los servicios con Docker Compose:

   ```bash
   docker compose up --build
   ```

## Estado del proyecto

Este repositorio contiene únicamente la estructura inicial del proyecto. La funcionalidad del MVP (autenticación, endpoints, modelos de base de datos, interfaces y mapas) se desarrollará en siguientes iteraciones.