/**
 * Instance Lookup Routes
 * API endpoints for finding instance codes by serial numbers
 */

import { Router, Request, Response } from 'express';
import { findInstanceBySerialNumber } from '../services/feishu/instance-lookup.service';
import { logger } from '../utils/logger';
import { authService } from '../services/auth/system-auth.service';

const router = Router();

/**
 * Find instance code by serial number
 * GET /api/lookup/instance/:serialNumber
 */
router.get('/instance/:serialNumber', async (req: Request, res: Response) => {
  try {
    // Extract and validate auth headers
    const { systemName, systemKey } = authService.extractAuthHeaders(
      req.headers
    );

    if (!systemName || !systemKey) {
      return res.status(401).json({
        success: false,
        error: 'Missing authentication headers (x-system-name, x-system-key)',
      });
    }

    // Validate system credentials
    const authResult = authService.validateSystem(systemName, systemKey);
    if (!authResult.authenticated) {
      return res.status(401).json({
        success: false,
        error: authResult.error,
      });
    }

    const { serialNumber } = req.params;
    const { approval_code } = req.query;

    if (!serialNumber) {
      return res.status(400).json({
        success: false,
        error: 'Serial number is required',
      });
    }

    logger.info(`Looking up instance for serial number: ${serialNumber}`, {
      requestedBy: authResult.systemName,
      approvalCode: approval_code || 'not provided',
    });

    const instanceCode = await findInstanceBySerialNumber(
      serialNumber,
      typeof approval_code === 'string' ? approval_code : undefined
    );

    if (instanceCode) {
      res.json({
        success: true,
        data: {
          serialNumber,
          instanceCode,
          approvalCode: approval_code || null,
        },
      });
    } else {
      res.status(404).json({
        success: false,
        error: `审批单号 ${serialNumber} 对应的实例未找到`,
        info: {
          serialNumber,
          approvalCode: approval_code || null,
          suggestions: [
            '确认审批单号是否正确',
            '如果知道审批定义代码，请通过 approval_code 参数提供',
            '检查审批流程是否在过去60天内创建',
          ],
        },
      });
    }
  } catch (error) {
    logger.error('Instance lookup error:', error);

    const errorMessage = error instanceof Error ? error.message : '查询失败';
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
});

/**
 * Find multiple instance codes by serial numbers
 * POST /api/lookup/instances
 * Body: { serialNumbers: string[] }
 */
router.post('/instances', async (req: Request, res: Response) => {
  try {
    // Extract and validate auth headers
    const { systemName, systemKey } = authService.extractAuthHeaders(
      req.headers
    );

    if (!systemName || !systemKey) {
      return res.status(401).json({
        success: false,
        error: 'Missing authentication headers (x-system-name, x-system-key)',
      });
    }

    // Validate system credentials
    const authResult = authService.validateSystem(systemName, systemKey);
    if (!authResult.authenticated) {
      return res.status(401).json({
        success: false,
        error: authResult.error,
      });
    }

    const { serialNumbers } = req.body;

    if (!Array.isArray(serialNumbers) || serialNumbers.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'serialNumbers array is required and cannot be empty',
      });
    }

    if (serialNumbers.length > 50) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 50 serial numbers allowed per request',
      });
    }

    logger.info(
      `Looking up instances for ${serialNumbers.length} serial numbers`,
      {
        requestedBy: authResult.systemName,
        serialNumbers,
      }
    );

    // For now, process serially to avoid overwhelming the API
    const results: Record<string, string | null> = {};

    for (const serialNumber of serialNumbers) {
      try {
        const instanceCode = await findInstanceBySerialNumber(serialNumber);
        results[serialNumber] = instanceCode;
      } catch (error) {
        logger.error(`Failed to lookup ${serialNumber}:`, error);
        results[serialNumber] = null;
      }
    }

    const found = Object.values(results).filter(code => code !== null).length;
    const notFound = serialNumbers.length - found;

    res.json({
      success: true,
      data: {
        results,
        summary: {
          total: serialNumbers.length,
          found,
          notFound,
        },
      },
    });
  } catch (error) {
    logger.error('Batch instance lookup error:', error);

    const errorMessage =
      error instanceof Error ? error.message : '批量查询失败';
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
});

export default router;
