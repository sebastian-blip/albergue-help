import uuid
from datetime import datetime, timezone
from enum import Enum as PyEnum

from sqlalchemy import CheckConstraint, DateTime, Enum, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class ShelterStatus(str, PyEnum):
    OPEN = "OPEN"
    FULL = "FULL"
    CLOSED = "CLOSED"


class VerificationStatus(str, PyEnum):
    PENDING = "PENDING"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"


class Shelter(Base):
    __tablename__ = "shelters"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    address: Mapped[str] = mapped_column(String(255), nullable=False)
    neighborhood: Mapped[str] = mapped_column(String(100), nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    department: Mapped[str] = mapped_column(String(100), nullable=False, index=True)

    capacity: Mapped[int | None] = mapped_column(Integer, nullable=True)
    current_occupancy: Mapped[int | None] = mapped_column(Integer, nullable=True)

    phone: Mapped[str] = mapped_column(String(50), nullable=False)
    contact_name: Mapped[str] = mapped_column(String(100), nullable=False)

    status: Mapped[ShelterStatus] = mapped_column(
        Enum(ShelterStatus, name="shelterstatus"),
        nullable=False,
        default=ShelterStatus.OPEN,
        index=True,
    )
    verification_status: Mapped[VerificationStatus] = mapped_column(
        Enum(VerificationStatus, name="verificationstatus"),
        nullable=False,
        default=VerificationStatus.PENDING,
        index=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    __table_args__ = (
        CheckConstraint(
            "capacity IS NULL OR capacity > 0", name="ck_shelter_capacity_positive"
        ),
        CheckConstraint(
            "current_occupancy IS NULL OR current_occupancy >= 0",
            name="ck_shelter_occupancy_non_negative",
        ),
    )

    @property
    def available_capacity(self) -> int | None:
        if self.capacity is None or self.current_occupancy is None:
            return None
        return self.capacity - self.current_occupancy
