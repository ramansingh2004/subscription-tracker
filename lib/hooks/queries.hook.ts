import { useQuery, useMutation, useQueryClient, QueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export interface SubscriptionFilters {
  page: number;
  limit: number;
  category?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

// Query Keys
export const subscriptionKeys = {
  all: ['subscriptions'] as const,
  list: (filters: SubscriptionFilters) => [...subscriptionKeys.all, 'list', filters] as const,
  detail: (id: string) => [...subscriptionKeys.all, 'detail', id] as const,
  upcoming: () => [...subscriptionKeys.all, 'upcoming'] as const,
};

export const analyticsKeys = {
  all: ['analytics'] as const,
  summary: () => [...analyticsKeys.all, 'summary'] as const,
  categories: () => [...analyticsKeys.all, 'categories'] as const,
};

// Fetch Functions
export const fetchSubscriptions = async (filters: SubscriptionFilters) => {
  const res = await apiClient.get('/subscriptions', {
    params: filters,
  });
  return res.data;
};

export const fetchSubscriptionById = async (id: string) => {
  const res = await apiClient.get(`/subscriptions/${id}`);
  return res.data.data;
};

export const fetchUpcomingSubscriptions = async () => {
  const res = await apiClient.get('/subscriptions/upcoming');
  return res.data.data;
};

export const fetchAnalyticsSummary = async () => {
  const res = await apiClient.get('/analytics/summary');
  return res.data.data;
};

export const fetchCategoryBreakdown = async () => {
  const res = await apiClient.get('/analytics/categories');
  return res.data.data;
};

//  HOOKS 

// Get paginated subscriptions with caching
export const useSubscriptions = (filters: SubscriptionFilters) => {
  return useQuery({
    queryKey: subscriptionKeys.list(filters),
    queryFn: () => fetchSubscriptions(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // Cache for 10 minutes
  });
};

// Get single subscription
export const useSubscription = (id: string) => {
  return useQuery({
    queryKey: subscriptionKeys.detail(id),
    queryFn: () => fetchSubscriptionById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get upcoming renewals
export const useUpcomingSubscriptions = () => {
  return useQuery({
    queryKey: subscriptionKeys.upcoming(),
    queryFn: fetchUpcomingSubscriptions,
    staleTime: 30 * 60 * 1000, // 30 minutes (less frequent changes)
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};

// Get analytics summary
export const useAnalyticsSummary = () => {
  return useQuery({
    queryKey: analyticsKeys.summary(),
    queryFn: fetchAnalyticsSummary,
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
  });
};

// Get category breakdown
export const useCategoryBreakdown = () => {
  return useQuery({
    queryKey: analyticsKeys.categories(),
    queryFn: fetchCategoryBreakdown,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};

// MUTATIONS 

// Create subscription
export const useCreateSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const res = await apiClient.post('/subscriptions', data);
      return res.data.data;
    },
    onSuccess: () => {
      // Invalidate and refetch subscriptions list
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
      // Invalidate analytics
      queryClient.invalidateQueries({ queryKey: analyticsKeys.all });
    },
  });
};

// Update subscription
export const useUpdateSubscription = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const res = await apiClient.put(`/subscriptions/${id}`, data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
      queryClient.invalidateQueries({ queryKey: analyticsKeys.all });
    },
  });
};

// Delete subscription
export const useDeleteSubscription = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await apiClient.delete(`/subscriptions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
      queryClient.invalidateQueries({ queryKey: analyticsKeys.all });
    },
  });
};

//  PREFETCH HELPERS 

// Prefetch next page
export const prefetchSubscriptionsPage = (
  queryClient: QueryClient,
  filters: SubscriptionFilters
) => {
  queryClient.prefetchQuery({
    queryKey: subscriptionKeys.list(filters),
    queryFn: () => fetchSubscriptions(filters),
    staleTime: 5 * 60 * 1000,
  });
};

// Prefetch single subscription
export const prefetchSubscription = (queryClient: QueryClient, id: string) => {
  queryClient.prefetchQuery({
    queryKey: subscriptionKeys.detail(id),
    queryFn: () => fetchSubscriptionById(id),
  });
};

// Prefetch analytics
export const prefetchAnalytics = (queryClient: QueryClient) => {
  queryClient.prefetchQuery({
    queryKey: analyticsKeys.summary(),
    queryFn: fetchAnalyticsSummary,
  });
  queryClient.prefetchQuery({
    queryKey: analyticsKeys.categories(),
    queryFn: fetchCategoryBreakdown,
  });
};