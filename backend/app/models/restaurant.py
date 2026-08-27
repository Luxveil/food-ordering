from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, func
from sqlalchemy.orm import relationship
from app.db.database import Base


class Restaurant(Base):
    __tablename__ = "restaurants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    cuisine = Column(String(100), nullable=False)
    rating = Column(Float, default=0.0)
    delivery_time_min = Column(Integer, default=30)
    price_for_two = Column(Integer, default=300)
    address = Column(String(500), nullable=True)
    city = Column(String(100), nullable=False)
    is_active = Column(Boolean, default=True)
    is_vegetarian_friendly = Column(Boolean, default=False)
    image_url = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    menus = relationship("Menu", back_populates="restaurant", cascade="all, delete-orphan")
    menu_items = relationship("MenuItem", back_populates="restaurant", cascade="all, delete-orphan")
