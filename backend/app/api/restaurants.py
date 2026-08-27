from fastapi import APIRouter, Depends, Query
from typing import Annotated, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.schemas.restaurant import RestaurantResponse, RestaurantDetailResponse, MenuItemResponse
from app.services.restaurant_service import (
    get_restaurants,
    get_restaurant_by_id,
    get_menu_items,
    search_menu_items,
)

router = APIRouter(prefix="/restaurants", tags=["Restaurants"])


@router.get("", response_model=list[RestaurantResponse])
async def list_restaurants(
    db: Annotated[AsyncSession, Depends(get_db)],
    cuisine: Optional[str] = Query(None),
    rating: Optional[float] = Query(None),
    price: Optional[int] = Query(None, alias="price"),
    veg_only: bool = Query(False),
    city: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
):
    return await get_restaurants(db, cuisine=cuisine, rating=rating, price_max=price, veg_only=veg_only, city=city, search=search)


@router.get("/{restaurant_id}", response_model=RestaurantDetailResponse)
async def get_restaurant(
    restaurant_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    restaurant = await get_restaurant_by_id(db, restaurant_id)
    if not restaurant:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Restaurant not found")
    menu_items = await get_menu_items(db, restaurant_id)
    return RestaurantDetailResponse(
        id=restaurant.id,
        name=restaurant.name,
        cuisine=restaurant.cuisine,
        rating=restaurant.rating,
        delivery_time_min=restaurant.delivery_time_min,
        price_for_two=restaurant.price_for_two,
        address=restaurant.address,
        city=restaurant.city,
        is_active=restaurant.is_active,
        is_vegetarian_friendly=restaurant.is_vegetarian_friendly,
        image_url=restaurant.image_url,
        description=restaurant.description,
        created_at=restaurant.created_at,
        menu_items=[MenuItemResponse.model_validate(item) for item in menu_items],
    )


@router.get("/{restaurant_id}/menu", response_model=list[MenuItemResponse])
async def get_restaurant_menu(
    restaurant_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    return await get_menu_items(db, restaurant_id)
