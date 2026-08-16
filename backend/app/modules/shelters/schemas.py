import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.modules.shelters.models import ShelterStatus, VerificationStatus


class ShelterCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=2000)

    address: str = Field(..., min_length=1, max_length=255)
    neighborhood: str = Field(..., min_length=1, max_length=100)
    city: str = Field(..., min_length=1, max_length=100)
    department: str = Field(..., min_length=1, max_length=100)

    capacity: int | None = Field(default=None, gt=0)
    current_occupancy: int | None = Field(default=0, ge=0)

    phone: str = Field(..., min_length=1, max_length=50)
    contact_name: str = Field(..., min_length=1, max_length=100)

    @field_validator("current_occupancy")
    @classmethod
    def occupancy_not_exceed_capacity(cls, value: int | None, info) -> int | None:
        if value is None:
            return value
        capacity = info.data.get("capacity")
        if capacity is not None and value > capacity:
            msg = "current_occupancy cannot exceed capacity"
            raise ValueError(msg)
        return value


class ShelterUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=2000)

    address: str | None = Field(default=None, min_length=1, max_length=255)
    neighborhood: str | None = Field(default=None, min_length=1, max_length=100)
    city: str | None = Field(default=None, min_length=1, max_length=100)
    department: str | None = Field(default=None, min_length=1, max_length=100)

    capacity: int | None = Field(default=None, gt=0)
    current_occupancy: int | None = Field(default=None, ge=0)

    phone: str | None = Field(default=None, min_length=1, max_length=50)
    contact_name: str | None = Field(default=None, min_length=1, max_length=100)

    status: ShelterStatus | None = None

    @field_validator("current_occupancy")
    @classmethod
    def occupancy_not_exceed_capacity(cls, value: int | None, info) -> int | None:
        if value is None:
            return value
        capacity = info.data.get("capacity")
        if capacity is not None and value > capacity:
            msg = "current_occupancy cannot exceed capacity"
            raise ValueError(msg)
        return value


class ShelterOccupancyUpdate(BaseModel):
    current_occupancy: int = Field(..., ge=0)


class ShelterResponse(BaseModel):
    id: uuid.UUID
    name: str
    description: str | None

    address: str
    neighborhood: str
    city: str
    department: str

    capacity: int | None
    current_occupancy: int | None
    available_capacity: int | None

    phone: str
    contact_name: str

    status: ShelterStatus
    verification_status: VerificationStatus

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ShelterFilters(BaseModel):
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)
    department: str | None = Field(default=None, max_length=100)
    city: str | None = Field(default=None, max_length=100)
    neighborhood: str | None = Field(default=None, max_length=100)
    status: ShelterStatus | None = None
    verification_status: VerificationStatus | None = None
    has_capacity: bool | None = None

    model_config = ConfigDict(populate_by_name=True)


class ShelterListResponse(BaseModel):
    items: list[ShelterResponse]
    total: int
    page: int
    page_size: int
    pages: int
