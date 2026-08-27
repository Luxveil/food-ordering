from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class DeliveryResponse(BaseModel):
    id: int
    order_id: int
    status: str
    eta_minutes: Optional[int] = None
    partner_name: Optional[str] = None
    current_location: Optional[str] = None
    updated_at: datetime

    model_config = {"from_attributes": True}
