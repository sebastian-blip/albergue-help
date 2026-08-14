import uuid

from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.shelters.models import Shelter, ShelterStatus, VerificationStatus


class ShelterRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    def _build_filter_query(
        self,
        *,
        department: str | None,
        city: str | None,
        neighborhood: str | None,
        status: ShelterStatus | None,
        verification_status: VerificationStatus | None,
        has_capacity: bool | None,
    ):
        query = select(Shelter)

        if department is not None:
            query = query.where(Shelter.department.ilike(department))
        if city is not None:
            query = query.where(Shelter.city.ilike(city))
        if neighborhood is not None:
            query = query.where(Shelter.neighborhood.ilike(neighborhood))
        if status is not None:
            query = query.where(Shelter.status == status)
        if verification_status is not None:
            query = query.where(Shelter.verification_status == verification_status)
        if has_capacity is True:
            query = query.where(Shelter.current_occupancy < Shelter.capacity)
        elif has_capacity is False:
            query = query.where(Shelter.current_occupancy >= Shelter.capacity)

        return query

    async def create(self, shelter: Shelter) -> Shelter:
        self.session.add(shelter)
        await self.session.commit()
        await self.session.refresh(shelter)
        return shelter

    async def get_by_id(self, shelter_id: uuid.UUID) -> Shelter | None:
        result = await self.session.execute(
            select(Shelter).where(Shelter.id == shelter_id),
        )
        return result.scalar_one_or_none()

    async def get_all(
        self,
        *,
        page: int,
        page_size: int,
        department: str | None = None,
        city: str | None = None,
        neighborhood: str | None = None,
        status: ShelterStatus | None = None,
        verification_status: VerificationStatus | None = None,
        has_capacity: bool | None = None,
    ) -> tuple[list[Shelter], int]:
        base_query = self._build_filter_query(
            department=department,
            city=city,
            neighborhood=neighborhood,
            status=status,
            verification_status=verification_status,
            has_capacity=has_capacity,
        )

        total_result = await self.session.execute(
            select(func.count()).select_from(base_query.subquery())
        )
        total = total_result.scalar_one()

        result = await self.session.execute(
            base_query.order_by(desc(Shelter.created_at))
            .offset((page - 1) * page_size)
            .limit(page_size),
        )
        shelters = result.scalars().all()
        return list(shelters), total

    async def update(self, shelter: Shelter) -> Shelter:
        self.session.add(shelter)
        await self.session.commit()
        await self.session.refresh(shelter)
        return shelter

    async def delete(self, shelter: Shelter) -> None:
        await self.session.delete(shelter)
        await self.session.commit()
