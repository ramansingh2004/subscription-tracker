import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { useAuthStore } from '@/store/authStore';
import { ISubscription } from '@/typesDefined';
import { CurrencyConverter } from '@/lib/currency-service';
import { useQueryClient } from '@tanstack/react-query';

// ============ useAuth Hook ============
export function useAuth() {
  const router = useRouter();
  const { user, setUser, clearAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setIsLoading(false);
          return;
        }

        const res = await apiClient.get('/auth/me');
        setUser(res.data.data);
      } catch (error) {
        localStorage.removeItem('accessToken');
        clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [setUser, clearAuth]);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    clearAuth();
    router.push('/login');
  }, [clearAuth, router]);

  return { user, isLoading, logout };
}

// ============ useSubscriptions Hook ============
export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<ISubscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptions = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/subscriptions');
      const data = res.data.data;
      setSubscriptions(Array.isArray(data) ? data : data?.subscriptions ?? []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  return { subscriptions, isLoading, error, refetch: fetchSubscriptions };
}

// ============ useCurrency Hook ============
/**
 * Hook to get current user's currency preference
 * Automatically updates when currency changes in settings
 * Uses Zustand store for global state management
 */
export function useCurrency() {
  // ← Listen to Zustand store for currency changes
  const currency = useAuthStore((state) => state.currency);
  
  return {
    currency,
    format: (amount: number, originalCurrency: string = 'USD') => {
      const converted = CurrencyConverter.convert(
        amount,
        originalCurrency,
        currency
      );
      return CurrencyConverter.format(converted, currency);
    },
    convert: (amount: number, fromCurrency: string = 'USD') => {
      return CurrencyConverter.convert(amount, fromCurrency, currency);
    },
    formatWithOriginal: (amount: number, originalCurrency: string = 'USD') => {
      const converted = CurrencyConverter.convert(
        amount,
        originalCurrency,
        currency
      );
      return {
        converted: CurrencyConverter.format(converted, currency),
        original: CurrencyConverter.format(amount, originalCurrency),
        display: `${CurrencyConverter.format(converted, currency)} (${CurrencyConverter.format(amount, originalCurrency)})`,
      };
    },
  };
}

// ============ useNotifications Hook ============
export function useNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const [notifRes, unreadRes] = await Promise.all([
          apiClient.get('/notifications'),
          apiClient.get('/notifications/unread'),
        ]);
        setNotifications(notifRes.data.data.notifications);
        setUnreadCount(unreadRes.data.data.unreadCount);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await apiClient.put(`/notifications/${id}`, { read: true });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  return { notifications, unreadCount, isLoading, markAsRead };
}

// ============ useInvalidateQueries Hook (Helper) ============
/**
 * Helper hook to invalidate all React Query caches
 * Useful when currency changes and you want to refetch all data
 */
export function useInvalidateQueries() {
  const queryClient = useQueryClient();

  return useCallback(() => {
    // Invalidate all queries to refetch with new currency
    queryClient.invalidateQueries();
  }, [queryClient]);
}