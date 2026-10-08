class ServiceError(Exception):
    """Base exception for service-layer errors."""


class NotFoundError(ServiceError):
    """Requested resource does not exist."""


class ConflictError(ServiceError):
    """Operation conflicts with existing data or business rules."""


class ValidationError(ServiceError):
    """Business-level validation error."""

class AuthenticationError(ServiceError):
    """Authentication failed or session is invalid."""