from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.schemas.coupon import CouponResponse
from app.services.coupon_service import validate_coupon, get_active_coupons

router = APIRouter(prefix="/coupons", tags=["Coupons"])


@router.get("/validate/{code}", response_model=dict)
async def validate_coupon_route(
    code: str,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await validate_coupon(db, code, 0)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid or expired coupon")
    return result
