'use client';

import { useState, useMemo } from 'react';
import { useSubscriptions } from '@/lib/hooks';
import Link from 'next/link';
import { SubscriptionTable } from '@/components/subscriptions/SubscriptionTable';
import { SubscriptionFilter } from '@/components/subscriptions/SubscriptionFilter';
import { ISubscription } from '@/typesDefined/index';

export default function SubscriptionsPage() {
  const { subscriptions, isLoading } = useSubscriptions();
  const [category, setCategory] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter subscriptions based on selected filters
  const filtered = useMemo(() => {
    return subscriptions.filter((sub: ISubscription) => {
      // Category filter
      if (category && sub.category !== category) return false;

      // Status filter
      if (status && sub.status !== status) return false;

      // Search filter - search by name or category
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesName = sub.name.toLowerCase().includes(term);
        const matchesCategory = sub.category.toLowerCase().includes(term);
        if (!matchesName && !matchesCategory) return false;
      }

      return true;
    });
  }, [subscriptions, category, status, searchTerm]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            All Subscriptions
          </h1>
          <p className="text-gray-600 mt-2">
            Manage and organize all your digital subscriptions
          </p>
        </div>
        <Link
          href="/subscriptions/new"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium text-center md:text-left"
        >
          + Add Subscription
        </Link>
      </div>

      {/* Filter Section */}
      <SubscriptionFilter
        onCategoryChange={setCategory}
        onStatusChange={setStatus}
        onSearchChange={setSearchTerm}
      />

      {/* Results Info */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <p className="text-blue-900">
          {isLoading ? (
            'Loading subscriptions...'
          ) : (
            <>
              Showing <span className="font-bold">{filtered.length}</span> of{' '}
              <span className="font-bold">{subscriptions.length}</span>{' '}
              subscriptions
            </>
          )}
        </p>
      </div>

      {/* Table Section */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
          <p className="mt-4 text-gray-600">Loading your subscriptions...</p>
        </div>
      ) : (
        <SubscriptionTable
          subscriptions={filtered}
        />
      )}

      {/* Empty State */}
      {!isLoading && subscriptions.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No subscriptions yet
          </h3>
          <p className="text-gray-600 mb-6">
            Start tracking your subscriptions by adding your first one!
          </p>
          <Link
            href="/subscriptions/new"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Add Your First Subscription
          </Link>
        </div>
      )}

      {/* No Results State */}
      {!isLoading && subscriptions.length > 0 && filtered.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No matching subscriptions
          </h3>
          <p className="text-gray-600 mb-6">
            Try adjusting your filters or search terms
          </p>
          <button
            onClick={() => {
              setCategory(null);
              setStatus(null);
              setSearchTerm('');
            }}
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
