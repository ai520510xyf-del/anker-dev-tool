/**
 * API 服务
 * 用于调用后端审批数据接口
 */

import axios, { AxiosError, AxiosInstance } from 'axios';
import { DEFAULT_CONFIG } from '../constants';
import type { ProcessedApprovalData } from '../types/approval.types';
import type { ApiResponse } from '../types/api.types';

// API 客户端缓存，避免重复创建
const apiClientCache = new Map<string, AxiosInstance>();

/**
 * 创建或获取 API 客户端
 */
const getApiClient = (baseURL: string): AxiosInstance => {
  if (apiClientCache.has(baseURL)) {
    return apiClientCache.get(baseURL)!;
  }

  const client = axios.create({
    baseURL,
    timeout: DEFAULT_CONFIG.REQUEST_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  apiClientCache.set(baseURL, client);
  return client;
};

/**
 * 获取审批数据
 * @param code 审批实例 code
 * @param systemCode 系统 code
 * @param systemKey 系统密钥
 * @param apiBaseUrl API 基础地址
 */
export async function fetchApprovalData(
  code: string,
  systemCode: string,
  systemKey: string,
  apiBaseUrl: string = DEFAULT_CONFIG.API_BASE_URL
): Promise<ProcessedApprovalData> {
  // 参数验证
  if (!code || !systemCode || !systemKey) {
    throw new Error('缺少必填参数：code、systemCode、systemKey');
  }

  const apiClient = getApiClient(apiBaseUrl);

  try {
    const response = await apiClient.get<ApiResponse<ProcessedApprovalData>>(
      `/approval/${code}`,
      {
        headers: {
          'x-system-name': systemCode,
          'x-system-key': systemKey,
        },
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.error.message);
    }

    return response.data.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      // 处理 HTTP 错误响应
      if (error.response?.data?.error) {
        const errorMessage =
          error.response.data.error.message || '获取审批数据失败';
        throw new Error(errorMessage);
      }
      // 处理网络错误
      if (error.code === 'ECONNABORTED') {
        throw new Error('请求超时，请稍后重试');
      }
      if (error.code === 'ERR_NETWORK') {
        throw new Error('网络错误，请检查网络连接');
      }
      throw new Error(error.message || '获取审批数据失败');
    }
    // 处理其他错误
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('获取审批数据失败');
  }
}
