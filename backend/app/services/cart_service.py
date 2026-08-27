from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload
from app.models.cart import Cart, CartItem
from app.models.menu import MenuItem


async def get_or_create_cart(db: AsyncSession, user_id: int) -> Cart:
    result = await db.execute(
        select(Cart).options(selectinload(Cart.items).selectinload(CartItem.menu_item)).where(Cart.user_id == user_id)
    )
    cart = result.scalar_one_or_none()
    if not cart:
        cart = Cart(user_id=user_id)
        db.add(cart)
        await db.commit()
        await db.refresh(cart)
        result = await db.execute(
            select(Cart).options(selectinload(Cart.items).selectinload(CartItem.menu_item)).where(Cart.id == cart.id)
        )
        cart = result.scalar_one()
    return cart


async def add_to_cart(
    db: AsyncSession, user_id: int, menu_item_id: int, quantity: int, customization: str | None
) -> CartItem:
    cart = await get_or_create_cart(db, user_id)
    menu_item = await db.get(MenuItem, menu_item_id)
    if not menu_item:
        raise ValueError("Menu item not found")

    # Check if item already in cart
    result = await db.execute(
        select(CartItem).where(CartItem.cart_id == cart.id, CartItem.menu_item_id == menu_item_id)
    )
    existing = result.scalar_one_or_none()

    if existing:
        existing.quantity += quantity
        await db.commit()
        await db.refresh(existing)
        await db.refresh(existing, ["menu_item"])
        return existing

    item = CartItem(
        cart_id=cart.id,
        menu_item_id=menu_item_id,
        quantity=quantity,
        customization=customization,
        price_at_time=menu_item.price,
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)
    await db.refresh(item, ["menu_item"])
    return item


async def update_cart_item(db: AsyncSession, user_id: int, item_id: int, quantity: int) -> CartItem:
    cart = await get_or_create_cart(db, user_id)
    result = await db.execute(
        select(CartItem).where(CartItem.id == item_id, CartItem.cart_id == cart.id)
    )
    item = result.scalar_one_or_none()
    if not item:
        raise ValueError("Cart item not found")
    if quantity <= 0:
        await db.delete(item)
        await db.commit()
        return None
    item.quantity = quantity
    await db.commit()
    await db.refresh(item)
    await db.refresh(item, ["menu_item"])
    return item


async def remove_cart_item(db: AsyncSession, user_id: int, item_id: int):
    cart = await get_or_create_cart(db, user_id)
    result = await db.execute(
        select(CartItem).where(CartItem.id == item_id, CartItem.cart_id == cart.id)
    )
    item = result.scalar_one_or_none()
    if item:
        await db.delete(item)
        await db.commit()


async def clear_cart(db: AsyncSession, user_id: int):
    cart = await get_or_create_cart(db, user_id)
    await db.execute(delete(CartItem).where(CartItem.cart_id == cart.id))
    await db.commit()


async def calculate_price(
    db: AsyncSession, user_id: int, coupon_code: str | None = None
) -> dict:
    cart = await get_or_create_cart(db, user_id)
    result = await db.execute(
        select(CartItem).where(CartItem.cart_id == cart.id)
    )
    items = list(result.scalars().all())

    subtotal = sum(item.price_at_time * item.quantity for item in items)
    tax = round(subtotal * 0.05, 2)  # 5% GST
    delivery_fee = 30.0 if subtotal < 500 else 0.0
    discount = 0.0

    if coupon_code:
        from app.services.coupon_service import validate_coupon
        coupon_result = await validate_coupon(db, coupon_code, subtotal)
        if coupon_result:
            discount = coupon_result["discount"]

    final_total = round(subtotal + tax + delivery_fee - discount, 2)
    return {
        "subtotal": subtotal,
        "tax": tax,
        "delivery_fee": delivery_fee,
        "discount": discount,
        "final_total": final_total,
    }
