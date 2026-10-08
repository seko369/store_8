import asyncio
from pathlib import Path
from uuid import uuid4

from pwdlib import PasswordHash
from sqlalchemy import delete
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

from app.core.config import settings
from app.models.category import Category
from app.models.product import Product


UPLOAD_DIR = (
    Path(__file__).resolve().parents[2]
    / "uploads"
    / "products"
)


def login_admin(client, monkeypatch):
    password = "TestPassword123!"

    generated_hash = PasswordHash.recommended().hash(password)

    monkeypatch.setattr(
        settings,
        "admin_password_hash",
        generated_hash,
    )

    response = client.post(
        "/api/v1/admin/login",
        json={
            "email": settings.admin_email,
            "password": password,
        },
    )

    assert response.status_code == 200


def snapshot_uploads() -> set[str]:
    if not UPLOAD_DIR.exists():
        return set()

    return {
        file.name
        for file in UPLOAD_DIR.iterdir()
        if file.is_file()
    }


def cleanup_new_uploads(before: set[str]) -> None:
    if not UPLOAD_DIR.exists():
        return

    for file in UPLOAD_DIR.iterdir():
        if file.is_file() and file.name not in before:
            file.unlink(missing_ok=True)


async def hard_delete_product(product_id: int):
    engine = create_async_engine(
        settings.database_url,
        poolclass=NullPool,
    )

    Session = async_sessionmaker(
        engine,
        expire_on_commit=False,
    )

    try:
        async with Session() as session:
            await session.execute(
                delete(Product).where(Product.id == product_id)
            )
            await session.commit()
    finally:
        await engine.dispose()


async def hard_delete_category(category_id: int):
    engine = create_async_engine(
        settings.database_url,
        poolclass=NullPool,
    )

    Session = async_sessionmaker(
        engine,
        expire_on_commit=False,
    )

    try:
        async with Session() as session:
            await session.execute(
                delete(Category).where(Category.id == category_id)
            )
            await session.commit()
    finally:
        await engine.dispose()


def test_duplicate_category(client, monkeypatch):
    login_admin(client, monkeypatch)

    try:
        response = client.post(
            "/api/v1/admin/categories",
            json={
                "name": "یخچال و فریزر",
            },
        )

        assert response.status_code == 409

    finally:
        client.post("/api/v1/admin/logout")


def test_invalid_product_category(client, monkeypatch):
    login_admin(client, monkeypatch)

    uploads_before = snapshot_uploads()

    try:
        response = client.post(
            "/api/v1/admin/products",
            data={
                "name": f"Invalid Category {uuid4().hex[:8]}",
                "description": "Test product",
                "price": "1000000",
                "category_id": "999999",
                "stock": "10",
                "sort_order": "9998",
                "is_active": "true",
            },
            files={
                "image": (
                    "test.jpg",
                    b"fake-image",
                    "image/jpeg",
                )
            },
        )

        assert response.status_code == 404

    finally:
        cleanup_new_uploads(uploads_before)
        client.post("/api/v1/admin/logout")


def test_duplicate_sort_order(client, monkeypatch):
    login_admin(client, monkeypatch)

    uploads_before = snapshot_uploads()

    try:
        response = client.post(
            "/api/v1/admin/products",
            data={
                "name": f"Duplicate Sort {uuid4().hex[:8]}",
                "description": "Test product",
                "price": "1000000",
                "category_id": "1",
                "stock": "10",
                "sort_order": "1",
                "is_active": "true",
            },
            files={
                "image": (
                    "test.jpg",
                    b"fake-image",
                    "image/jpeg",
                )
            },
        )

        assert response.status_code == 409

    finally:
        cleanup_new_uploads(uploads_before)
        client.post("/api/v1/admin/logout")


def test_invalid_product_price(client, monkeypatch):
    login_admin(client, monkeypatch)

    uploads_before = snapshot_uploads()

    try:
        response = client.post(
            "/api/v1/admin/products",
            data={
                "name": f"Invalid Price {uuid4().hex[:8]}",
                "description": "Test product",
                "price": "0",
                "category_id": "1",
                "stock": "10",
                "sort_order": "9997",
                "is_active": "true",
            },
            files={
                "image": (
                    "test.jpg",
                    b"fake-image",
                    "image/jpeg",
                )
            },
        )

        assert response.status_code == 400

    finally:
        cleanup_new_uploads(uploads_before)
        client.post("/api/v1/admin/logout")


def test_invalid_product_stock(client, monkeypatch):
    login_admin(client, monkeypatch)

    uploads_before = snapshot_uploads()

    try:
        response = client.post(
            "/api/v1/admin/products",
            data={
                "name": f"Invalid Stock {uuid4().hex[:8]}",
                "description": "Test product",
                "price": "1000000",
                "category_id": "1",
                "stock": "-1",
                "sort_order": "9996",
                "is_active": "true",
            },
            files={
                "image": (
                    "test.jpg",
                    b"fake-image",
                    "image/jpeg",
                )
            },
        )

        assert response.status_code == 400

    finally:
        cleanup_new_uploads(uploads_before)
        client.post("/api/v1/admin/logout")


def test_invalid_image_type(client, monkeypatch):
    login_admin(client, monkeypatch)

    uploads_before = snapshot_uploads()

    try:
        response = client.post(
            "/api/v1/admin/products",
            data={
                "name": f"Invalid Image {uuid4().hex[:8]}",
                "description": "Test product",
                "price": "1000000",
                "category_id": "1",
                "stock": "10",
                "sort_order": "9995",
                "is_active": "true",
            },
            files={
                "image": (
                    "test.txt",
                    b"not-an-image",
                    "text/plain",
                )
            },
        )

        assert response.status_code == 400

    finally:
        cleanup_new_uploads(uploads_before)
        client.post("/api/v1/admin/logout")


def test_image_too_large(client, monkeypatch):
    login_admin(client, monkeypatch)

    uploads_before = snapshot_uploads()

    try:
        large_file = b"x" * (5 * 1024 * 1024 + 1)

        response = client.post(
            "/api/v1/admin/products",
            data={
                "name": f"Large Image {uuid4().hex[:8]}",
                "description": "Test product",
                "price": "1000000",
                "category_id": "1",
                "stock": "10",
                "sort_order": "9994",
                "is_active": "true",
            },
            files={
                "image": (
                    "large.jpg",
                    large_file,
                    "image/jpeg",
                )
            },
        )

        assert response.status_code == 400

    finally:
        cleanup_new_uploads(uploads_before)
        client.post("/api/v1/admin/logout")


def test_delete_category_with_products(client, monkeypatch):
    login_admin(client, monkeypatch)

    category_id = None
    product_id = None
    product_image_url = None

    try:
        category_response = client.post(
            "/api/v1/admin/categories",
            json={
                "name": f"Temporary Category {uuid4().hex[:8]}",
            },
        )

        assert category_response.status_code == 201

        category_id = category_response.json()["id"]

        product_response = client.post(
            "/api/v1/admin/products",
            data={
                "name": f"Temporary Product {uuid4().hex[:8]}",
                "description": "Used to test category deletion",
                "price": "1000000",
                "category_id": str(category_id),
                "stock": "1",
                "sort_order": "9993",
                "is_active": "true",
            },
            files={
                "image": (
                    "test.jpg",
                    b"fake-image",
                    "image/jpeg",
                )
            },
        )

        assert product_response.status_code == 201

        product_data = product_response.json()

        product_id = product_data["id"]
        product_image_url = product_data["image_url"]

        response = client.delete(
            f"/api/v1/admin/categories/{category_id}"
        )

        assert response.status_code == 409

    finally:
        if product_id is not None:
            asyncio.run(
                hard_delete_product(product_id)
            )

        if category_id is not None:
            asyncio.run(
                hard_delete_category(category_id)
            )

        if product_image_url:
            image_path = Path(
                product_image_url.lstrip("/")
            )

            if image_path.exists():
                image_path.unlink()

        client.post("/api/v1/admin/logout")


def test_admin_me_without_session(client):
    response = client.get(
        "/api/v1/admin/me"
    )

    assert response.status_code == 401


def test_admin_products_without_session(client):
    response = client.get(
        "/api/v1/admin/products"
    )

    assert response.status_code == 401


def test_login_with_wrong_password(client, monkeypatch):
    correct_password = "TestPassword123!"

    generated_hash = PasswordHash.recommended().hash(
        correct_password
    )

    monkeypatch.setattr(
        settings,
        "admin_password_hash",
        generated_hash,
    )

    response = client.post(
        "/api/v1/admin/login",
        json={
            "email": settings.admin_email,
            "password": "WrongPassword123!",
        },
    )

    assert response.status_code == 401
