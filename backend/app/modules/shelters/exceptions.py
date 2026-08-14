from app.shared.exceptions import ApplicationError


class ShelterNotFoundError(ApplicationError):
    """El albergue solicitado no existe."""


class InvalidShelterOccupancyError(ApplicationError):
    """La ocupación proporcionada no es válida."""


__all__ = ["ShelterNotFoundError", "InvalidShelterOccupancyError"]
