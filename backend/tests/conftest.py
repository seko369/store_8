import pytest
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

from app.core import database
from app.core.config import settings
from app.core.database import get_db
from app.main import app


test_engine = create_async_engine(
    settings.database_url,
    poolclass=NullPool,
)

TestSessionLocal = async_sessionmaker(
    bind=test_engine,
    expire_on_commit=False,
)


async def override_get_db():
    async with TestSessionLocal() as session:
        yield session


@pytest.fixture(scope="module", autouse=True)
def configure_test_database():
    database.engine = test_engine
    database.SessionLocal = TestSessionLocal

    app.dependency_overrides[get_db] = override_get_db

    yield

    app.dependency_overrides.pop(get_db, None)


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as test_client:
        yield test_client