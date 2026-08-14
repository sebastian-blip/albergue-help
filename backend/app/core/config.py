from functools import lru_cache
from pathlib import Path

from pydantic import PostgresDsn, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


# Try to load .env from the project root first, then from the current directory.
_PROJECT_ROOT = Path(__file__).resolve().parents[3]
_ENV_CANDIDATES = [
    str(_PROJECT_ROOT / ".env"),
    ".env",
]
_ENV_FILE = next((path for path in _ENV_CANDIDATES if Path(path).is_file()), None)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=_ENV_FILE,
        env_file_encoding="utf-8",
        extra="ignore",
    )

    APP_NAME: str = "Albergue Help"
    APP_ENV: str = "development"

    POSTGRES_USER: str = ""
    POSTGRES_PASSWORD: str = ""
    POSTGRES_DB: str = ""
    POSTGRES_HOST: str = "postgres"
    POSTGRES_PORT: int = 5432

    DATABASE_URL: str = ""

    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173"

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def assemble_database_url(cls, value: str, info) -> str:
        if isinstance(value, str) and value:
            return value

        values = info.data
        user = values.get("POSTGRES_USER")
        password = values.get("POSTGRES_PASSWORD")
        db = values.get("POSTGRES_DB")
        host = values.get("POSTGRES_HOST", "postgres")
        port = values.get("POSTGRES_PORT", 5432)

        if not all([user, password, db]):
            return ""

        return str(
            PostgresDsn.build(
                scheme="postgresql+asyncpg",
                username=user,
                password=password,
                host=host,
                port=port,
                path=db,
            )
        )

    @property
    def cors_origins_list(self) -> list[str]:
        return [
            origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()
        ]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
