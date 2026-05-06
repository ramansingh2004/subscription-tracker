import { ISubscription } from '@/typesDefined';

interface Props {
  subscriptions: ISubscription[];
}

export function QuickStats({ subscriptions }: Props) {
  const totalMonthly = subscriptions.reduce((sum, sub) => {
    if (sub.billingCycle === 'monthly') return sum + sub.cost;
    if (sub.billingCycle === 'yearly') return sum + sub.cost / 12;
    if (sub.billingCycle === 'quarterly') return sum + sub.cost / 3;
    return sum;
  }, 0);

  const categoryCounts = subscriptions.reduce((acc, sub) => {
    acc[sub.category] = (acc[sub.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCategory = Object.entries(categoryCounts).sort(
    ([, a], [, b]) => b - a
  )[0]?.[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
        <p className="text-gray-600 text-sm font-medium">Total Subscriptions</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">
          {subscriptions.length}
        </p>
      </div>

      <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
        <p className="text-gray-600 text-sm font-medium">Monthly Spending</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">
          ${Math.round(totalMonthly * 100) / 100}
        </p>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
        <p className="text-gray-600 text-sm font-medium">Yearly Spending</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">
          ${Math.round(totalMonthly * 12 * 100) / 100}
        </p>
      </div>

      <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg">
        <p className="text-gray-600 text-sm font-medium">Top Category</p>
        <p className="text-3xl font-bold text-gray-900 mt-2 capitalize">
          {topCategory || 'N/A'}
        </p>
      </div>
    </div>
  );
}