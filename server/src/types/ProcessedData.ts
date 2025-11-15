/**
 * Processed Data Types
 * Matches frontend contract specifications
 */

export type ApprovalStatus = 'APPROVED' | 'REJECTED' | 'PENDING' | 'CANCELED';
export type NodeStatus = 'APPROVED' | 'REJECTED' | 'PENDING' | 'TRANSFERRED';

export interface ProcessedNode {
  id: string;
  type: 'approval' | 'cc';
  name: string;
  status: NodeStatus;
  approver: string;
  timestamp: string | null;
  comment: string | null;
}

export interface CCNode {
  id: string;
  name: string;
  ccPerson: string;
  timestamp: string;
}

export interface TimelineData {
  completed: ProcessedNode[];
  pending: ProcessedNode[];
  cc: CCNode[];
}

export interface ProcessedApprovalData {
  instance_code: string;
  header: {
    status: ApprovalStatus;
    startTime: string;
    endTime: string | null;
  };
  timeline: TimelineData;
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T | null;
}
