import { useState, useCallback } from 'react';
import apiClient from '@/lib/api-client';
import { PaginationState, PaginationResponse } from '@/typesDefined';

// OFFSET-BASED PAGINATION

export const usePagination = <T>(initialLimit: number = 10) => {
  const [state, setState] = useState<PaginationState>({
    page: 1,
    limit: initialLimit,
    total: 0,
    hasMore: true,
  });

  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPage = useCallback(
    async (pageNum: number) => {
      setLoading(true);
      setError(null);

      try {
        const res = await apiClient.get<PaginationResponse<T>>(
          '/subscriptions',
          {
            params: {
              page: pageNum,
              limit: state.limit,
            },
          }
        );

        const { data: items, pagination } = res.data;

        setData(items);
        setState({
          page: pagination.page,
          limit: pagination.limit,
          total: pagination.total,
          hasMore: pagination.page < pagination.totalPages,
        });
      } catch (err: any) {
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    },
    [state.limit]
  );

  const goToPage = useCallback((pageNum: number) => {
    if (pageNum >= 1) {
      fetchPage(pageNum);
    }
  }, [fetchPage]);

  const nextPage = useCallback(() => {
    goToPage(state.page + 1);
  }, [state.page, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(Math.max(1, state.page - 1));
  }, [state.page, goToPage]);

  const changeLimit = useCallback((newLimit: number) => {
    setState(prev => ({ ...prev, limit: newLimit }));
    fetchPage(1);
  }, [fetchPage]);

  return {
    data,
    ...state,
    loading,
    error,
    goToPage,
    nextPage,
    prevPage,
    changeLimit,
  };
};

// CURSOR-BASED PAGINATION (Better for large datasets)

interface CursorPaginationState<T> {
  items: T[];
  cursor: string | null;
  hasMore: boolean;
  loading: boolean;
  error: string | null;
}

export const useCursorPagination = <T extends { _id: string }>(
  limit: number = 10
) => {
  const [state, setState] = useState<CursorPaginationState<T>>({
    items: [],
    cursor: null,
    hasMore: true,
    loading: false,
    error: null,
  });

  const fetchInitial = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const res = await apiClient.get('/subscriptions', {
        params: { limit },
      });

      const items = res.data.data;
      const lastId = items.length > 0 ? items[items.length - 1]._id : null;

      setState({
        items,
        cursor: lastId,
        hasMore: items.length === limit,
        loading: false,
        error: null,
      });
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err.message || 'Failed to fetch data',
      }));
    }
  }, [limit]);

  const fetchMore = useCallback(async () => {
    if (!state.hasMore || state.loading) return;

    setState(prev => ({ ...prev, loading: true }));

    try {
      const res = await apiClient.get('/subscriptions', {
        params: {
          cursor: state.cursor,
          limit,
        },
      });

      const newItems = res.data.data;
      const newCursor =
        newItems.length > 0 ? newItems[newItems.length - 1]._id : null;

      setState(prev => ({
        items: [...prev.items, ...newItems],
        cursor: newCursor,
        hasMore: newItems.length === limit,
        loading: false,
        error: null,
      }));
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err.message || 'Failed to fetch more',
      }));
    }
  }, [state.cursor, state.hasMore, state.loading, limit]);

  const reset = useCallback(() => {
    setState({
      items: [],
      cursor: null,
      hasMore: true,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    fetchInitial,
    fetchMore,
    reset,
  };
};

// INFINITE SCROLL HOOK

export const useInfiniteScroll = <T extends { _id: string }>(
  limit: number = 10
) => {
  const {
    items,
    cursor,
    hasMore,
    loading,
    error,
    fetchInitial,
    fetchMore,
    reset,
  } = useCursorPagination<T>(limit);

  const handleScroll = useCallback(
    (e: Event) => {
      const element = e.target as HTMLElement;
      const isNearBottom =
        element.scrollHeight - element.scrollTop - element.clientHeight < 200;

      if (isNearBottom && hasMore && !loading) {
        fetchMore();
      }
    },
    [hasMore, loading, fetchMore]
  );

  return {
    items,
    hasMore,
    loading,
    error,
    cursor,
    fetchInitial,
    fetchMore,
    reset,
    handleScroll,
  };
};