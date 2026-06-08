import { Redis } from '@upstash/redis';

// ============ UPSTASH REDIS CLIENT SETUP ============

let redisClient: Redis | null = null;

export const initRedis = async () => {
  if (redisClient) {
    return redisClient;
  }

  try {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      console.warn('⚠️ Upstash Redis credentials not configured. Caching disabled.');
      console.warn('   Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to .env.local');
      return null;
    }

    redisClient = new Redis({
      url,
      token,
    });

    // Test connection
    try {
      await redisClient.ping();
      console.log('✅ Upstash Redis connected successfully');
    } catch (error) {
      console.error('❌ Upstash Redis connection test failed:', error);
      console.error('   Check your URL and TOKEN in .env.local');
      redisClient = null;
      return null;
    }

    return redisClient;
  } catch (error) {
    console.error('❌ Upstash Redis initialization error:', error);
    return null;
  }
};

export const getRedis = async () => {
  if (!redisClient) {
    return await initRedis();
  }
  return redisClient;
};

// Upstash doesn't require explicit close (REST API)
export const closeRedis = async () => {
  redisClient = null;
  console.log('✅ Redis client cleared');
};

export default redisClient;