/**
 * Feishu Approval Service
 * Fetches approval instance data
 */

import axios, { AxiosError } from 'axios';
import { config } from '../../config';
import { logger } from '../../utils/logger';
import { getTenantToken, clearTokenCache } from './token.service';
import type { FeishuApprovalResponse } from '../../models/FeishuResponse';

export async function getApprovalInstance(
  instanceId: string,
  retries: number = 3
): Promise<FeishuApprovalResponse> {
  let attempt = 0;

  while (attempt < retries) {
    try {
      const token = await getTenantToken();

      logger.info(`Fetching approval instance: ${instanceId}`);

      const response = await axios.get<FeishuApprovalResponse>(
        `${config.feishu.baseUrl}${config.feishu.approvalEndpoint}/${instanceId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          params: {
            locale: 'zh-CN',
          },
          timeout: config.feishu.timeout,
        }
      );

      if (response.data.code === 99991663) {
        // Token expired, clear cache and retry
        logger.warn('Token expired, clearing cache and retrying');
        await clearTokenCache();
        attempt++;
        continue;
      }

      if (response.data.code !== 0) {
        logger.error('Feishu API returned error', {
          code: response.data.code,
          msg: response.data.msg,
          instanceId,
        });

        // Handle specific error codes with user-friendly messages
        if (response.data.code === 400008) {
          // Instance not found or no permission
          throw new Error('审批流程不存在或无权限访问');
        } else if (response.data.code === 400007) {
          // Invalid instance code format
          throw new Error('审批实例编码格式不正确');
        } else if (response.data.code === 99991664) {
          // App not approved
          throw new Error('应用未获得审批权限');
        } else {
          // Other errors - show more generic message
          throw new Error(
            `获取审批数据失败: ${response.data.msg || '未知错误'}`
          );
        }
      }

      logger.info(`Successfully fetched approval instance: ${instanceId}`);

      // 🔍 DEBUG: Log raw Feishu API response
      logger.debug('🔍 RAW FEISHU API RESPONSE:', {
        instanceId: instanceId,
        code: response.data.code,
        status: response.data.data?.status,
        timeline_count: response.data.data?.timeline?.length || 0,
        task_list_count: response.data.data?.task_list?.length || 0,
        timeline_nodes: response.data.data?.timeline?.map(
          (node: any, idx: number) => ({
            index: idx,
            type: node.type,
            status: node.status,
            node_name: node.node_name,
            node_key: node.node_key,
            user_id: node.user_id,
            open_id: node.open_id,
            cc_user_list: node.cc_user_list,
            // Log all available fields for CC nodes
            ...(node.type === 'CC' ? { raw_cc_node: node } : {}),
          })
        ),
        task_list: response.data.data?.task_list?.map(
          (task: any, idx: number) => ({
            index: idx,
            id: task.id,
            status: task.status,
            node_name: task.node_name,
            user_id: task.user_id,
            open_id: task.open_id,
          })
        ),
      });

      return response.data;
    } catch (error) {
      attempt++;

      if (error instanceof AxiosError) {
        // Log detailed error information
        if (error.response) {
          logger.error(`Feishu API error response:`, {
            status: error.response.status,
            data: error.response.data,
            headers: error.response.headers,
          });

          // 先检查响应体中的错误码（Feishu API可能返回HTTP 200但code不为0，也可能返回HTTP 4xx/5xx）
          const responseData = error.response.data;
          if (
            responseData &&
            typeof responseData === 'object' &&
            'code' in responseData
          ) {
            const feishuCode = responseData.code;
            const feishuMsg = responseData.msg || '未知错误';

            // 处理Feishu API的错误码
            if (feishuCode === 400008) {
              throw new Error('审批流程不存在或无权限访问');
            } else if (feishuCode === 400007) {
              throw new Error('审批实例编码格式不正确');
            } else if (feishuCode === 99991664) {
              throw new Error('应用未获得审批权限');
            } else {
              throw new Error(`获取审批数据失败: ${feishuMsg}`);
            }
          }

          // Handle HTTP status errors with user-friendly messages
          if (error.response.status === 400) {
            throw new Error('审批流程不存在或参数错误');
          } else if (error.response.status === 403) {
            throw new Error('无权限访问该审批流程');
          } else if (error.response.status === 404) {
            throw new Error('审批流程不存在');
          } else if (error.response.status === 500) {
            throw new Error('服务器错误，请稍后重试');
          }
        }

        // Network timeout or connection reset - retry with exponential backoff
        if (error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET') {
          if (attempt < retries) {
            const delay = 1000 * attempt; // 1s, 2s, 3s
            logger.warn(
              `Network error, retrying in ${delay}ms (attempt ${attempt}/${retries})`
            );
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          throw new Error('网络连接超时，请检查网络后重试');
        }
      }

      logger.error(`Failed to fetch approval instance: ${instanceId}`, error);

      // If we reach here and error has a message, pass it through
      if (error instanceof Error && error.message) {
        throw error;
      }

      throw new Error('获取审批数据失败，请稍后重试');
    }
  }

  throw new Error('Max retries reached');
}
