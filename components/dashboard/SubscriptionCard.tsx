import { ISubscription } from '@/typesDefined';
import Link from 'next/link';

interface Props {
  subscription: ISubscription;
}

export function SubscriptionCard({ subscription }: Props) {
  const daysUntilRenewal = Math.ceil(
    (new Date(subscription.nextRenewalDate).getTime() - Date.now()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {subscription.name}
          </h3>
          <p className="text-sm text-gray-600">{subscription.category}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          subscription.status === 'active'
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {subscription.status}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Cost:</span>
          <span className="font-semibold text-gray-900">
            ${subscription.cost}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Billing:</span>
          <span className="font-semibold text-gray-900">
            {subscription.billingCycle}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Renews in:</span>
          <span className={`font-semibold ${
            daysUntilRenewal <= 7 ? 'text-red-600' : 'text-gray-900'
          }`}>
            {daysUntilRenewal} days
          </span>
        </div>
      </div>

      <Link
        href={`/subscriptions/${subscription._id}`}
        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
      >
        View Details →
      </Link>
    </div>
  );
}