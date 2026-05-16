'use client';

import { useState, useEffect, useRef } from 'react';
import { useSubscriptions, prefetchSubscriptionsPage } from '@/lib/hooks/queries.hook';
import { usePagination } from '@/lib/hooks/pagination.hook';
import { SkeletonLoader, usePrefetch } from '@/lib/hooks/lazy-loading.hook';
import { useQueryClient } from '@tanstack/react-query';
import { SubscriptionCardWithActions } from '@/components/subscriptions/SubscriptionCardWithActions';
import { SubscriptionFilter } from '@/components/subscriptions/SubscriptionFilter';
import { ISubscription } from '@/typesDefined/index';

export default function SubscriptionsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState({
    category: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Fetch subscriptions with React Query
  const { data, isLoading, error } = useSubscriptions(page, limit);

  // Prefetch next page on hover
  const nextPageRef = useRef<HTMLButtonElement>(null);
  const { onMouseEnter: onNextPageHover } = usePrefetch(() => {
    if (data?.pagination?.totalPages > page) {
      prefetchSubscriptionsPage(queryClient, page + 1, limit);
    }
  });

  const subscriptions = data?.data || [];
  const pagination = data?.pagination || {};

  const handleNextPage = () => {
    if (pagination.totalPages && page < pagination.totalPages) {
      setPage(page + 1);
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Subscriptions</h1>
        <a
          href="/subscriptions/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Add Subscription
        </a>
      </div>

      {/* Filters */}
      <SubscriptionFilter
        filters={filters}
        onFilterChange={setFilters}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-3">
          <SkeletonLoader count={5} height="120px" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">
          Failed to load subscriptions. Please try again.
        </div>
      )}

      {/* Empty State */}
      {!isLoading && subscriptions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No subscriptions found</p>
          <a href="/subscriptions/new" className="text-blue-600 hover:underline">
            Add your first subscription
          </a>
        </div>
      )}

      {/* Subscriptions Grid */}
      {!isLoading && subscriptions.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subscriptions.map((sub: ISubscription) => (
              <SubscriptionCardWithActions
                key={String(sub._id)}
                subscription={sub}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between pt-6 border-t">
            <div className="text-sm text-gray-600">
              Showing {(page - 1) * limit + 1} to{' '}
              {Math.min(page * limit, pagination.total)} of {pagination.total}{' '}
              subscriptions
            </div>

            <div className="flex items-center gap-4">
              {/* Items per page */}
              <select
                value={limit}
                onChange={(e) => handleLimitChange(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
              </select>

              {/* Page buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handlePrevPage}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {/* Page indicator */}
                <div className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                  <span className="font-medium">{page}</span> /{' '}
                  <span>{pagination.totalPages || 1}</span>
                </div>

                {/* Next button with prefetch */}
                <button
                  ref={nextPageRef}
                  onMouseEnter={onNextPageHover}
                  onClick={handleNextPage}
                  disabled={!pagination.totalPages || page >= pagination.totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
