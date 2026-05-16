'use client';

import { Dispatch, SetStateAction, useState } from 'react';

export interface FilterState {
  category: string;
  sortBy: string;
  sortOrder: string;
}

interface Props {
  filters: FilterState;
  onFilterChange: Dispatch<SetStateAction<FilterState>>;
}

const CATEGORIES = [
  'Streaming',
  'Software',
  'Productivity',
  'Entertainment',
  'Education',
  'Health',
  'Other',
];

export function SubscriptionFilter({ filters, onFilterChange }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCategoryChange = (category: string) => {
    onFilterChange((prev) => ({
      ...prev,
      category: prev.category === category ? '' : category,
    }));
  };

  const handleReset = () => {
    onFilterChange({
      category: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

  const hasActiveFilters = filters.category !== '';

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Mobile Toggle */}
      <div className="md:hidden mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex justify-between items-center px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
        >
          <span className="font-medium text-gray-900">
            Filters & Sorting {hasActiveFilters ? '(1)' : ''}
          </span>
          <span className="text-gray-600">{isExpanded ? '▼' : '▶'}</span>
        </button>
      </div>

      {/* Filter Controls */}
      <div className={`space-y-6 ${isExpanded ? 'block' : 'hidden md:block'}`}>
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Category
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {/* All option */}
            <button
              onClick={() => onFilterChange((prev) => ({ ...prev, category: '' }))}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                filters.category === ''
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>

            {/* Category options */}
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  filters.category === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) =>
                onFilterChange((prev) => ({ ...prev, sortBy: e.target.value }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="createdAt">Date Added</option>
              <option value="name">Name</option>
              <option value="cost">Cost</option>
              <option value="nextRenewalDate">Next Renewal Date</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Order
            </label>
            <select
              value={filters.sortOrder}
              onChange={(e) =>
                onFilterChange((prev) => ({ ...prev, sortOrder: e.target.value }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>

        {/* Reset Button */}
        {(hasActiveFilters || filters.sortBy !== 'createdAt' || filters.sortOrder !== 'desc') && (
          <button
            onClick={handleReset}
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition"
          >
            Reset Filters & Sort
          </button>
        )}
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-3">Active Filters:</p>
          <div className="flex flex-wrap gap-2">
            {filters.category && (
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                <span>Category: {filters.category}</span>
                <button
                  onClick={() => onFilterChange((prev) => ({ ...prev, category: '' }))}
                  className="font-bold hover:text-blue-900"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
