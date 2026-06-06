'use client';

import { useState } from 'react';
import apiClient from '@/lib/api-client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  subscriptionSchema,
  type SubscriptionInput,
} from '@/lib/validation';
import toast from 'react-hot-toast';
import { CurrencyConverter } from '@/lib/currency-service';

interface Props {
  initialData?: any;
  onSuccess?: () => void;
}

const categories = [
  'Streaming',
  'Software',
  'Productivity',
  'Entertainment',
  'Education',
  'Health',
  'Other',
];

export function SubscriptionForm({ initialData, onSuccess }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SubscriptionInput>({
    resolver: zodResolver(subscriptionSchema) as any,
    defaultValues: initialData,
  });

  const onSubmit = async (data: SubscriptionInput) => {
    setIsLoading(true);
    try {
      if (initialData?._id) {
        await apiClient.put(`/subscriptions/${initialData._id}`, data);
        toast.success('Subscription updated');
      } else {
        await apiClient.post('/subscriptions', data);
        toast.success('Subscription created');
      }
      onSuccess?.();
    } catch (error: any) {
      toast.error(
        error.response?.data?.error?.message || 'Operation failed'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-lg shadow space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Subscription Name *
        </label>
        <input
          {...register('name')}
          type="text"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
          placeholder="e.g., Netflix, Spotify"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Category *
        </label>
        <select
          {...register('category')}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
        >
          <option value="">Select category</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="mt-1 text-sm text-red-600">
            {errors.category.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Cost *
          </label>
          <input
            {...register('cost', { valueAsNumber: true })}
            type="number"
            step="0.01"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
            placeholder="9.99"
          />
          {errors.cost && (
            <p className="mt-1 text-sm text-red-600">{errors.cost.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Currency *
          </label>
          <select
            {...register('currency')}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
          >
            {CurrencyConverter.getSupportedCurrencies().map((cur) => (
              <option key={cur.code} value={cur.code}>
                {cur.symbol} {cur.code}
              </option>
            ))}
          </select>
          {errors.currency && (
            <p className="mt-1 text-sm text-red-600">{errors.currency.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Billing Cycle *
        </label>
        <select
          {...register('billingCycle')}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
        >
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
          <option value="quarterly">Quarterly</option>
        </select>
        {errors.billingCycle && (
          <p className="mt-1 text-sm text-red-600">
            {errors.billingCycle.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Next Renewal Date *
        </label>
        <input
          {...register('nextRenewalDate')}
          type="date"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
        />
        {errors.nextRenewalDate && (
          <p className="mt-1 text-sm text-red-600">
            {errors.nextRenewalDate.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          {...register('status')}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
        >
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Notes
        </label>
        <textarea
          {...register('notes')}
          rows={3}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
          placeholder="Any additional notes..."
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
      >
        {isLoading ? 'Saving...' : 'Save Subscription'}
      </button>
    </form>
  );
}