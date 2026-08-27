from fastapi import APIRouter, Depends
from typing import Annotated
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.core.dependencies import get_current_active_user
from app.models.user import User
from app.schemas.user_preferences import UserPreferencesBase, UserPreferencesResponse
from app.services.user_service import get_preferences, update_preferences

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/preferences", response_model=UserPreferencesResponse)
async def get_user_preferences(
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    prefs = await get_preferences(db, current_user.id)
    if not prefs:
        prefs = await update_preferences(db, current_user.id)
    return prefs


@router.put("/preferences", response_model=UserPreferencesResponse)
async def update_user_preferences(
    prefs_data: UserPreferencesBase,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    prefs = await update_preferences(
        db,
        current_user.id,
        favorite_cuisine=prefs_data.favorite_cuisine,
        favorite_restaurants=prefs_data.favorite_restaurants,
        dietary_restrictions=prefs_data.dietary_restrictions,
    )
    return prefs
