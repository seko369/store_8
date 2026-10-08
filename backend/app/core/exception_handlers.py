import logging

from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.services.exceptions import (
    AuthenticationError,
    ConflictError,
    NotFoundError,
    ServiceError,
    ValidationError,
)


logger = logging.getLogger(__name__)


async def service_exception_handler(
    request: Request,
    exc: ServiceError,
) -> JSONResponse:

    if isinstance(exc, AuthenticationError):
        status_code = 401

    elif isinstance(exc, NotFoundError):
        status_code = 404

    elif isinstance(exc, ConflictError):
        status_code = 409

    elif isinstance(exc, ValidationError):
        status_code = 400

    else:
        status_code = 400

    return JSONResponse(
        status_code=status_code,
        content={
            "detail": str(exc),
        },
    )


async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError,
) -> JSONResponse:

    return JSONResponse(
        status_code=422,
        content={
            "detail": exc.errors(),
        },
    )


async def unexpected_exception_handler(
    request: Request,
    exc: Exception,
) -> JSONResponse:

    logger.exception(
        "Unhandled server error",
        exc_info=exc,
    )

    return JSONResponse(
        status_code=500,
        content={
            "detail": "خطای داخلی سرور.",
        },
    )