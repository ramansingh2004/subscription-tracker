'use client';

import { Suspense } from 'react';
import AnalyticsContent from '@/components/analytics/AnalyticsContent';
import AnalyticsSkeleton from '@/components/analytics/AnalyticsSkeleton';

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<AnalyticsSkeleton />}>
      <AnalyticsContent />
    </Suspense>
  );
}