import { create } from 'zustand';
import { api } from '../lib/api';

// ─── Plan GUID Cache ───────────────────────────────────────────────────────────
// Prevents N independent API calls per cart item during syncGuestCart.
// One fetch per session, refreshed every 5 minutes.
let _planCachePromise: Promise<any[]> | null = null;
let _planCacheTime = 0;
const PLAN_CACHE_TTL_MS = 5 * 60 * 1000;

async function fetchAllPlansOnce(): Promise<any[]> {
  const now = Date.now();
  if (_planCachePromise && now - _planCacheTime < PLAN_CACHE_TTL_MS) {
    return _planCachePromise;
  }
  _planCacheTime = now;
  _planCachePromise = api.get('/service-plans')
    .then((res) => res.data || [])
    .catch(() => []);
  return _planCachePromise;
}

export interface CartItem {
  id: string; // The cart item ID in DB or local id
  servicePlanId: string;
  name: string;
  title?: string;
  type?: 'vps' | 'hosting' | 'domain' | 'game' | 'database' | 'storage' | 'ssl' | 'app' | 'security' | 'migration' | 'static' | 'cdn' | 'dedicated' | 'email';
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

// Helper to resolve non-GUID string slugs to actual Database GUID.
// Uses the shared fetchAllPlansOnce() cache — NO extra network call per item.
async function resolvePlanGuid(planIdOrSlug: string, itemName?: string): Promise<string> {
  try {
    const allPlans = await fetchAllPlansOnce();

    // 1. If it's a GUID and actually exists in DB, use it directly
    if (GUID_REGEX.test(planIdOrSlug)) {
      const exists = allPlans.some((p: any) => (p.servicePlanId === planIdOrSlug || p.id === planIdOrSlug));
      if (exists) {
        return planIdOrSlug;
      }
    }

    // 2. If it's a fake dummy GUID, slug, or custom plan, search by name first
    const normalizedTarget = (itemName || planIdOrSlug).toLowerCase().replace(/[^a-z0-9]/g, '');

    let matched = allPlans.find((p: any) => {
      const pName = (p.servicePlanName || p.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      return pName.includes(normalizedTarget) || (normalizedTarget.length > 3 && normalizedTarget.includes(pName));
    });

    // 3. Search by category keyword
    if (!matched) {
      const slugLower = (planIdOrSlug + ' ' + (itemName || '')).toLowerCase();
      if (slugLower.includes('game') || slugLower.includes('minecraft') || slugLower.includes('cs2') || slugLower.includes('rust')) {
        matched = allPlans.find((p: any) => (p.categoryName || p.categorySlug || '').toLowerCase().includes('game'));
      } else if (slugLower.includes('db') || slugLower.includes('database') || slugLower.includes('postgres') || slugLower.includes('mysql') || slugLower.includes('redis')) {
        matched = allPlans.find((p: any) => (p.categoryName || p.categorySlug || '').toLowerCase().includes('database'));
      } else if (slugLower.includes('static')) {
        matched = allPlans.find((p: any) => (p.categoryName || p.categorySlug || '').toLowerCase().includes('static'));
      } else if (slugLower.includes('storage') || slugLower.includes('s3') || slugLower.includes('minio')) {
        matched = allPlans.find((p: any) => (p.categoryName || p.categorySlug || '').toLowerCase().includes('storage'));
      } else if (slugLower.includes('dedicated') || slugLower.includes('máy chủ riêng') || slugLower.includes('xeon') || slugLower.includes('epyc')) {
        matched = allPlans.find((p: any) => (p.categoryName || p.categorySlug || '').toLowerCase().includes('dedicated'));
      } else if (slugLower.includes('ssl')) {
        matched = allPlans.find((p: any) => (p.categoryName || p.categorySlug || '').toLowerCase().includes('ssl'));
      } else if (slugLower.includes('security') || slugLower.includes('waf') || slugLower.includes('bảo mật') || slugLower.includes('tường lửa')) {
        matched = allPlans.find((p: any) => (p.categoryName || p.categorySlug || '').toLowerCase().includes('security') || (p.categoryName || p.categorySlug || '').toLowerCase().includes('waf'));
      } else if (slugLower.includes('migration') || slugLower.includes('chuyển đổi') || slugLower.includes('di dời')) {
        matched = allPlans.find((p: any) => (p.categoryName || p.categorySlug || '').toLowerCase().includes('migration'));
      } else if (slugLower.includes('email') || slugLower.includes('mail')) {
        matched = allPlans.find((p: any) => (p.categoryName || p.categorySlug || '').toLowerCase().includes('email'));
      } else if (slugLower.includes('hosting') || slugLower.includes('wordpress') || slugLower.includes('cpanel')) {
        matched = allPlans.find((p: any) => (p.categoryName || p.categorySlug || '').toLowerCase().includes('hosting'));
      } else if (slugLower.includes('domain') || slugLower.includes('tên miền') || slugLower.includes('.vn') || slugLower.includes('.com')) {
        matched = allPlans.find((p: any) => (p.categoryName || p.categorySlug || '').toLowerCase().includes('domain') || (p.categoryName || p.categorySlug || '').toLowerCase().includes('ten-mien'));
      } else if (slugLower.includes('cdn')) {
        matched = allPlans.find((p: any) => (p.categoryName || p.categorySlug || '').toLowerCase().includes('cdn'));
      } else if (slugLower.includes('app')) {
        matched = allPlans.find((p: any) => (p.categoryName || p.categorySlug || '').toLowerCase().includes('app'));
      }
    }

    const realId = matched?.servicePlanId || matched?.id;
    if (realId) {
      return realId;
    }

    // 4. Fallback to first available plan if none matched
    if (allPlans.length > 0 && (allPlans[0].servicePlanId || allPlans[0].id)) {
      return allPlans[0].servicePlanId || allPlans[0].id;
    }
  } catch (e) {
    console.warn('Could not resolve plan GUID from server:', e);
  }

  return planIdOrSlug;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
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
      const backendItems: CartItem[] = (res.data.items || []).map((it: any) => {
        const matchingLocal = localItems.find(loc => loc.servicePlanId === it.servicePlanId || loc.name === it.name || loc.title === it.title);
        return {
          id: it.id,
          servicePlanId: it.servicePlanId || it.id,
          name: it.servicePlanName || it.name || it.title || matchingLocal?.name || 'Dịch vụ Cloud',
          title: it.servicePlanName || it.name || it.title || matchingLocal?.title || 'Dịch vụ Cloud',
          type: it.type || matchingLocal?.type || (it.servicePlanName?.toLowerCase().includes('hosting') ? 'hosting' : it.servicePlanName?.toLowerCase().includes('domain') ? 'domain' : 'vps'),
          details: it.details || matchingLocal?.details || `${it.billingCycle || 1} tháng`,
          billingCycle: it.billingCycle || matchingLocal?.billingCycle || 1,
          price: (it.price && it.price > 0) ? it.price : (matchingLocal?.price || 149000),
          quantity: it.quantity || matchingLocal?.quantity || 1,
        };
      });

      set({ items: backendItems, isLoading: false });
      saveLocalGuestCart(backendItems);
    } catch (error) {
      console.error('Failed to fetch cart from server', error);
      // Fallback to guest items if server fetch fails
      set({ items: localItems, isLoading: false });
    }
  },

  addItem: async (planId, billingCycle, autoRenew, itemDetails) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const resolvedPlanId = await resolvePlanGuid(planId, itemDetails?.name || itemDetails?.title);
    
    const validCycle = (billingCycle === 12 || billingCycle === 2) ? 2 : (billingCycle || 1);

    const tempId = `cart_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newItem: CartItem = {
      id: tempId,
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

    // Logged in User — persist to backend and update item id with DB GUID
    if (GUID_REGEX.test(resolvedPlanId)) {
      api.post('/carts/items', {
        servicePlanId: resolvedPlanId,
        quantity: 1,
        billingCycle: validCycle,
        autoRenew: !!autoRenew
      }).then((res) => {
        if (res.data?.id) {
          const syncedItems = get().items.map(it => it.id === tempId ? { ...it, id: res.data.id } : it);
          set({ items: syncedItems });
          saveLocalGuestCart(syncedItems);
        }
      }).catch((error) => {
        console.warn('Backend cart sync failed, retained in local storage:', error);
      });
    }
  },

  removeItem: async (itemId) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const targetItem = get().items.find(it => it.id === itemId);

    const updated = get().items.filter(it => it.id !== itemId);
    set({ items: updated });
    saveLocalGuestCart(updated);

    if (!token) return;

    if (GUID_REGEX.test(itemId)) {
      api.delete(`/carts/items/${itemId}`).catch((error) => {
        console.error('Failed to remove item on server', error);
      });
    } else if (targetItem) {
      // Find matching item in backend and delete it
      try {
        const res = await api.get('/carts/me');
        const dbItem = (res.data?.items || []).find((b: any) =>
          b.servicePlanId === targetItem.servicePlanId || b.servicePlanName === targetItem.name
        );
        if (dbItem?.id && GUID_REGEX.test(dbItem.id)) {
          api.delete(`/carts/items/${dbItem.id}`).catch(() => {});
        }
      } catch {}
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

    // Only sync items that were stored locally as guest items (with temporary IDs)
    const localItems = getLocalGuestCart();
    const guestItems = localItems.filter(it => it.id.startsWith('cart_') || it.id.startsWith('guest_') || it.id.startsWith('local_'));
    
    // If no temporary guest items exist, do nothing and do NOT duplicate backend items!
    if (guestItems.length === 0) {
      return;
    }

    // Fetch all plans ONCE (cached) before the loop — eliminates N redundant API calls
    const allPlans = await fetchAllPlansOnce();

    // Resolve GUID from already-loaded plan list without extra network requests
    const resolveFromCache = (item: CartItem): string => {
      if (GUID_REGEX.test(item.servicePlanId)) {
        const exists = allPlans.some((p: any) => (p.servicePlanId === item.servicePlanId || p.id === item.servicePlanId));
        if (exists) return item.servicePlanId;
      }
      const normalizedTarget = (item.name || item.servicePlanId).toLowerCase().replace(/[^a-z0-9]/g, '');
      const matched = allPlans.find((p: any) => {
        const pName = (p.servicePlanName || p.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        return pName.includes(normalizedTarget) || (normalizedTarget.length > 3 && normalizedTarget.includes(pName));
      });
      return matched?.servicePlanId || matched?.id || (allPlans[0]?.servicePlanId ?? item.servicePlanId);
    };

    // Build all POST requests and run them concurrently — no sequential blocking
    const syncRequests = guestItems.map((item) => {
      const resolvedGuid = resolveFromCache(item);
      if (!GUID_REGEX.test(resolvedGuid)) return Promise.resolve();

      const cycleNumber = typeof item.billingCycle === 'number'
        ? (item.billingCycle === 12 ? 2 : item.billingCycle)
        : (String(item.billingCycle).toLowerCase() === 'yearly' || String(item.billingCycle) === '2' || String(item.billingCycle) === '12' ? 2 : 1);

      return api.post('/carts/items', {
        servicePlanId: resolvedGuid,
        quantity: item.quantity || 1,
        billingCycle: cycleNumber,
        autoRenew: true
      }).catch((err) => {
        console.warn('Could not sync guest item to server cart', item, err);
      });
    });

    // Run all sync requests concurrently
    await Promise.allSettled(syncRequests);

    // Clear local guest cart now that it's transferred to the backend
    if (typeof window !== 'undefined') {
      localStorage.removeItem(GUEST_CART_KEY);
    }

    await get().fetchCart();
  }
}));
