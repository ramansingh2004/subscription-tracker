import { getRedis } from '@/lib/redis-client-upstash';

interface SubscriptionListCacheParams {
  page: number;
  limit: number;
  category?: string | null;
  sortBy: string;
  sortOrder: number;
  search?: string | null;
}

// ============ CACHE KEY GENERATOR ============

export const cacheKeys = {
  // User data
  userProfile: (userId: string) => `user:profile:${userId}`,
  userSettings: (userId: string) => `user:settings:${userId}`,

  // Subscriptions
  subscriptionsList: (userId: string, params: SubscriptionListCacheParams) =>
    [
      'subscriptions:list',
      userId,
      params.page,
      params.limit,
      encodeURIComponent(params.category || 'all'),
      encodeURIComponent(params.sortBy),
      params.sortOrder,
      encodeURIComponent(params.search || ''),
    ].join(':'),
  subscriptionDetail: (subscriptionId: string) =>
    `subscription:${subscriptionId}`,
  userSubscriptions: (userId: string) => `subscriptions:${userId}`,

  // Analytics
  analyticsSummary: (userId: string) => `analytics:summary:${userId}`,
  categoryBreakdown: (userId: string) => `analytics:categories:${userId}`,

  // Notifications
  notifications: (userId: string, page: number, limit: number) =>
    `notifications:${userId}:${page}:${limit}`,
  notificationCount: (userId: string) => `notifications:unread:${userId}`,

  // Exchange rates
  exchangeRates: () => 'exchange:rates',

  // Temp session data
  tempData: (key: string) => `temp:${key}`,
};

// ============ TTL CONFIGURATION ============

export const CACHE_TTL = {
  // User data - longer TTL (30 min - 1 hour)
  USER_PROFILE: 30 * 60, // 30 minutes
  USER_SETTINGS: 30 * 60, // 30 minutes

  // Subscriptions - medium TTL (10 min)
  SUBSCRIPTIONS_LIST: 10 * 60, // 10 minutes
  SUBSCRIPTION_DETAIL: 15 * 60, // 15 minutes
  USER_SUBSCRIPTIONS: 10 * 60, // 10 minutes

  // Analytics - longer TTL (1 hour)
  ANALYTICS_SUMMARY: 60 * 60, // 1 hour
  CATEGORY_BREAKDOWN: 60 * 60, // 1 hour

  // Notifications - short TTL (5 min)
  NOTIFICATIONS: 5 * 60, // 5 minutes
  NOTIFICATION_COUNT: 5 * 60, // 5 minutes

  // Exchange rates - very long TTL (24 hours)
  EXCHANGE_RATES: 24 * 60 * 60, // 24 hours

  // Session/temp - short TTL (15 min)
  TEMP_DATA: 15 * 60, // 15 minutes
};

export const getCache = async (key: string) => {
  try {
    const redis = await getRedis();
    if (!redis) return null;

    const value = await redis.get(key);
    if (value !== null && value !== undefined) {
      console.log(`✅ Cache HIT: ${key}`);
      return value;
    }

    console.log(`❌ Cache MISS: ${key}`);
    return null;
  } catch (error) {
    console.error(`Error getting cache key ${key}:`, error);
    return null; // Fail gracefully - return null to trigger fresh fetch
  }
};

export const setCache = async (
  key: string,
  value: any,
  ttl: number = CACHE_TTL.TEMP_DATA
): Promise<boolean> => {
  try {
    const redis = await getRedis();
    if (!redis) return false;

    await redis.setex(key, ttl, value);
    console.log(`✅ Cache SET: ${key} (TTL: ${ttl}s)`);
    return true;
  } catch (error) {
    console.error(`Error setting cache key ${key}:`, error);
    return false;
  }
};

export const deleteCache = async (key: string): Promise<boolean> => {
  try {
    const redis = await getRedis();
    if (!redis) return false;

    await redis.del(key);
    console.log(`✅ Cache DELETED: ${key}`);
    return true;
  } catch (error) {
    console.error(`Error deleting cache key ${key}:`, error);
    return false;
  }
};

export const deletePatternCache = async (pattern: string): Promise<number> => {
  try {
    const redis = await getRedis();
    if (!redis) return 0;

    const keys = await redis.keys(pattern);
    if (keys.length === 0) return 0;

    const deleted = await redis.del(...keys);
    console.log(`✅ Cache DELETED ${deleted} keys matching: ${pattern}`);
    return deleted;
  } catch (error) {
    console.error(`Error deleting cache pattern ${pattern}:`, error);
    return 0;
  }
};

export const clearUserCache = async (userId: string): Promise<void> => {
  try {
    await Promise.all([
      deleteCache(cacheKeys.userProfile(userId)),
      deleteCache(cacheKeys.userSettings(userId)),
      deletePatternCache(`subscriptions:list:${userId}:*`),
      deleteCache(cacheKeys.userSubscriptions(userId)),
      deleteCache(cacheKeys.analyticsSummary(userId)),
      deleteCache(cacheKeys.categoryBreakdown(userId)),
      deletePatternCache(`notifications:${userId}:*`),
      deleteCache(cacheKeys.notificationCount(userId)),
    ]);
    console.log(`✅ Cleared all caches for user: ${userId}`);
  } catch (error) {
    console.error(`Error clearing user cache for ${userId}:`, error);
  }
};

export const clearSubscriptionCache = async (userId: string): Promise<void> => {
  try {
    await Promise.all([
      deletePatternCache(`subscriptions:list:${userId}:*`),
      deleteCache(cacheKeys.userSubscriptions(userId)),
      deleteCache(cacheKeys.analyticsSummary(userId)),
      deleteCache(cacheKeys.categoryBreakdown(userId)),
    ]);
    console.log(`✅ Cleared subscription caches for user: ${userId}`);
  } catch (error) {
    console.error(`Error clearing subscription cache for ${userId}:`, error);
  }
};

export const warmCache = async (userId: string): Promise<void> => {
  try {
    console.log(`🔥 Warming cache for user: ${userId}`);

    console.log(`✅ Cache warming complete for user: ${userId}`);
  } catch (error) {
    console.error(`Error warming cache for user ${userId}:`, error);
  }
};

export const getCacheStats = async () => {
  try {
    const redis = await getRedis();
    if (!redis) return null;

    const totalKeys = await redis.dbsize();

    return {
      totalKeys,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return null;
  }
};

export const monitorCache = async (userId: string) => {
  try {
    const redis = await getRedis();
    if (!redis) return;

    // Get all keys for user
    const userKeys = await redis.keys(`*${userId}*`);

    console.log(`📊 Cache Monitor - User: ${userId}`);
    console.log(`   Total user keys: ${userKeys.length}`);

    // Get TTL for each key
    for (const key of userKeys) {
      const ttl = await redis.ttl(key);
      console.log(`   - ${key} (TTL: ${ttl}s)`);
    }
  } catch (error) {
    console.error('Error monitoring cache:', error);
  }
};

export const clearNotificationCache = async (userId: string): Promise<void> => {
  await Promise.all([
    deletePatternCache(`notifications:${userId}:*`),
    deleteCache(cacheKeys.notificationCount(userId)),
  ]);
};
