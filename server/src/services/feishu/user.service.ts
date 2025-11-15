/**
 * Feishu User Service
 * Fetches user information from Feishu API
 */

import axios, { AxiosError } from 'axios';
import { logger } from '../../utils/logger';

interface FeishuUserInfo {
  user_id?: string;
  open_id?: string;
  union_id?: string;
  name?: string;
  en_name?: string;
  email?: string;
  mobile?: string;
  department_ids?: string[];
}

interface FeishuUserResponse {
  code: number;
  msg: string;
  data: {
    user_list?: FeishuUserInfo[];
    users?: FeishuUserInfo[];
  };
}

interface FeishuSingleUserResponse {
  code: number;
  msg: string;
  data: {
    user: FeishuUserInfo;
  };
}

export class UserService {
  private baseUrl = 'https://open.feishu.cn/open-apis';

  /**
   * Batch get user information by user IDs
   * API: https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/contact-v3/user/batch_get_id
   */
  async batchGetUserInfo(
    userIds: string[],
    tenantAccessToken: string
  ): Promise<Map<string, string>> {
    if (userIds.length === 0) {
      return new Map();
    }

    // Remove duplicates
    const uniqueUserIds = Array.from(new Set(userIds));

    try {
      logger.debug('Fetching user info for user IDs', {
        count: uniqueUserIds.length,
        userIds: uniqueUserIds,
      });

      // Feishu API限制: 每次最多查询50个用户
      const batchSize = 50;
      const userInfoMap = new Map<string, string>();

      for (let i = 0; i < uniqueUserIds.length; i += batchSize) {
        const batch = uniqueUserIds.slice(i, i + batchSize);
        const batchResult = await this.fetchUserBatch(batch, tenantAccessToken);

        // Merge results
        batchResult.forEach((name, userId) => {
          userInfoMap.set(userId, name);
        });
      }

      logger.info('User info fetched successfully', {
        requested: uniqueUserIds.length,
        retrieved: userInfoMap.size,
      });

      return userInfoMap;
    } catch (error) {
      logger.error('Failed to fetch user info', error);
      // Return empty map on error - will fall back to user IDs
      return new Map();
    }
  }

  /**
   * Fetch a batch of user information using individual GET requests
   * Uses GET /contact/v3/users/{user_id} which requires contact:contact.base:readonly permission
   */
  private async fetchUserBatch(
    userIds: string[],
    tenantAccessToken: string
  ): Promise<Map<string, string>> {
    const userInfoMap = new Map<string, string>();

    // Fetch users concurrently with Promise.allSettled to handle partial failures
    const promises = userIds.map(async userId => {
      try {
        const response = await axios.get<FeishuSingleUserResponse>(
          `${this.baseUrl}/contact/v3/users/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${tenantAccessToken}`,
              'Content-Type': 'application/json',
            },
            params: {
              user_id_type: 'open_id',
            },
            timeout: 10000,
          }
        );

        if (response.data.code === 0 && response.data.data?.user) {
          const user = response.data.data.user;
          // 优先使用name,如果没有则使用en_name
          const displayName = user.name || user.en_name || userId;
          return { userId, displayName };
        } else {
          logger.warn('Failed to get user info for user', {
            userId,
            code: response.data.code,
            msg: response.data.msg,
          });
          return null;
        }
      } catch (error) {
        if (error instanceof AxiosError) {
          logger.warn('Failed to fetch single user', {
            userId,
            status: error.response?.status,
            message: error.message,
          });
        }
        return null;
      }
    });

    const results = await Promise.allSettled(promises);

    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value) {
        userInfoMap.set(result.value.userId, result.value.displayName);
      }
    });

    logger.debug('Fetched user batch', {
      requested: userIds.length,
      retrieved: userInfoMap.size,
    });

    return userInfoMap;
  }
}

export const userService = new UserService();
