def test_health(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    assert response.json()["database"] == "connected"


def test_get_products(client):
    response = client.get("/api/v1/products")

    assert response.status_code == 200

    data = response.json()

    assert "data" in data
    assert "page" in data
    assert "limit" in data
    assert "total" in data


def test_get_product(client):
    response = client.get("/api/v1/products/1")

    assert response.status_code == 200

    product = response.json()

    assert product["id"] == 1
    assert "category" in product


def test_get_nonexistent_product(client):
    response = client.get("/api/v1/products/999999")

    assert response.status_code == 404


def test_get_categories(client):
    response = client.get("/api/v1/categories")

    assert response.status_code == 200

    categories = response.json()

    assert isinstance(categories, list)