/**
 * Processed Data Types
 * 类型定义在 timeline-processor.service.ts 中，这里只导出 ApiResponse
 */

// 导出所有相关类型
export type {
  ProcessedApprovalData,
  ApprovalHeader,
  TimelineData,
  ProcessedNode,
  CCNode,
} from '../services/timeline/timeline-processor.service';

/**
 * Standard API response wrapper - 参照Java版本的格式
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  error: {
    message: string;
    code?: string;
  } | null;
  timestamp: number;
}
