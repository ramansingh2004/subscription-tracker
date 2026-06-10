'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useUpdateUserSettings, useUserSettings } from '@/lib/hooks/user-settings';
import { CurrencyConverter } from '@/lib/currency-service';
import { useAuth, useCurrency } from '@/lib/hooks';
import { useAuthStore } from '@/store/authStore';
import { useQueryClient } from '@tanstack/react-query';

const settingsSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  theme: z.enum(['light', 'dark']),
  currency: z.string(),
  notificationFrequency: z.enum(['instant', 'daily', 'weekly']),
  emailNotifications: z.boolean(),
});

type SettingsInput = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const { logout } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'security'>('profile');
  const [previewAmount, setPreviewAmount] = useState<number>(9.99);

  const { data: settingsData, isLoading: settingsLoading } = useUserSettings();
  const updateMutation = useUpdateUserSettings();
  
  // ← Get Zustand store functions
  const { setCurrency, updateUserWithCurrency } = useAuthStore();
  const { currency: currentCurrency, rates } = useCurrency(); // ← Get current currency

  const user = settingsData?.data?.user;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      theme: user?.preferences?.theme || 'light',
      currency: user?.preferences?.currency || 'USD',
      notificationFrequency: user?.preferences?.notificationFrequency || 'daily',
      emailNotifications: user?.preferences?.emailNotifications ?? true,
    },
  });

  const selectedCurrency = watch('currency');

  // Update form when user data loads
  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        theme: user.preferences?.theme || 'light',
        currency: user.preferences?.currency || 'USD',
        notificationFrequency: user.preferences?.notificationFrequency || 'daily',
        emailNotifications: user.preferences?.emailNotifications ?? true,
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: SettingsInput) => {
    try {
      console.log('Submitting settings:', data);
      
      const result = await updateMutation.mutateAsync(data);
      
      console.log('Update result:', result);
      console.log('Updated user:', result?.data?.user);

      // ← CRITICAL: Update Zustand store immediately
      if (result?.data?.user) {
        console.log('Updating Zustand with user:', result.data.user);
        updateUserWithCurrency(result.data.user);
      }

      // ← Also explicitly set currency
      setCurrency(data.currency);

      console.log('Currency set to:', data.currency);

      // ← Invalidate all React Query caches so pages refetch with new currency
      queryClient.invalidateQueries();

      toast.success('Settings updated successfully');
      
      // ← NO page reload - let Zustand trigger re-renders naturally
      
    } catch (error: any) {
      console.error('Settings error:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to update settings');
    }
  };

  // Calculate converted amount for preview
  const convertedAmount = CurrencyConverter.convert(
    previewAmount,
    'USD',
    selectedCurrency,
    rates
  );
  const formattedAmount = CurrencyConverter.format(convertedAmount, selectedCurrency);

  if (settingsLoading) {
    return (
      <div className="max-w-4xl space-y-8">
        <div className="bg-gray-200 h-8 rounded w-1/4 animate-pulse"></div>
        <div className="bg-white rounded-lg shadow p-6 h-96 animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your account preferences and settings
          {currentCurrency && (
            <span className="text-blue-600 font-medium"> • Current currency: {currentCurrency}</span>
          )}
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <div className="flex gap-8 px-6">
            {(['profile', 'preferences', 'security'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium transition ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'profile' && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    {...register('firstName')}
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-600 mt-1">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    {...register('lastName')}
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-600 mt-1">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  {...register('email')}
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition"
              >
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}

          {activeTab === 'preferences' && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="max-w-2xl space-y-6">
                {/* Theme */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Theme
                  </label>
                  <select
                    {...register('theme')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="light">☀️ Light</option>
                    <option value="dark">🌙 Dark</option>
                  </select>
                </div>

                {/* Currency with Preview */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency
                    </label>
                    <select
                      {...register('currency')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {CurrencyConverter.getSupportedCurrencies().map((curr) => (
                        <option key={curr.code} value={curr.code}>
                          {curr.symbol} {curr.code} - {curr.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Currency Conversion Preview */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-3 text-sm">
                      Currency Preview
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Example amount (USD):</span>
                        <span className="font-semibold text-gray-900">
                          {CurrencyConverter.format(previewAmount, 'USD')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">In {selectedCurrency}:</span>
                        <span className="font-semibold text-blue-600 text-lg">
                          {formattedAmount}
                        </span>
                      </div>
                      <div className="pt-2 mt-2 border-t border-blue-200">
                        <p className="text-xs text-blue-700">
                          Exchange rate: 1 USD = {CurrencyConverter.convert(1, 'USD', selectedCurrency, rates)} {selectedCurrency}
                        </p>
                      </div>
                    </div>

                    {/* Adjust preview amount */}
                    <div className="mt-4 pt-4 border-t border-blue-200">
                      <label className="text-xs font-medium text-blue-900 mb-2 block">
                        Test with different amount:
                      </label>
                      <input
                        type="number"
                        value={previewAmount}
                        onChange={(e) => setPreviewAmount(parseFloat(e.target.value) || 0)}
                        step="0.01"
                        className="w-full px-3 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter amount in USD"
                      />
                    </div>
                  </div>
                </div>

                {/* Notification Frequency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notification Frequency
                  </label>
                  <select
                    {...register('notificationFrequency')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="instant">⚡ Instant</option>
                    <option value="daily">📅 Daily</option>
                    <option value="weekly">📆 Weekly</option>
                  </select>
                </div>

                {/* Email Notifications */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <input
                    {...register('emailNotifications')}
                    type="checkbox"
                    id="emailNotifs"
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <label htmlFor="emailNotifs" className="text-sm text-gray-700 flex-1">
                    <span className="font-medium">Receive email notifications</span>
                    <p className="text-xs text-gray-500 mt-1">
                      Get alerts about subscription renewals and important updates
                    </p>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition"
              >
                {updateMutation.isPending ? 'Saving...' : 'Save Preferences'}
              </button>
            </form>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6 max-w-2xl">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-red-900 mb-2">
                  Danger Zone
                </h3>
                <p className="text-red-700 mb-4">
                  These actions cannot be undone. Please be careful.
                </p>

                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to logout?')) {
                      logout();
                    }
                  }}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-medium transition"
                >
                  Logout
                </button>

                <div className="mt-6 pt-6 border-t border-red-200">
                  <button
                    onClick={() => {
                      if (confirm('This will permanently delete your account and all data. Are you sure?')) {
                        toast.error('Account deletion coming soon');
                      }
                    }}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-medium transition"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}