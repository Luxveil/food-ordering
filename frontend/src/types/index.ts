export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  city?: string;
  created_at: string;
}

export interface Restaurant {
  id: number;
  name: string;
  cuisine: string;
  rating: number;
  delivery_time_min: number;
  price_for_two: number;
  address?: string;
  city: string;
  is_active: boolean;
  is_vegetarian_friendly: boolean;
  image_url?: string;
  description?: string;
  created_at: string;
}

export interface RestaurantDetail extends Restaurant {
  menu_items: MenuItem[];
}

export interface MenuItem {
  id: number;
  menu_id: number;
  restaurant_id: number;
  name: string;
  description?: string;
  price: number;
  is_vegetarian: boolean;
  is_available: boolean;
  category: string;
  image_url?: string;
  add_ons: any[];
  created_at: string;
}

export interface CartItem {
  id: number;
  menu_item_id: number;
  quantity: number;
  customization?: string;
  price_at_time: number;
  menu_item?: MenuItem;
}

export interface Cart {
  id: number;
  restaurant_id?: number;
  items: CartItem[];
}

export interface PriceBreakdown {
  subtotal: number;
  tax: number;
  delivery_fee: number;
  discount: number;
  final_total: number;
}

export interface OrderItem {
  id: number;
  menu_item_id?: number;
  quantity: number;
  price: number;
  customization?: string;
  item_name?: string;
}

export interface Order {
  id: number;
  order_number: string;
  status: string;
  restaurant_id?: number;
  total: number;
  discount: number;
  tax: number;
  delivery_fee: number;
  final_total: number;
  coupon_code?: string;
  delivery_address?: string;
  items: OrderItem[];
  created_at: string;
}

export interface Payment {
  id: number;
  order_id: number;
  status: string;
  method?: string;
  amount: number;
  transaction_id?: string;
  created_at: string;
}

export interface Delivery {
  id: number;
  order_id: number;
  status: string;
  eta_minutes?: number;
  partner_name?: string;
  current_location?: string;
  updated_at: string;
}

export interface Coupon {
  code: string;
  discount_type: string;
  discount_value: number;
  min_order: number;
  max_discount?: number;
  valid_until: string;
}

export interface UserPreferences {
  id: number;
  user_id: number;
  favorite_cuisine?: string;
  favorite_restaurants: string[];
  dietary_restrictions: string[];
}

export interface Token {
  access_token: string;
  refresh_token: string;
  token_type: string;
}
