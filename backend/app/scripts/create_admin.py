import asyncio
import sys

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.modules.users.service import UserService


def _validate_env() -> tuple[str, str, str]:
    name = settings.ADMIN_NAME.strip()
    email = settings.ADMIN_EMAIL.strip().lower()
    password = settings.ADMIN_PASSWORD

    if not name:
        print("ADMIN_NAME is required")
        sys.exit(1)
    if not email:
        print("ADMIN_EMAIL is required")
        sys.exit(1)
    if not password or len(password) < 8:
        print("ADMIN_PASSWORD is required and must be at least 8 characters")
        sys.exit(1)

    return name, email, password


async def main(session: AsyncSession) -> None:
    name, email, password = _validate_env()
    service = UserService(session)

    user = await service.create_admin_user(
        name=name,
        email=email,
        password=password,
    )

    if user is None:
        print(f"Admin with email {email} already exists. No changes made.")
    else:
        print(f"Admin user created: {user.email}")


async def run() -> None:
    async with AsyncSessionLocal() as session:
        await main(session)


if __name__ == "__main__":
    asyncio.run(run())
