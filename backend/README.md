# Albergue Help - Backend

Backend de la aplicación **Albergue Help**, construido con Python y FastAPI.

## Propósito

Servir como API para ayudar a personas durante situaciones de emergencia en Colombia a encontrar albergues disponibles.

## Stack

- **Python** 3.12+
- **FastAPI**
- **SQLAlchemy** (ORM)
- **Alembic** (migraciones)
- **PostgreSQL**
- **Pydantic** y **Pydantic Settings**
- **uv** (gestor de paquetes y entorno virtual)
- **pytest** (pruebas)

## Estructura

```text
backend/
├── app/
│   ├── main.py        # Punto de entrada de FastAPI
│   ├── core/          # Configuración, seguridad y utilidades centrales
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── dependencies.py
│   │   └── security.py
│   ├── modules/       # Módulos de negocio (monolito modular)
│   │   ├── shelters/
│   │   └── users/
│   └── shared/        # Excepciones y utilidades compartidas entre módulos
│       ├── exceptions.py
│       └── utils.py
├── alembic/           # Migraciones de base de datos
├── tests/             # Pruebas con pytest
├── Dockerfile         # Imagen Docker basada en uv
├── alembic.ini
├── pyproject.toml     # Configuración del proyecto y dependencias
└── uv.lock            # Lock de dependencias generado por uv
```

## Requisitos

- Python 3.12 o superior
- [uv](https://docs.astral.sh/uv/) instalado

## Instalación

```bash
cd backend
uv sync
```

## Ejecución local

```bash
uv run uvicorn app.main:app --reload
```

El endpoint `/health` debe responder con `{"status": "ok"}`.

## Ejecutar pruebas

```bash
uv run pytest
```

## Estado del proyecto

El módulo `shelters` ya está implementado con CRUD básico, paginación, validaciones y migraciones de Alembic. Autenticación, usuarios y funcionalidades adicionales se implementarán en siguientes tareas.

## Endpoints principales

```text
GET    /health
POST   /api/v1/shelters
GET    /api/v1/shelters
GET    /api/v1/shelters/{id}
PUT    /api/v1/shelters/{id}
PATCH  /api/v1/shelters/{id}/occupancy
DELETE /api/v1/shelters/{id}
```

## Migraciones

```bash
uv run alembic upgrade head
```