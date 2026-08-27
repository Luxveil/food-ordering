from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.core.dependencies import get_current_active_user
from app.models.user import User
from app.schemas.cart import (
    CartItemCreate, CartItemUpdate, CartItemResponse, CartResponse,
    CartCalculateRequest, PriceBreakdown,
)
from app.services.cart_service import (
    get_or_create_cart, add_to_cart, update_cart_item,
    remove_cart_item, clear_cart, calculate_price,
)

router = APIRouter(prefix="/cart", tags=["Cart"])


@router.get("", response_model=CartResponse)
async def get_cart(
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    cart = await get_or_create_cart(db, current_user.id)
    return cart


@router.post("/items", response_model=CartItemResponse, status_code=status.HTTP_201_CREATED)
async def add_cart_item(
    item_data: CartItemCreate,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    try:
        item = await add_to_cart(db, current_user.id, item_data.menu_item_id, item_data.quantity, item_data.customization)
        return item
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.put("/items/{item_id}", response_model=CartItemResponse)
async def update_cart_item_route(
    item_id: int,
    item_data: CartItemUpdate,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    try:
        item = await update_cart_item(db, current_user.id, item_id, item_data.quantity)
        if item is None:
            return {"detail": "Item removed"}
        return item
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/items/{item_id}")
async def delete_cart_item(
    item_id: int,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    await remove_cart_item(db, current_user.id, item_id)
    return {"detail": "Item removed"}


@router.delete("")
async def clear_cart_route(
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    await clear_cart(db, current_user.id)
    return {"detail": "Cart cleared"}


@router.post("/calculate", response_model=PriceBreakdown)
async def calculate_cart_price(
    body: CartCalculateRequest,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    return await calculate_price(db, current_user.id, body.coupon_code)
