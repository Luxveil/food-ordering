from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.delivery import Delivery
from app.models.order import Order


STATUS_PROGRESSION = {
    "PLACED": "CONFIRMED",
    "CONFIRMED": "PREPARING",
    "PREPARING": "READY_FOR_PICKUP",
    "READY_FOR_PICKUP": "OUT_FOR_DELIVERY",
    "OUT_FOR_DELIVERY": "DELIVERED",
}


async def get_delivery_status(db: AsyncSession, order_id: int) -> Delivery | None:
    result = await db.execute(
        select(Delivery).where(Delivery.order_id == order_id)
    )
    return result.scalar_one_or_none()


async def simulate_progress(db: AsyncSession, order_id: int) -> Delivery:
    delivery_result = await db.execute(
        select(Delivery).where(Delivery.order_id == order_id)
    )
    delivery = delivery_result.scalar_one_or_none()
    if not delivery:
        raise ValueError("Delivery not found")

    if delivery.status == "DELIVERED":
        return delivery

    next_status = STATUS_PROGRESSION.get(delivery.status)
    if next_status:
        delivery.status = next_status
        order_result = await db.execute(
            select(Order).where(Order.id == order_id)
        )
        order = order_result.scalar_one_or_none()
        if order:
            order.status = next_status

        eta_map = {
            "CONFIRMED": 30,
            "PREPARING": 20,
            "READY_FOR_PICKUP": 10,
            "OUT_FOR_DELIVERY": 5,
            "DELIVERED": 0,
        }
        delivery.eta_minutes = eta_map.get(next_status, 15)

        location_map = {
            "CONFIRMED": "Restaurant",
            "PREPARING": "Kitchen",
            "READY_FOR_PICKUP": "Restaurant counter",
            "OUT_FOR_DELIVERY": "On the way",
            "DELIVERED": "Your doorstep",
        }
        delivery.current_location = location_map.get(next_status, "Unknown")

    await db.commit()
    await db.refresh(delivery)
    return delivery
