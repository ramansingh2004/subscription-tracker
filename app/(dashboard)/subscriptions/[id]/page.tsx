'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { SubscriptionForm } from '@/components/subscriptions/SubscriptionForm';
import toast from 'react-hot-toast';
import { ISubscription } from '@/typesDefined/index';

export default function SubscriptionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [subscription, setSubscription] = useState<ISubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const res = await apiClient.get(`/subscriptions/${params.id}`);
        setSubscription(res.data.data.subscription);
      } catch (error) {
        toast.error('Failed to load subscription');
        router.push('/subscriptions');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchSubscription();
    }
  }, [params.id, router]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this subscription?')) {
      return;
    }

    try {
      await apiClient.delete(`/subscriptions/${params.id}`);
      toast.success('Subscription deleted');
      router.push('/subscriptions');
    } catch (error: any) {
      toast.error('Failed to delete subscription');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Subscription not found</p>
      </div>
    );
  }

  const daysUntilRenewal = Math.ceil(
    (new Date(subscription.nextRenewalDate).getTime() - Date.now()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {subscription.name}
          </h1>
          <p className="text-gray-600 mt-2">{subscription.category}</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          {isEditing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      {isEditing ? (
        <SubscriptionForm
          initialData={subscription}
          onSuccess={() => {
            setIsEditing(false);
            router.refresh();
          }}
        />
      ) : (
        <>
          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="bg-white p-6 rounded-lg shadow space-y-6">
              <div>
                <label className="text-gray-600 text-sm font-medium">
                  Monthly Cost
                </label>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  $
                  {subscription.billingCycle === 'monthly'
                    ? subscription.cost
                    : subscription.billingCycle === 'yearly'
                    ? (subscription.cost / 12).toFixed(2)
                    : (subscription.cost / 3).toFixed(2)}
                </p>
              </div>

              <div>
                <label className="text-gray-600 text-sm font-medium">
                  Billing Cycle
                </label>
                <p className="text-xl font-semibold text-gray-900 mt-1 capitalize">
                  {subscription.billingCycle}
                </p>
              </div>

              <div>
                <label className="text-gray-600 text-sm font-medium">
                  Status
                </label>
                <div className="mt-1">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      subscription.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : subscription.status === 'paused'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {subscription.status}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-gray-600 text-sm font-medium">
                  Auto Renew
                </label>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {subscription.autoRenew ? '✓ Yes' : '✗ No'}
                </p>
              </div>
            </div>

            {/* Right Column */}
            <div className="bg-white p-6 rounded-lg shadow space-y-6">
              <div>
                <label className="text-gray-600 text-sm font-medium">
                  Next Renewal Date
                </label>
                <p className="text-xl font-semibold text-gray-900 mt-1">
                  {new Date(subscription.nextRenewalDate).toLocaleDateString()}
                </p>
              </div>

              <div>
                <label className="text-gray-600 text-sm font-medium">
                  Days Until Renewal
                </label>
                <p
                  className={`text-xl font-semibold mt-1 ${
                    daysUntilRenewal <= 7 ? 'text-red-600' : 'text-gray-900'
                  }`}
                >
                  {daysUntilRenewal === 0
                    ? 'Today'
                    : daysUntilRenewal === 1
                    ? 'Tomorrow'
                    : `${daysUntilRenewal} days`}
                </p>
              </div>

              <div>
                <label className="text-gray-600 text-sm font-medium">
                  Yearly Cost
                </label>
                <p className="text-xl font-semibold text-gray-900 mt-1">
                  $
                  {subscription.billingCycle === 'yearly'
                    ? subscription.cost
                    : subscription.billingCycle === 'monthly'
                    ? (subscription.cost * 12).toFixed(2)
                    : (subscription.cost * 4).toFixed(2)}
                </p>
              </div>

              <div>
                <label className="text-gray-600 text-sm font-medium">
                  Created
                </label>
                <p className="text-gray-900 mt-1">
                  {new Date(subscription.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          {subscription.notes && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold text-gray-900 mb-3">Notes</h3>
              <p className="text-gray-700 whitespace-pre-wrap">
                {subscription.notes}
              </p>
            </div>
          )}

          {/* Delete Button */}
          <div className="flex justify-end gap-4">
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
            >
              Back
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
            >
              Delete Subscription
            </button>
          </div>
        </>
      )}
    </div>
  );
}