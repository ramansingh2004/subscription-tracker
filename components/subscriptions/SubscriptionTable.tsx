'use client';

import { useState } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/api-client';
import toast from 'react-hot-toast';
import { ISubscription } from '@/typesDefined/index';

interface Props {
  subscriptions: ISubscription[];
  onRefresh?: () => void;
}

export function SubscriptionTable({ subscriptions, onRefresh }: Props) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'cost' | 'renewal'>('renewal');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subscription?')) {
      return;
    }

    setIsDeleting(id);
    try {
      await apiClient.delete(`/subscriptions/${id}`);
      toast.success('Subscription deleted');
      onRefresh?.();
    } catch (error: any) {
      toast.error(
        error.response?.data?.error?.message || 'Failed to delete subscription'
      );
    } finally {
      setIsDeleting(null);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    try {
      await apiClient.put(`/subscriptions/${id}`, { status: newStatus });
      toast.success(`Subscription ${newStatus}`);
      onRefresh?.();
    } catch (error: any) {
      toast.error('Failed to update subscription');
    }
  };

  const sortedSubscriptions = [...subscriptions].sort((a, b) => {
    let aValue: any = a.name;
    let bValue: any = b.name;

    if (sortBy === 'cost') {
      aValue = a.cost;
      bValue = b.cost;
    } else if (sortBy === 'renewal') {
      aValue = new Date(a.nextRenewalDate).getTime();
      bValue = new Date(b.nextRenewalDate).getTime();
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleSort = (column: 'name' | 'cost' | 'renewal') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortBy !== column) {
      return <span className="ml-1 text-gray-400">↕</span>;
    }
    return (
      <span className="ml-1 text-blue-600">
        {sortOrder === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  if (subscriptions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <p className="text-gray-600 text-lg mb-4">
          No subscriptions yet. Start by adding your first subscription!
        </p>
        <Link
          href="/subscriptions/new"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Add First Subscription
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center hover:text-gray-700"
                >
                  Name
                  <SortIcon column="name" />
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('cost')}
                  className="flex items-center hover:text-gray-700"
                >
                  Cost
                  <SortIcon column="cost" />
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Billing Cycle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('renewal')}
                  className="flex items-center hover:text-gray-700"
                >
                  Next Renewal
                  <SortIcon column="renewal" />
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedSubscriptions.map((subscription) => {
              const daysUntilRenewal = Math.ceil(
                (new Date(subscription.nextRenewalDate).getTime() - Date.now()) /
                  (1000 * 60 * 60 * 24)
              );

              const renewalDateString = new Date(
                subscription.nextRenewalDate
              ).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <tr
                  key={subscription._id.toString()}
                  className="hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/subscriptions/${subscription._id}`}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {subscription.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {subscription.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                    ${subscription.cost.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600 capitalize">
                    {subscription.billingCycle}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-900">{renewalDateString}</div>
                    <div
                      className={`text-xs font-medium ${
                        daysUntilRenewal <= 7 ? 'text-red-600' : 'text-gray-600'
                      }`}
                    >
                      {daysUntilRenewal === 0
                        ? 'Today'
                        : daysUntilRenewal === 1
                        ? 'Tomorrow'
                        : `${daysUntilRenewal} days`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() =>
                        handleToggleStatus(subscription._id.toString(), subscription.status)
                      }
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                        subscription.status === 'active'
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {subscription.status}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <Link
                      href={`/subscriptions/${subscription._id}`}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(subscription._id.toString())}
                      disabled={isDeleting === subscription._id.toString()}
                      className="text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                    >
                      {isDeleting === subscription._id.toString() ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <p className="text-gray-600">Total Subscriptions</p>
            <p className="text-2xl font-bold text-gray-900">
              {subscriptions.length}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Total Monthly Cost</p>
            <p className="text-2xl font-bold text-gray-900">
              $
              {subscriptions
                .reduce((sum, sub) => {
                  if (sub.status !== 'active') return sum;
                  if (sub.billingCycle === 'monthly') return sum + sub.cost;
                  if (sub.billingCycle === 'yearly') return sum + sub.cost / 12;
                  if (sub.billingCycle === 'quarterly') return sum + sub.cost / 3;
                  return sum;
                }, 0)
                .toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Active Subscriptions</p>
            <p className="text-2xl font-bold text-gray-900">
              {subscriptions.filter((s) => s.status === 'active').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
