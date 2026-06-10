import { CurrencyConverter } from '@/lib/currency-service';
import { useUserPreferences } from '@/lib/hooks/user-settings';
import { useAuthStore } from '@/store/authStore';

interface SubscriptionRowProps {
  subscription: {
    _id: string;
    name: string;
    category: string;
    cost: number;
    currency: string;
    billingCycle: string;
    nextRenewalDate: string;
  };
}

/**
 * Component to display subscription with currency conversion
 * Shows original currency and converts to user's preferred currency
 */
export const SubscriptionRowWithConversion: React.FC<SubscriptionRowProps> = ({
  subscription,
}) => {
  const { currency: userCurrency } = useUserPreferences();
  const rates = useAuthStore((state) => state.rates);

  // Convert subscription cost to user's preferred currency
  const convertedCost = CurrencyConverter.convert(
    subscription.cost,
    subscription.currency,
    userCurrency,
    rates
  );

  const renewalDate = new Date(subscription.nextRenewalDate);
  const isUpcomingSoon =
    renewalDate.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;

  return (
    <tr className="border-b border-gray-300 hover:bg-gray-50 transition">
      <td className="px-6 py-4 text-sm font-medium text-gray-900">
        {subscription.name}
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">
        <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
          {subscription.category}
        </span>
      </td>
      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
        <div className="flex flex-col">
          <span>{CurrencyConverter.format(convertedCost, userCurrency)}</span>
          <span className="text-xs text-gray-500 font-normal">
            ({CurrencyConverter.format(subscription.cost, subscription.currency)})
          </span>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-600 capitalize">
        {subscription.billingCycle}
      </td>
      <td className="px-6 py-4 text-sm">
        <span
          className={`${
            isUpcomingSoon ? 'bg-amber-50 text-amber-700' : 'text-gray-600'
          } px-2 py-1 rounded`}
        >
          {renewalDate.toLocaleDateString()}
        </span>
      </td>
      <td className="px-6 py-4 text-sm">
        <a
          href={`/subscriptions/${subscription._id}`}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Edit
        </a>
      </td>
    </tr>
  );
};

/**
 * Hook to format prices in user's preferred currency
 */
export const usePriceFormatter = () => {
  const { currency } = useUserPreferences();
  const rates = useAuthStore((state) => state.rates);

  return {
    format: (amount: number, originalCurrency: string = 'USD') => {
      const converted = CurrencyConverter.convert(
        amount,
        originalCurrency,
        currency,
        rates
      );
      return CurrencyConverter.format(converted, currency);
    },
    formatWithOriginal: (amount: number, originalCurrency: string = 'USD') => {
      const converted = CurrencyConverter.convert(
        amount,
        originalCurrency,
        currency,
        rates
      );
      return {
        converted: CurrencyConverter.format(converted, currency),
        original: CurrencyConverter.format(amount, originalCurrency),
        display: `${CurrencyConverter.format(converted, currency)} (${CurrencyConverter.format(amount, originalCurrency)})`,
      };
    },
  };
};