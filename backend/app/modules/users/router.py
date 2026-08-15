import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import CurrentAdmin, CurrentUser
from app.modules.users.exceptions import (
    InactiveUserError,
    InvalidCredentialsError,
    UserAlreadyExistsError,
    UserNotFoundError,
)
from app.modules.users.schemas import (
    LoginRequest,
    TokenResponse,
    UserCreate,
    UserResponse,
    UserStatusUpdate,
    UserUpdate,
)
from app.modules.users.service import UserService

auth_router = APIRouter(prefix="/api/v1/auth", tags=["auth"])
users_router = APIRouter(prefix="/api/v1/users", tags=["users"])

DbSession = Annotated[AsyncSession, Depends(get_db)]


@auth_router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, session: DbSession) -> TokenResponse:
    service = UserService(session)
    try:
        token = await service.authenticate_user(payload)
    except (InvalidCredentialsError, InactiveUserError, UserNotFoundError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc
    return TokenResponse(access_token=token)


@users_router.post(
    "",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_user(
    payload: UserCreate,
    session: DbSession,
    _: CurrentAdmin,
) -> UserResponse:
    service = UserService(session)
    try:
        user = await service.create_user(payload)
    except UserAlreadyExistsError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc
    return UserResponse.model_validate(user)


@users_router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: CurrentUser) -> UserResponse:
    return UserResponse.model_validate(current_user)


@users_router.get("", response_model=list[UserResponse])
async def list_users(
    session: DbSession,
    _: CurrentAdmin,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
) -> list[UserResponse]:
    service = UserService(session)
    users, _ = await service.get_users(page=page, page_size=page_size)
    return [UserResponse.model_validate(u) for u in users]


@users_router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: uuid.UUID,
    session: DbSession,
    _: CurrentAdmin,
) -> UserResponse:
    service = UserService(session)
    try:
        user = await service.repository.get_by_id(user_id)
    except UserNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return UserResponse.model_validate(user)


@users_router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: uuid.UUID,
    payload: UserUpdate,
    session: DbSession,
    _: CurrentAdmin,
) -> UserResponse:
    service = UserService(session)
    try:
        user = await service.update_user(user_id, payload)
    except UserNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc
    except UserAlreadyExistsError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc
    return UserResponse.model_validate(user)


@users_router.patch("/{user_id}/status", response_model=UserResponse)
async def update_user_status(
    user_id: uuid.UUID,
    payload: UserStatusUpdate,
    session: DbSession,
    _: CurrentAdmin,
) -> UserResponse:
    service = UserService(session)
    try:
        user = await service.update_user_status(user_id, payload.is_active)
    except UserNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc
    return UserResponse.model_validate(user)
