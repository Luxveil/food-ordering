import pytest
import asyncio
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.db.database import Base, get_db
from main import app

TEST_DATABASE_URL = "sqlite+aiosqlite:///./test.db"

test_engine = create_async_engine(TEST_DATABASE_URL, echo=False)
TestSessionLocal = async_sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)


async def override_get_db():
    async with TestSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(autouse=True)
async def setup_database():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest_asyncio.fixture
async def db():
    async with TestSessionLocal() as session:
        yield session


async def register_user(client: AsyncClient, email: str = "test@example.com", password: str = "Test123!", name: str = "Test User"):
    response = await client.post("/auth/register", json={
        "email": email,
        "password": password,
        "name": name,
    })
    return response


async def login_user(client: AsyncClient, email: str = "test@example.com", password: str = "Test123!"):
    response = await client.post("/auth/login", data={
        "username": email,
        "password": password,
    })
    return response


async def get_auth_headers(client: AsyncClient, email: str = "test@example.com", password: str = "Test123!"):
    await register_user(client, email=email, password=password)
    login_response = await login_user(client, email=email, password=password)
    token = login_response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_health_check(client):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


@pytest.mark.asyncio
async def test_register(client):
    response = await register_user(client)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["name"] == "Test User"
    assert "id" in data


@pytest.mark.asyncio
async def test_register_duplicate(client):
    await register_user(client)
    response = await register_user(client)
    assert response.status_code == 409


@pytest.mark.asyncio
async def test_login(client):
    await register_user(client)
    response = await login_user(client)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data


@pytest.mark.asyncio
async def test_login_wrong_password(client):
    await register_user(client)
    response = await client.post("/auth/login", data={
        "username": "test@example.com",
        "password": "wrongpassword",
    })
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_me(client):
    headers = await get_auth_headers(client)
    response = await client.get("/auth/me", headers=headers)
    assert response.status_code == 200
    assert response.json()["email"] == "test@example.com"


@pytest.mark.asyncio
async def test_protected_route(client):
    response = await client.get("/auth/me")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_refresh_token(client):
    await register_user(client)
    login_response = await login_user(client)
    refresh_token = login_response.json()["refresh_token"]

    response = await client.post("/auth/refresh", json={
        "refresh_token": refresh_token,
    })
    assert response.status_code == 200
    assert "access_token" in response.json()


@pytest.mark.asyncio
async def test_restaurants_empty(client):
    headers = await get_auth_headers(client)
    response = await client.get("/restaurants", headers=headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


@pytest.mark.asyncio
async def test_cart_operations(client):
    headers = await get_auth_headers(client)

    # Get cart (empty)
    response = await client.get("/cart", headers=headers)
    assert response.status_code == 200

    # Clear empty cart
    response = await client.delete("/cart", headers=headers)
    assert response.status_code == 200
