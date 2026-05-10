'use client';

import { ISubscription } from '@/typesDefined/index';
import { useState } from 'react';
import apiClient from '@/lib/api-client';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

interface Props {
  subscription: ISubscription;
  onUpdate?: () => void;
}

export function SubscriptionCardWithActions({
  subscription,
  onUpdate,
}: Props) {
  const [isDeleting, setIsDeleting] = useState(false);

  const daysUntilRenewal = Math.ceil(
    (new Date(subscription.nextRenewalDate).getTime() - Date.now()) /
      (1000 * 60 * 60 * 24)
  );

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await apiClient.delete(`/subscriptions/${subscription._id}`);
      toast.success('Subscription deleted');
      onUpdate?.();
    } catch (error: any) {
      toast.error('Failed to delete subscription');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async () => {
    const newStatus = subscription.status === 'active' ? 'paused' : 'active';
    try {
      await apiClient.put(`/subscriptions/${subscription._id}`, {
        status: newStatus,
      });
      toast.success(`Subscription ${newStatus}`);
      onUpdate?.();
    } catch (error) {
      toast.error('Failed to update subscription');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <Link
          href={`/subscriptions/${subscription._id}`}
          className="flex-1 min-w-0"
        >
          <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition truncate">
            {subscription.name}
          </h3>
          <p className="text-sm text-gray-600">{subscription.category}</p>
        </Link>
        <span
          className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium ${
            subscription.status === 'active'
              ? 'bg-green-100 text-green-800'
              : subscription.status === 'paused'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {subscription.status}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-6">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Cost:</span>
          <span className="font-semibold">${subscription.cost.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Billing:</span>
          <span className="font-semibold capitalize">{subscription.billingCycle}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Renews in:</span>
          <span className={`font-semibold ${
            daysUntilRenewal <= 7 ? 'text-red-600' : 'text-gray-900'
          }`}>
            {daysUntilRenewal < 0 ? 'Overdue' : `${daysUntilRenewal}d`}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Link
          href={`/subscriptions/${subscription._id}`}
          className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition text-center font-medium"
        >
          View
        </Link>

        <button
          onClick={handleToggleStatus}
          className={`flex-1 px-3 py-2 text-sm rounded transition font-medium ${
            subscription.status === 'active'
              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              : 'bg-green-200 text-green-700 hover:bg-green-300'
          }`}
        >
          {subscription.status === 'active' ? 'Pause' : 'Resume'}
        </button>

        <ConfirmDialog
          title="Delete Subscription"
          message="Are you sure you want to delete this subscription? This action cannot be undone."
          onConfirm={handleDelete}
          confirmText="Delete"
          isDangerous
        >
          <button
            disabled={isDeleting}
            className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition font-medium disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </ConfirmDialog>
      </div>
    </div>
  );
}