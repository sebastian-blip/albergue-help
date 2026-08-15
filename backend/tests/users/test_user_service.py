import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.users.exceptions import InvalidCredentialsError, UserAlreadyExistsError
from app.modules.users.models import UserRole
from app.modules.users.schemas import LoginRequest, UserCreate
from app.modules.users.service import UserService


@pytest.fixture
def service(db_session: AsyncSession) -> UserService:
    return UserService(db_session)


@pytest.mark.asyncio
async def test_create_user(service: UserService) -> None:
    data = UserCreate(
        name="Maria",
        email="maria@example.com",
        password="secure-password",
        role=UserRole.OPERATOR,
    )
    user = await service.create_user(data)

    assert user.name == "Maria"
    assert user.email == "maria@example.com"
    assert user.role == UserRole.OPERATOR
    assert user.is_active is True
    assert user.password_hash != "secure-password"


@pytest.mark.asyncio
async def test_authenticate_user(service: UserService) -> None:
    await service.create_user(
        UserCreate(
            name="Maria",
            email="maria@example.com",
            password="secure-password",
            role=UserRole.OPERATOR,
        )
    )

    token = await service.authenticate_user(
        LoginRequest(email="maria@example.com", password="secure-password")
    )

    assert token
    assert isinstance(token, str)


@pytest.mark.asyncio
async def test_authenticate_user_wrong_password(service: UserService) -> None:
    await service.create_user(
        UserCreate(
            name="Maria",
            email="maria@example.com",
            password="secure-password",
            role=UserRole.OPERATOR,
        )
    )

    with pytest.raises(InvalidCredentialsError):
        await service.authenticate_user(
            LoginRequest(email="maria@example.com", password="wrong-password")
        )


@pytest.mark.asyncio
async def test_duplicate_email(service: UserService) -> None:
    data = UserCreate(
        name="Maria",
        email="maria@example.com",
        password="secure-password",
        role=UserRole.OPERATOR,
    )
    await service.create_user(data)

    with pytest.raises(UserAlreadyExistsError):
        await service.create_user(data)


@pytest.mark.asyncio
async def test_update_user_status(service: UserService) -> None:
    user = await service.create_user(
        UserCreate(
            name="Maria",
            email="maria@example.com",
            password="secure-password",
            role=UserRole.OPERATOR,
        )
    )

    updated = await service.update_user_status(user.id, False)
    assert updated.is_active is False
