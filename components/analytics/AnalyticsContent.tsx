'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api-client';
import { useCurrency } from '@/lib/hooks';
import { CurrencyConverter } from '@/lib/currency-service';

import { SpendingChart } from '@/components/analytics/SpendingChart';
import { CategoryBreakdown } from '@/components/analytics/CategoryBreakdown';
import AnalyticsSkeleton from '@/components/analytics/AnalyticsSkeleton';

export default function AnalyticsContent() {
  const { currency, format } = useCurrency();

  const [summary, setSummary] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [summaryRes, categoriesRes] = await Promise.all([
          apiClient.get('/analytics/summary'),
          apiClient.get('/analytics/categories'),
        ]);

        setSummary(summaryRes.data.data.summary);
        setCategories(categoriesRes.data.data.categories);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
        setError('Failed to load analytics. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (isLoading) {
    return <AnalyticsSkeleton />;
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
          <p className="font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Convert category data from USD to user's currency
  const convertedCategories = categories.map((cat: any) => ({
    ...cat,
    totalCost: CurrencyConverter.convert(cat.totalCost, 'USD', currency),
    cost: CurrencyConverter.convert(cat.cost, 'USD', currency),
    monthlyEquivalent: CurrencyConverter.convert(cat.monthlyEquivalent, 'USD', currency),
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-2">
          Your subscription spending overview (Currency: {currency})
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Subscriptions */}
        <div className="bg-white p-6 rounded-lg border border-gray-300 shadow-sm hover:shadow-md transition">
          <h3 className="text-gray-600 text-sm font-medium">
            Total Subscriptions
          </h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {summary?.totalSubscriptions || 0}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {summary?.activeSubscriptions || 0} active
          </p>
        </div>

        {/* Monthly Cost */}
        <div className="bg-white p-6 rounded-lg border border-gray-300 shadow-sm hover:shadow-md transition">
          <h3 className="text-gray-600 text-sm font-medium">
            Monthly Cost
          </h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {format(summary?.monthlyCost || 0)}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Average per month
          </p>
        </div>

        {/* Yearly Cost */}
        <div className="bg-white p-6 rounded-lg border border-gray-300 shadow-sm hover:shadow-md transition">
          <h3 className="text-gray-600 text-sm font-medium">
            Yearly Cost
          </h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {format(summary?.yearlyCost || 0)}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Projected annual spending
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Spending Trend Chart */}
        <div className="bg-white p-6 rounded-lg border border-gray-300 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Spending Trend (Last 12 Months)
          </h2>
          <SpendingChart currency={currency} />
        </div>

        {/* Category Breakdown Chart */}
        <div className="bg-white p-6 rounded-lg border border-gray-300 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Spending by Category
          </h2>
          <CategoryBreakdown categories={convertedCategories} currency={currency} />
        </div>
      </div>

      {/* Detailed Category Breakdown Table */}
      <div className="bg-white p-6 rounded-lg border border-gray-300 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Category Breakdown Details
        </h2>
        
        {categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No subscription data available</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-300">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    Subscriptions
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    Monthly Cost
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    Total Cost
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    Percentage
                  </th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, idx) => (
                  <tr key={idx} className="border-b border-gray-300 hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {cat.category}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {cat.count} subscription{cat.count > 1 ? 's' : ''}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {format(cat.monthlyEquivalent)}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {format(cat.cost)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {cat.percentage}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}