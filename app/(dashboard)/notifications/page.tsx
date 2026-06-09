'use client';

import { Suspense } from 'react';
import NotificationsContent from '@/components/notifications/NotificationsContent';
import NotificationsSkeleton from '@/components/notifications/NotificationsSkeleton';

export default function NotificationsPage() {
  return (
    <Suspense fallback={<NotificationsSkeleton />}>
      <NotificationsContent />
    </Suspense>
  );
}