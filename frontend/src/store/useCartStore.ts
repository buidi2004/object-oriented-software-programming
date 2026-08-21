import { create } from 'zustand';
import { api } from '../lib/api';

export interface CartItem {
  id: string; // The cart item ID in DB or local id
  servicePlanId: string;
  name: string;
  title?: string;
  type?: 'vps' | 'hosting' | 'domain' | 'game' | 'database' | 'storage' | 'ssl' | 'app' | 'security' | 'migration';
  details?: string;
  billingCycle: number | string; // e.g. 1 (monthly), 2 (yearly), 12 (annually)
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
const GUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

// Helper to resolve non-GUID string slugs to actual Database GUID
async function resolvePlanGuid(planIdOrSlug: string, itemName?: string): Promise<string> {
  if (GUID_REGEX.test(planIdOrSlug)) {
    return planIdOrSlug;
  }

  try {
    // Try fetching all service plans
    const res = await api.get('/service-plans/admin');
    const allPlans = res.data || [];
    
    // 1. Search by exact or partial name
    const normalizedTarget = (itemName || planIdOrSlug).toLowerCase().replace(/[^a-z0-9]/g, '');
    
    let matched = allPlans.find((p: any) => {
      const pName = (p.servicePlanName || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      return pName.includes(normalizedTarget) || normalizedTarget.includes(pName);
    });

    // 2. Search by category keyword
    if (!matched) {
      const slugLower = planIdOrSlug.toLowerCase();
      if (slugLower.includes('game') || slugLower.includes('minecraft') || slugLower.includes('cs2') || slugLower.includes('rust')) {
        matched = allPlans.find((p: any) => (p.categoryName || '').toLowerCase().includes('game'));
      } else if (slugLower.includes('db') || slugLower.includes('database') || slugLower.includes('postgres') || slugLower.includes('mysql') || slugLower.includes('redis')) {
        matched = allPlans.find((p: any) => (p.categoryName || '').toLowerCase().includes('database'));
      } else if (slugLower.includes('static')) {
        matched = allPlans.find((p: any) => (p.categoryName || '').toLowerCase().includes('static'));
      } else if (slugLower.includes('storage') || slugLower.includes('s3')) {
        matched = allPlans.find((p: any) => (p.categoryName || '').toLowerCase().includes('storage'));
      } else if (slugLower.includes('dedicated')) {
        matched = allPlans.find((p: any) => (p.categoryName || '').toLowerCase().includes('dedicated'));
      } else if (slugLower.includes('ssl')) {
        matched = allPlans.find((p: any) => (p.categoryName || '').toLowerCase().includes('ssl'));
      }
    }

    if (matched && matched.servicePlanId) {
      return matched.servicePlanId;
    }

    // Fallback to first available plan
    if (allPlans.length > 0 && allPlans[0].servicePlanId) {
      return allPlans[0].servicePlanId;
    }
  } catch (e) {
    console.warn('Could not resolve plan GUID from server:', e);
  }

  return planIdOrSlug;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: typeof window !== 'undefined' ? getLocalGuestCart() : [],
  isLoading: false,

  fetchCart: async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const localItems = getLocalGuestCart();
    
    if (!token) {
      // Guest mode - load from local storage
      set({ items: localItems, isLoading: false });
      return;
    }

    set({ isLoading: true });
    try {
      const res = await api.get('/carts/me');
      const backendItems: CartItem[] = (res.data.items || []).map((it: any) => ({
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

      // Merge backend items with local fallback items (if backend was empty or local has un-synced items)
      const merged = [...backendItems];
      for (const loc of localItems) {
        if (!merged.some(b => b.servicePlanId === loc.servicePlanId || b.name === loc.name)) {
          merged.push(loc);
        }
      }

      set({ items: merged });
      saveLocalGuestCart(merged);
    } catch (error) {
      console.error('Failed to fetch cart from server', error);
      // Fallback to guest items if server fetch fails
      set({ items: localItems });
    } finally {
      set({ isLoading: false });
    }
  },

  addItem: async (planId, billingCycle, autoRenew, itemDetails) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const resolvedPlanId = await resolvePlanGuid(planId, itemDetails?.name || itemDetails?.title);
    
    const validCycle = (billingCycle === 12 || billingCycle === 2) ? 2 : (billingCycle || 1);

    const newItem: CartItem = {
      id: `cart_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      servicePlanId: resolvedPlanId,
      name: itemDetails?.name || itemDetails?.title || 'Dịch vụ Cloud',
      title: itemDetails?.title || itemDetails?.name || 'Dịch vụ Cloud',
      type: (itemDetails?.type as any) || 'vps',
      details: itemDetails?.details || `${billingCycle} tháng`,
      billingCycle: billingCycle,
      price: itemDetails?.price || 149000,
      quantity: 1,
    };

    // Optimistically update local cart immediately
    const currentItems = get().items;
    const updated = [...currentItems, newItem];
    set({ items: updated });
    saveLocalGuestCart(updated);

    if (!token) {
      return;
    }

    // Logged in User - call backend API with valid GUID
    try {
      if (GUID_REGEX.test(resolvedPlanId)) {
        await api.post('/carts/items', {
          servicePlanId: resolvedPlanId,
          quantity: 1,
          billingCycle: validCycle,
          autoRenew: !!autoRenew
        });
        await get().fetchCart();
      }
    } catch (error) {
      console.warn('Backend cart sync failed, retained in local storage:', error);
    }
  },

  removeItem: async (itemId) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

    const updated = get().items.filter(it => it.id !== itemId);
    set({ items: updated });
    saveLocalGuestCart(updated);

    if (!token || itemId.startsWith('guest_') || itemId.startsWith('local_') || itemId.startsWith('cart_')) {
      return;
    }

    try {
      await api.delete(`/carts/items/${itemId}`);
      await get().fetchCart();
    } catch (error) {
      console.error('Failed to remove item on server', error);
    }
  },

  clearCart: () => {
    set({ items: [] });
    if (typeof window !== 'undefined') {
      localStorage.removeItem(GUEST_CART_KEY);
    }
  },

  syncGuestCart: async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) return;

    const allItems = get().items;

    for (const item of allItems) {
      const cycleNumber = typeof item.billingCycle === 'number' 
        ? (item.billingCycle === 12 ? 2 : item.billingCycle)
        : (String(item.billingCycle).toLowerCase() === 'yearly' || String(item.billingCycle) === '2' || String(item.billingCycle) === '12' ? 2 : 1);

      const resolvedGuid = await resolvePlanGuid(item.servicePlanId, item.name);

      if (GUID_REGEX.test(resolvedGuid)) {
        try {
          await api.post('/carts/items', {
            servicePlanId: resolvedGuid,
            quantity: item.quantity || 1,
            billingCycle: cycleNumber,
            autoRenew: true
          });
        } catch (err) {
          console.warn('Could not sync item to server cart', item, err);
        }
      }
    }

    await get().fetchCart();
  }
}));
