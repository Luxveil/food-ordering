from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.core.dependencies import get_current_active_user
from app.models.user import User
from app.schemas.delivery import DeliveryResponse
from app.services.delivery_service import get_delivery_status, simulate_progress

router = APIRouter(prefix="/deliveries", tags=["Deliveries"])


@router.get("/{order_id}/status", response_model=DeliveryResponse)
async def get_delivery_status_route(
    order_id: int,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    delivery = await get_delivery_status(db, order_id)
    if not delivery:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Delivery not found")
    return delivery


@router.post("/{order_id}/simulate-progress", response_model=DeliveryResponse)
async def simulate_delivery_progress(
    order_id: int,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    try:
        delivery = await simulate_progress(db, order_id)
        return delivery
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
