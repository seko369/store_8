from pwdlib import PasswordHash

from app.core.config import settings


def test_admin_me_without_session(client):
    response = client.get("/api/v1/admin/me")

    assert response.status_code == 401


def test_admin_products_without_session(client):
    response = client.get("/api/v1/admin/products")

    assert response.status_code == 401


def test_full_admin_auth_flow(client, monkeypatch):
    password = "TestPassword123!"

    generated_hash = PasswordHash.recommended().hash(password)

    monkeypatch.setattr(
        settings,
        "admin_password_hash",
        generated_hash,
    )

    # -------------------------
    # 1. Login
    # -------------------------
    login_response = client.post(
        "/api/v1/admin/login",
        json={
            "email": settings.admin_email,
            "password": password,
        },
    )

    assert login_response.status_code == 200
    assert login_response.json()["message"] == (
        "ورود با موفقیت انجام شد."
    )

    assert client.cookies.get("session_token") is not None

    # -------------------------
    # 2. /admin/me
    # -------------------------
    me_response = client.get(
        "/api/v1/admin/me"
    )

    assert me_response.status_code == 200
    assert me_response.json()["email"] == (
        settings.admin_email
    )

    # -------------------------
    # 3. Protected Admin API
    # -------------------------
    products_response = client.get(
        "/api/v1/admin/products"
    )

    assert products_response.status_code == 200

    products_data = products_response.json()

    assert "data" in products_data
    assert "total" in products_data

    # -------------------------
    # 4. Logout
    # -------------------------
    logout_response = client.post(
        "/api/v1/admin/logout"
    )

    assert logout_response.status_code == 200
    assert logout_response.json()["message"] == (
        "خروج با موفقیت انجام شد."
    )

    # -------------------------
    # 5. Session invalidated
    # -------------------------
    me_after_logout = client.get(
        "/api/v1/admin/me"
    )

    assert me_after_logout.status_code == 401


def test_admin_login_with_wrong_password(
    client,
    monkeypatch,
):
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
    assert response.json()["detail"] == (
        "ایمیل یا رمز عبور صحیح نیست."
    )