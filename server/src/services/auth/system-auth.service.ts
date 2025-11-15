/**
 * System Authentication Service
 */

import { getTrustedSystem } from '../../config/trusted-systems';
import { logger } from '../../utils/logger';

export interface AuthResult {
  authenticated: boolean;
  systemName?: string;
  error?: string;
}

export class SystemAuthService {
  /**
   * Validate system credentials
   */
  validateSystem(systemName: string, systemKey: string): AuthResult {
    try {
      // Check if system exists and is enabled
      const trustedSystem = getTrustedSystem(systemName);

      if (!trustedSystem) {
        logger.warn(
          `Authentication failed: Unknown or disabled system: ${systemName}`
        );
        return {
          authenticated: false,
          error: 'Unknown or disabled system',
        };
      }

      // Validate system key
      if (trustedSystem.system_key !== systemKey) {
        logger.warn(
          `Authentication failed: Invalid key for system: ${systemName}`
        );
        return {
          authenticated: false,
          error: 'Invalid system key',
        };
      }

      logger.info(`System authenticated: ${systemName}`);
      return {
        authenticated: true,
        systemName: trustedSystem.system_name,
      };
    } catch (error) {
      logger.error('System authentication error', error);
      return {
        authenticated: false,
        error: 'Authentication service error',
      };
    }
  }

  /**
   * Extract and validate auth headers
   */
  extractAuthHeaders(headers: Record<string, string | string[] | undefined>): {
    systemName: string | null;
    systemKey: string | null;
  } {
    const systemName = headers['x-system-name'];
    const systemKey = headers['x-system-key'];

    return {
      systemName: typeof systemName === 'string' ? systemName : null,
      systemKey: typeof systemKey === 'string' ? systemKey : null,
    };
  }
}

export const authService = new SystemAuthService();
