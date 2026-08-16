import uuid

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.shelters.exceptions import (
    InvalidShelterOccupancyError,
    ShelterNotFoundError,
)
from app.modules.shelters.models import ShelterStatus, VerificationStatus
from app.modules.shelters.schemas import (
    ShelterCreate,
    ShelterFilters,
    ShelterOccupancyUpdate,
    ShelterUpdate,
)
from app.modules.shelters.service import ShelterService


@pytest.fixture
def service(db_session: AsyncSession) -> ShelterService:
    return ShelterService(db_session)


def _valid_create_data(**overrides) -> ShelterCreate:
    defaults = {
        "name": "Albergue Comunitario",
        "description": "Albergue temporal",
        "address": "Carrera 10 # 20-30",
        "neighborhood": "San José",
        "city": "Cali",
        "department": "Valle del Cauca",
        "capacity": 100,
        "current_occupancy": 40,
        "phone": "3001234567",
        "contact_name": "Juan Pérez",
    }
    defaults.update(overrides)
    return ShelterCreate(**defaults)


@pytest.mark.asyncio
async def test_create_shelter(service: ShelterService) -> None:
    data = _valid_create_data()
    shelter = await service.create_shelter(data)

    assert shelter.name == data.name
    assert shelter.capacity == 100
    assert shelter.current_occupancy == 40
    assert shelter.available_capacity == 60
    assert shelter.status == ShelterStatus.OPEN
    assert shelter.verification_status == VerificationStatus.PENDING


@pytest.mark.asyncio
async def test_create_shelter_rejects_non_positive_capacity(
    service: ShelterService,
) -> None:
    data = ShelterCreate.model_construct(
        name="Test",
        address="Addr",
        neighborhood="Barrio",
        city="City",
        department="Dept",
        capacity=0,
        current_occupancy=0,
        phone="123",
        contact_name="Name",
    )
    with pytest.raises(InvalidShelterOccupancyError):
        await service.create_shelter(data)


@pytest.mark.asyncio
async def test_create_shelter_rejects_negative_occupancy(
    service: ShelterService,
) -> None:
    data = ShelterCreate.model_construct(
        name="Test",
        address="Addr",
        neighborhood="Barrio",
        city="City",
        department="Dept",
        capacity=10,
        current_occupancy=-1,
        phone="123",
        contact_name="Name",
    )
    with pytest.raises(InvalidShelterOccupancyError):
        await service.create_shelter(data)


@pytest.mark.asyncio
async def test_create_shelter_rejects_occupancy_exceeding_capacity(
    service: ShelterService,
) -> None:
    data = ShelterCreate.model_construct(
        name="Test",
        address="Addr",
        neighborhood="Barrio",
        city="City",
        department="Dept",
        capacity=50,
        current_occupancy=51,
        phone="123",
        contact_name="Name",
    )
    with pytest.raises(InvalidShelterOccupancyError):
        await service.create_shelter(data)


@pytest.mark.asyncio
async def test_create_shelter_full_when_occupancy_equals_capacity(
    service: ShelterService,
) -> None:
    data = _valid_create_data(capacity=50, current_occupancy=50)
    shelter = await service.create_shelter(data)

    assert shelter.status == ShelterStatus.FULL
    assert shelter.available_capacity == 0


@pytest.mark.asyncio
async def test_get_shelter(service: ShelterService) -> None:
    created = await service.create_shelter(_valid_create_data())
    fetched = await service.get_shelter(created.id)

    assert fetched.id == created.id
    assert fetched.name == created.name


@pytest.mark.asyncio
async def test_get_shelter_not_found(service: ShelterService) -> None:
    with pytest.raises(ShelterNotFoundError):
        await service.get_shelter(uuid.uuid4())


@pytest.mark.asyncio
async def test_get_shelters_paginated(service: ShelterService) -> None:
    for i in range(5):
        await service.create_shelter(_valid_create_data(name=f"Shelter {i}"))

    filters = ShelterFilters(page=1, page_size=2)
    shelters, total = await service.get_shelters(filters)

    assert total == 5
    assert len(shelters) == 2


@pytest.mark.asyncio
async def test_update_shelter(service: ShelterService) -> None:
    created = await service.create_shelter(_valid_create_data())
    update = ShelterUpdate(name="Albergue Renombrado")
    updated = await service.update_shelter(created.id, update)

    assert updated.name == "Albergue Renombrado"
    assert updated.status == ShelterStatus.OPEN


@pytest.mark.asyncio
async def test_update_shelter_occupancy(service: ShelterService) -> None:
    created = await service.create_shelter(
        _valid_create_data(capacity=100, current_occupancy=50)
    )
    update = ShelterUpdate(current_occupancy=80)
    updated = await service.update_shelter(created.id, update)

    assert updated.current_occupancy == 80
    assert updated.available_capacity == 20
    assert updated.status == ShelterStatus.OPEN


@pytest.mark.asyncio
async def test_update_shelter_open_to_full(service: ShelterService) -> None:
    created = await service.create_shelter(
        _valid_create_data(capacity=100, current_occupancy=99)
    )
    update = ShelterUpdate(current_occupancy=100)
    updated = await service.update_shelter(created.id, update)

    assert updated.status == ShelterStatus.FULL


@pytest.mark.asyncio
async def test_update_shelter_full_to_open(service: ShelterService) -> None:
    created = await service.create_shelter(
        _valid_create_data(capacity=100, current_occupancy=100)
    )
    assert created.status == ShelterStatus.FULL

    update = ShelterUpdate(current_occupancy=95)
    updated = await service.update_shelter(created.id, update)

    assert updated.status == ShelterStatus.OPEN


@pytest.mark.asyncio
async def test_update_occupancy_keeps_closed_status(service: ShelterService) -> None:
    created = await service.create_shelter(
        _valid_create_data(capacity=100, current_occupancy=50)
    )
    await service.update_shelter(created.id, ShelterUpdate(status=ShelterStatus.CLOSED))

    updated = await service.update_occupancy(
        created.id, ShelterOccupancyUpdate(current_occupancy=60)
    )

    assert updated.status == ShelterStatus.CLOSED
    assert updated.current_occupancy == 60


@pytest.mark.asyncio
async def test_update_occupancy_endpoint_logic(service: ShelterService) -> None:
    created = await service.create_shelter(
        _valid_create_data(capacity=100, current_occupancy=50)
    )
    updated = await service.update_occupancy(
        created.id, ShelterOccupancyUpdate(current_occupancy=100)
    )

    assert updated.current_occupancy == 100
    assert updated.status == ShelterStatus.FULL


@pytest.mark.asyncio
async def test_delete_shelter(service: ShelterService) -> None:
    created = await service.create_shelter(_valid_create_data())
    await service.delete_shelter(created.id)

    with pytest.raises(ShelterNotFoundError):
        await service.get_shelter(created.id)


@pytest.mark.asyncio
async def test_create_shelter_with_null_capacity_and_occupancy(
    service: ShelterService,
) -> None:
    data = _valid_create_data(capacity=None, current_occupancy=None)
    shelter = await service.create_shelter(data)

    assert shelter.capacity is None
    assert shelter.current_occupancy is None
    assert shelter.available_capacity is None
    assert shelter.status == ShelterStatus.OPEN


@pytest.mark.asyncio
async def test_create_shelter_with_known_capacity_and_null_occupancy(
    service: ShelterService,
) -> None:
    data = _valid_create_data(capacity=100, current_occupancy=None)
    shelter = await service.create_shelter(data)

    assert shelter.capacity == 100
    assert shelter.current_occupancy is None
    assert shelter.available_capacity is None


@pytest.mark.asyncio
async def test_update_shelter_to_null_capacity_and_occupancy(
    service: ShelterService,
) -> None:
    created = await service.create_shelter(_valid_create_data())
    updated = await service.update_shelter(
        created.id, ShelterUpdate(capacity=None, current_occupancy=None)
    )

    assert updated.capacity is None
    assert updated.current_occupancy is None
    assert updated.available_capacity is None


@pytest.mark.asyncio
async def test_filter_has_capacity_true_excludes_unknown(
    service: ShelterService,
) -> None:
    await service.create_shelter(
        _valid_create_data(name="Con cupos", capacity=100, current_occupancy=50)
    )
    await service.create_shelter(
        _valid_create_data(name="Desconocido", capacity=None, current_occupancy=None)
    )

    filters = ShelterFilters(has_capacity=True)
    shelters, total = await service.get_shelters(filters)

    assert total == 1
    assert shelters[0].name == "Con cupos"
