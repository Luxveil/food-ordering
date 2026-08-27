from fastapi import APIRouter, Depends, Query
from typing import Annotated, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.schemas.restaurant import MenuItemResponse
from app.services.restaurant_service import search_menu_items, get_menu_item_by_id

router = APIRouter(prefix="/menu-items", tags=["Menu"])


@router.get("", response_model=list[MenuItemResponse])
async def list_menu_items(
    db: Annotated[AsyncSession, Depends(get_db)],
    search: Optional[str] = Query(None),
):
    if search:
        return await search_menu_items(db, search)
    return []


@router.get("/{item_id}", response_model=MenuItemResponse)
async def get_menu_item(
    item_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    item = await get_menu_item_by_id(db, item_id)
    if not item:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Menu item not found")
    return item
