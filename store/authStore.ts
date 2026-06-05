import { create } from 'zustand';
import { IUser } from '@/typesDefined/index';

interface AuthState {
  user: IUser | null;
  isAuthenticated: boolean;
  currency: string; // ← Add currency to store
  setUser: (user: IUser) => void;
  setCurrency: (currency: string) => void; // ← New action
  updateUserWithCurrency: (user: IUser) => void; // ← New action
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  currency: 'USD', // Default currency
  
  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      currency: user?.preferences?.currency || 'USD', // ← Set currency from user
    }),

  // ← NEW: Set currency directly
  setCurrency: (currency) =>
    set({
      currency,
    }),

  // ← NEW: Update user and currency together
  updateUserWithCurrency: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      currency: user?.preferences?.currency || 'USD',
    }),

  clearAuth: () =>
    set({
      user: null,
      isAuthenticated: false,
      currency: 'USD',
    }),
}));