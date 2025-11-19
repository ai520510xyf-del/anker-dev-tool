/**
 * Error Handling Middleware
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import type { ApiResponse } from '../types/ProcessedData';

/**
 * Global error handler
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log error details
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  // Determine status code
  const statusCode = err.statusCode || err.code || 500;

  // Prepare error response - 参照Java版本的格式
  const response: ApiResponse = {
    success: false,
    data: null,
    error: {
      message: err.message || 'Internal server error',
      code: String(statusCode),
    },
    timestamp: Date.now(),
  };

  // Send error response
  res.status(statusCode).json(response);
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  logger.warn('Route not found', {
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  const response: ApiResponse = {
    success: false,
    data: null,
    error: {
      message: 'Route not found',
      code: '404',
    },
    timestamp: Date.now(),
  };

  res.status(404).json(response);
}
