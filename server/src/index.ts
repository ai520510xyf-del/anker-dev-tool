/**
 * Express Server Entry Point
 */

import express, { Express } from 'express';
import cors from 'cors';
import { config } from './config';
import { logger } from './utils/logger';
import { getRedisClient, closeRedisClient } from './config/redis.config';
import approvalRoutes from './routes/approval.routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

const app: Express = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.debug('Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip,
  });
  next();
});

// Root endpoint - API documentation
app.get('/', (req, res) => {
  res.json({
    name: '飞书审批流程可视化 API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: 'GET /health',
      approval: 'GET /api/approval/:instanceId',
    },
    documentation: {
      frontend: 'http://localhost:5173',
      example: 'GET /api/approval/YOUR_INSTANCE_CODE',
      headers: {
        'x-system-name': 'demo',
        'x-system-key': 'demo_secret_key_000',
      },
    },
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.server.nodeEnv,
  });
});

// API routes
app.use('/api/approval', approvalRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Server startup
async function startServer(): Promise<void> {
  try {
    // Try to connect to Redis (optional)
    logger.info('Attempting to connect to Redis...');
    try {
      await getRedisClient();
      logger.info('✓ Redis connected successfully - caching enabled');
    } catch (redisError) {
      logger.warn('⚠ Redis connection failed - caching disabled', redisError);
      logger.warn(
        'Server will continue without Redis. Install and start Redis for full functionality.'
      );
    }

    // Start Express server
    const port = config.server.port;
    app.listen(port, '0.0.0.0', () => {
      logger.info(`✓ Server started on port ${port}`, {
        environment: config.server.nodeEnv,
        nodeVersion: process.version,
        url: `http://localhost:${port}`,
      });
      console.log(`\n✓ Backend server is running at http://localhost:${port}`);
      console.log(`✓ Health check: http://localhost:${port}/health\n`);
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

// Graceful shutdown
async function gracefulShutdown(signal: string): Promise<void> {
  logger.info(`Received ${signal}, shutting down gracefully...`);

  try {
    await closeRedisClient();
    logger.info('Redis connection closed');

    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown', error);
    process.exit(1);
  }
}

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
startServer();

export default app;
