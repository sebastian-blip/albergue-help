from uuid import uuid4

import asyncio

import pytest
from httpx import AsyncClient

from app.modules.shelters.models import ShelterStatus, VerificationStatus
from app.modules.shelters.schemas import ShelterCreate
from app.modules.shelters.service import ShelterService


@pytest.fixture
def valid_payload() -> dict:
    return {
        "name": "Albergue Comunitario San José",
        "description": "Albergue temporal para familias afectadas",
        "address": "Carrera 10 # 20-30",
        "neighborhood": "San José",
        "city": "Cali",
        "department": "Valle del Cauca",
        "capacity": 100,
        "current_occupancy": 40,
        "phone": "3001234567",
        "contact_name": "Juan Pérez",
    }


@pytest.fixture
def auth_headers(admin_token: str) -> dict:
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.mark.asyncio
async def test_create_shelter(
    client: AsyncClient, valid_payload: dict, auth_headers: dict
) -> None:
    response = await client.post(
        "/api/v1/shelters", json=valid_payload, headers=auth_headers
    )

    assert response.status_code == 201
    data = response.json()
    assert data["name"] == valid_payload["name"]
    assert data["available_capacity"] == 60
    assert data["status"] == ShelterStatus.OPEN.value
    assert data["verification_status"] == VerificationStatus.PENDING.value
    assert "id" in data


@pytest.mark.asyncio
async def test_create_shelter_rejects_invalid_capacity(
    client: AsyncClient, valid_payload: dict, auth_headers: dict
) -> None:
    invalid = {**valid_payload, "capacity": 0}
    response = await client.post("/api/v1/shelters", json=invalid, headers=auth_headers)

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_create_shelter_allows_occupancy_exceeding_capacity(
    client: AsyncClient,
    valid_payload: dict,
    auth_headers: dict,
) -> None:
    payload = {**valid_payload, "capacity": 50, "current_occupancy": 51}
    response = await client.post("/api/v1/shelters", json=payload, headers=auth_headers)

    assert response.status_code == 201
    data = response.json()
    assert data["status"] == ShelterStatus.FULL.value
    assert data["available_capacity"] == -1


@pytest.mark.asyncio
async def test_get_shelter(
    client: AsyncClient, valid_payload: dict, auth_headers: dict
) -> None:
    created = (
        await client.post("/api/v1/shelters", json=valid_payload, headers=auth_headers)
    ).json()
    response = await client.get(f"/api/v1/shelters/{created['id']}")

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == created["id"]
    assert data["name"] == valid_payload["name"]


@pytest.mark.asyncio
async def test_get_shelter_not_found(client: AsyncClient) -> None:
    response = await client.get(f"/api/v1/shelters/{uuid4()}")

    assert response.status_code == 404
    assert response.json()["detail"]


@pytest.mark.asyncio
async def test_list_shelters(
    client: AsyncClient, valid_payload: dict, auth_headers: dict
) -> None:
    await client.post("/api/v1/shelters", json=valid_payload, headers=auth_headers)
    response = await client.get("/api/v1/shelters?page=1&page_size=10")

    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert "page" in data
    assert "page_size" in data
    assert "pages" in data
    assert len(data["items"]) >= 1


@pytest.mark.asyncio
async def test_update_shelter(
    client: AsyncClient, valid_payload: dict, auth_headers: dict
) -> None:
    created = (
        await client.post("/api/v1/shelters", json=valid_payload, headers=auth_headers)
    ).json()
    update = {"name": "Albergue Actualizado"}
    response = await client.put(
        f"/api/v1/shelters/{created['id']}", json=update, headers=auth_headers
    )

    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Albergue Actualizado"
    assert data["status"] == ShelterStatus.OPEN.value


@pytest.mark.asyncio
async def test_update_shelter_occupancy(
    client: AsyncClient, valid_payload: dict, auth_headers: dict
) -> None:
    created = (
        await client.post("/api/v1/shelters", json=valid_payload, headers=auth_headers)
    ).json()
    response = await client.patch(
        f"/api/v1/shelters/{created['id']}/occupancy",
        json={"current_occupancy": 100},
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["current_occupancy"] == 100
    assert data["status"] == ShelterStatus.FULL.value
    assert data["available_capacity"] == 0


@pytest.mark.asyncio
async def test_closed_shelter_remains_closed_after_occupancy_update(
    client: AsyncClient,
    valid_payload: dict,
    auth_headers: dict,
) -> None:
    created = (
        await client.post("/api/v1/shelters", json=valid_payload, headers=auth_headers)
    ).json()

    await client.put(
        f"/api/v1/shelters/{created['id']}",
        json={"status": "CLOSED"},
        headers=auth_headers,
    )

    response = await client.patch(
        f"/api/v1/shelters/{created['id']}/occupancy",
        json={"current_occupancy": 50},
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == ShelterStatus.CLOSED.value


@pytest.mark.asyncio
async def test_delete_shelter(
    client: AsyncClient, valid_payload: dict, auth_headers: dict
) -> None:
    created = (
        await client.post("/api/v1/shelters", json=valid_payload, headers=auth_headers)
    ).json()
    response = await client.delete(
        f"/api/v1/shelters/{created['id']}", headers=auth_headers
    )

    assert response.status_code == 204

    get_response = await client.get(f"/api/v1/shelters/{created['id']}")
    assert get_response.status_code == 404


@pytest.mark.asyncio
async def test_filter_by_city(
    client: AsyncClient, valid_payload: dict, auth_headers: dict
) -> None:
    await client.post("/api/v1/shelters", json=valid_payload, headers=auth_headers)
    response = await client.get("/api/v1/shelters?city=Cali")

    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 1
    assert data["items"][0]["city"] == "Cali"


@pytest.mark.asyncio
async def test_filter_by_city_is_case_insensitive(
    client: AsyncClient, valid_payload: dict, auth_headers: dict
) -> None:
    await client.post("/api/v1/shelters", json=valid_payload, headers=auth_headers)
    response = await client.get("/api/v1/shelters?city=cali")

    assert response.status_code == 200
    assert len(response.json()["items"]) == 1


@pytest.mark.asyncio
async def test_filter_by_neighborhood(
    client: AsyncClient, valid_payload: dict, auth_headers: dict
) -> None:
    await client.post("/api/v1/shelters", json=valid_payload, headers=auth_headers)
    response = await client.get("/api/v1/shelters?neighborhood=San%20José")

    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 1
    assert data["items"][0]["neighborhood"] == "San José"


@pytest.mark.asyncio
async def test_filter_by_city_and_neighborhood(
    client: AsyncClient, valid_payload: dict, auth_headers: dict
) -> None:
    await client.post("/api/v1/shelters", json=valid_payload, headers=auth_headers)
    response = await client.get("/api/v1/shelters?city=Cali&neighborhood=San%20José")

    assert response.status_code == 200
    assert len(response.json()["items"]) == 1


@pytest.mark.asyncio
async def test_filter_by_department(
    client: AsyncClient, valid_payload: dict, auth_headers: dict
) -> None:
    await client.post("/api/v1/shelters", json=valid_payload, headers=auth_headers)
    response = await client.get("/api/v1/shelters?department=Valle%20del%20Cauca")

    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 1
    assert data["items"][0]["department"] == "Valle del Cauca"


@pytest.mark.asyncio
async def test_filter_by_status(
    client: AsyncClient, valid_payload: dict, auth_headers: dict
) -> None:
    await client.post("/api/v1/shelters", json=valid_payload, headers=auth_headers)
    response = await client.get("/api/v1/shelters?status=OPEN")

    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 1
    assert data["items"][0]["status"] == ShelterStatus.OPEN.value


@pytest.mark.asyncio
async def test_filter_by_verification_status(
    client: AsyncClient, valid_payload: dict, auth_headers: dict
) -> None:
    await client.post("/api/v1/shelters", json=valid_payload, headers=auth_headers)
    response = await client.get("/api/v1/shelters?verification_status=PENDING")

    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 1
    assert data["items"][0]["verification_status"] == VerificationStatus.PENDING.value


@pytest.mark.asyncio
async def test_filter_has_capacity_true(
    client: AsyncClient, auth_headers: dict
) -> None:
    await client.post(
        "/api/v1/shelters",
        json={
            "name": "Con cupos",
            "address": "A",
            "neighborhood": "B",
            "city": "Cali",
            "department": "Valle",
            "capacity": 100,
            "current_occupancy": 80,
            "phone": "1",
            "contact_name": "X",
        },
        headers=auth_headers,
    )
    await client.post(
        "/api/v1/shelters",
        json={
            "name": "Lleno",
            "address": "A",
            "neighborhood": "B",
            "city": "Cali",
            "department": "Valle",
            "capacity": 100,
            "current_occupancy": 100,
            "phone": "1",
            "contact_name": "X",
        },
        headers=auth_headers,
    )

    response = await client.get("/api/v1/shelters?has_capacity=true")
    data = response.json()

    assert response.status_code == 200
    assert len(data["items"]) == 1
    assert data["items"][0]["name"] == "Con cupos"


@pytest.mark.asyncio
async def test_filter_has_capacity_false(
    client: AsyncClient, auth_headers: dict
) -> None:
    await client.post(
        "/api/v1/shelters",
        json={
            "name": "Con cupos",
            "address": "A",
            "neighborhood": "B",
            "city": "Cali",
            "department": "Valle",
            "capacity": 100,
            "current_occupancy": 80,
            "phone": "1",
            "contact_name": "X",
        },
        headers=auth_headers,
    )
    await client.post(
        "/api/v1/shelters",
        json={
            "name": "Lleno",
            "address": "A",
            "neighborhood": "B",
            "city": "Cali",
            "department": "Valle",
            "capacity": 100,
            "current_occupancy": 100,
            "phone": "1",
            "contact_name": "X",
        },
        headers=auth_headers,
    )

    response = await client.get("/api/v1/shelters?has_capacity=false")
    data = response.json()

    assert response.status_code == 200
    assert len(data["items"]) == 1
    assert data["items"][0]["name"] == "Lleno"


@pytest.mark.asyncio
async def test_filter_without_has_capacity_returns_all(
    client: AsyncClient,
    auth_headers: dict,
) -> None:
    await client.post(
        "/api/v1/shelters",
        json={
            "name": "Con cupos",
            "address": "A",
            "neighborhood": "B",
            "city": "Cali",
            "department": "Valle",
            "capacity": 100,
            "current_occupancy": 80,
            "phone": "1",
            "contact_name": "X",
        },
        headers=auth_headers,
    )
    await client.post(
        "/api/v1/shelters",
        json={
            "name": "Lleno",
            "address": "A",
            "neighborhood": "B",
            "city": "Cali",
            "department": "Valle",
            "capacity": 100,
            "current_occupancy": 100,
            "phone": "1",
            "contact_name": "X",
        },
        headers=auth_headers,
    )

    response = await client.get("/api/v1/shelters")
    data = response.json()

    assert response.status_code == 200
    assert len(data["items"]) == 2


@pytest.mark.asyncio
async def test_filter_combined(
    client: AsyncClient, valid_payload: dict, auth_headers: dict
) -> None:
    await client.post("/api/v1/shelters", json=valid_payload, headers=auth_headers)
    await client.post(
        "/api/v1/shelters",
        json={
            "name": "Otro",
            "address": "A",
            "neighborhood": "Otro",
            "city": "Bogotá",
            "department": "Cundinamarca",
            "capacity": 100,
            "current_occupancy": 100,
            "phone": "1",
            "contact_name": "X",
        },
        headers=auth_headers,
    )

    response = await client.get(
        "/api/v1/shelters?city=Cali&neighborhood=San%20José&has_capacity=true"
    )
    data = response.json()

    assert response.status_code == 200
    assert len(data["items"]) == 1
    assert data["items"][0]["city"] == "Cali"
    assert data["items"][0]["neighborhood"] == "San José"


@pytest.mark.asyncio
async def test_list_shelters_orders_by_availability_priority(
    client: AsyncClient, auth_headers: dict
) -> None:
    # Create records in reverse order within each priority group so that
    # the default created_at descending tie-breaker produces the expected A-G order.
    shelters = [
        # Priority 1: known availability
        {"name": "B", "capacity": 50, "current_occupancy": 49},
        {"name": "A", "capacity": 50, "current_occupancy": 20},
        # Priority 2: known, no availability
        {"name": "D", "capacity": 50, "current_occupancy": 60},
        {"name": "C", "capacity": 50, "current_occupancy": 50},
        # Priority 3: unknown availability
        {"name": "G", "capacity": None, "current_occupancy": None},
        {"name": "F", "capacity": 50, "current_occupancy": None},
        {"name": "E", "capacity": None, "current_occupancy": 20},
    ]

    for s in shelters:
        await client.post(
            "/api/v1/shelters",
            json={
                "name": s["name"],
                "address": "A",
                "neighborhood": "B",
                "city": "Cali",
                "department": "Valle",
                "capacity": s["capacity"],
                "current_occupancy": s["current_occupancy"],
                "phone": "1",
                "contact_name": "X",
            },
            headers=auth_headers,
        )
        await asyncio.sleep(0.01)

    response = await client.get("/api/v1/shelters?page=1&page_size=20")
    data = response.json()

    assert response.status_code == 200
    assert data["total"] == 7
    names = [item["name"] for item in data["items"]]
    assert names == ["A", "B", "C", "D", "E", "F", "G"]


@pytest.mark.asyncio
async def test_create_shelter_with_null_capacity(
    client: AsyncClient, auth_headers: dict
) -> None:
    payload = {
        "name": "Albergue Sin Capacidad Informada",
        "address": "Carrera 1",
        "neighborhood": "Centro",
        "city": "Cali",
        "department": "Valle",
        "capacity": None,
        "current_occupancy": None,
        "phone": "3000000000",
        "contact_name": "Contacto",
    }
    response = await client.post("/api/v1/shelters", json=payload, headers=auth_headers)

    assert response.status_code == 201
    data = response.json()
    assert data["capacity"] is None
    assert data["current_occupancy"] is None
    assert data["available_capacity"] is None


@pytest.mark.asyncio
async def test_create_shelter_with_null_current_occupancy(
    client: AsyncClient, auth_headers: dict
) -> None:
    payload = {
        "name": "Albergue Con Capacidad Pero Sin Ocupación",
        "address": "Carrera 1",
        "neighborhood": "Centro",
        "city": "Cali",
        "department": "Valle",
        "capacity": 50,
        "current_occupancy": None,
        "phone": "3000000000",
        "contact_name": "Contacto",
    }
    response = await client.post("/api/v1/shelters", json=payload, headers=auth_headers)

    assert response.status_code == 201
    data = response.json()
    assert data["capacity"] == 50
    assert data["current_occupancy"] is None
    assert data["available_capacity"] is None


@pytest.mark.asyncio
async def test_update_shelter_clears_capacity_and_occupancy(
    client: AsyncClient, valid_payload: dict, auth_headers: dict
) -> None:
    created = (
        await client.post("/api/v1/shelters", json=valid_payload, headers=auth_headers)
    ).json()

    response = await client.put(
        f"/api/v1/shelters/{created['id']}",
        json={"capacity": None, "current_occupancy": None},
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["capacity"] is None
    assert data["current_occupancy"] is None
    assert data["available_capacity"] is None


@pytest.mark.asyncio
async def test_list_and_detail_show_unknown_capacity(
    client: AsyncClient, auth_headers: dict
) -> None:
    payload = {
        "name": "Albergue Desconocido",
        "address": "Carrera 1",
        "neighborhood": "Centro",
        "city": "Cali",
        "department": "Valle",
        "capacity": None,
        "current_occupancy": None,
        "phone": "3000000000",
        "contact_name": "Contacto",
    }
    created = (
        await client.post("/api/v1/shelters", json=payload, headers=auth_headers)
    ).json()

    list_response = await client.get("/api/v1/shelters")
    assert list_response.status_code == 200
    item = next(s for s in list_response.json()["items"] if s["id"] == created["id"])
    assert item["capacity"] is None
    assert item["available_capacity"] is None

    detail_response = await client.get(f"/api/v1/shelters/{created['id']}")
    assert detail_response.status_code == 200
    assert detail_response.json()["capacity"] is None


@pytest.mark.asyncio
async def test_filter_has_capacity_true_excludes_null_capacity(
    client: AsyncClient, auth_headers: dict
) -> None:
    await client.post(
        "/api/v1/shelters",
        json={
            "name": "Con cupos",
            "address": "A",
            "neighborhood": "B",
            "city": "Cali",
            "department": "Valle",
            "capacity": 100,
            "current_occupancy": 80,
            "phone": "1",
            "contact_name": "X",
        },
        headers=auth_headers,
    )
    await client.post(
        "/api/v1/shelters",
        json={
            "name": "Capacidad desconocida",
            "address": "A",
            "neighborhood": "B",
            "city": "Cali",
            "department": "Valle",
            "capacity": None,
            "current_occupancy": None,
            "phone": "1",
            "contact_name": "X",
        },
        headers=auth_headers,
    )

    response = await client.get("/api/v1/shelters?has_capacity=true")
    data = response.json()

    assert response.status_code == 200
    assert len(data["items"]) == 1
    assert data["items"][0]["name"] == "Con cupos"
