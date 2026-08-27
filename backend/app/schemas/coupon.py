from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CouponResponse(BaseModel):
    code: str
    discount_type: str
    discount_value: float
    min_order: float
    max_discount: Optional[float] = None
    valid_until: datetime

    model_config = {"from_attributes": True}
