from collections.abc import AsyncGenerator
from urllib.parse import urlparse, urlunparse

import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

from app.core.config import settings
from app.core.database import Base, get_db
from app.core.security import create_access_token
from app.main import app
from app.modules.shelters.models import Shelter
from app.modules.users.models import User, UserRole
from app.modules.users.schemas import UserCreate
from app.modules.users.service import UserService


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
async def clean_tables() -> AsyncGenerator[None, None]:
    """Remove all test data after each test to keep tests isolated."""
    yield
    async with test_engine.begin() as conn:
        await conn.execute(delete(Shelter))
        await conn.execute(delete(User))


@pytest_asyncio.fixture
async def admin_user(db_session: AsyncSession) -> User:
    service = UserService(db_session)
    return await service.create_user(
        UserCreate(
            name="Admin",
            email="admin@example.com",
            password="admin-password",
            role=UserRole.ADMIN,
        )
    )


@pytest_asyncio.fixture
async def operator_user(db_session: AsyncSession) -> User:
    service = UserService(db_session)
    return await service.create_user(
        UserCreate(
            name="Operator",
            email="operator@example.com",
            password="operator-password",
            role=UserRole.OPERATOR,
        )
    )


@pytest_asyncio.fixture
def admin_token(admin_user: User) -> str:
    return create_access_token(
        {"sub": str(admin_user.id), "role": admin_user.role.value}
    )


@pytest_asyncio.fixture
def operator_token(operator_user: User) -> str:
    return create_access_token(
        {"sub": str(operator_user.id), "role": operator_user.role.value}
    )


@pytest_asyncio.fixture
def expired_token() -> str:
    from datetime import datetime, timedelta, timezone

    from jose import jwt

    from app.core.config import settings

    payload = {
        "sub": "00000000-0000-0000-0000-000000000000",
        "role": "ADMIN",
        "exp": datetime.now(timezone.utc) - timedelta(minutes=1),
    }
    return jwt.encode(
        payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM
    )
