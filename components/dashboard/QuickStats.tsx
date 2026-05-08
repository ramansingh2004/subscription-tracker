import { ISubscription } from '@/typesDefined/index';

interface Props {
  subscriptions: ISubscription[];
}

export function QuickStats({ subscriptions }: Props) {
  if (subscriptions.length === 0) {
    return null;
  }

  // Calculate monthly cost
  const totalMonthly = subscriptions.reduce((sum, sub) => {
    if (sub.status !== 'active') return sum;
    
    if (sub.billingCycle === 'monthly') {
      return sum + sub.cost;
    } else if (sub.billingCycle === 'yearly') {
      return sum + sub.cost / 12;
    } else if (sub.billingCycle === 'quarterly') {
      return sum + sub.cost / 3;
    }
    return sum;
  }, 0);

  const totalYearly = totalMonthly * 12;

  // Get category breakdown
  const categoryCounts = subscriptions.reduce((acc, sub) => {
    if (sub.status !== 'active') return acc;
    acc[sub.category] = (acc[sub.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCategory = Object.entries(categoryCounts).sort(
    ([, a], [, b]) => b - a
  )[0]?.[0];

  const stats = [
    {
      label: 'Active Subscriptions',
      value: subscriptions.filter(s => s.status === 'active').length,
      icon: '📦',
      color: 'from-blue-50 to-blue-100',
      textColor: 'text-blue-900',
    },
    {
      label: 'Monthly Spending',
      value: `$${totalMonthly.toFixed(2)}`,
      icon: '💰',
      color: 'from-green-50 to-green-100',
      textColor: 'text-green-900',
    },
    {
      label: 'Yearly Spending',
      value: `$${totalYearly.toFixed(2)}`,
      icon: '📊',
      color: 'from-purple-50 to-purple-100',
      textColor: 'text-purple-900',
    },
    {
      label: 'Top Category',
      value: topCategory || 'N/A',
      icon: '🏆',
      color: 'from-orange-50 to-orange-100',
      textColor: 'text-orange-900',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`bg-gradient-to-br ${stat.color} rounded-lg p-6 border border-gray-200`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${stat.textColor} opacity-75`}>
                {stat.label}
              </p>
              <p className={`text-2xl font-bold ${stat.textColor} mt-2`}>
                {stat.value}
              </p>
            </div>
            <span className="text-4xl opacity-50">{stat.icon}</span>
          </div>
        </div>
      ))}
    </div>
  );
}