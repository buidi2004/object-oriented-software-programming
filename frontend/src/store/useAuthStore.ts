import { create } from 'zustand';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  roleId?: string;
  role?: string;
  walletBalance?: number;
}

export interface AuthState {
  token: string | null;
  user: AuthUser | null;
  setToken: (token: string) => void;
  setUser: (user: any) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null,
  user: null, // Should ideally be fetched with /api/users/me upon app load
  setToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
      document.cookie = `accessToken=${token}; path=/; max-age=${60 * 60 * 8}; SameSite=Lax`;
    }
    set({ token });
  },
  setUser: (user: any) => set({ user }),
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      document.cookie = 'accessToken=; path=/; max-age=0; SameSite=Lax';
    }
    set({ token: null, user: null });
  },
}));
