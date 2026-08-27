from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.core.dependencies import get_current_active_user
from app.models.user import User
from app.schemas.payment import PaymentProcess, PaymentResponse
from app.services.payment_service import process_payment, get_payment_status

router = APIRouter(prefix="/payments", tags=["Payments"])


@router.post("/process", response_model=PaymentResponse)
async def process_payment_route(
    payment_data: PaymentProcess,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    try:
        payment = await process_payment(db, payment_data.order_id, payment_data.method, current_user.id)
        return payment
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/{order_id}/status", response_model=PaymentResponse)
async def get_payment_status_route(
    order_id: int,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    payment = await get_payment_status(db, order_id)
    if not payment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")
    return payment
