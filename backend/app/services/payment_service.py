import uuid
import random
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.payment import Payment
from app.models.order import Order


async def process_payment(db: AsyncSession, order_id: int, method: str, user_id: int) -> Payment:
    order_result = await db.execute(
        select(Order).where(Order.id == order_id, Order.user_id == user_id)
    )
    order = order_result.scalar_one_or_none()
    if not order:
        raise ValueError("Order not found")

    existing = await db.execute(
        select(Payment).where(Payment.order_id == order_id)
    )
    existing_payment = existing.scalar_one_or_none()
    if existing_payment and existing_payment.status == "success":
        return existing_payment

    success = random.random() < 0.95  # 95% success rate

    transaction_id = str(uuid.uuid4()) if success else None

    if existing_payment:
        existing_payment.status = "success" if success else "failed"
        existing_payment.method = method
        existing_payment.transaction_id = transaction_id
        payment = existing_payment
    else:
        payment = Payment(
            order_id=order_id,
            status="success" if success else "failed",
            method=method,
            amount=order.final_total,
            transaction_id=transaction_id,
        )
        db.add(payment)

    if success:
        order.status = "CONFIRMED"

    await db.commit()
    await db.refresh(payment)
    return payment


async def get_payment_status(db: AsyncSession, order_id: int) -> Payment | None:
    result = await db.execute(
        select(Payment).where(Payment.order_id == order_id)
    )
    return result.scalar_one_or_none()
