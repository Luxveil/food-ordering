from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.schemas.restaurant import MenuItemResponse


class CartItemCreate(BaseModel):
    menu_item_id: int
    quantity: int = 1
    customization: Optional[str] = None


class CartItemUpdate(BaseModel):
    quantity: int


class CartItemResponse(BaseModel):
    id: int
    menu_item_id: int
    quantity: int
    customization: Optional[str] = None
    price_at_time: float
    menu_item: Optional[MenuItemResponse] = None

    model_config = {"from_attributes": True}


class CartResponse(BaseModel):
    id: int
    restaurant_id: Optional[int] = None
    items: list[CartItemResponse] = []

    model_config = {"from_attributes": True}


class CartCalculateRequest(BaseModel):
    coupon_code: Optional[str] = None


class PriceBreakdown(BaseModel):
    subtotal: float
    tax: float
    delivery_fee: float
    discount: float
    final_total: float
