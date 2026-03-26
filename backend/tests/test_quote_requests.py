import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_quote_request(client: AsyncClient, auth_headers):
    response = await client.post("/quote-requests", json={
        "product_name": "Viking 36-inch Range",
        "brand": "Viking",
        "zip_code": "94102",
        "radius_miles": 50,
    }, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["product_name"] == "Viking 36-inch Range"
    assert data["brand"] == "Viking"
    assert data["zip_code"] == "94102"
    assert data["reference_code"].startswith("DR-")
    assert data["status"] == "pending"


@pytest.mark.asyncio
async def test_create_quote_request_unauthorized(client: AsyncClient):
    response = await client.post("/quote-requests", json={
        "product_name": "Test Product",
        "zip_code": "94102",
    })
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_list_quote_requests(client: AsyncClient, auth_headers):
    # Create a request first
    await client.post("/quote-requests", json={
        "product_name": "Test Product",
        "zip_code": "94102",
    }, headers=auth_headers)

    response = await client.get("/quote-requests", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1


@pytest.mark.asyncio
async def test_get_quote_request_detail(client: AsyncClient, auth_headers):
    # Create
    create_resp = await client.post("/quote-requests", json={
        "product_name": "Test Product",
        "zip_code": "94102",
    }, headers=auth_headers)
    qr_id = create_resp.json()["id"]

    # Get detail
    response = await client.get(f"/quote-requests/{qr_id}", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["product_name"] == "Test Product"
    assert "dealers" in data
    assert "replies" in data


@pytest.mark.asyncio
async def test_archive_quote_request(client: AsyncClient, auth_headers):
    create_resp = await client.post("/quote-requests", json={
        "product_name": "Test Product",
        "zip_code": "94102",
    }, headers=auth_headers)
    qr_id = create_resp.json()["id"]

    response = await client.patch(f"/quote-requests/{qr_id}/archive", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["status"] == "archived"


@pytest.mark.asyncio
async def test_delete_quote_request(client: AsyncClient, auth_headers):
    create_resp = await client.post("/quote-requests", json={
        "product_name": "Test Product",
        "zip_code": "94102",
    }, headers=auth_headers)
    qr_id = create_resp.json()["id"]

    response = await client.delete(f"/quote-requests/{qr_id}", headers=auth_headers)
    assert response.status_code == 204
