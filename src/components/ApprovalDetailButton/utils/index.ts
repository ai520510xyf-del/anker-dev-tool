/**
 * 审批组件工具函数
 */

import { TERMINAL_STATUSES } from '../constants';
import type { ApprovalStatus, DisplayStatus } from '../types/approval.types';

/**
 * 判断审批状态是否为终态
 * @param status 审批状态（支持英文和中文状态）
 */
export function isTerminalStatus(
  status: ApprovalStatus | '已通过' | '已拒绝' | '已撤销' | '进行中'
): boolean {
  // 中文状态映射到英文状态
  const statusMap: Record<string, ApprovalStatus> = {
    已通过: 'APPROVED',
    已拒绝: 'REJECTED',
    已撤销: 'CANCELED',
    进行中: 'PENDING',
  };

  // 如果是中文状态，先转换为英文状态
  const normalizedStatus = statusMap[status] || (status as ApprovalStatus);

  return TERMINAL_STATUSES.includes(normalizedStatus);
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
