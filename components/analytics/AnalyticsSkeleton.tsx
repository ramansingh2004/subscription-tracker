'use client';

export default function AnalyticsSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div>
        <div className="h-9 bg-gray-200 rounded w-1/4 mb-3"></div>
        <div className="h-5 bg-gray-100 rounded w-1/2"></div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg border border-gray-300 shadow-sm">
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
            <div className="h-9 bg-gray-200 rounded w-1/2 mb-3"></div>
            <div className="h-3 bg-gray-100 rounded w-2/3"></div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Spending Trend Chart */}
        <div className="bg-white p-6 rounded-lg border border-gray-300 shadow-sm">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-8 bg-gradient-to-r from-blue-200 to-blue-100 rounded w-1/3"></div>
                <div className="h-3 bg-gray-100 rounded flex-1"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown Chart */}
        <div className="bg-white p-6 rounded-lg border border-gray-300 shadow-sm">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="flex items-center justify-center">
            <div className="w-40 h-40 bg-gray-100 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Details Table */}
      <div className="bg-white p-6 rounded-lg border border-gray-300 shadow-sm">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>

        {/* Table Header */}
        <div className="grid grid-cols-5 gap-4 p-4 border-b border-gray-300 bg-gray-50 mb-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded"></div>
          ))}
        </div>

        {/* Table Rows */}
        <div className="space-y-3">
          {[...Array(6)].map((_, rowIdx) => (
            <div key={rowIdx} className="grid grid-cols-5 gap-4 p-4 border-b border-gray-100">
              {[...Array(5)].map((_, colIdx) => (
                <div key={colIdx} className="h-4 bg-gray-100 rounded"></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}