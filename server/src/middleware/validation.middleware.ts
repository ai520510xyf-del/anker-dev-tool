/**
 * Validation Middleware
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import type { ApiResponse } from '../types/ProcessedData';

/**
 * Validate instance ID parameter
 */
export function validateInstanceId(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { instanceId } = req.params;

  if (!instanceId || typeof instanceId !== 'string') {
    logger.warn('Validation failed: Missing or invalid instanceId', {
      instanceId,
      path: req.path,
    });

    const response: ApiResponse = {
      success: false,
      data: null,
      error: {
        message: 'Invalid request: instanceId is required',
        code: '400',
      },
      timestamp: Date.now(),
    };

    res.status(400).json(response);
    return;
  }

  // Validate instanceId format (alphanumeric with hyphens/underscores)
  const instanceIdPattern = /^[a-zA-Z0-9_-]+$/;
  if (!instanceIdPattern.test(instanceId)) {
    logger.warn('Validation failed: Invalid instanceId format', {
      instanceId,
      path: req.path,
    });

    const response: ApiResponse = {
      success: false,
      data: null,
      error: {
        message: 'Invalid instanceId format',
        code: '400',
      },
      timestamp: Date.now(),
    };

    res.status(400).json(response);
    return;
  }

  logger.debug('Validation passed', { instanceId });
  next();
}
