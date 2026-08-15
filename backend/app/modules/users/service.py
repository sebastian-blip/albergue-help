import uuid
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, get_password_hash, verify_password
from app.modules.users.exceptions import (
    InactiveUserError,
    InvalidCredentialsError,
    UserAlreadyExistsError,
    UserNotFoundError,
)
from app.modules.users.models import User, UserRole
from app.modules.users.repository import UserRepository
from app.modules.users.schemas import LoginRequest, UserCreate, UserUpdate


class UserService:
    def __init__(self, session: AsyncSession) -> None:
        self.repository = UserRepository(session)

    async def create_user(self, data: UserCreate) -> User:
        existing = await self.repository.get_by_email(data.email)
        if existing is not None:
            raise UserAlreadyExistsError(f"User with email {data.email} already exists")

        user = User(
            name=data.name,
            email=data.email,
            password_hash=get_password_hash(data.password),
            role=data.role,
            is_active=True,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        return await self.repository.create(user)

    async def authenticate_user(self, data: LoginRequest) -> str:
        user = await self.repository.get_by_email(data.email)
        if user is None:
            raise InvalidCredentialsError("Invalid credentials")

        if not user.is_active:
            raise InvalidCredentialsError("Invalid credentials")

        if not verify_password(data.password, user.password_hash):
            raise InvalidCredentialsError("Invalid credentials")

        return create_access_token({"sub": str(user.id), "role": user.role.value})

    async def get_user(self, user_id: uuid.UUID) -> User:
        user = await self.repository.get_by_id(user_id)
        if user is None:
            raise UserNotFoundError(f"User with id {user_id} not found")
        if not user.is_active:
            raise InactiveUserError(f"User with id {user_id} is inactive")
        return user

    async def get_users(self, *, page: int, page_size: int) -> tuple[list[User], int]:
        return await self.repository.get_all(page=page, page_size=page_size)

    async def update_user(self, user_id: uuid.UUID, data: UserUpdate) -> User:
        user = await self.repository.get_by_id(user_id)
        if user is None:
            raise UserNotFoundError(f"User with id {user_id} not found")

        if data.email is not None and data.email != user.email:
            existing = await self.repository.get_by_email(data.email)
            if existing is not None:
                raise UserAlreadyExistsError(
                    f"User with email {data.email} already exists"
                )
            user.email = data.email

        if data.name is not None:
            user.name = data.name
        if data.role is not None:
            user.role = data.role

        user.updated_at = datetime.now(timezone.utc)
        return await self.repository.update(user)

    async def update_user_status(self, user_id: uuid.UUID, is_active: bool) -> User:
        user = await self.repository.get_by_id(user_id)
        if user is None:
            raise UserNotFoundError(f"User with id {user_id} not found")

        user.is_active = is_active
        user.updated_at = datetime.now(timezone.utc)
        return await self.repository.update(user)

    async def create_admin_user(
        self, *, name: str, email: str, password: str
    ) -> User | None:
        existing = await self.repository.get_by_email(email)
        if existing is not None:
            return None

        user = User(
            name=name,
            email=email,
            password_hash=get_password_hash(password),
            role=UserRole.ADMIN,
            is_active=True,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        return await self.repository.create(user)
