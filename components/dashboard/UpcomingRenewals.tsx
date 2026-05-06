import { ISubscription } from '@/typesDefined';

interface Props {
  subscriptions: ISubscription[];
}

export function UpcomingRenewals({ subscriptions }: Props) {
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

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Upcoming Renewals
      </h3>

      {upcoming.length === 0 ? (
        <p className="text-gray-600">No renewals in next 30 days</p>
      ) : (
        <ul className="space-y-3">
          {upcoming.map((sub) => (
            <li
              key={String(sub._id)}
              className="flex justify-between items-center p-3 bg-gray-50 rounded"
            >
              <div>
                <p className="font-medium text-gray-900">{sub.name}</p>
                <p className="text-sm text-gray-600">
                  {new Date(sub.nextRenewalDate).toLocaleDateString()}
                </p>
              </div>
              <p className="font-semibold text-gray-900">${sub.cost}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}