import pytest
from httpx import AsyncClient

from app.modules.users.models import User, UserRole


@pytest.mark.asyncio
async def test_admin_can_create_user(
    client: AsyncClient,
    admin_token: str,
) -> None:
    response = await client.post(
        "/api/v1/users",
        json={
            "name": "Maria",
            "email": "maria@example.com",
            "password": "secure-password",
            "role": "OPERATOR",
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )

    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Maria"
    assert data["email"] == "maria@example.com"
    assert data["role"] == "OPERATOR"
    assert "password" not in data
    assert "password_hash" not in data


@pytest.mark.asyncio
async def test_operator_cannot_create_user(
    client: AsyncClient,
    operator_token: str,
) -> None:
    response = await client.post(
        "/api/v1/users",
        json={
            "name": "Maria",
            "email": "maria@example.com",
            "password": "secure-password",
            "role": "OPERATOR",
        },
        headers={"Authorization": f"Bearer {operator_token}"},
    )

    assert response.status_code == 403


@pytest.mark.asyncio
async def test_admin_can_list_users(
    client: AsyncClient,
    admin_token: str,
    admin_user: User,
) -> None:
    response = await client.get(
        "/api/v1/users",
        headers={"Authorization": f"Bearer {admin_token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert "password_hash" not in data[0]
    assert "password" not in data[0]


@pytest.mark.asyncio
async def test_operator_cannot_list_users(
    client: AsyncClient,
    operator_token: str,
) -> None:
    response = await client.get(
        "/api/v1/users",
        headers={"Authorization": f"Bearer {operator_token}"},
    )

    assert response.status_code == 403


@pytest.mark.asyncio
async def test_admin_can_update_user(
    client: AsyncClient,
    admin_token: str,
    operator_user: User,
) -> None:
    response = await client.put(
        f"/api/v1/users/{operator_user.id}",
        json={"name": "Updated Operator"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Operator"


@pytest.mark.asyncio
async def test_admin_can_deactivate_user(
    client: AsyncClient,
    admin_token: str,
    operator_user: User,
) -> None:
    response = await client.patch(
        f"/api/v1/users/{operator_user.id}/status",
        json={"is_active": False},
        headers={"Authorization": f"Bearer {admin_token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["is_active"] is False


@pytest.mark.asyncio
async def test_duplicate_email_rejected(
    client: AsyncClient,
    admin_token: str,
    operator_user: User,
) -> None:
    response = await client.post(
        "/api/v1/users",
        json={
            "name": "Duplicate",
            "email": "operator@example.com",
            "password": "secure-password",
            "role": "OPERATOR",
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )

    assert response.status_code == 409


@pytest.mark.asyncio
async def test_email_is_normalized(
    client: AsyncClient,
    admin_token: str,
) -> None:
    response = await client.post(
        "/api/v1/users",
        json={
            "name": "Mixed Case",
            "email": "Mixed@Example.com",
            "password": "secure-password",
            "role": "OPERATOR",
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )

    assert response.status_code == 201
    assert response.json()["email"] == "mixed@example.com"


@pytest.mark.asyncio
async def test_create_admin_user(
    client: AsyncClient,
    admin_token: str,
) -> None:
    response = await client.post(
        "/api/v1/users",
        json={
            "name": "Another Admin",
            "email": "another-admin@example.com",
            "password": "secure-password",
            "role": "ADMIN",
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )

    assert response.status_code == 201
    assert response.json()["role"] == UserRole.ADMIN.value
