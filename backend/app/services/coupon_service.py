from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.coupon import Coupon


async def validate_coupon(db: AsyncSession, code: str, subtotal: float) -> dict | None:
    result = await db.execute(
        select(Coupon).where(
            Coupon.code == code.upper(),
            Coupon.is_active == True,
        )
    )
    coupon = result.scalar_one_or_none()
    if not coupon:
        return None

    now = datetime.now(timezone.utc)
    if coupon.valid_until.replace(tzinfo=timezone.utc) < now:
        return None

    if subtotal < coupon.min_order:
        return {"error": f"Minimum order of ₹{coupon.min_order} required"}

    discount = 0.0
    if coupon.discount_type == "percentage":
        discount = round(subtotal * coupon.discount_value / 100, 2)
        if coupon.max_discount:
            discount = min(discount, coupon.max_discount)
    elif coupon.discount_type == "fixed":
        discount = coupon.discount_value
    elif coupon.discount_type == "free_delivery":
        discount = 30.0

    return {
        "discount": discount,
        "coupon_code": coupon.code,
        "discount_type": coupon.discount_type,
    }


async def get_active_coupons(db: AsyncSession) -> list[Coupon]:
    now = datetime.now(timezone.utc)
    result = await db.execute(
        select(Coupon).where(
            Coupon.is_active == True,
            Coupon.valid_until > now,
        )
    )
    return list(result.scalars().all())
