'use client';

import { useSubscriptions, useCurrency } from '@/lib/hooks';
import Link from 'next/link';
import { SubscriptionCard } from '@/components/dashboard/SubscriptionCard';
import { QuickStats } from '@/components/dashboard/QuickStats';
import { UpcomingRenewals } from '@/components/dashboard/UpcomingRenewals';
import { EmptyState } from '@/components/shared/EmptyState';
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton';

export default function DashboardContent() {
  const { subscriptions, isLoading } = useSubscriptions();
  const { currency } = useCurrency();

  // Handle loading state with skeleton loader
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const activeSubscriptions = subscriptions.filter(
    (sub) => sub.status === 'active'
  );

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Manage and track all your subscriptions in one place
        </p>
      </div>

      {/* Quick Stats */}
      <QuickStats subscriptions={activeSubscriptions} currency={currency} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Subscriptions */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Your Subscriptions
            </h2>
            <Link
              href="/subscriptions"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              View All →
            </Link>
          </div>

          {activeSubscriptions.length === 0 ? (
            <EmptyState
              icon="📦"
              title="No Active Subscriptions"
              description="Add your first subscription to get started!"
              actionText="Add Subscription"
              actionHref="/subscriptions/new"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeSubscriptions.slice(0, 6).map((subscription) => (
                <SubscriptionCard
                  key={subscription._id.toString()}
                  subscription={subscription}
                  currency={currency}
                />
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Renewals */}
        <div className="lg:col-span-1">
          <UpcomingRenewals
            subscriptions={activeSubscriptions}
            currency={currency}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-[#283618] to-[#606C38] rounded-lg shadow p-8 text-white">
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/subscriptions/new"
            className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-3 rounded-lg text-center font-medium transition"
          >
            ➕ Add Subscription
          </Link>
          <Link
            href="/subscriptions"
            className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-3 rounded-lg text-center font-medium transition"
          >
            📋 View All Subscriptions
          </Link>
          <Link
            href="/analytics"
            className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-3 rounded-lg text-center font-medium transition"
          >
            📊 View Analytics
          </Link>
        </div>
      </div>
    </div>
  );
}