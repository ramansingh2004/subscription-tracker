'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api-client';
import { SpendingChart } from '@/components/analytics/SpendingChart';
import { CategoryBreakdown } from '@/components/analytics/CategoryBreakdown';

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [summaryRes, categoriesRes] = await Promise.all([
          apiClient.get('/analytics/summary'),
          apiClient.get('/analytics/categories'),
        ]);

        setSummary(summaryRes.data.data.summary);
        setCategories(categoriesRes.data.data.categories);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (isLoading) return <div>Loading analytics...</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 text-sm font-medium">
            Total Subscriptions
          </h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {summary?.totalSubscriptions}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 text-sm font-medium">
            Monthly Cost
          </h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            ${summary?.monthlyCost}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 text-sm font-medium">
            Yearly Cost
          </h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            ${summary?.yearlyCost}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SpendingChart />
        <CategoryBreakdown categories={categories} />
      </div>
    </div>
  );
}