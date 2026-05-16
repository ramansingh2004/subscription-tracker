import { lazy, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useCallback, useRef, useState, useEffect } from 'react';

//CODE SPLITTING WITH DYNAMIC IMPORT 

// Lazy load analytics page (only when user navigates to it)
export const AnalyticsPage = dynamic(
  () => import('@/app/(dashboard)/analytics/page'),
  {
    loading: () => <SkeletonLoader />,
    ssr: true,
  }
);

// Lazy load settings page
export const SettingsPage = dynamic(
  () => import('@/app/(dashboard)/settings/page'),
  {
    loading: () => <SkeletonLoader />,
    ssr: true,
  }
);

// Lazy load subscription form
export const SubscriptionForm = dynamic(
  () => import('@/components/subscriptions/SubscriptionForm').then((mod) => mod.SubscriptionForm),
  {
    loading: () => <div>Loading form...</div>,
    ssr: false,
  }
);

// Lazy load heavy chart component
export const SpendingChart = dynamic(
  () => import('@/components/analytics/SpendingChart').then((mod) => mod.SpendingChart),
  {
    loading: () => <SkeletonLoader height="300px" />,
    ssr: false,
  }
);

// IMAGE LAZY LOADING 

import Image from 'next/image';

interface LazyImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
}) => {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading="lazy"
      quality={75}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  );
};

// SKELETON LOADERS

interface SkeletonLoaderProps {
  count?: number;
  height?: string;
  width?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  count = 1,
  height = '16px',
  width = '100%',
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            height,
            width,
            backgroundColor: 'var(--color-background-secondary)',
            borderRadius: '8px',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }}
        />
      ))}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};

// SUSPENSE BOUNDARY

interface SuspenseBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const SuspenseBoundary: React.FC<SuspenseBoundaryProps> = ({
  children,
  fallback = <SkeletonLoader count={3} />,
}) => {
  return <Suspense fallback={fallback}>{children}</Suspense>;
};

// INTERSECTION OBSERVER FOR LAZY LOADING 

export const useIntersectionObserver = (
  ref: React.RefObject<HTMLElement>
): boolean => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(ref.current!);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(ref.current);

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref]);

  return isVisible;
};

// VIRTUAL LIST (For rendering 1000+ items)

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  containerHeight: number;
}

export const VirtualList = <T extends { _id: string }>({
  items,
  itemHeight,
  renderItem,
  containerHeight,
}: VirtualListProps<T>): React.ReactElement => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.ceil((scrollTop + containerHeight) / itemHeight);
  const visibleItems = items.slice(
    startIndex,
    Math.min(endIndex + 1, items.length)
  );
  const offsetY = startIndex * itemHeight;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{
        height: containerHeight,
        overflow: 'auto',
        border: '1px solid var(--color-border-tertiary)',
        borderRadius: '8px',
      }}
    >
      {/* Spacer for items above viewport */}
      <div style={{ height: offsetY }} />

      {/* Visible items */}
      <div>
        {visibleItems.map((item, i) => (
          <div
            key={item._id}
            style={{
              height: itemHeight,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {renderItem(item, startIndex + i)}
          </div>
        ))}
      </div>

      {/* Spacer for items below viewport */}
      <div
        style={{
          height: Math.max(
            0,
            (items.length - endIndex - 1) * itemHeight
          ),
        }}
      />
    </div>
  );
};

// DEBOUNCED SEARCH

interface UseDebouncedSearchResult<T> {
  results: T[];
  loading: boolean;
  search: (query: string) => void;
}

export const useDebouncedSearch = <T,>(
  searchFn: (query: string) => Promise<T[]>,
  delay: number = 300
): UseDebouncedSearchResult<T> => {
  const [results, setResults] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const search = useCallback(
    (query: string) => {
      setLoading(true);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(async () => {
        const res = await searchFn(query);
        setResults(res);
        setLoading(false);
      }, delay);
    },
    [searchFn, delay]
  );

  return { results, loading, search };
};

// PREFETCH ON HOVER

interface UsePrefetchResult {
  onMouseEnter: () => void;
}

export const usePrefetch = (
  prefetchFn: () => void
): UsePrefetchResult => {
  const [isPrefetching, setIsPrefetching] = useState(false);

  const onMouseEnter = useCallback(() => {
    if (!isPrefetching) {
      setIsPrefetching(true);
      prefetchFn();
    }
  }, [isPrefetching, prefetchFn]);

  return { onMouseEnter };
};
