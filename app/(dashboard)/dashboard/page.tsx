'use client';

import { useSubscriptions } from '@/lib/hooks';
import Link from 'next/link';
import { SubscriptionCard } from '@/components/dashboard/SubscriptionCard';
import { QuickStats } from '@/components/dashboard/QuickStats';
import { UpcomingRenewals } from '@/components/dashboard/UpcomingRenewals';

export default function DashboardPage() {
  const { subscriptions, isLoading } = useSubscriptions();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const activeSubscriptions = subscriptions.filter(
    (sub) => sub.status === 'active'
  );

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">
          Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Manage and track all your subscriptions in one place
        </p>
      </div>

      {/* Quick Stats */}
      <QuickStats subscriptions={activeSubscriptions} />

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
            <div className="bg-white p-12 rounded-lg shadow text-center">
              <div className="text-5xl mb-4">📦</div>
              <p className="text-gray-600 mb-6">
                No active subscriptions yet. Add your first subscription to get started!
              </p>
              <Link
                href="/subscriptions/new"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
              >
                Add Subscription
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeSubscriptions.slice(0, 6).map((subscription) => (
                <SubscriptionCard
                  key={subscription._id.toString()}
                  subscription={subscription}
                />
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Renewals */}
        <div className="lg:col-span-1">
          <UpcomingRenewals subscriptions={activeSubscriptions} />
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