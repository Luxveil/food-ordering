from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import get_settings
from app.db.database import engine, Base
from app.api import auth, restaurants, menu, cart, orders, payments, deliveries, coupons, users

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


def create_app() -> FastAPI:
    app = FastAPI(
        title="Food Ordering API",
        description="A production-ready food ordering backend",
        version="1.0.0",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(auth.router)
    app.include_router(restaurants.router)
    app.include_router(menu.router)
    app.include_router(cart.router)
    app.include_router(orders.router)
    app.include_router(payments.router)
    app.include_router(deliveries.router)
    app.include_router(coupons.router)
    app.include_router(users.router)

    @app.get("/health")
    async def health_check():
        return {"status": "healthy"}

    return app


app = create_app()
