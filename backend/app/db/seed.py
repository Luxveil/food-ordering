import asyncio
import os
import sys
from datetime import datetime, timedelta, timezone
from app.db.database import async_session_factory, engine, Base
from app.models import User, Restaurant, Menu, MenuItem, Coupon, UserPreferences
from app.core.security import get_password_hash


RESTAURANTS = [
    {
        "name": "Spice Garden",
        "cuisine": "North Indian",
        "rating": 4.5,
        "delivery_time_min": 30,
        "price_for_two": 400,
        "address": "12 MG Road",
        "city": "Bangalore",
        "is_vegetarian_friendly": True,
        "image_url": "https://images.unsplash.com/photo-1567337710282-00832b415979?w=800",
        "description": "Authentic North Indian cuisine with a modern twist. Our chefs bring the flavors of Punjab to your doorstep.",
    },
    {
        "name": "Chettinad Spice",
        "cuisine": "South Indian",
        "rating": 4.3,
        "delivery_time_min": 25,
        "price_for_two": 350,
        "address": "45 Anna Salai",
        "city": "Chennai",
        "is_vegetarian_friendly": True,
        "image_url": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800",
        "description": "Traditional Chettinad flavors from the heart of Tamil Nadu. Spicy, aromatic, and unforgettable.",
    },
    {
        "name": "Biryani House",
        "cuisine": "Biryani",
        "rating": 4.7,
        "delivery_time_min": 35,
        "price_for_two": 500,
        "address": "78 Charminar Road",
        "city": "Hyderabad",
        "is_vegetarian_friendly": True,
        "image_url": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800",
        "description": "Hyderabadi biryani perfected over generations. Slow-cooked with love and the finest saffron.",
    },
    {
        "name": "Dragon Wok",
        "cuisine": "Chinese",
        "rating": 4.2,
        "delivery_time_min": 20,
        "price_for_two": 450,
        "address": "23 Park Street",
        "city": "Kolkata",
        "is_vegetarian_friendly": True,
        "image_url": "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800",
        "description": "Sizzling Chinese cuisine with Indo-Chinese flavors. From dim sums to Hakka noodles.",
    },
    {
        "name": "Chat Corner",
        "cuisine": "Street Food",
        "rating": 4.4,
        "delivery_time_min": 15,
        "price_for_two": 250,
        "address": "56 Chandni Chowk",
        "city": "Delhi",
        "is_vegetarian_friendly": True,
        "image_url": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800",
        "description": "Authentic street food from the lanes of Old Delhi. Chaat, golgappa, and more.",
    },
    {
        "name": "Udupi Palace",
        "cuisine": "South Indian",
        "rating": 4.6,
        "delivery_time_min": 20,
        "price_for_two": 300,
        "address": "89 Brigade Road",
        "city": "Bangalore",
        "is_vegetarian_friendly": True,
        "image_url": "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=800",
        "description": "Pure vegetarian South Indian paradise. Crispy dosas, fluffy idlis, and silky sambar.",
    },
    {
        "name": "Tandoori Nights",
        "cuisine": "North Indian",
        "rating": 4.1,
        "delivery_time_min": 40,
        "price_for_two": 600,
        "address": "34 Juhu Beach Road",
        "city": "Mumbai",
        "is_vegetarian_friendly": False,
        "image_url": "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800",
        "description": "Tandoor-cooked delicacies with a sea view vibe. Butter chicken that melts in your mouth.",
    },
    {
        "name": "Sweet Surrender",
        "cuisine": "Desserts",
        "rating": 4.8,
        "delivery_time_min": 25,
        "price_for_two": 350,
        "address": "12 Park Lane",
        "city": "Pune",
        "is_vegetarian_friendly": True,
        "image_url": "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800",
        "description": "Heavenly desserts and sweet treats. From artisanal cakes to traditional Indian mithai.",
    },
    {
        "name": "Bhojan",
        "cuisine": "North Indian",
        "rating": 4.0,
        "delivery_time_min": 30,
        "price_for_two": 350,
        "address": "67 Civil Lines",
        "city": "Jaipur",
        "is_vegetarian_friendly": True,
        "image_url": "https://images.unsplash.com/photo-1517244683847-7456b63c5969?w=800",
        "description": "Rajasthani thalis and traditional North Indian fare. Daal baati churma is our specialty.",
    },
    {
        "name": "Kerala Kitchen",
        "cuisine": "South Indian",
        "rating": 4.3,
        "delivery_time_min": 35,
        "price_for_two": 400,
        "address": "91 MG Road",
        "city": "Kochi",
        "is_vegetarian_friendly": True,
        "image_url": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800",
        "description": "Kerala flavors transported to your plate. Appam, stew, and Malabar biryani.",
    },
]


MENUS = {
    "Spice Garden": {
        "Starters": [
            {"name": "Paneer Tikka", "description": "Grilled cottage cheese cubes marinated in spices", "price": 180, "is_vegetarian": True},
            {"name": "Chicken Seekh Kebab", "description": "Minced chicken kebabs grilled to perfection", "price": 220, "is_vegetarian": False},
            {"name": "Samosa", "description": "Crispy pastry filled with spiced potatoes", "price": 80, "is_vegetarian": True},
        ],
        "Mains": [
            {"name": "Butter Chicken", "description": "Creamy tomato-based chicken curry", "price": 280, "is_vegetarian": False},
            {"name": "Dal Makhani", "description": "Slow-cooked black lentils in butter", "price": 180, "is_vegetarian": True},
            {"name": "Paneer Butter Masala", "description": "Cottage cheese in rich buttery gravy", "price": 220, "is_vegetarian": True},
            {"name": "Naan", "description": "Freshly baked bread from tandoor", "price": 40, "is_vegetarian": True},
        ],
        "Rice": [
            {"name": "Jeera Rice", "description": "Cumin-flavored basmati rice", "price": 120, "is_vegetarian": True},
            {"name": "Veg Pulao", "description": "Mixed vegetable rice pilaf", "price": 150, "is_vegetarian": True},
        ],
        "Desserts": [
            {"name": "Gulab Jamun", "description": "Deep-fried milk dumplings in syrup", "price": 80, "is_vegetarian": True},
            {"name": "Rasgulla", "description": "Spongy cheese balls in sugar syrup", "price": 70, "is_vegetarian": True},
        ],
        "Beverages": [
            {"name": "Mango Lassi", "description": "Creamy yogurt shake with mango", "price": 60, "is_vegetarian": True},
            {"name": "Masala Chai", "description": "Spiced Indian tea", "price": 30, "is_vegetarian": True},
        ],
    },
    "Chettinad Spice": {
        "Dosa": [
            {"name": "Masala Dosa", "description": "Crispy crepe with potato filling", "price": 100, "is_vegetarian": True},
            {"name": "Rava Dosa", "description": "Semolina crepe with onions", "price": 110, "is_vegetarian": True},
            {"name": "Mysore Masala Dosa", "description": "Dosa with spicy Mysore chutney", "price": 120, "is_vegetarian": True},
        ],
        "Rice": [
            {"name": "Chettinad Chicken Biryani", "description": "Aromatic rice with spicy chicken", "price": 220, "is_vegetarian": False},
            {"name": "Curd Rice", "description": "Yogurt rice with tempered spices", "price": 80, "is_vegetarian": True},
        ],
        "Sides": [
            {"name": "Sambar", "description": "Lentil stew with vegetables", "price": 60, "is_vegetarian": True},
            {"name": "Chicken 65", "description": "Deep-fried spicy chicken", "price": 180, "is_vegetarian": False},
        ],
    },
    "Biryani House": {
        "Biryani": [
            {"name": "Hyderabadi Chicken Biryani", "description": "Dum-cooked chicken biryani", "price": 250, "is_vegetarian": False},
            {"name": "Mutton Biryani", "description": "Slow-cooked mutton with saffron rice", "price": 350, "is_vegetarian": False},
            {"name": "Veg Biryani", "description": "Mixed vegetable biryani", "price": 180, "is_vegetarian": True},
            {"name": "Egg Biryani", "description": "Boiled eggs in spiced rice", "price": 170, "is_vegetarian": False},
        ],
        "Accompaniments": [
            {"name": "Mirchi Ka Salan", "description": "Green chili curry", "price": 60, "is_vegetarian": True},
            {"name": "Raita", "description": "Yogurt with onions and spices", "price": 40, "is_vegetarian": True},
        ],
        "Kebabs": [
            {"name": "Shami Kebab", "description": "Minced meat patties", "price": 150, "is_vegetarian": False},
            {"name": "Paneer Shashlik", "description": "Grilled paneer skewers", "price": 160, "is_vegetarian": True},
        ],
    },
    "Dragon Wok": {
        "Starters": [
            {"name": "Spring Rolls", "description": "Crispy vegetable spring rolls", "price": 120, "is_vegetarian": True},
            {"name": "Chilli Chicken", "description": "Indo-Chinese chilli chicken", "price": 200, "is_vegetarian": False},
            {"name": "Honey Chilli Potato", "description": "Crispy potatoes in honey chilli sauce", "price": 140, "is_vegetarian": True},
        ],
        "Noodles": [
            {"name": "Hakka Noodles", "description": "Stir-fried noodles with vegetables", "price": 150, "is_vegetarian": True},
            {"name": "Schezwan Noodles", "description": "Spicy schezwan-style noodles", "price": 160, "is_vegetarian": True},
            {"name": "Chicken Noodles", "description": "Noodles with chicken", "price": 180, "is_vegetarian": False},
        ],
        "Rice": [
            {"name": "Fried Rice", "description": "Wok-tossed vegetable fried rice", "price": 140, "is_vegetarian": True},
            {"name": "Schezwan Fried Rice", "description": "Spicy fried rice", "price": 150, "is_vegetarian": True},
        ],
        "Soups": [
            {"name": "Hot and Sour Soup", "description": "Spicy and tangy soup", "price": 80, "is_vegetarian": True},
            {"name": "Manchow Soup", "description": "Thick vegetable soup with crispy noodles", "price": 80, "is_vegetarian": True},
        ],
    },
    "Chat Corner": {
        "Chaat": [
            {"name": "Pani Puri", "description": "Crispy puris with spiced water", "price": 40, "is_vegetarian": True},
            {"name": "Bhel Puri", "description": "Puffed rice with vegetables", "price": 50, "is_vegetarian": True},
            {"name": "Aloo Tikki", "description": "Spiced potato patties with chutney", "price": 60, "is_vegetarian": True},
            {"name": "Dahi Puri", "description": "Puris filled with yogurt", "price": 50, "is_vegetarian": True},
        ],
        "Rolls": [
            {"name": "Chicken Kathi Roll", "description": "Grilled chicken in paratha", "price": 100, "is_vegetarian": False},
            {"name": "Paneer Kathi Roll", "description": "Paneer in paratha with chutney", "price": 80, "is_vegetarian": True},
        ],
        "Lassi": [
            {"name": "Sweet Lassi", "description": "Classic sweet yogurt drink", "price": 50, "is_vegetarian": True},
            {"name": "Salted Lassi", "description": "Savory yogurt drink", "price": 40, "is_vegetarian": True},
        ],
    },
    "Udupi Palace": {
        "Dosa": [
            {"name": "Plain Dosa", "description": "Classic crispy rice crepe", "price": 70, "is_vegetarian": True},
            {"name": "Masala Dosa", "description": "Dosa with potato filling", "price": 90, "is_vegetarian": True},
            {"name": "Onion Dosa", "description": "Dosa topped with onions", "price": 85, "is_vegetarian": True},
            {"name": "Cheese Dosa", "description": "Dosa with melted cheese", "price": 110, "is_vegetarian": True},
        ],
        "Idli & Vada": [
            {"name": "Idli Sambar", "description": "Steamed rice cakes with sambar", "price": 60, "is_vegetarian": True},
            {"name": "Medu Vada", "description": "Crispy lentil donuts", "price": 60, "is_vegetarian": True},
            {"name": "Rava Idli", "description": "Semolina steamed cakes", "price": 70, "is_vegetarian": True},
        ],
        "Meals": [
            {"name": "South Indian Thali", "description": "Complete meal with rice, sambar, rasam, and sides", "price": 150, "is_vegetarian": True},
            {"name": "Bisibele Bath", "description": "Spiced rice-lentil dish", "price": 100, "is_vegetarian": True},
        ],
    },
    "Tandoori Nights": {
        "Tandoor": [
            {"name": "Tandoori Chicken", "description": "Whole chicken leg marinated and grilled", "price": 280, "is_vegetarian": False},
            {"name": "Malai Tikka", "description": "Creamy chicken tikka", "price": 250, "is_vegetarian": False},
            {"name": "Paneer Tikka", "description": "Grilled cottage cheese", "price": 200, "is_vegetarian": True},
        ],
        "Curry": [
            {"name": "Butter Chicken", "description": "Rich and creamy chicken curry", "price": 300, "is_vegetarian": False},
            {"name": "Rogan Josh", "description": "Kashmiri-style lamb curry", "price": 320, "is_vegetarian": False},
            {"name": "Shahi Paneer", "description": "Creamy paneer in royal gravy", "price": 240, "is_vegetarian": True},
        ],
        "Bread": [
            {"name": "Garlic Naan", "description": "Naan with garlic butter", "price": 50, "is_vegetarian": True},
            {"name": "Laccha Paratha", "description": "Layered flatbread", "price": 45, "is_vegetarian": True},
        ],
    },
    "Sweet Surrender": {
        "Cakes": [
            {"name": "Chocolate Truffle Cake", "description": "Rich chocolate layer cake", "price": 250, "is_vegetarian": True},
            {"name": "Red Velvet Cake", "description": "Classic red velvet with cream cheese", "price": 280, "is_vegetarian": True},
            {"name": "Cheesecake", "description": "New York style cheesecake", "price": 300, "is_vegetarian": True},
        ],
        "Pastries": [
            {"name": "Black Forest Pastry", "description": "Chocolate and cherry pastry", "price": 80, "is_vegetarian": True},
            {"name": "Pineapple Pastry", "description": "Light pineapple cream pastry", "price": 70, "is_vegetarian": True},
        ],
        "Indian Sweets": [
            {"name": "Rasgulla", "description": "Soft cheese balls in syrup", "price": 60, "is_vegetarian": True},
            {"name": "Gulab Jamun", "description": "Fried milk dumplings in syrup", "price": 70, "is_vegetarian": True},
            {"name": "Kheer", "description": "Rice pudding with cardamom", "price": 80, "is_vegetarian": True},
        ],
    },
    "Bhojan": {
        "Thali": [
            {"name": "Rajasthani Thali", "description": "Traditional Rajasthani spread", "price": 250, "is_vegetarian": True},
            {"name": "Dal Bati Churma", "description": "Baked wheat balls with dal", "price": 180, "is_vegetarian": True},
        ],
        "Sabzi": [
            {"name": "Ker Sangri", "description": "Desert beans and berries", "price": 140, "is_vegetarian": True},
            {"name": "Gatte Ki Sabzi", "description": "Gram flour dumplings in curry", "price": 120, "is_vegetarian": True},
        ],
        "Breads": [
            {"name": "Bajra Roti", "description": "Millet flatbread", "price": 30, "is_vegetarian": True},
            {"name": "Missi Roti", "description": "Gram flour flatbread", "price": 35, "is_vegetarian": True},
        ],
    },
    "Kerala Kitchen": {
        "Appam": [
            {"name": "Appam and Stew", "description": "Rice crepe with coconut stew", "price": 120, "is_vegetarian": True},
            {"name": "Egg Curry with Appam", "description": "Appam with egg curry", "price": 140, "is_vegetarian": False},
        ],
        "Rice": [
            {"name": "Malabar Biryani", "description": "Kerala-style chicken biryani", "price": 220, "is_vegetarian": False},
            {"name": "Lemon Rice", "description": "Tangy rice with peanuts", "price": 100, "is_vegetarian": True},
        ],
        "Fish": [
            {"name": "Karimeen Fry", "description": "Fried pearl spot fish", "price": 280, "is_vegetarian": False},
            {"name": "Prawn Moilee", "description": "Prawns in coconut milk", "price": 300, "is_vegetarian": False},
        ],
    },
}

COUPONS = [
    {
        "code": "WELCOME10",
        "discount_type": "percentage",
        "discount_value": 10,
        "min_order": 200,
        "max_discount": 100,
        "valid_until": datetime.now(timezone.utc) + timedelta(days=30),
    },
    {
        "code": "FOOD20",
        "discount_type": "percentage",
        "discount_value": 20,
        "min_order": 500,
        "max_discount": 200,
        "valid_until": datetime.now(timezone.utc) + timedelta(days=15),
    },
    {
        "code": "FIRST50",
        "discount_type": "fixed",
        "discount_value": 50,
        "min_order": 300,
        "max_discount": 50,
        "valid_until": datetime.now(timezone.utc) + timedelta(days=60),
    },
    {
        "code": "FREEDEL",
        "discount_type": "free_delivery",
        "discount_value": 0,
        "min_order": 100,
        "max_discount": 30,
        "valid_until": datetime.now(timezone.utc) + timedelta(days=7),
    },
]

USERS = [
    {
        "email": "demo@example.com",
        "password": "Demo123!",
        "name": "Demo User",
        "phone": "+91 9876543210",
    },
    {
        "email": "alice@example.com",
        "password": "Alice123!",
        "name": "Alice Johnson",
        "phone": "+91 9876543211",
    },
    {
        "email": "bob@example.com",
        "password": "Bob123!",
        "name": "Bob Smith",
        "phone": "+91 9876543212",
    },
]


async def seed():
    from app.db.database import async_session_factory

    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    async with async_session_factory() as session:
        # Seed users
        users = []
        for u in USERS:
            user = User(
                email=u["email"],
                hashed_password=get_password_hash(u["password"]),
                name=u["name"],
                phone=u["phone"],
                city="Bangalore",
            )
            session.add(user)
            users.append(user)
        await session.flush()

        # Seed preferences for demo user
        for user in users:
            prefs = UserPreferences(
                user_id=user.id,
                favorite_cuisine="North Indian",
                favorite_restaurants=[],
                dietary_restrictions=[],
            )
            session.add(prefs)

        # Seed restaurants and menus
        for r_data in RESTAURANTS:
            restaurant = Restaurant(**r_data)
            session.add(restaurant)
            await session.flush()

            restaurant_menus = MENUS.get(restaurant.name, {})
            for category, items in restaurant_menus.items():
                menu = Menu(restaurant_id=restaurant.id, category=category)
                session.add(menu)
                await session.flush()

                for item_data in items:
                    item = MenuItem(
                        menu_id=menu.id,
                        restaurant_id=restaurant.id,
                        category=category,
                        **item_data,
                    )
                    session.add(item)

        # Seed coupons
        for c_data in COUPONS:
            coupon = Coupon(**c_data)
            session.add(coupon)

        await session.commit()
        print("Seed data created successfully!")


if __name__ == "__main__":
    asyncio.run(seed())
