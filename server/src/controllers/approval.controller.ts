/**
 * Approval Controller
 * Orchestrates approval data fetching, caching, and processing
 */

import { Request, Response } from 'express';
import { getApprovalInstance } from '../services/feishu/approval.service';
import { userService } from '../services/feishu/user.service';
import { getTenantToken } from '../services/feishu/token.service';
import { timelineProcessor } from '../services/timeline/timeline-processor.service';
import {
  cacheService,
  CACHE_KEYS,
  CACHE_TTL,
} from '../services/cache/redis.service';
import { logger } from '../utils/logger';
import type {
  ProcessedApprovalData,
  ApiResponse,
} from '../types/ProcessedData';
import type { AuthenticatedRequest } from '../middleware/auth.middleware';

export class ApprovalController {
  /**
   * GET /api/approval/:instanceId
   * Fetch and process approval instance data
   */
  async getApprovalData(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    const { instanceId } = req.params;
    const systemName = req.systemName || 'unknown';

    try {
      logger.info(`Fetching approval data: ${instanceId}`, { systemName });

      // Check cache first
      const cacheKey = CACHE_KEYS.approval(instanceId);
      const cachedData =
        await cacheService.get<ProcessedApprovalData>(cacheKey);

      if (cachedData) {
        logger.debug(`Cache hit: ${instanceId}`);
        const response: ApiResponse<ProcessedApprovalData> = {
          success: true,
          data: cachedData,
          error: null, // 参照Java版本：成功时error为null
          timestamp: Date.now(),
        };
        res.json(response);
        return;
      }

      // Fetch from Feishu API
      logger.debug(`Cache miss: ${instanceId}, fetching from Feishu`);
      const rawResponse = await getApprovalInstance(instanceId);

      // Extract all user IDs from timeline and task_list
      const userIds = this.extractUserIds(
        rawResponse.data.timeline,
        rawResponse.data.task_list
      );

      // Batch fetch user information
      let userInfoMap: Map<string, string> | undefined;
      if (userIds.length > 0) {
        try {
          const token = await getTenantToken();
          userInfoMap = await userService.batchGetUserInfo(userIds, token);
        } catch (error) {
          logger.warn(
            'Failed to fetch user info, continuing with user IDs',
            error
          );
          // Continue without user names - will fall back to user IDs
        }
      }

      // Process timeline data with user info
      const processedData = timelineProcessor.processApprovalData(
        rawResponse.data,
        userInfoMap
      );

      // Determine cache TTL based on status
      const ttl = this.getCacheTTL(processedData.header.status);

      // Cache the processed data
      if (ttl > 0) {
        await cacheService.set(cacheKey, processedData, ttl);
        logger.debug(`Data cached: ${instanceId} (TTL: ${ttl}s)`);
      }

      // Return response in Java version format (ApiResponse)
      const response: ApiResponse<ProcessedApprovalData> = {
        success: true,
        data: processedData,
        error: null, // 参照Java版本：成功时error为null
        timestamp: Date.now(),
      };

      res.json(response);

      logger.info(`Approval data fetched successfully: ${instanceId}`, {
        systemName,
        status: processedData.header.status,
        cached: ttl > 0,
      });
    } catch (error: any) {
      logger.error(`Failed to fetch approval data: ${instanceId}`, {
        systemName,
        error: error.message,
      });

      // Ensure we use a valid HTTP status code
      const statusCode =
        typeof error.code === 'number' && error.code >= 100 && error.code < 600
          ? error.code
          : 500;

      // Return error response in Java version format (ApiResponse)
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        error: {
          message: error.message || '获取审批数据失败',
          code: error.code || 'UNKNOWN_ERROR',
        },
        timestamp: Date.now(),
      };

      res.status(statusCode).json(response);
    }
  }

  /**
   * Extract all user IDs from timeline nodes and task_list
   * Note: Extracts open_id (not user_id) as that's what Feishu Contact API requires
   */
  private extractUserIds(timeline: any[], taskList?: any[]): string[] {
    const userIds = new Set<string>();

    // Extract from timeline
    if (timeline) {
      timeline.forEach(node => {
        // Add node open_id (preferred over user_id for Contact API)
        if (node.open_id) {
          userIds.add(node.open_id);
        }

        // Add CC user list
        if (node.cc_user_list && Array.isArray(node.cc_user_list)) {
          node.cc_user_list.forEach((cc: any) => {
            if (cc.open_id) {
              userIds.add(cc.open_id);
            }
          });
        }

        // Add open_id_list
        if (node.open_id_list && Array.isArray(node.open_id_list)) {
          node.open_id_list.forEach((id: string) => {
            userIds.add(id);
          });
        }
      });
    }

    // Extract from task_list (待审批任务)
    if (taskList && Array.isArray(taskList)) {
      taskList.forEach(task => {
        if (task.open_id) {
          userIds.add(task.open_id);
        }
      });
    }

    return Array.from(userIds);
  }

  /**
   * Determine cache TTL based on approval status
   */
  private getCacheTTL(status: string): number {
    switch (status) {
      case 'APPROVED':
        return CACHE_TTL.APPROVED;
      case 'REJECTED':
        return CACHE_TTL.REJECTED;
      case 'CANCELED':
        return CACHE_TTL.CANCELED;
      case 'PENDING':
      default:
        return CACHE_TTL.PENDING;
    }
  }
}

export const approvalController = new ApprovalController();
