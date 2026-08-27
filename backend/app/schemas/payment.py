from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class PaymentProcess(BaseModel):
    order_id: int
    method: str  # cod, mock_card, mock_upi


class PaymentResponse(BaseModel):
    id: int
    order_id: int
    status: str
    method: Optional[str] = None
    amount: float
    transaction_id: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}
