/**
 * 审批组件常量定义
 */

// 审批状态常量
export const APPROVAL_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CANCELED: 'CANCELED',
  DELETED: 'DELETED',
} as const;

// 显示状态常量
export const DISPLAY_STATUS = {
  APPROVED: 'approved',
  REJECTED: 'rejected',
  PENDING: 'pending',
} as const;

// 终态状态列表（不再需要自动刷新的状态）
export const TERMINAL_STATUSES: readonly string[] = [
  APPROVAL_STATUS.APPROVED,
  APPROVAL_STATUS.REJECTED,
  APPROVAL_STATUS.CANCELED,
];

// 默认配置
export const DEFAULT_CONFIG = {
  API_BASE_URL: 'http://localhost:3000/api',
  AUTO_REFRESH_INTERVAL: 30000, // 30 秒
  REQUEST_TIMEOUT: 10000, // 10 秒
  BUTTON_TEXT: '审批流程',
} as const;
