import uuid

from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.users.models import User


class UserRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create(self, user: User) -> User:
        self.session.add(user)
        await self.session.commit()
        await self.session.refresh(user)
        return user

    async def get_by_id(self, user_id: uuid.UUID) -> User | None:
        result = await self.session.execute(
            select(User).where(User.id == user_id),
        )
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> User | None:
        result = await self.session.execute(
            select(User).where(User.email == email),
        )
        return result.scalar_one_or_none()

    async def get_all(self, *, page: int, page_size: int) -> tuple[list[User], int]:
        total_result = await self.session.execute(
            select(func.count()).select_from(User)
        )
        total = total_result.scalar_one()

        result = await self.session.execute(
            select(User)
            .order_by(desc(User.created_at))
            .offset((page - 1) * page_size)
            .limit(page_size),
        )
        users = result.scalars().all()
        return list(users), total

    async def update(self, user: User) -> User:
        self.session.add(user)
        await self.session.commit()
        await self.session.refresh(user)
        return user
