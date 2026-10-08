from pathlib import Path

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.database import check_database_connection
from app.core.exception_handlers import (
    service_exception_handler,
    unexpected_exception_handler,
    validation_exception_handler,
)
from app.services.exceptions import ServiceError

app = FastAPI(
    title=settings.app_name,
    debug=settings.environment != "production",
)

app.add_exception_handler(ServiceError, service_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, unexpected_exception_handler)

PROJECT_ROOT = Path(__file__).resolve().parents[1]
UPLOAD_DIR = PROJECT_ROOT / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

app.mount(
    "/uploads",
    StaticFiles(directory=UPLOAD_DIR),
    name="uploads",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/health")
async def health_check():
    database_ok = await check_database_connection()

    return {
        "status": "ok" if database_ok else "error",
        "database": "connected" if database_ok else "disconnected",
    }