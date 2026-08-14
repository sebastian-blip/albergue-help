import uuid
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.shelters.exceptions import (
    InvalidShelterOccupancyError,
    ShelterNotFoundError,
)
from app.modules.shelters.models import Shelter, ShelterStatus, VerificationStatus
from app.modules.shelters.repository import ShelterRepository
from app.modules.shelters.schemas import (
    ShelterCreate,
    ShelterFilters,
    ShelterOccupancyUpdate,
    ShelterUpdate,
)


def _compute_status(
    *, current_status: ShelterStatus, capacity: int, occupancy: int
) -> ShelterStatus:
    """Calcula el estado operativo respetando la prioridad CLOSED > FULL > OPEN.

    Reglas:
    - Si el estado actual es CLOSED, se mantiene CLOSED (override manual).
    - Si no, se calcula según la ocupación:
      - occupancy == capacity -> FULL
      - occupancy < capacity -> OPEN
    """
    if current_status == ShelterStatus.CLOSED:
        return ShelterStatus.CLOSED
    if occupancy == capacity:
        return ShelterStatus.FULL
    return ShelterStatus.OPEN


def _validate_occupancy(capacity: int, occupancy: int) -> None:
    if capacity <= 0:
        msg = "Capacity must be greater than 0"
        raise InvalidShelterOccupancyError(msg)
    if occupancy < 0:
        msg = "Occupancy cannot be negative"
        raise InvalidShelterOccupancyError(msg)
    if occupancy > capacity:
        msg = "Occupancy cannot exceed capacity"
        raise InvalidShelterOccupancyError(msg)


class ShelterService:
    def __init__(self, session: AsyncSession) -> None:
        self.repository = ShelterRepository(session)

    async def create_shelter(self, data: ShelterCreate) -> Shelter:
        _validate_occupancy(data.capacity, data.current_occupancy)

        status = _compute_status(
            current_status=ShelterStatus.OPEN,
            capacity=data.capacity,
            occupancy=data.current_occupancy,
        )

        shelter = Shelter(
            name=data.name,
            description=data.description,
            address=data.address,
            neighborhood=data.neighborhood,
            city=data.city,
            department=data.department,
            capacity=data.capacity,
            current_occupancy=data.current_occupancy,
            phone=data.phone,
            contact_name=data.contact_name,
            status=status,
            verification_status=VerificationStatus.PENDING,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        return await self.repository.create(shelter)

    async def get_shelter(self, shelter_id: uuid.UUID) -> Shelter:
        shelter = await self.repository.get_by_id(shelter_id)
        if shelter is None:
            raise ShelterNotFoundError(f"Shelter with id {shelter_id} not found")
        return shelter

    async def get_shelters(self, filters: ShelterFilters) -> tuple[list[Shelter], int]:
        return await self.repository.get_all(
            page=filters.page,
            page_size=filters.page_size,
            department=filters.department,
            city=filters.city,
            neighborhood=filters.neighborhood,
            status=filters.status,
            verification_status=filters.verification_status,
            has_capacity=filters.has_capacity,
        )

    async def update_shelter(
        self, shelter_id: uuid.UUID, data: ShelterUpdate
    ) -> Shelter:
        shelter = await self.get_shelter(shelter_id)

        new_capacity = data.capacity if data.capacity is not None else shelter.capacity
        new_occupancy = (
            data.current_occupancy
            if data.current_occupancy is not None
            else shelter.current_occupancy
        )
        _validate_occupancy(new_capacity, new_occupancy)

        for field, value in data.model_dump(exclude_unset=True).items():
            if field in {"status"}:
                continue
            setattr(shelter, field, value)

        shelter.capacity = new_capacity
        shelter.current_occupancy = new_occupancy

        requested_status = data.status
        if requested_status is not None:
            effective_status = requested_status
        else:
            effective_status = shelter.status

        shelter.status = _compute_status(
            current_status=effective_status,
            capacity=new_capacity,
            occupancy=new_occupancy,
        )
        shelter.updated_at = datetime.now(timezone.utc)

        return await self.repository.update(shelter)

    async def update_occupancy(
        self,
        shelter_id: uuid.UUID,
        data: ShelterOccupancyUpdate,
    ) -> Shelter:
        shelter = await self.get_shelter(shelter_id)
        _validate_occupancy(shelter.capacity, data.current_occupancy)

        shelter.current_occupancy = data.current_occupancy
        shelter.status = _compute_status(
            current_status=shelter.status,
            capacity=shelter.capacity,
            occupancy=data.current_occupancy,
        )
        shelter.updated_at = datetime.now(timezone.utc)

        return await self.repository.update(shelter)

    async def delete_shelter(self, shelter_id: uuid.UUID) -> None:
        shelter = await self.get_shelter(shelter_id)
        await self.repository.delete(shelter)
