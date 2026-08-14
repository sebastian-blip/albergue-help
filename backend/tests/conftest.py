from collections.abc import AsyncGenerator
from urllib.parse import urlparse, urlunparse

import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

from app.core.config import settings
from app.core.database import Base, get_db
from app.main import app
from app.modules.shelters.models import Shelter


def _get_test_database_url() -> str:
    """Derive a test database URL from the configured DATABASE_URL."""
    url = settings.DATABASE_URL
    parsed = urlparse(url)
    original_db = parsed.path.strip("/").split("/")[-1]
    test_db = f"{original_db}_test"
    return urlunparse(parsed._replace(path=f"/{test_db}"))


TEST_DATABASE_URL = _get_test_database_url()

test_engine = create_async_engine(
    TEST_DATABASE_URL,
    echo=False,
    future=True,
    poolclass=NullPool,
)

TestSessionLocal = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)


@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_test_database() -> AsyncGenerator[None, None]:
    """Create all tables at the beginning of the test session and drop them after."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await test_engine.dispose()


@pytest_asyncio.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """Provide a fresh database session for each test.

    Tests are responsible for cleaning up any data they create.
    """
    async with TestSessionLocal() as session:
        yield session


@pytest_asyncio.fixture
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Provide an HTTP client with the database dependency overridden."""

    async def _override_get_db() -> AsyncGenerator[AsyncSession, None]:
        yield db_session

    original_override = app.dependency_overrides.get(get_db)
    app.dependency_overrides[get_db] = _override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    if original_override is None:
        app.dependency_overrides.pop(get_db, None)
    else:
        app.dependency_overrides[get_db] = original_override


@pytest_asyncio.fixture(autouse=True)
async def clean_shelters() -> AsyncGenerator[None, None]:
    """Remove all shelters after each test to keep tests isolated."""
    yield
    async with test_engine.begin() as conn:
        await conn.execute(delete(Shelter))
