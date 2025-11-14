/**
 * useAutoRefresh Hook
 * 实现自动刷新功能
 */

import { useEffect, useRef } from 'react';
import { DEFAULT_CONFIG } from '../constants';

/**
 * 自动刷新 Hook
 * @param enabled 是否启用自动刷新
 * @param refetchFn 刷新函数
 * @param interval 刷新间隔（毫秒），默认 30 秒
 */
export function useAutoRefresh(
  enabled: boolean,
  refetchFn: () => Promise<void>,
  interval: number = DEFAULT_CONFIG.AUTO_REFRESH_INTERVAL
) {
  const timeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!enabled) return;

    const scheduleRefresh = async () => {
      await refetchFn();
      timeoutRef.current = window.setTimeout(scheduleRefresh, interval);
    };

    timeoutRef.current = window.setTimeout(scheduleRefresh, interval);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, refetchFn, interval]);
}
