/**
 * Feishu Token Service
 * Manages tenant_access_token with Redis caching
 */

import axios from 'axios';
import { config } from '../../config';
import { getRedisClient } from '../../config/redis.config';
import { logger } from '../../utils/logger';
import type { FeishuTokenResponse } from '../../models/FeishuResponse';

const TOKEN_CACHE_KEY = 'feishu:tenant_token';

export async function getTenantToken(): Promise<string> {
  try {
    // 1. Try to get from Redis cache (if available)
    try {
      const redis = await getRedisClient();
      const cachedToken = await redis.get(TOKEN_CACHE_KEY);

      if (cachedToken) {
        logger.debug('Using cached tenant token');
        return cachedToken;
      }
    } catch (redisError) {
      // Redis not available, continue without cache
      logger.debug('Redis not available, fetching token without cache');
    }

    // 2. Fetch new token from Feishu API
    logger.info('Fetching new tenant token from Feishu API');
    const response = await axios.post<FeishuTokenResponse>(
      `${config.feishu.baseUrl}${config.feishu.tokenEndpoint}`,
      {
        app_id: config.feishu.appId,
        app_secret: config.feishu.appSecret,
      },
      {
        timeout: config.feishu.timeout,
      }
    );

    if (response.data.code !== 0) {
      throw new Error(`Feishu API error: ${response.data.msg}`);
    }

    const { tenant_access_token } = response.data;

    // 3. Cache token with TTL (7200s - 300s = 6900s) if Redis is available
    try {
      const redis = await getRedisClient();
      await redis.setEx(
        TOKEN_CACHE_KEY,
        config.feishu.tokenTTL,
        tenant_access_token
      );
      logger.info('Tenant token cached successfully');
    } catch (redisError) {
      // Redis not available, continue without caching
      logger.debug('Redis not available, token not cached');
    }

    return tenant_access_token;
  } catch (error) {
    logger.error('Failed to get tenant token', error);
    throw error;
  }
}

export async function clearTokenCache(): Promise<void> {
  try {
    const redis = await getRedisClient();
    await redis.del(TOKEN_CACHE_KEY);
    logger.info('Token cache cleared');
  } catch (error) {
    logger.error('Failed to clear token cache', error);
  }
}
