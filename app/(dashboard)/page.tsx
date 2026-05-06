'use client';

import { useSubscriptions } from '@/lib/hooks';
import { useAuth } from '@/lib/hooks';
import { SubscriptionCard } from '@/components/dashboard/SubscriptionCard';
import { QuickStats } from '@/components/dashboard/QuickStats';
import { UpcomingRenewals } from '@/components/dashboard/UpcomingRenewals';
import { LoadingSkeletons } from '@/components/shared/LoadingSkeletons';

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { subscriptions, isLoading } = useSubscriptions();

  if (authLoading || isLoading) {
    return <LoadingSkeletons />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.firstName || user?.username}!
        </h1>
        <p className="mt-2 text-gray-600">
          Here's an overview of your subscriptions
        </p>
      </div>

      <QuickStats subscriptions={subscriptions} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold mb-4">Your Subscriptions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subscriptions.map((sub) => (
              <SubscriptionCard key={sub._id} subscription={sub} />
            ))}
          </div>
        </div>

        <div>
          <UpcomingRenewals subscriptions={subscriptions} />
        </div>
      </div>
    </div>
  );
}