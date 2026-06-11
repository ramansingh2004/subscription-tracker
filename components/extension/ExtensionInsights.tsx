'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api-client';
import { useCurrency } from '@/lib/hooks';

interface TrackingStats {
  page_visit?: number;
  time_on_page?: number;
  ad_detected?: number;
  paywall_detected?: number;
  subscription_mention?: number;
}

interface DomainData {
  domain: string;
  visits?: number;
  totalTime?: number;
  count?: number;
}

interface SubscriptionMention {
  totalMentions: number;
  domains: string[];
}

export default function ExtensionInsights() {
  const { currency } = useCurrency();
  const [days, setDays] = useState(7);
  const [stats, setStats] = useState<TrackingStats | null>(null);
  const [topDomains, setTopDomains] = useState<DomainData[]>([]);
  const [paywallDomains, setPaywallDomains] = useState<DomainData[]>([]);
  const [adDomains, setAdDomains] = useState<DomainData[]>([]);
  const [subscriptionMentions, setSubscriptionMentions] =
    useState<SubscriptionMention | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInsights();
  }, [days]);

  async function fetchInsights() {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.get('/extension/track', {
        params: { days },
      });

      const data = response.data.data;
      setStats(data.stats);
      setTopDomains(data.topDomains || []);
      setPaywallDomains(data.paywallDomains || []);
      setAdDomains(data.adDomains || []);
      setSubscriptionMentions(data.subscriptionMentions);
    } catch (error) {
      console.error('Failed to fetch insights:', error);
      setError('Failed to load extension insights');
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Browser Insights</h1>
        <p className="text-gray-600 mt-2">
          Data collected from SubTrack browser extension
        </p>
      </div>

      {/* Time Filter */}
      <div className="flex gap-2 flex-wrap">
        {[7, 14, 30].map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              days === d
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Last {d} days
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
          {error}
        </div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-300 shadow-sm">
          <h3 className="text-gray-600 text-sm font-medium">Pages Visited</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {stats?.page_visit || 0}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-300 shadow-sm">
          <h3 className="text-gray-600 text-sm font-medium">Time Tracked</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {stats?.time_on_page ? `${Math.round(stats.time_on_page / 60000)}m` : '0m'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-300 shadow-sm">
          <h3 className="text-gray-600 text-sm font-medium">Ads Detected</h3>
          <p className="text-3xl font-bold text-orange-600 mt-2">
            {stats?.ad_detected || 0}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-300 shadow-sm">
          <h3 className="text-gray-600 text-sm font-medium">Paywalls Found</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">
            {stats?.paywall_detected || 0}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-300 shadow-sm">
          <h3 className="text-gray-600 text-sm font-medium">
            Subscription Mentions
          </h3>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {subscriptionMentions?.totalMentions || 0}
          </p>
        </div>
      </div>

      {/* Top Domains */}
      <div className="bg-white p-6 rounded-lg border border-gray-300 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          🌐 Top Visited Domains
        </h2>
        {topDomains.length === 0 ? (
          <p className="text-gray-500">No data available</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-300">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    Domain
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    Visits
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    Time Spent
                  </th>
                </tr>
              </thead>
              <tbody>
                {topDomains.map((domain, idx) => (
                  <tr key={idx} className="border-b border-gray-300 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {domain.domain}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {domain.visits}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {domain.totalTime
                        ? `${Math.round(domain.totalTime / 60000)}m`
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Paywalls & Ads Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Paywalls */}
        <div className="bg-white p-6 rounded-lg border border-gray-300 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            🔐 Sites with Paywalls
          </h2>
          {paywallDomains.length === 0 ? (
            <p className="text-gray-500">No paywalls detected</p>
          ) : (
            <div className="space-y-2">
              {paywallDomains.map((domain, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center p-3 bg-red-50 rounded-lg"
                >
                  <span className="text-sm font-medium text-gray-900">
                    {domain.domain}
                  </span>
                  <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded">
                    {domain.count} times
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ads */}
        <div className="bg-white p-6 rounded-lg border border-gray-300 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            📢 Sites with Ads
          </h2>
          {adDomains.length === 0 ? (
            <p className="text-gray-500">No ads detected</p>
          ) : (
            <div className="space-y-2">
              {adDomains.map((domain, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center p-3 bg-orange-50 rounded-lg"
                >
                  <span className="text-sm font-medium text-gray-900">
                    {domain.domain}
                  </span>
                  <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded">
                    {domain.count} times
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Subscription Mentions */}
      {subscriptionMentions && subscriptionMentions.domains.length > 0 && (
        <div className="bg-white p-6 rounded-lg border border-gray-300 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            💰 Subscription Opportunities
          </h2>
          <p className="text-gray-600 mb-4">
            These sites mentioned subscriptions {subscriptionMentions.totalMentions}{' '}
            times
          </p>
          <div className="flex flex-wrap gap-2">
            {subscriptionMentions.domains.map((domain, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-green-50 text-green-800 rounded-full text-sm font-medium"
              >
                {domain}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}