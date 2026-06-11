'use client';

import { Suspense } from 'react';
import ExtensionInsights from '@/components/extension/ExtensionInsights';

function ExtensionSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div>
        <div className="h-9 bg-gray-200 rounded w-1/3 mb-3"></div>
        <div className="h-5 bg-gray-100 rounded w-1/2"></div>
      </div>

      {/* Filter Buttons Skeleton */}
      <div className="flex gap-2 flex-wrap">
        <div className="h-10 bg-gray-200 rounded w-24"></div>
        <div className="h-10 bg-gray-100 rounded w-24"></div>
        <div className="h-10 bg-gray-100 rounded w-24"></div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg border border-gray-300 shadow-sm">
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-3"></div>
            <div className="h-3 bg-gray-100 rounded w-3/4"></div>
          </div>
        ))}
      </div>

      {/* Top Domains Table Skeleton */}
      <div className="bg-white p-6 rounded-lg border border-gray-300 shadow-sm">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>

        {/* Table Header */}
        <div className="grid grid-cols-3 gap-4 p-4 border-b border-gray-300 bg-gray-50 mb-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded"></div>
          ))}
        </div>

        {/* Table Rows */}
        {[...Array(5)].map((_, i) => (
          <div key={i} className="grid grid-cols-3 gap-4 p-4 border-b border-gray-100">
            {[...Array(3)].map((_, j) => (
              <div key={j} className="h-4 bg-gray-100 rounded"></div>
            ))}
          </div>
        ))}
      </div>

      {/* Paywalls & Ads Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg border border-gray-300 shadow-sm">
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="space-y-2">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="h-10 bg-gray-100 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ExtensionPage() {
  return (
    <Suspense fallback={<ExtensionSkeleton />}>
      <ExtensionInsights />
    </Suspense>
  );
}