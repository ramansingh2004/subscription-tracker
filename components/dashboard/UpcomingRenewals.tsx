import { ISubscription } from '@/typesDefined';
import Link from 'next/link';
import { CurrencyConverter } from '@/lib/currency-service';

interface Props {
  subscriptions: ISubscription[];
  currency?: string;
}

export function UpcomingRenewals({ subscriptions, currency }: Props) {
  const today = new Date();
  const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  const upcoming = subscriptions
    .filter(
      (sub) =>
        sub.status === 'active' &&
        new Date(sub.nextRenewalDate) >= today &&
        new Date(sub.nextRenewalDate) <= thirtyDaysFromNow
    )
    .sort(
      (a, b) =>
        new Date(a.nextRenewalDate).getTime() -
        new Date(b.nextRenewalDate).getTime()
    )
    .slice(0, 5);

  const getUrgency = (date: Date | string) => {
    const daysLeft = Math.ceil(
      (new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    if (daysLeft <= 3) return { label: '🔴 Soon', color: 'text-red-600' };
    if (daysLeft <= 7) return { label: '🟠 This week', color: 'text-orange-600' };
    return { label: '🟡 Later', color: 'text-yellow-600' };
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow h-fit">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Upcoming Renewals
      </h3>

      {upcoming.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 text-sm">
            No renewals in the next 30 days
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {upcoming.map((sub) => {
            const urgency = getUrgency(sub.nextRenewalDate);
            const renewalDate = new Date(sub.nextRenewalDate);
            
            return (
              <li
                key={sub._id.toString()}
                className="flex items-between justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition"
              >
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/subscriptions/${sub._id}`}
                    className="block font-medium text-gray-900 hover:text-blue-600 transition truncate"
                  >
                    {sub.name}
                  </Link>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-600">
                      {renewalDate.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    <p className={`text-xs font-medium ${urgency.color}`}>
                      {urgency.label}
                    </p>
                  </div>
                </div>
                <p className="ml-2 font-semibold text-gray-900 text-right">
                  {CurrencyConverter.format(
                    CurrencyConverter.convert(
                      sub.cost,
                      sub.currency || 'USD',
                      currency || 'USD'
                    ),
                    currency || 'USD'
                  )}
                </p>
              </li>
            );
          })}
        </ul>
      )}

      <Link
        href="/subscriptions"
        className="block mt-4 text-center text-blue-600 hover:text-blue-700 text-sm font-medium"
      >
        View all subscriptions →
      </Link>
    </div>
  );
}
