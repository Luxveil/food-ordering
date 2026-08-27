from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime


class RestaurantBase(BaseModel):
    name: str
    cuisine: str
    rating: float = 0.0
    delivery_time_min: int = 30
    price_for_two: int = 300
    address: Optional[str] = None
    city: str
    is_active: bool = True
    is_vegetarian_friendly: bool = False
    image_url: Optional[str] = None
    description: Optional[str] = None


class RestaurantResponse(RestaurantBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class MenuItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    is_vegetarian: bool = False
    is_available: bool = True
    category: str
    image_url: Optional[str] = None
    add_ons: Any = []


class MenuItemResponse(MenuItemBase):
    id: int
    menu_id: int
    restaurant_id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class RestaurantDetailResponse(RestaurantResponse):
    menu_items: list[MenuItemResponse] = []
