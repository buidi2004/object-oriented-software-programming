import { create } from 'zustand';

interface UIState {
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  authModal: { isOpen: boolean; mode: 'login' | 'register' };
  authRedirect: string | null;
  setAuthModal: (open: boolean, mode?: 'login' | 'register') => void;
  setAuthRedirect: (url: string | null) => void;
  isDashboardOpen: boolean;
  setIsDashboardOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isCartOpen: false,
  setIsCartOpen: (open) => set({ isCartOpen: open }),
  authModal: { isOpen: false, mode: 'login' },
  authRedirect: null,
  setAuthModal: (open, mode = 'login') =>
    set((state) => ({
      authModal: { isOpen: open, mode },
      authRedirect: open ? state.authRedirect : null,
    })),
  setAuthRedirect: (url) => set({ authRedirect: url }),
  isDashboardOpen: false,
  setIsDashboardOpen: (open) => set({ isDashboardOpen: open }),
}));
