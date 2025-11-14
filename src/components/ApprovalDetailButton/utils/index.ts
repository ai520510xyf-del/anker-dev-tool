/**
 * 审批组件工具函数
 */

import { TERMINAL_STATUSES } from '../constants';
import type { ApprovalStatus, DisplayStatus } from '../types/approval.types';

/**
 * 判断审批状态是否为终态
 * @param status 审批状态
 */
export function isTerminalStatus(status: ApprovalStatus): boolean {
  return TERMINAL_STATUSES.includes(status);
}

/**
 * 将审批状态转换为显示状态
 * @param status 审批状态
 */
export function toDisplayStatus(status: ApprovalStatus): DisplayStatus {
  const statusLower = status.toLowerCase();
  if (statusLower === 'approved') {
    return 'approved';
  }
  if (statusLower === 'rejected') {
    return 'rejected';
  }
  return 'pending';
}
