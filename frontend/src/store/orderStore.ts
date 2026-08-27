import { create } from "zustand";
import api from "@/lib/api";
import type { Order, Delivery } from "@/types";

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  delivery: Delivery | null;
  isLoading: boolean;
  fetchOrders: () => Promise<void>;
  fetchOrder: (id: number) => Promise<void>;
  createOrder: (deliveryAddress: string, couponCode?: string) => Promise<Order>;
  cancelOrder: (id: number) => Promise<void>;
  fetchDeliveryStatus: (orderId: number) => Promise<Delivery>;
  simulateProgress: (orderId: number) => Promise<Delivery>;
}

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  currentOrder: null,
  delivery: null,
  isLoading: false,

  fetchOrders: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get("/orders");
      set({ orders: response.data.orders, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchOrder: async (id) => {
    set({ isLoading: true });
    try {
      const response = await api.get(`/orders/${id}`);
      set({ currentOrder: response.data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  createOrder: async (deliveryAddress, couponCode) => {
    set({ isLoading: true });
    try {
      const response = await api.post("/orders", {
        delivery_address: deliveryAddress,
        coupon_code: couponCode,
      });
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  cancelOrder: async (id) => {
    try {
      const response = await api.patch(`/orders/${id}/cancel`);
      set((state) => ({
        orders: state.orders.map((o) => (o.id === id ? response.data : o)),
        currentOrder: response.data,
      }));
    } catch (error) {
      throw error;
    }
  },

  fetchDeliveryStatus: async (orderId) => {
    try {
      const response = await api.get(`/deliveries/${orderId}/status`);
      set({ delivery: response.data });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  simulateProgress: async (orderId) => {
    try {
      const response = await api.post(`/deliveries/${orderId}/simulate-progress`);
      set({ delivery: response.data });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
}));
