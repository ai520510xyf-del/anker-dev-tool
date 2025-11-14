/**
 * 审批数据类型定义
 */

export type ApprovalStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELED'
  | 'DELETED';

export type DisplayStatus = 'approved' | 'rejected' | 'pending';

export type NodeType = 'START' | 'APPROVAL' | 'CC' | 'END';

export interface ApprovalHeader {
  instanceId: string;
  approvalName: string;
  serialNumber?: string;
  applicant: string;
  applicantDept?: string;
  applyTime: string;
  status: ApprovalStatus;
}

export interface ProcessedNode {
  id: string;
  nodeName: string;
  nodeType: NodeType;
  approverName: string;
  approverDept?: string;
  time: string;
  status: DisplayStatus;
  comment?: string;
  isTimeClose?: boolean;
  timeDiffSeconds?: number;
  timeCloseNote?: string;
}

export interface CCNode {
  id: string;
  ccPersonName: string;
  ccPersonDept?: string;
  ccTime?: string;
}

export interface TimelineData {
  completed: ProcessedNode[];
  pending: ProcessedNode[];
  cc: CCNode[];
}

export interface ProcessedApprovalData {
  header: ApprovalHeader;
  timeline: TimelineData;
}
