import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

// Types
export interface UserPreferences {
  theme: 'light' | 'dark';
  currency: string;
  notificationFrequency: 'instant' | 'daily' | 'weekly';
  emailNotifications: boolean;
}

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  preferences: UserPreferences;
}

export interface UserSettingsResponse {
  success: boolean;
  data: {
    user: User;
  };
}

// Query keys
export const userKeys = {
  all: ['user'] as const,
  settings: () => [...userKeys.all, 'settings'] as const,
  preferences: () => [...userKeys.all, 'preferences'] as const,
};

// Fetch functions
export const fetchUserSettings = async (): Promise<UserSettingsResponse> => {
  const res = await apiClient.get('/auth/settings');
  return res.data;
};

export const updateUserSettings = async (data: Partial<UserPreferences & { firstName?: string; lastName?: string; email?: string }>) => {
  const res = await apiClient.put('/auth/settings', data);
  return res.data;
};

// Hooks
export const useUserSettings = () => {
  return useQuery({
    queryKey: userKeys.settings(),
    queryFn: fetchUserSettings,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};

export const useUpdateUserSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserSettings,
    onSuccess: (data) => {
      // Update cache with new data
      queryClient.setQueryData(userKeys.settings(), data);
    },
  });
};

export const useUserPreferences = () => {
  const { data, isLoading, error } = useUserSettings();
  return {
    preferences: data?.data?.user?.preferences,
    currency: data?.data?.user?.preferences?.currency || 'USD',
    isLoading,
    error,
  };
};