'use client';

import { useState } from 'react';
import apiClient from '@/lib/api-client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { subscriptionSchema, type SubscriptionInput } from '@/lib/validation';
import toast from 'react-hot-toast';
import { CurrencyConverter } from '@/lib/currency-service';

interface Props {
  initialData?: any;
  onSuccess?: () => void;
}

const categories = [
  'Entertainment',
  'Productivity',
  'Cloud Storage',
  'Utilities',
  'Developer Tools',
  'Health & Fitness',
  'Education',
  'Other',
];

export function SubscriptionForm({ initialData, onSuccess }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<SubscriptionInput>({
    resolver: zodResolver(subscriptionSchema),
    mode: 'onBlur', // Validate on blur
    defaultValues: initialData,
  });

  const cost = watch('cost');
  const currency = watch('currency');
  const billingCycle = watch('billingCycle');

  // Calculate monthly equivalent
  const monthlyCost =
    billingCycle === 'yearly'
      ? (cost || 0) / 12
      : billingCycle === 'quarterly'
        ? (cost || 0) / 3
        : cost || 0;

  const onSubmit = async (data: SubscriptionInput) => {
    setIsLoading(true);
    try {
      if (initialData?._id) {
        await apiClient.put(`/subscriptions/${initialData._id}`, data);
        toast.success('Subscription updated successfully');
      } else {
        await apiClient.post('/subscriptions', data);
        toast.success('Subscription created successfully');
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
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white p-8 rounded-lg border border-gray-300 space-y-6"
    >
      {/* Subscription Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Subscription Name *
        </label>
        <input
          {...register('name')}
          type="text"
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            errors.name
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
          placeholder="e.g., Netflix, Spotify, Adobe Creative Cloud"
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
            ⚠️ {errors.name.message}
          </p>
        )}
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category *
        </label>
        <select
          {...register('category')}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            errors.category
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
            ⚠️ {errors.category.message}
          </p>
        )}
      </div>

      {/* Cost and Currency */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cost *
          </label>
          <input
            {...register('cost', { valueAsNumber: true })}
            type="number"
            step="0.01"
            min="0"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.cost
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            placeholder="9.99"
          />
          {errors.cost ? (
            <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
              ⚠️ {errors.cost.message}
            </p>
          ) : (
            <p className="mt-1 text-xs text-gray-500">
              Monthly equivalent: {CurrencyConverter.format(monthlyCost, currency)}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Currency *
          </label>
          <select
            {...register('currency')}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.currency
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
          >
            {CurrencyConverter.getSupportedCurrencies().map((cur) => (
              <option key={cur.code} value={cur.code}>
                {cur.symbol} {cur.code}
              </option>
            ))}
          </select>
          {errors.currency && (
            <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
              ⚠️ {errors.currency.message}
            </p>
          )}
        </div>
      </div>

      {/* Billing Cycle */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Billing Cycle *
        </label>
        <select
          {...register('billingCycle')}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            errors.billingCycle
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
        >
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
          <option value="quarterly">Quarterly</option>
        </select>
        {errors.billingCycle && (
          <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
            ⚠️ {errors.billingCycle.message}
          </p>
        )}
      </div>

      {/* Next Renewal Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Next Renewal Date *
        </label>
        <input
          {...register('nextRenewalDate')}
          type="date"
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            errors.nextRenewalDate
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
        />
        {errors.nextRenewalDate && (
          <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
            ⚠️ {errors.nextRenewalDate.message}
          </p>
        )}
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Status
        </label>
        <select
          {...register('status')}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            errors.status
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
        >
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Website */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Website (optional)
        </label>
        <input
          {...register('website')}
          type="url"
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            errors.website
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
          placeholder="https://example.com"
        />
        {errors.website && (
          <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
            ⚠️ {errors.website.message}
          </p>
        )}
      </div>

      {/* Account Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Account Email (optional)
        </label>
        <input
          {...register('accountEmail')}
          type="email"
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            errors.accountEmail
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
          placeholder="your-account@example.com"
        />
        {errors.accountEmail && (
          <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
            ⚠️ {errors.accountEmail.message}
          </p>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notes (optional)
        </label>
        <textarea
          {...register('notes')}
          rows={3}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            errors.notes
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
          } resize-none`}
          placeholder="Any additional notes about this subscription..."
          maxLength={500}
        />
        {errors.notes && (
          <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
            ⚠️ {errors.notes.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !isValid}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition duration-200"
      >
        {isLoading
          ? initialData?._id
            ? 'Updating...'
            : 'Creating...'
          : initialData?._id
            ? 'Update Subscription'
            : 'Create Subscription'}
      </button>
    </form>
  );
}