/**
 * System Authentication Middleware
 */

import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth/system-auth.service';
import { logger } from '../utils/logger';

export interface AuthenticatedRequest extends Request {
  systemName?: string;
}

export function systemAuthMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    // Extract auth headers
    const { systemName, systemKey } = authService.extractAuthHeaders(
      req.headers
    );

    // Check if headers exist
    if (!systemName || !systemKey) {
      logger.warn('Authentication failed: Missing credentials', {
        ip: req.ip,
        path: req.path,
      });
      res.status(401).json({
        code: 401,
        message:
          'Missing authentication headers: x-system-name and x-system-key required',
        data: null,
      });
      return;
    }

    // Validate system credentials
    const authResult = authService.validateSystem(systemName, systemKey);

    if (!authResult.authenticated) {
      logger.warn('Authentication failed', {
        systemName,
        error: authResult.error,
        ip: req.ip,
        path: req.path,
      });
      res.status(403).json({
        code: 403,
        message: authResult.error || 'Authentication failed',
        data: null,
      });
      return;
    }

    // Attach system name to request
    req.systemName = authResult.systemName;

    logger.debug('Request authenticated', {
      systemName: authResult.systemName,
      path: req.path,
    });

    next();
  } catch (error) {
    logger.error('Authentication middleware error', error);
    res.status(500).json({
      code: 500,
      message: 'Internal authentication error',
      data: null,
    });
  }
}
