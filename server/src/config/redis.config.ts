/**
 * Redis Configuration
 */

import { createClient } from 'redis';
import { config } from './index';
import { logger } from '../utils/logger';

export type RedisClient = ReturnType<typeof createClient>;

let redisClient: RedisClient | null = null;

export async function getRedisClient(): Promise<RedisClient> {
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  redisClient = createClient({
    socket: {
      host: config.redis.host,
      port: config.redis.port,
      connectTimeout: 3000, // 3 seconds timeout
      reconnectStrategy: false, // Don't reconnect automatically on startup
    },
    password: config.redis.password,
    database: config.redis.db,
  });

  redisClient.on('error', err => {
    // Suppress error logs during startup
  });

  redisClient.on('connect', () => {
    logger.info('Redis Client Connected');
  });

  await redisClient.connect();

  return redisClient;
}

export async function closeRedisClient(): Promise<void> {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit();
    redisClient = null;
  }
}
