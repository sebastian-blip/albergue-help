FROM python:3.12-slim

WORKDIR /app

# Instalar uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Copiar solo los archivos de dependencias para aprovechar cache de Docker
COPY pyproject.toml uv.lock ./

# Sincronizar dependencias sin instalar el grupo de desarrollo
RUN uv sync --no-dev --frozen --no-install-project

# Copiar el resto del código fuente
COPY . .

# Instalar el proyecto
RUN uv sync --no-dev --frozen

# Exponer el puerto por defecto de FastAPI/Uvicorn
EXPOSE 8000

# Comando por defecto (se puede sobreescribir en docker-compose.yml)
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]