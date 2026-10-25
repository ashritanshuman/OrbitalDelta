"""Standardized application error classes and FastAPI exception handlers."""

import logging
from typing import Any, Dict
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger("orbital_delta.errors")


class AppError(Exception):
    """Base application exception."""

    status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR
    default_detail: str = "An unexpected error occurred during processing."

    def __init__(self, detail: str = None):
        self.detail = detail or self.default_detail
        super().__init__(self.detail)


class InvalidImageError(AppError):
    """Raised when an uploaded file cannot be decoded or is corrupted."""

    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Uploaded file could not be decoded as a valid image."


class FileTooLargeError(AppError):
    """Raised when an uploaded file exceeds the maximum allowed size."""

    status_code = getattr(status, "HTTP_413_CONTENT_TOO_LARGE", 413)
    default_detail = "Uploaded file exceeds maximum allowed file size."


class UnsupportedMediaTypeError(AppError):
    """Raised when an uploaded file format is not allowed."""

    status_code = status.HTTP_415_UNSUPPORTED_MEDIA_TYPE
    default_detail = "Unsupported image media type. Only image/jpeg and image/png are allowed."


class MissingFieldError(AppError):
    """Raised when required parameters or file parts are missing."""

    status_code = getattr(status, "HTTP_422_UNPROCESSABLE_CONTENT", 422)
    default_detail = "Missing required form fields or files."


class InternalProcessingError(AppError):
    """Raised when an unrecoverable failure occurs in the pipeline."""

    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    default_detail = "Internal pipeline failure while analyzing satellite rasters."


def setup_exception_handlers(app: FastAPI) -> None:
    """Register uniform exception handlers returning {'detail': '...'}."""

    @app.exception_handler(AppError)
    async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
        logger.warning(
            f"AppError [{exc.status_code}] on {request.method} {request.url.path}: {exc.detail}"
        )
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail},
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(
        request: Request, exc: StarletteHTTPException
    ) -> JSONResponse:
        detail = exc.detail if isinstance(exc.detail, str) else str(exc.detail)
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": detail},
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        first_error = exc.errors()[0] if exc.errors() else {}
        loc = " -> ".join(str(l) for l in first_error.get("loc", []))
        msg = first_error.get("msg", "Invalid request parameter.")
        detail = f"Validation error at {loc}: {msg}" if loc else msg
        return JSONResponse(
            status_code=getattr(status, "HTTP_422_UNPROCESSABLE_CONTENT", 422),
            content={"detail": detail},
        )

    @app.exception_handler(Exception)
    async def generic_exception_handler(
        request: Request, exc: Exception
    ) -> JSONResponse:
        logger.exception(f"Unhandled exception on {request.method} {request.url.path}: {exc}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal processing exception occurred during telemetry analysis."},
        )
