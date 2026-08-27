from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from app.core.config import get_settings
import re

settings = get_settings()

DATABASE_URL = settings.DATABASE_URL
if DATABASE_URL:
    DATABASE_URL = re.sub(r'[?&]sslmode=[^&]*', '', DATABASE_URL)
    DATABASE_URL = DATABASE_URL.rstrip('?&')


class Base(DeclarativeBase):
    pass


engine = create_async_engine(
    DATABASE_URL,
    echo=settings.ENVIRONMENT == "development",
    connect_args={"ssl": True} if DATABASE_URL and "neon" in DATABASE_URL else {},
)
async_session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def get_db():
    async with async_session_factory() as session:
        try:
            yield session
        finally:
            await session.close()
