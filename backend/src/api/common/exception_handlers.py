import json

from fastapi import HTTPException as StarletteHTTPException
from fastapi import Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from src.core.exceptions import (
    AlreadyExistsError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
)
from src.core.log import logger


async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    logger.error(f"HTTP exception: {exc}", exc_info=True)

    return JSONResponse(
        status_code=exc.status_code,
        content={"status": "error", "code": exc.status_code, "message": exc.detail},
    )


async def validation_exception_handler(request: Request, exc):
    logger.error(f"Validation exception: {exc}", exc_info=True)

    # Convert the exc.errors() to a JSON string to ensure it"s serializable
    error_details = json.dumps(exc.errors(), default=str)

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
        content={
            "status": "error",
            "code": 422,
            "message": "Validation failed.",
            "errors": json.loads(error_details),
        },
    )


async def authentication_error_handler(request: Request, exc: AuthenticationError):
    logger.error(f"AuthenticationError: {exc}", exc_info=True)

    return JSONResponse(
        status_code=status.HTTP_401_UNAUTHORIZED,
        content={"status": "error", "code": 401, "message": str(exc)},
    )


async def authorisation_error_handler(request: Request, exc: AuthorizationError):
    logger.error(f"AuthorizationError: {exc}", exc_info=True)

    return JSONResponse(
        status_code=status.HTTP_403_FORBIDDEN,
        content={"status": "error", "code": 403, "message": str(exc)},
    )


async def already_exists_error_handler(request: Request, exc: AlreadyExistsError):
    logger.error(f"AlreadyExistsError: {exc}", exc_info=True)

    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content={"status": "error", "code": 409, "message": str(exc)},
    )


async def not_found_error_handler(request: Request, exc: NotFoundError):
    logger.error(f"NotFoundError: {exc}", exc_info=True)

    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"status": "error", "code": 404, "message": str(exc)},
    )


def register_exception_handlers(app):
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(AuthenticationError, authentication_error_handler)
    app.add_exception_handler(AuthorizationError, authorisation_error_handler)
    app.add_exception_handler(AlreadyExistsError, already_exists_error_handler)
    app.add_exception_handler(NotFoundError, not_found_error_handler)
