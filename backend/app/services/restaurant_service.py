from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from app.models.restaurant import Restaurant
from app.models.menu import MenuItem


async def get_restaurants(
    db: AsyncSession,
    cuisine: str | None = None,
    rating: float | None = None,
    price_max: int | None = None,
    veg_only: bool = False,
    city: str | None = None,
    search: str | None = None,
) -> list[Restaurant]:
    query = select(Restaurant).where(Restaurant.is_active == True)

    if cuisine:
        query = query.where(Restaurant.cuisine.ilike(f"%{cuisine}%"))
    if rating:
        query = query.where(Restaurant.rating >= rating)
    if price_max:
        query = query.where(Restaurant.price_for_two <= price_max)
    if veg_only:
        query = query.where(Restaurant.is_vegetarian_friendly == True)
    if city:
        query = query.where(Restaurant.city.ilike(f"%{city}%"))
    if search:
        query = query.where(
            or_(
                Restaurant.name.ilike(f"%{search}%"),
                Restaurant.cuisine.ilike(f"%{search}%"),
            )
        )

    result = await db.execute(query.order_by(Restaurant.rating.desc()))
    return list(result.scalars().all())


async def get_restaurant_by_id(db: AsyncSession, restaurant_id: int) -> Restaurant | None:
    result = await db.execute(select(Restaurant).where(Restaurant.id == restaurant_id))
    return result.scalar_one_or_none()


async def get_menu_items(db: AsyncSession, restaurant_id: int) -> list[MenuItem]:
    result = await db.execute(
        select(MenuItem).where(MenuItem.restaurant_id == restaurant_id, MenuItem.is_available == True)
    )
    return list(result.scalars().all())


async def get_menu_item_by_id(db: AsyncSession, item_id: int) -> MenuItem | None:
    result = await db.execute(select(MenuItem).where(MenuItem.id == item_id))
    return result.scalar_one_or_none()


async def search_menu_items(db: AsyncSession, search: str) -> list[MenuItem]:
    result = await db.execute(
        select(MenuItem).where(MenuItem.name.ilike(f"%{search}%"), MenuItem.is_available == True)
    )
    return list(result.scalars().all())
