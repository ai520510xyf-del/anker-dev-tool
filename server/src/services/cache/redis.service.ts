/**
 * Redis Cache Service
 */

import { getRedisClient } from '../../config/redis.config';
import { logger } from '../../utils/logger';

export class RedisCacheService {
  async get<T>(key: string): Promise<T | null> {
    try {
      const redis = await getRedisClient();
      const value = await redis.get(key);

      if (!value) {
        return null;
      }

      return JSON.parse(value) as T;
    } catch (error) {
      logger.error(`Failed to get cache key: ${key}`, error);
      return null;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const redis = await getRedisClient();
      const serialized = JSON.stringify(value);

      if (ttl) {
        await redis.setEx(key, ttl, serialized);
      } else {
        await redis.set(key, serialized);
      }

      logger.debug(`Cache set: ${key} (TTL: ${ttl || 'none'})`);
    } catch (error) {
      logger.error(`Failed to set cache key: ${key}`, error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      const redis = await getRedisClient();
      await redis.del(key);
      logger.debug(`Cache deleted: ${key}`);
    } catch (error) {
      logger.error(`Failed to delete cache key: ${key}`, error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const redis = await getRedisClient();
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Failed to check cache key: ${key}`, error);
      return false;
    }
  }
}

// Cache key generators
export const CACHE_KEYS = {
  approval: (instanceId: string) => `approval:${instanceId}`,
  token: () => 'feishu:tenant_token',
};

// Cache TTL strategies (seconds)
export const CACHE_TTL = {
  APPROVED: 3600, // 1 hour
  REJECTED: 3600, // 1 hour
  CANCELED: 3600, // 1 hour
  PENDING: 0, // No cache
};

export const cacheService = new RedisCacheService();
