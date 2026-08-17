import { create } from 'zustand';
import { api } from '../lib/api';

export interface CartItem {
  id: string; // The cart item ID in DB or local id
  servicePlanId: string;
  name: string;
  title?: string;
  type?: 'vps' | 'hosting' | 'domain';
  details?: string;
  billingCycle: number | string; // e.g. 1 (monthly), 12 (annually)
  price: number; // the price at the time of adding
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (planId: string, billingCycle: number, autoRenew: boolean, itemDetails?: Partial<CartItem>) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => void;
  syncGuestCart: () => Promise<void>;
}

const GUEST_CART_KEY = 'cloudhost_guest_cart';

const getLocalGuestCart = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLocalGuestCart = (items: CartItem[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save guest cart to localStorage', err);
  }
};

export const useCartStore = create<CartState>((set, get) => ({
  items: typeof window !== 'undefined' ? getLocalGuestCart() : [],
  isLoading: false,

  fetchCart: async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    
    if (!token) {
      // Guest mode - load from local storage
      const guestItems = getLocalGuestCart();
      set({ items: guestItems, isLoading: false });
      return;
    }

    set({ isLoading: true });
    try {
      const res = await api.get('/carts/me');
      const backendItems = (res.data.items || []).map((it: any) => ({
        id: it.id,
        servicePlanId: it.servicePlanId || it.id,
        name: it.servicePlanName || it.name || it.title || 'Dịch vụ Cloud',
        title: it.servicePlanName || it.name || it.title || 'Dịch vụ Cloud',
        type: it.type || (it.name?.toLowerCase().includes('hosting') ? 'hosting' : it.name?.toLowerCase().includes('domain') ? 'domain' : 'vps'),
        details: it.details || `${it.billingCycle || 1} tháng`,
        billingCycle: it.billingCycle || 1,
        price: it.price || 0,
        quantity: it.quantity || 1,
      }));
      set({ items: backendItems });
    } catch (error) {
      console.error('Failed to fetch cart from server', error);
      // Fallback to guest items if server fetch fails
      set({ items: getLocalGuestCart() });
    } finally {
      set({ isLoading: false });
    }
  },

  addItem: async (planId, billingCycle, autoRenew, itemDetails) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

    if (!token) {
      // Guest User - add locally
      const currentItems = get().items;
      const newItem: CartItem = {
        id: `guest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        servicePlanId: planId,
        name: itemDetails?.name || itemDetails?.title || 'Dịch vụ Cloud',
        title: itemDetails?.title || itemDetails?.name || 'Dịch vụ Cloud',
        type: itemDetails?.type || 'vps',
        details: itemDetails?.details || `${billingCycle} tháng`,
        billingCycle: billingCycle,
        price: itemDetails?.price || 500000,
        quantity: 1,
      };

      const updated = [...currentItems, newItem];
      set({ items: updated });
      saveLocalGuestCart(updated);
      return;
    }

    // Logged in User - call backend API
    try {
      await api.post('/carts/items', {
        servicePlanId: planId,
        quantity: 1,
        billingCycle,
        autoRenew: !!autoRenew
      });
      await get().fetchCart();
    } catch (error) {
      console.error('Failed to add item to server cart', error);
      // Fallback locally
      const currentItems = get().items;
      const newItem: CartItem = {
        id: `local_${Date.now()}`,
        servicePlanId: planId,
        name: itemDetails?.name || itemDetails?.title || 'Dịch vụ Cloud',
        title: itemDetails?.title || itemDetails?.name || 'Dịch vụ Cloud',
        type: itemDetails?.type || 'vps',
        details: itemDetails?.details || `${billingCycle} tháng`,
        billingCycle: billingCycle,
        price: itemDetails?.price || 500000,
        quantity: 1,
      };
      set({ items: [...currentItems, newItem] });
    }
  },

  removeItem: async (itemId) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

    if (!token || itemId.startsWith('guest_') || itemId.startsWith('local_')) {
      const updated = get().items.filter(it => it.id !== itemId);
      set({ items: updated });
      saveLocalGuestCart(updated);
      return;
    }

    try {
      await api.delete(`/carts/items/${itemId}`);
      await get().fetchCart();
    } catch (error) {
      console.error('Failed to remove item', error);
      const updated = get().items.filter(it => it.id !== itemId);
      set({ items: updated });
    }
  },

  clearCart: () => {
    set({ items: [] });
    if (typeof window !== 'undefined') {
      localStorage.removeItem(GUEST_CART_KEY);
    }
  },

  syncGuestCart: async () => {
    const guestItems = getLocalGuestCart();
    if (guestItems.length === 0) {
      await get().fetchCart();
      return;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) return;

    // Send all guest items to backend
    for (const item of guestItems) {
      try {
        await api.post('/carts/items', {
          servicePlanId: item.servicePlanId,
          quantity: item.quantity || 1,
          billingCycle: typeof item.billingCycle === 'number' ? item.billingCycle : 1,
          autoRenew: true
        });
      } catch (err) {
        console.warn('Could not sync guest item', item, err);
      }
    }

    // Clear local guest cart and refresh from DB
    if (typeof window !== 'undefined') {
      localStorage.removeItem(GUEST_CART_KEY);
    }
    await get().fetchCart();
  }
}));
