from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, func
from app.db.database import Base


class Coupon(Base):
    __tablename__ = "coupons"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True)
    discount_type = Column(String(20), nullable=False)  # "percentage" or "fixed" or "free_delivery"
    discount_value = Column(Float, nullable=False, default=0)
    min_order = Column(Float, default=0)
    max_discount = Column(Float, nullable=True)
    valid_until = Column(DateTime(timezone=True), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
