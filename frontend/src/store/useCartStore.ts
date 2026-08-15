import { create } from 'zustand';
import { api } from '../lib/api';

export interface CartItem {
  id: string; // The cart item ID in DB
  servicePlanId: string;
  name: string;
  billingCycle: number; // e.g. 1 (monthly), 12 (annually)
  price: number; // the price at the time of adding
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (planId: string, billingCycle: number, autoRenew: boolean) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isLoading: false,

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/carts/me');
      // Assume res.data contains items
      set({ items: res.data.items || [] });
    } catch (error) {
      console.error('Failed to fetch cart', error);
      // In case of 404 (cart not found), just set items to empty
      set({ items: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  addItem: async (planId, billingCycle, autoRenew) => {
    try {
      await api.post('/carts/items', {
        servicePlanId: planId,
        quantity: 1,
        billingCycle,
        autoRenew
      });
      // Refresh cart
      await get().fetchCart();
    } catch (error) {
      console.error('Failed to add item', error);
      throw error;
    }
  },

  updateQuantity: async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await get().removeItem(itemId);
      return;
    }
    try {
      await api.put(`/carts/items/${itemId}`, { quantity });
      // Refresh cart
      await get().fetchCart();
    } catch (error) {
      console.error('Failed to update item quantity', error);
    }
  },

  removeItem: async (itemId) => {
    try {
      await api.delete(`/carts/items/${itemId}`);
      // Refresh cart
      await get().fetchCart();
    } catch (error) {
      console.error('Failed to remove item', error);
    }
  },

  clearCart: () => {
    set({ items: [] });
  }
}));
