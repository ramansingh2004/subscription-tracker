import { create } from 'zustand';
import { IUser } from '@/typesDefined/index';

interface AuthState {
  user: IUser | null;
  isAuthenticated: boolean;
  currency: string; // ← Add currency to store
  rates: Record<string, number>; // ← Add exchange rates to store
  setUser: (user: IUser) => void;
  setCurrency: (currency: string) => void; // ← New action
  updateUserWithCurrency: (user: IUser) => void; // ← New action
  setRates: (rates: Record<string, number>) => void; // ← New action
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  currency: 'USD', // Default currency
  rates: {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    INR: 83.12,
  }, // Default exchange rates
  
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

  // ← NEW: Set exchange rates directly
  setRates: (rates) =>
    set({
      rates,
    }),

  clearAuth: () =>
    set({
      user: null,
      isAuthenticated: false,
      currency: 'USD',
      rates: {
        USD: 1,
        EUR: 0.92,
        GBP: 0.79,
        INR: 83.12,
      },
    }),
}));