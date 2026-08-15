import pytest
from httpx import AsyncClient

from app.modules.users.models import User


@pytest.fixture
def shelter_payload() -> dict:
    return {
        "name": "Albergue Test",
        "address": "Carrera 1",
        "neighborhood": "Centro",
        "city": "Cali",
        "department": "Valle",
        "capacity": 100,
        "current_occupancy": 0,
        "phone": "3000000000",
        "contact_name": "Contacto",
    }


@pytest.mark.asyncio
async def test_get_shelters_public(
    client: AsyncClient,
    shelter_payload: dict,
    admin_token: str,
) -> None:
    create_response = await client.post(
        "/api/v1/shelters",
        json=shelter_payload,
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert create_response.status_code == 201

    response = await client.get("/api/v1/shelters")

    assert response.status_code == 200
    assert len(response.json()["items"]) == 1


@pytest.mark.asyncio
async def test_create_shelter_requires_auth(
    client: AsyncClient,
    shelter_payload: dict,
) -> None:
    response = await client.post("/api/v1/shelters", json=shelter_payload)

    assert response.status_code == 401


@pytest.mark.asyncio
async def test_admin_can_create_shelter(
    client: AsyncClient,
    admin_token: str,
    shelter_payload: dict,
) -> None:
    response = await client.post(
        "/api/v1/shelters",
        json=shelter_payload,
        headers={"Authorization": f"Bearer {admin_token}"},
    )

    assert response.status_code == 201


@pytest.mark.asyncio
async def test_operator_can_create_shelter(
    client: AsyncClient,
    operator_token: str,
    shelter_payload: dict,
) -> None:
    response = await client.post(
        "/api/v1/shelters",
        json=shelter_payload,
        headers={"Authorization": f"Bearer {operator_token}"},
    )

    assert response.status_code == 201


@pytest.mark.asyncio
async def test_operator_can_update_shelter(
    client: AsyncClient,
    operator_token: str,
    shelter_payload: dict,
) -> None:
    created = await client.post(
        "/api/v1/shelters",
        json=shelter_payload,
        headers={"Authorization": f"Bearer {operator_token}"},
    )
    shelter_id = created.json()["id"]

    response = await client.put(
        f"/api/v1/shelters/{shelter_id}",
        json={"name": "Updated"},
        headers={"Authorization": f"Bearer {operator_token}"},
    )

    assert response.status_code == 200
    assert response.json()["name"] == "Updated"


@pytest.mark.asyncio
async def test_operator_can_update_occupancy(
    client: AsyncClient,
    operator_token: str,
    shelter_payload: dict,
) -> None:
    created = await client.post(
        "/api/v1/shelters",
        json=shelter_payload,
        headers={"Authorization": f"Bearer {operator_token}"},
    )
    shelter_id = created.json()["id"]

    response = await client.patch(
        f"/api/v1/shelters/{shelter_id}/occupancy",
        json={"current_occupancy": 50},
        headers={"Authorization": f"Bearer {operator_token}"},
    )

    assert response.status_code == 200
    assert response.json()["current_occupancy"] == 50


@pytest.mark.asyncio
async def test_operator_can_delete_shelter(
    client: AsyncClient,
    operator_token: str,
    admin_token: str,
    shelter_payload: dict,
) -> None:
    created = await client.post(
        "/api/v1/shelters",
        json=shelter_payload,
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    shelter_id = created.json()["id"]

    response = await client.delete(
        f"/api/v1/shelters/{shelter_id}",
        headers={"Authorization": f"Bearer {operator_token}"},
    )

    assert response.status_code == 204


@pytest.mark.asyncio
async def test_admin_can_delete_shelter(
    client: AsyncClient,
    admin_token: str,
    shelter_payload: dict,
) -> None:
    created = await client.post(
        "/api/v1/shelters",
        json=shelter_payload,
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    shelter_id = created.json()["id"]

    response = await client.delete(
        f"/api/v1/shelters/{shelter_id}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )

    assert response.status_code == 204
