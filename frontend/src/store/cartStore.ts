import { create } from "zustand";
import api from "@/lib/api";
import type { Cart, CartItem, PriceBreakdown } from "@/types";
import { useAuthStore } from "./authStore";

interface CartState {
  cart: Cart | null;
  items: CartItem[];
  pricing: PriceBreakdown | null;
  couponCode: string | null;
  restaurantId: number | null;
  isLoading: boolean;

  fetchCart: () => Promise<void>;
  addToCart: (menuItemId: number, quantity?: number, customization?: string) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  calculatePrice: (couponCode?: string) => Promise<PriceBreakdown>;
  applyCoupon: (code: string) => Promise<void>;
  setRestaurantId: (id: number) => void;
  loadGuestCart: () => void;
  saveGuestCart: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  items: JSON.parse(localStorage.getItem("guest_cart") || "[]"),
  pricing: null,
  couponCode: null,
  restaurantId: null,
  isLoading: false,

  fetchCart: async () => {
    if (!useAuthStore.getState().isAuthenticated) return;
    set({ isLoading: true });
    try {
      const response = await api.get("/cart");
      set({ cart: response.data, items: response.data.items, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  addToCart: async (menuItemId, quantity = 1, customization) => {
    if (!useAuthStore.getState().isAuthenticated) {
      const { items } = get();
      const existing = items.find((i) => i.menu_item_id === menuItemId);
      let newItems;
      if (existing) {
        newItems = items.map((i) =>
          i.menu_item_id === menuItemId ? { ...i, quantity: i.quantity + quantity } : i
        );
      } else {
        newItems = [...items, { id: Date.now(), menu_item_id: menuItemId, quantity, price_at_time: 0, customization } as CartItem];
      }
      set({ items: newItems });
      localStorage.setItem("guest_cart", JSON.stringify(newItems));
      return;
    }

    set({ isLoading: true });
    try {
      const response = await api.post("/cart/items", {
        menu_item_id: menuItemId,
        quantity,
        customization,
      });
      const { items } = get();
      const existingIndex = items.findIndex((i) => i.menu_item_id === menuItemId);
      let newItems;
      if (existingIndex >= 0) {
        newItems = items.map((i, idx) => (idx === existingIndex ? response.data : i));
      } else {
        newItems = [...items, response.data];
      }
      set({ items: newItems, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  updateQuantity: async (itemId, quantity) => {
    if (!useAuthStore.getState().isAuthenticated) {
      const { items } = get();
      if (quantity <= 0) {
        const newItems = items.filter((i) => i.id !== itemId);
        set({ items: newItems });
        localStorage.setItem("guest_cart", JSON.stringify(newItems));
      } else {
        const newItems = items.map((i) => (i.id === itemId ? { ...i, quantity } : i));
        set({ items: newItems });
        localStorage.setItem("guest_cart", JSON.stringify(newItems));
      }
      return;
    }
    try {
      await api.put(`/cart/items/${itemId}`, { quantity });
      const { items } = get();
      if (quantity <= 0) {
        set({ items: items.filter((i) => i.id !== itemId) });
      } else {
        set({ items: items.map((i) => (i.id === itemId ? { ...i, quantity } : i)) });
      }
    } catch {}
  },

  removeItem: async (itemId) => {
    if (!useAuthStore.getState().isAuthenticated) {
      const newItems = get().items.filter((i) => i.id !== itemId);
      set({ items: newItems });
      localStorage.setItem("guest_cart", JSON.stringify(newItems));
      return;
    }
    try {
      await api.delete(`/cart/items/${itemId}`);
      set({ items: get().items.filter((i) => i.id !== itemId) });
    } catch {}
  },

  clearCart: async () => {
    if (!useAuthStore.getState().isAuthenticated) {
      set({ items: [] });
      localStorage.removeItem("guest_cart");
      return;
    }
    try {
      await api.delete("/cart");
      set({ items: [], couponCode: null, pricing: null });
    } catch {}
  },

  calculatePrice: async (couponCode) => {
    const response = await api.post("/cart/calculate", { coupon_code: couponCode || null });
    set({ pricing: response.data });
    return response.data;
  },

  applyCoupon: async (code) => {
    try {
      const pricing = await get().calculatePrice(code);
      set({ couponCode: code });
      return pricing;
    } catch (error) {
      throw error;
    }
  },

  setRestaurantId: (id) => set({ restaurantId: id }),

  loadGuestCart: () => {
    const guestCart = localStorage.getItem("guest_cart");
    if (guestCart) {
      set({ items: JSON.parse(guestCart) });
    }
  },

  saveGuestCart: () => {
    const { items } = get();
    localStorage.setItem("guest_cart", JSON.stringify(items));
  },
}));
