import { ISubscription } from '@/typesDefined/index';
import { CurrencyConverter } from '@/lib/currency-service';
import { useAuthStore } from '@/store/authStore';

interface Props {
  subscriptions: ISubscription[];
  currency?: string;
}

export function QuickStats({ subscriptions, currency }: Props) {
  const rates = useAuthStore((state) => state.rates);

  if (subscriptions.length === 0) {
    return null;
  }

  // Calculate monthly cost in the user's preferred currency
  const totalMonthly = subscriptions.reduce((sum, sub) => {
    if (sub.status !== 'active') return sum;
    
    const costInPreferredCurrency = CurrencyConverter.convert(
      sub.cost,
      sub.currency || 'USD',
      currency || 'USD',
      rates
    );
    
    if (sub.billingCycle === 'monthly') {
      return sum + costInPreferredCurrency;
    } else if (sub.billingCycle === 'yearly') {
      return sum + costInPreferredCurrency / 12;
    } else if (sub.billingCycle === 'quarterly') {
      return sum + costInPreferredCurrency / 3;
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
      color: 'from-[#FEFAE0] to-[#E2ECDB]',
      textColor: 'text-[#283618]',
    },
    {
      label: 'Monthly Spending',
      value: CurrencyConverter.format(totalMonthly, currency || 'USD'),
      icon: '💰',
      color: 'from-[#FEFAE0] to-[#F7E7C4]',
      textColor: 'text-[#BC6C25]',
    },
    {
      label: 'Yearly Spending',
      value: CurrencyConverter.format(totalYearly, currency || 'USD'),
      icon: '📊',
      color: 'from-[#E2ECDB] to-[#C8D5B9]',
      textColor: 'text-[#283618]',
    },
    {
      label: 'Top Category',
      value: topCategory || 'N/A',
      icon: '🏆',
      color: 'from-[#F7E7C4] to-[#EADCA9]',
      textColor: 'text-[#BC6C25]',
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