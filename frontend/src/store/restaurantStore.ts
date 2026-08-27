import { create } from "zustand";
import api from "@/lib/api";
import type { Restaurant, RestaurantDetail } from "@/types";

interface RestaurantFilters {
  cuisine?: string;
  rating?: number;
  price?: number;
  veg_only: boolean;
  city?: string;
  search?: string;
}

interface RestaurantState {
  restaurants: Restaurant[];
  selectedRestaurant: RestaurantDetail | null;
  filters: RestaurantFilters;
  isLoading: boolean;
  fetchRestaurants: (filters?: Partial<RestaurantFilters>) => Promise<void>;
  fetchRestaurant: (id: number) => Promise<void>;
  setFilters: (filters: Partial<RestaurantFilters>) => void;
  clearFilters: () => void;
}

const defaultFilters: RestaurantFilters = {
  veg_only: false,
};

export const useRestaurantStore = create<RestaurantState>((set, get) => ({
  restaurants: [],
  selectedRestaurant: null,
  filters: { ...defaultFilters },
  isLoading: false,

  fetchRestaurants: async (filters) => {
    set({ isLoading: true });
    try {
      const currentFilters = { ...get().filters, ...filters };
      const params = new URLSearchParams();
      if (currentFilters.cuisine) params.append("cuisine", currentFilters.cuisine);
      if (currentFilters.rating) params.append("rating", String(currentFilters.rating));
      if (currentFilters.price) params.append("price", String(currentFilters.price));
      if (currentFilters.veg_only) params.append("veg_only", "true");
      if (currentFilters.city) params.append("city", currentFilters.city);
      if (currentFilters.search) params.append("search", currentFilters.search);

      const response = await api.get(`/restaurants?${params.toString()}`);
      set({ restaurants: response.data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchRestaurant: async (id) => {
    set({ isLoading: true });
    try {
      const response = await api.get(`/restaurants/${id}`);
      set({ selectedRestaurant: response.data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  setFilters: (filters) => {
    set({ filters: { ...get().filters, ...filters } });
  },

  clearFilters: () => {
    set({ filters: { ...defaultFilters } });
  },
}));
