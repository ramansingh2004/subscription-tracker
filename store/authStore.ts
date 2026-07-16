import { create } from 'zustand';
import { IUser } from '@/typesDefined/index';

interface AuthState {
  user: IUser | null;
  isAuthenticated: boolean;
  currency: string; 
  rates: Record<string, number>; 
  setUser: (user: IUser) => void;
  setCurrency: (currency: string) => void; 
  updateUserWithCurrency: (user: IUser) => void; 
  setRates: (rates: Record<string, number>) => void; 
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  currency: 'USD',
  rates: {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    INR: 83.12,
  }, 
  
  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      currency: user?.preferences?.currency || 'USD',
    }),

  setCurrency: (currency) =>
    set({
      currency,
    }),

  updateUserWithCurrency: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      currency: user?.preferences?.currency || 'USD',
    }),

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