from typing import AsyncGenerator

import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from app.main import app
from app.database import get_session
from app.models.base import Base
from app.services.auth_service import hash_password, create_access_token


TEST_DATABASE_URL = "postgresql+asyncpg://postgres:postgres@localhost:5432/dealerreach_test"


@pytest_asyncio.fixture(scope="function")
async def _engine():
    """Create a fresh engine per test to avoid event loop issues."""
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def db_session(_engine) -> AsyncGenerator[AsyncSession, None]:
    session_factory = async_sessionmaker(_engine, class_=AsyncSession, expire_on_commit=False)
    async with session_factory() as session:
        yield session


@pytest_asyncio.fixture(scope="function")
async def client(_engine) -> AsyncGenerator[AsyncClient, None]:
    session_factory = async_sessionmaker(_engine, class_=AsyncSession, expire_on_commit=False)

    async def override_get_session():
        async with session_factory() as session:
            yield session

    app.dependency_overrides[get_session] = override_get_session

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def test_user(db_session: AsyncSession):
    from app.models.user import User
    user = User(
        email="test@example.com",
        password_hash=hash_password("testpass123"),
        name="Test User",
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def auth_headers(test_user) -> dict:
    token = create_access_token(test_user.id)
    return {"Authorization": f"Bearer {token}"}
