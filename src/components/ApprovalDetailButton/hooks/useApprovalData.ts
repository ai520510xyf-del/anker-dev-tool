/**
 * useApprovalData Hook
 * 获取和管理审批数据
 */

import { useState, useCallback, useEffect } from 'react';
import type { ProcessedApprovalData } from '../types/approval.types';
import { fetchApprovalData } from '../services/api.service';

/**
 * 审批数据 Hook
 * @param code 审批实例 code
 * @param systemCode 系统 code
 * @param systemKey 系统密钥
 * @param apiBaseUrl API 基础地址
 */
export function useApprovalData(
  code: string,
  systemCode: string,
  systemKey: string,
  apiBaseUrl?: string
) {
  const [data, setData] = useState<ProcessedApprovalData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    // 参数验证
    if (!code || !systemCode || !systemKey) {
      setError(new Error('缺少必填参数：code、systemCode、systemKey'));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await fetchApprovalData(
        code,
        systemCode,
        systemKey,
        apiBaseUrl
      );
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('获取审批数据失败'));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [code, systemCode, systemKey, apiBaseUrl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
