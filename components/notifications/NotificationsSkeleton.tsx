'use client';

export default function NotificationsSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <div className="h-9 bg-gray-200 rounded w-1/4 mb-3"></div>
          <div className="h-4 bg-gray-100 rounded w-1/2"></div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={`h-10 rounded-lg w-24 ${
              i === 0 ? 'bg-blue-200' : 'bg-gray-100'
            }`}
          ></div>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`p-4 rounded-lg border-l-4 ${
              i % 2 === 0 ? 'bg-blue-50 border-blue-600' : 'bg-gray-50 border-gray-300'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1 space-y-2">
                {/* Title and Badge */}
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-6 bg-blue-200 rounded w-16"></div>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                </div>

                {/* Timestamp */}
                <div className="h-3 bg-gray-100 rounded w-1/4"></div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 ml-4">
                <div className="h-8 bg-blue-200 rounded w-20"></div>
                <div className="h-8 bg-red-200 rounded w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Skeleton */}
      <div className="flex justify-center">
        <div className="h-10 bg-gray-200 rounded w-32"></div>
      </div>
    </div>
  );
}