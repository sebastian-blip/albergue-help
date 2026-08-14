"""Excepciones compartidas entre módulos del dominio.

Colocar aquí únicamente excepciones que sean reutilizables por varios módulos.
Excepciones específicas de un dominio deben vivir dentro de su módulo.
"""


class ApplicationError(Exception):
    """Base para excepciones controladas de la aplicación."""


class NotFoundError(ApplicationError):
    """Recurso no encontrado."""


__all__ = ["ApplicationError", "NotFoundError"]
