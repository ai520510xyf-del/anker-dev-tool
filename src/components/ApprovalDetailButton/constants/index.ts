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

/**
 * 根据环境动态获取 API 地址
 * 运行时动态判断，而不是构建时确定
 */
export const getApiBaseUrl = (): string => {
  // 如果设置了环境变量，优先使用
  if (typeof window !== 'undefined') {
    const win = window as Window & { __API_BASE_URL__?: string };
    if (win.__API_BASE_URL__) {
      return win.__API_BASE_URL__;
    }

    const hostname = window.location.hostname;

    // GitHub Pages 环境
    if (hostname.includes('github.io')) {
      return 'https://cl-dev-tool-server.onrender.com/api';
    }

    // 本地开发环境
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // return 'http://10.0.200.5:3000/api';
      return 'http://localhost:8080/api';
    }
  }

  // 默认使用线上地址
  return 'https://cl-dev-tool-server.onrender.com/api';
};

// 默认配置
export const DEFAULT_CONFIG = {
  AUTO_REFRESH_INTERVAL: 30000, // 30 秒
  REQUEST_TIMEOUT: 10000, // 10 秒
  BUTTON_TEXT: '审批流程',
} as const;
