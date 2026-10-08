import asyncio
from uuid import uuid4

from pwdlib import PasswordHash
from sqlalchemy import delete
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.pool import NullPool

from app.core.config import settings
from app.core.database import SessionLocal
from app.models.product import Product


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


async def cleanup_product(product_id: int):
    engine = create_async_engine(
        settings.database_url,
        poolclass=NullPool,
    )

    try:
        async with SessionLocal(bind=engine) as session:
            await session.execute(
                delete(Product).where(Product.id == product_id)
            )
            await session.commit()
    finally:
        await engine.dispose()


def test_product_crud(
    client,
    monkeypatch,
):
    login_admin(client, monkeypatch)

    product_name = f"Test Product {uuid4().hex[:8]}"
    sort_order = 9000 + (
        uuid4().int % 1000
    )

    created_product_id = None

    try:
        # -------------------------
        # 1. Create
        # -------------------------
        response = client.post(
            "/api/v1/admin/products",
            data={
                "name": product_name,
                "description": "Temporary CRUD test product",
                "price": "1500000",
                "category_id": "1",
                "stock": "10",
                "sort_order": str(sort_order),
                "is_active": "true",
            },
            files={
                "image": (
                    "test.jpg",
                    b"fake-image-content",
                    "image/jpeg",
                )
            },
        )

        assert response.status_code == 201

        product = response.json()
        created_product_id = product["id"]

        assert product["name"] == product_name
        assert product["price"] == 1500000
        assert product["stock"] == 10
        assert product["is_active"] is True

        # -------------------------
        # 2. Read
        # -------------------------
        response = client.get(
            f"/api/v1/admin/products/{created_product_id}"
        )

        assert response.status_code == 200

        product = response.json()

        assert product["id"] == created_product_id

        # -------------------------
        # 3. Update
        # -------------------------
        response = client.patch(
            f"/api/v1/admin/products/{created_product_id}",
            data={
                "name": "Updated CRUD Product",
                "price": "2000000",
                "stock": "20",
            },
        )

        assert response.status_code == 200

        product = response.json()

        assert product["name"] == "Updated CRUD Product"
        assert product["price"] == 2000000
        assert product["stock"] == 20

        # -------------------------
        # 4. Soft Delete
        # -------------------------
        response = client.delete(
            f"/api/v1/admin/products/{created_product_id}"
        )

        assert response.status_code == 200

        # Public API must not see inactive product
        response = client.get(
            f"/api/v1/products/{created_product_id}"
        )

        assert response.status_code == 404

        # -------------------------
        # 5. Restore
        # -------------------------
        response = client.patch(
            f"/api/v1/admin/products/{created_product_id}/restore"
        )

        assert response.status_code == 200

        # Public API sees it again
        response = client.get(
            f"/api/v1/products/{created_product_id}"
        )

        assert response.status_code == 200
        assert response.json()["is_active"] is True

    finally:
        # Remove temporary DB record
        if created_product_id is not None:
            asyncio.run(
                cleanup_product(created_product_id)
            )

        client.post("/api/v1/admin/logout")


def test_category_crud(
    client,
    monkeypatch,
):
    login_admin(client, monkeypatch)

    category_name = f"Test Category {uuid4().hex[:8]}"

    try:
        # -------------------------
        # 1. Create
        # -------------------------
        response = client.post(
            "/api/v1/admin/categories",
            json={
                "name": category_name,
            },
        )

        assert response.status_code == 201

        category = response.json()

        category_id = category["id"]

        assert category["name"] == category_name

        # -------------------------
        # 2. Read
        # -------------------------
        response = client.get(
            "/api/v1/admin/categories"
        )

        assert response.status_code == 200

        categories = response.json()

        assert any(
            item["id"] == category_id
            for item in categories
        )

        # -------------------------
        # 3. Update
        # -------------------------
        response = client.patch(
            f"/api/v1/admin/categories/{category_id}",
            json={
                "name": "Updated Test Category",
            },
        )

        assert response.status_code == 200

        assert (
            response.json()["name"]
            == "Updated Test Category"
        )

        # -------------------------
        # 4. Delete
        # -------------------------
        response = client.delete(
            f"/api/v1/admin/categories/{category_id}"
        )

        assert response.status_code == 200

        # Verify deletion
        response = client.get(
            "/api/v1/admin/categories"
        )

        assert response.status_code == 200

        categories = response.json()

        assert not any(
            item["id"] == category_id
            for item in categories
        )

    finally:
        client.post("/api/v1/admin/logout")