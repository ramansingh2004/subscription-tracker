'use client';

import { useRouter } from 'next/navigation';
import { SubscriptionForm } from '@/components/subscriptions/SubscriptionForm';

export default function NewSubscriptionPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/subscriptions');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Add New Subscription
      </h1>
      <SubscriptionForm onSuccess={handleSuccess} />
    </div>
  );
}