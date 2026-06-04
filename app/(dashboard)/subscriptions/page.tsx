'use client';

import { useState, useEffect, useRef } from 'react';
import { useSubscriptions, prefetchSubscriptionsPage } from '@/lib/hooks/queries.hook';
import { SkeletonLoader, usePrefetch } from '@/lib/hooks/lazy-loading.hook';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';

interface Subscription {
  _id: string;
  name: string;
  category: string;
  cost: number;
  currency: string;
  billingCycle: string;
  nextRenewalDate: string;
  autoRenew: boolean;
  website?: string;
}

interface SubscriptionsResponse {
  data: Subscription[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

const CATEGORIES = [
  'All',
  'Entertainment',
  'Productivity',
  'Cloud Storage',
  'Utilities',
  'Developer Tools',
  'Health & Fitness',
  'Education',
  'Other',
];

export default function SubscriptionsPage() {
  const queryClient = useQueryClient();

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Filter state
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 when searching
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Fetch subscriptions with React Query
  const { data, isLoading, error, refetch } = useSubscriptions({
    page,
    limit,
    category,
    sortBy,
    sortOrder,
    search: debouncedSearch,
  });

  // Type the data properly
  const subscriptions: Subscription[] = data?.data || [];
  const pagination = data?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasMore: false,
  };

  // Prefetch next page on hover
  const nextPageRef = useRef<HTMLButtonElement>(null);
  const { onMouseEnter: onNextPageHover } = usePrefetch(() => {
    if (pagination.totalPages && page < pagination.totalPages) {
      prefetchSubscriptionsPage(queryClient, {
        page: page + 1,
        limit,
        category,
        sortBy,
        sortOrder,
        search: debouncedSearch,
      });
    }
  });

  // Prefetch previous page
  const prevPageRef = useRef<HTMLButtonElement>(null);
  const { onMouseEnter: onPrevPageHover } = usePrefetch(() => {
    if (page > 1) {
      prefetchSubscriptionsPage(queryClient, {
        page: page - 1,
        limit,
        category,
        sortBy,
        sortOrder,
        search: debouncedSearch,
      });
    }
  });

  const handleNextPage = () => {
    if (pagination.hasMore) {
      setPage(page + 1);
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

  const handleSortChange = (newSortBy: string) => {
    if (newSortBy === sortBy) {
      // Toggle sort order if clicking same column
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, default to descending
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
    setPage(1); // Reset to page 1
  };

  // Calculate total monthly cost
  const totalMonthlyCost = subscriptions.reduce((sum, sub) => {
    const monthlyCost =
      sub.billingCycle === 'yearly'
        ? sub.cost / 12
        : sub.billingCycle === 'quarterly'
          ? sub.cost / 3
          : sub.cost;
    return sum + monthlyCost;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Subscriptions</h1>
          <p className="text-gray-600 mt-1">
            {pagination.total} total • ${totalMonthlyCost.toFixed(2)}/month
          </p>
        </div>
        <Link
          href="/subscriptions/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          + Add Subscription
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-300 p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, website..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="createdAt">Date Added</option>
              <option value="name">Name</option>
              <option value="cost">Cost</option>
              <option value="nextRenewalDate">Renewal Date</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-3">
          <SkeletonLoader count={5} height="100px" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center justify-between">
          <span>Failed to load subscriptions. Please try again.</span>
          <button
            onClick={() => refetch()}
            className="text-red-700 hover:text-red-900 font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && subscriptions.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-300">
          <p className="text-gray-500 text-lg mb-4">No subscriptions found</p>
          <Link
            href="/subscriptions/new"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Add your first subscription
          </Link>
        </div>
      )}

      {/* Subscriptions Table */}
      {!isLoading && subscriptions.length > 0 && (
        <>
          <div className="overflow-x-auto bg-white rounded-lg border border-gray-300">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-300">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    Cost
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    Cycle
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    Renewal
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub) => {
                  const renewalDate = new Date(sub.nextRenewalDate);
                  const isUpcomingSoon =
                    renewalDate.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;

                  return (
                    <tr
                      key={sub._id}
                      className="border-b border-gray-300 hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {sub.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                          {sub.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {sub.currency} {sub.cost}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                        {sub.billingCycle}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`${
                            isUpcomingSoon
                              ? 'bg-amber-50 text-amber-700'
                              : 'text-gray-600'
                          } px-2 py-1 rounded`}
                        >
                          {renewalDate.toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Link
                          href={`/subscriptions/${sub._id}`}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
              </select>

              {/* Page buttons */}
              <div className="flex gap-2 items-center">
                <button
                  ref={prevPageRef}
                  onMouseEnter={onPrevPageHover}
                  onClick={handlePrevPage}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium"
                >
                  Previous
                </button>

                {/* Page indicator */}
                <div className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm">
                  <span className="font-medium">{page}</span> /{' '}
                  <span>{pagination.totalPages}</span>
                </div>

                {/* Next button with prefetch */}
                <button
                  ref={nextPageRef}
                  onMouseEnter={onNextPageHover}
                  onClick={handleNextPage}
                  disabled={!pagination.hasMore}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium"
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
