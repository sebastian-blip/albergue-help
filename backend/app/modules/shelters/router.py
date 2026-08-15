import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import CurrentUser
from app.modules.shelters.exceptions import (
    InvalidShelterOccupancyError,
    ShelterNotFoundError,
)
from app.modules.shelters.schemas import (
    ShelterCreate,
    ShelterFilters,
    ShelterListResponse,
    ShelterOccupancyUpdate,
    ShelterResponse,
    ShelterUpdate,
)
from app.modules.shelters.service import ShelterService

router = APIRouter(prefix="/api/v1/shelters", tags=["shelters"])

DbSession = Annotated[AsyncSession, Depends(get_db)]


def _get_service(session: AsyncSession) -> ShelterService:
    return ShelterService(session)


@router.post(
    "",
    response_model=ShelterResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_shelter(
    payload: ShelterCreate,
    session: DbSession,
    _: CurrentUser,
) -> ShelterResponse:
    service = _get_service(session)
    try:
        shelter = await service.create_shelter(payload)
    except InvalidShelterOccupancyError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)
        ) from exc
    return ShelterResponse.model_validate(shelter)


@router.get(
    "",
    response_model=ShelterListResponse,
)
async def list_shelters(
    session: DbSession,
    filters: Annotated[ShelterFilters, Depends()],
) -> ShelterListResponse:
    service = _get_service(session)
    shelters, total = await service.get_shelters(filters)
    pages = (total + filters.page_size - 1) // filters.page_size

    return ShelterListResponse(
        items=[ShelterResponse.model_validate(s) for s in shelters],
        total=total,
        page=filters.page,
        page_size=filters.page_size,
        pages=pages,
    )


@router.get(
    "/{shelter_id}",
    response_model=ShelterResponse,
)
async def get_shelter(shelter_id: uuid.UUID, session: DbSession) -> ShelterResponse:
    service = _get_service(session)
    try:
        shelter = await service.get_shelter(shelter_id)
    except ShelterNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
        ) from exc
    return ShelterResponse.model_validate(shelter)


@router.put(
    "/{shelter_id}",
    response_model=ShelterResponse,
)
async def update_shelter(
    shelter_id: uuid.UUID,
    payload: ShelterUpdate,
    session: DbSession,
    _: CurrentUser,
) -> ShelterResponse:
    service = _get_service(session)
    try:
        shelter = await service.update_shelter(shelter_id, payload)
    except ShelterNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
        ) from exc
    except InvalidShelterOccupancyError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)
        ) from exc
    return ShelterResponse.model_validate(shelter)


@router.patch(
    "/{shelter_id}/occupancy",
    response_model=ShelterResponse,
)
async def update_shelter_occupancy(
    shelter_id: uuid.UUID,
    payload: ShelterOccupancyUpdate,
    session: DbSession,
    _: CurrentUser,
) -> ShelterResponse:
    service = _get_service(session)
    try:
        shelter = await service.update_occupancy(shelter_id, payload)
    except ShelterNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
        ) from exc
    except InvalidShelterOccupancyError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)
        ) from exc
    return ShelterResponse.model_validate(shelter)


@router.delete(
    "/{shelter_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_shelter(
    shelter_id: uuid.UUID,
    session: DbSession,
    _: CurrentUser,
) -> None:
    service = _get_service(session)
    try:
        await service.delete_shelter(shelter_id)
    except ShelterNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
        ) from exc
