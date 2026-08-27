from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class OrderCreate(BaseModel):
    delivery_address: str
    coupon_code: Optional[str] = None


class OrderItemResponse(BaseModel):
    id: int
    menu_item_id: Optional[int] = None
    quantity: int
    price: float
    customization: Optional[str] = None
    item_name: Optional[str] = None

    model_config = {"from_attributes": True}


class OrderResponse(BaseModel):
    id: int
    order_number: str
    status: str
    restaurant_id: Optional[int] = None
    total: float
    discount: float
    tax: float
    delivery_fee: float
    final_total: float
    coupon_code: Optional[str] = None
    delivery_address: Optional[str] = None
    items: list[OrderItemResponse] = []
    created_at: datetime

    model_config = {"from_attributes": True}


class OrderListResponse(BaseModel):
    orders: list[OrderResponse]
