/**
 * API 响应类型定义
 */

import type { ProcessedApprovalData } from './approval.types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  timestamp: number;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    details?: any;
  };
  timestamp: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;

export type GetApprovalSuccessResponse = SuccessResponse<ProcessedApprovalData>;
