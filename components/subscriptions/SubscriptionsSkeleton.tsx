'use client';

export default function SubscriptionsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <div className="h-9 bg-gray-200 rounded w-1/4 mb-3"></div>
          <div className="h-4 bg-gray-100 rounded w-1/3"></div>
        </div>
        <div className="h-10 bg-blue-200 rounded w-32"></div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-300 p-4 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i}>
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-10 bg-gray-100 rounded"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg border border-gray-300 animate-pulse">
        {/* Header Row */}
        <div className="grid grid-cols-6 gap-4 p-6 border-b border-gray-300 bg-gray-50">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded"></div>
          ))}
        </div>

        {/* Data Rows */}
        {[...Array(8)].map((_, rowIdx) => (
          <div key={rowIdx} className="grid grid-cols-6 gap-4 p-6 border-b border-gray-200">
            {[...Array(6)].map((_, colIdx) => (
              <div
                key={colIdx}
                className={`h-4 bg-gray-100 rounded ${
                  colIdx === 0 ? 'w-5/6' : colIdx === 5 ? 'w-2/3' : 'w-full'
                }`}
              ></div>
            ))}
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>

        <div className="flex items-center gap-4">
          {/* Items per page dropdown */}
          <div className="h-10 bg-gray-100 rounded w-32"></div>

          {/* Page buttons */}
          <div className="flex gap-2">
            <div className="h-10 bg-gray-100 rounded w-20"></div>
            <div className="h-10 bg-gray-100 rounded w-16"></div>
            <div className="h-10 bg-gray-100 rounded w-20"></div>
          </div>
        </div>
      </div>
    </div>
  );
}