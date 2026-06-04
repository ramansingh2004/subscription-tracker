import { ISubscription } from '@/typesDefined/index';
import Link from 'next/link';

interface Props {
  subscription: ISubscription;
}

export function SubscriptionCard({ subscription }: Props) {
  const daysUntilRenewal = Math.ceil(
    (new Date(subscription.nextRenewalDate).getTime() - Date.now()) /
      (1000 * 60 * 60 * 24)
  );

  const isUrgent = daysUntilRenewal <= 7 && daysUntilRenewal >= 0;

  return (
    <div className={`bg-white rounded-lg shadow hover:shadow-lg transition p-6 border-l-4 ${
      isUrgent ? 'border-red-500' : 'border-[#606C38]'
    }`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
            {subscription.name}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{subscription.category}</p>
        </div>
        <span className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium ${
          subscription.status === 'active'
            ? 'bg-green-100 text-green-800'
            : subscription.status === 'paused'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {subscription.status}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-sm">Cost:</span>
          <span className="font-semibold text-gray-900">
            ${subscription.cost.toFixed(2)}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-sm">Billing:</span>
          <span className="font-semibold text-gray-900 capitalize">
            {subscription.billingCycle}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-sm">Next Renewal:</span>
          <span className={`font-semibold ${
            isUrgent ? 'text-red-600' : 'text-gray-900'
          }`}>
            {daysUntilRenewal < 0 ? 'Overdue' : `${daysUntilRenewal}d`}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-gray-200">
        <Link
          href={`/subscriptions/${subscription._id}`}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center"
        >
          View Details
          <span className="ml-1">→</span>
        </Link>
      </div>
    </div>
  );
}