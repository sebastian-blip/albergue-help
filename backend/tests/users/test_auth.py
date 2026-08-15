import pytest
from httpx import AsyncClient

from app.modules.users.models import User


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient, admin_user: User) -> None:
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@example.com", "password": "admin-password"},
    )

    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient, admin_user: User) -> None:
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@example.com", "password": "wrong-password"},
    )

    assert response.status_code == 401


@pytest.mark.asyncio
async def test_login_nonexistent_email(client: AsyncClient) -> None:
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "nobody@example.com", "password": "any-password"},
    )

    assert response.status_code == 401


@pytest.mark.asyncio
async def test_login_inactive_user(
    client: AsyncClient,
    admin_token: str,
    operator_user: User,
) -> None:
    deactivate = await client.patch(
        f"/api/v1/users/{operator_user.id}/status",
        json={"is_active": False},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert deactivate.status_code == 200

    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "operator@example.com", "password": "operator-password"},
    )

    assert response.status_code == 401


@pytest.mark.asyncio
async def test_valid_jwt_access(client: AsyncClient, admin_token: str) -> None:
    response = await client.get(
        "/api/v1/users",
        headers={"Authorization": f"Bearer {admin_token}"},
    )

    assert response.status_code == 200


@pytest.mark.asyncio
async def test_invalid_jwt_access(client: AsyncClient) -> None:
    response = await client.get(
        "/api/v1/users",
        headers={"Authorization": "Bearer invalid-token"},
    )

    assert response.status_code == 401


@pytest.mark.asyncio
async def test_expired_jwt_access(client: AsyncClient, expired_token: str) -> None:
    response = await client.get(
        "/api/v1/users",
        headers={"Authorization": f"Bearer {expired_token}"},
    )

    assert response.status_code == 401


@pytest.mark.asyncio
async def test_missing_token_access(client: AsyncClient) -> None:
    response = await client.get("/api/v1/users")

    assert response.status_code == 401
