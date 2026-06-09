'use client';

import { Suspense } from 'react';
import SubscriptionsContent from '@/components/subscriptions/SubscriptionsContent';
import SubscriptionsSkeleton from '@/components/subscriptions/SubscriptionsSkeleton';

export default function SubscriptionsPage() {
  return (
    <Suspense fallback={<SubscriptionsSkeleton />}>
      <SubscriptionsContent />
    </Suspense>
  );
}