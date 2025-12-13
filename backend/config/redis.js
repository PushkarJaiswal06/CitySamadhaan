import Redis from 'ioredis';

// Check if Redis is configured
const redisUrl = process.env.UPSTASH_REDIS_URL;
const isRedisEnabled = !!redisUrl;

let redisClient = null;

if (isRedisEnabled) {
  // Upstash Redis configuration
  redisClient = new Redis(redisUrl, {
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: 3,
    tls: {}, // Enable TLS for Upstash
    enableOfflineQueue: false,
    lazyConnect: false
  });

  redisClient.on('connect', () => {
    console.log('Redis client connected');
  });

  redisClient.on('error', (err) => {
    console.error('Redis error:', err);
  });

  redisClient.on('ready', () => {
    console.log('Redis client ready');
  });
} else {
  console.log('Redis not configured - caching disabled (set UPSTASH_REDIS_URL to enable)');
}

// Helper functions - gracefully handle when Redis is disabled
export const setCache = async (key, value, expireInSeconds = 3600) => {
  if (!redisClient) return false;
  try {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    await redisClient.setex(key, expireInSeconds, stringValue);
    return true;
  } catch (error) {
    console.error('Redis set error:', error);
    return false;
  }
};

export const getCache = async (key) => {
  if (!redisClient) return null;
  try {
    const data = await redisClient.get(key);
    if (!data) return null;
    
    // Try to parse as JSON, return as string if it fails
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
};

export const deleteCache = async (key) => {
  if (!redisClient) return false;
  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error('Redis delete error:', error);
    return false;
  }
};

export default redisClient;
