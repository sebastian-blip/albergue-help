import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.modules.users.models import UserRole


class UserCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)
    role: UserRole

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return value.lower().strip()


class UserUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    email: EmailStr | None = None
    role: UserRole | None = None

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str | None) -> str | None:
        if value is None:
            return value
        return value.lower().strip()


class UserStatusUpdate(BaseModel):
    is_active: bool


class UserResponse(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    role: UserRole
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return value.lower().strip()


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
