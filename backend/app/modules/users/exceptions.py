from app.shared.exceptions import ApplicationError


class UserNotFoundError(ApplicationError):
    """El usuario solicitado no existe."""


class UserAlreadyExistsError(ApplicationError):
    """Ya existe un usuario con el mismo email."""


class InvalidCredentialsError(ApplicationError):
    """Credenciales inválidas."""


class InactiveUserError(ApplicationError):
    """El usuario está desactivado."""


__all__ = [
    "UserNotFoundError",
    "UserAlreadyExistsError",
    "InvalidCredentialsError",
    "InactiveUserError",
]
