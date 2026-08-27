import uuid
import random
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.models.order import Order, OrderItem
from app.models.cart import Cart, CartItem
from app.models.delivery import Delivery
from app.services.cart_service import calculate_price


async def create_order(
    db: AsyncSession, user_id: int, delivery_address: str, coupon_code: str | None = None
) -> Order:
    cart_result = await db.execute(
        select(Cart).options(selectinload(Cart.items)).where(Cart.user_id == user_id)
    )
    cart = cart_result.scalar_one_or_none()
    if not cart or not cart.items:
        raise ValueError("Cart is empty")

    cart_items_result = await db.execute(
        select(CartItem).where(CartItem.cart_id == cart.id)
    )
    cart_items = list(cart_items_result.scalars().all())

    if not cart_items:
        raise ValueError("Cart is empty")

    pricing = await calculate_price(db, user_id, coupon_code)

    order_number = f"ORD-{uuid.uuid4().hex[:8].upper()}"
    order = Order(
        user_id=user_id,
        order_number=order_number,
        status="PLACED",
        restaurant_id=cart.restaurant_id,
        total=pricing["subtotal"],
        discount=pricing["discount"],
        tax=pricing["tax"],
        delivery_fee=pricing["delivery_fee"],
        final_total=pricing["final_total"],
        coupon_code=coupon_code,
        delivery_address=delivery_address,
    )
    db.add(order)
    await db.flush()

    from app.models.menu import MenuItem
    for ci in cart_items:
        mi_result = await db.execute(select(MenuItem.name).where(MenuItem.id == ci.menu_item_id))
        item_name = mi_result.scalar_one_or_none()
        order_item = OrderItem(
            order_id=order.id,
            menu_item_id=ci.menu_item_id,
            quantity=ci.quantity,
            price=ci.price_at_time,
            customization=ci.customization,
            item_name=item_name,
        )
        db.add(order_item)

    delivery = Delivery(
        order_id=order.id,
        status="PLACED",
        eta_minutes=random.randint(25, 45),
        partner_name=random.choice(["Rahul", "Amit", "Vikram", "Suresh"]),
        current_location="Restaurant",
    )
    db.add(delivery)

    # Clear cart
    from sqlalchemy import delete
    await db.execute(delete(CartItem).where(CartItem.cart_id == cart.id))

    await db.commit()
    result = await db.execute(
        select(Order).options(selectinload(Order.items)).where(Order.id == order.id)
    )
    return result.scalar_one()


async def get_user_orders(db: AsyncSession, user_id: int) -> list[Order]:
    result = await db.execute(
        select(Order).options(selectinload(Order.items)).where(Order.user_id == user_id).order_by(Order.created_at.desc())
    )
    return list(result.scalars().all())


async def get_order_by_id(db: AsyncSession, order_id: int, user_id: int) -> Order | None:
    result = await db.execute(
        select(Order).options(selectinload(Order.items)).where(Order.id == order_id, Order.user_id == user_id)
    )
    return result.scalar_one_or_none()


async def cancel_order(db: AsyncSession, order_id: int, user_id: int) -> Order:
    order = await get_order_by_id(db, order_id, user_id)
    if not order:
        raise ValueError("Order not found")
    if order.status not in ("PLACED", "CONFIRMED"):
        raise ValueError("Order cannot be cancelled at this stage")
    order.status = "CANCELLED"
    await db.commit()
    result = await db.execute(
        select(Order).options(selectinload(Order.items)).where(Order.id == order.id)
    )
    return result.scalar_one()
