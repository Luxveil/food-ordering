from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user_preferences import UserPreferences


async def get_preferences(db: AsyncSession, user_id: int) -> UserPreferences | None:
    result = await db.execute(
        select(UserPreferences).where(UserPreferences.user_id == user_id)
    )
    return result.scalar_one_or_none()


async def update_preferences(
    db: AsyncSession,
    user_id: int,
    favorite_cuisine: str | None = None,
    favorite_restaurants: list | None = None,
    dietary_restrictions: list | None = None,
) -> UserPreferences:
    result = await db.execute(
        select(UserPreferences).where(UserPreferences.user_id == user_id)
    )
    prefs = result.scalar_one_or_none()

    if not prefs:
        prefs = UserPreferences(user_id=user_id)
        db.add(prefs)

    if favorite_cuisine is not None:
        prefs.favorite_cuisine = favorite_cuisine
    if favorite_restaurants is not None:
        prefs.favorite_restaurants = favorite_restaurants
    if dietary_restrictions is not None:
        prefs.dietary_restrictions = dietary_restrictions

    await db.commit()
    await db.refresh(prefs)
    return prefs
