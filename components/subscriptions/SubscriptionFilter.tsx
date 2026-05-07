'use client';

import { useState } from 'react';

interface Props {
  onCategoryChange?: (category: string | null) => void;
  onStatusChange?: (status: string | null) => void;
  onSearchChange?: (search: string) => void;
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

const STATUSES = ['active', 'paused', 'cancelled'];

export function SubscriptionFilter({
  onCategoryChange,
  onStatusChange,
  onSearchChange,
}: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
    onCategoryChange?.(category);
  };

  const handleStatusChange = (status: string | null) => {
    setSelectedStatus(status);
    onStatusChange?.(status);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onSearchChange?.(value);
  };

  const handleReset = () => {
    setSelectedCategory(null);
    setSelectedStatus(null);
    setSearchTerm('');
    onCategoryChange?.(null);
    onStatusChange?.(null);
    onSearchChange?.('');
  };

  const hasActiveFilters =
    selectedCategory || selectedStatus || searchTerm;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Mobile Toggle */}
      <div className="md:hidden mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex justify-between items-center px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
        >
          <span className="font-medium text-gray-900">
            Filters {hasActiveFilters && `(${(selectedCategory ? 1 : 0) + (selectedStatus ? 1 : 0)})`}
          </span>
          <span className="text-gray-600">
            {isExpanded ? '▼' : '▶'}
          </span>
        </button>
      </div>

      {/* Filter Controls */}
      <div
        className={`space-y-6 ${
          isExpanded ? 'block' : 'hidden md:block'
        }`}
      >
        {/* Search Bar */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search by Name
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search subscriptions..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Category
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {/* All option */}
            <button
              onClick={() => handleCategoryChange(null)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                selectedCategory === null
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
                onClick={() =>
                  handleCategoryChange(
                    selectedCategory === category ? null : category
                  )
                }
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Status
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {/* All option */}
            <button
              onClick={() => handleStatusChange(null)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                selectedStatus === null
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>

            {/* Status options */}
            {STATUSES.map((status) => (
              <button
                key={status}
                onClick={() =>
                  handleStatusChange(selectedStatus === status ? null : status)
                }
                className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition ${
                  selectedStatus === status
                    ? 'bg-blue-600 text-white'
                    : status === 'active'
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : status === 'paused'
                    ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Reset Button */}
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition"
          >
            Clear All Filters
          </button>
        )}
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-3">Active Filters:</p>
          <div className="flex flex-wrap gap-2">
            {selectedCategory && (
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                <span>Category: {selectedCategory}</span>
                <button
                  onClick={() => handleCategoryChange(null)}
                  className="font-bold hover:text-blue-900"
                >
                  ×
                </button>
              </div>
            )}
            {selectedStatus && (
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm capitalize">
                <span>Status: {selectedStatus}</span>
                <button
                  onClick={() => handleStatusChange(null)}
                  className="font-bold hover:text-blue-900"
                >
                  ×
                </button>
              </div>
            )}
            {searchTerm && (
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                <span>Search: "{searchTerm}"</span>
                <button
                  onClick={() => handleSearchChange('')}
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
