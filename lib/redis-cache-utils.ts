import { getRedis } from '@/lib/redis-client-upstash';

// ============ CACHE KEY GENERATOR ============

export const cacheKeys = {
  // User data
  userProfile: (userId: string) => `user:profile:${userId}`,
  userSettings: (userId: string) => `user:settings:${userId}`,

  // Subscriptions
  subscriptionsList: (userId: string, page: number, limit: number) =>
    `subscriptions:list:${userId}:${page}:${limit}`,
  subscriptionDetail: (subscriptionId: string) =>
    `subscription:${subscriptionId}`,
  userSubscriptions: (userId: string) => `subscriptions:${userId}`,

  // Analytics
  analyticsSummary: (userId: string) => `analytics:summary:${userId}`,
  categoryBreakdown: (userId: string) => `analytics:categories:${userId}`,

  // Notifications
  notifications: (userId: string) => `notifications:${userId}`,
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

// ============ CACHE GET/SET FUNCTIONS ============

/**
 * Get value from cache
 * Returns null if key doesn't exist or error occurs
 */
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

/**
 * Set value in cache with TTL
 * Returns true on success, false on failure
 */
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

/**
 * Delete cache key
 */
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

/**
 * Delete multiple cache keys by pattern
 * Example: deletePatternCache("subscriptions:*")
 */
export const deletePatternCache = async (pattern: string): Promise<number> => {
  try {
    const redis = await getRedis();
    if (!redis) return 0;

    const keys = await redis.keys(pattern);
    if (keys.length === 0) return 0;

    const deleted = await redis.del(keys.toString());
    console.log(`✅ Cache DELETED ${deleted} keys matching: ${pattern}`);
    return deleted;
  } catch (error) {
    console.error(`Error deleting cache pattern ${pattern}:`, error);
    return 0;
  }
};

/**
 * Clear all user-related caches
 */
export const clearUserCache = async (userId: string): Promise<void> => {
  try {
    await Promise.all([
      deleteCache(cacheKeys.userProfile(userId)),
      deleteCache(cacheKeys.userSettings(userId)),
      deletePatternCache(`subscriptions:list:${userId}:*`),
      deleteCache(cacheKeys.userSubscriptions(userId)),
      deleteCache(cacheKeys.analyticsSummary(userId)),
      deleteCache(cacheKeys.categoryBreakdown(userId)),
      deleteCache(cacheKeys.notifications(userId)),
      deleteCache(cacheKeys.notificationCount(userId)),
    ]);
    console.log(`✅ Cleared all caches for user: ${userId}`);
  } catch (error) {
    console.error(`Error clearing user cache for ${userId}:`, error);
  }
};

/**
 * Clear all subscription-related caches for a user
 */
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

// ============ CACHE WARMING ============

/**
 * Warm cache by preloading frequently accessed data
 * Call this when user logs in or periodically
 */
export const warmCache = async (userId: string): Promise<void> => {
  try {
    console.log(`🔥 Warming cache for user: ${userId}`);

    // Import functions that fetch data
    // This would be called after user logs in
    // Example: await warmUserCache(userId);

    console.log(`✅ Cache warming complete for user: ${userId}`);
  } catch (error) {
    console.error(`Error warming cache for user ${userId}:`, error);
  }
};

// ============ CACHE STATISTICS ============

/**
 * Get cache statistics
 */
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


/**
 * Monitor cache performance
 */
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