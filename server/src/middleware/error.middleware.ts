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

  // Prepare error response
  const response: ApiResponse = {
    code: statusCode,
    message: err.message || 'Internal server error',
    data: null,
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
    code: 404,
    message: 'Route not found',
    data: null,
  };

  res.status(404).json(response);
}
