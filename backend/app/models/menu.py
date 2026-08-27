from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float, Boolean, Text, JSON, func
from sqlalchemy.orm import relationship
from app.db.database import Base


class Menu(Base):
    __tablename__ = "menus"

    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id", ondelete="CASCADE"), nullable=False)
    category = Column(String(100), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    restaurant = relationship("Restaurant", back_populates="menus")
    items = relationship("MenuItem", back_populates="menu", cascade="all, delete-orphan")


class MenuItem(Base):
    __tablename__ = "menu_items"

    id = Column(Integer, primary_key=True, index=True)
    menu_id = Column(Integer, ForeignKey("menus.id", ondelete="CASCADE"), nullable=False)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    is_vegetarian = Column(Boolean, default=False)
    is_available = Column(Boolean, default=True)
    category = Column(String(100), nullable=False)
    image_url = Column(String(500), nullable=True)
    add_ons = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    menu = relationship("Menu", back_populates="items")
    restaurant = relationship("Restaurant", back_populates="menu_items")
