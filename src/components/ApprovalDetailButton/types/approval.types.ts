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
  // 参照Java版本：支持英文状态和中文状态
  status: ApprovalStatus | '已通过' | '已拒绝' | '已撤销' | '进行中';
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
  ccNodeName?: string; // 抄送节点名称，用于显示特定的抄送目标描述
  ccPersonName: string;
  ccPersonDept?: string;
  ccTime?: string;
}

export interface TimelineData {
  completed: ProcessedNode[];
  pending: ProcessedNode[];
  cc: CCNode[];
}

// 数组格式的 timeline 项（API 可能返回的格式）
export interface ArrayTimelineItem {
  id: string;
  name?: string;
  nodeName?: string;
  type?: string;
  status?: string;
  user?: string;
  approverName?: string;
  approver?: string;
  dept?: string;
  approverDept?: string;
  time?: string;
  timestamp?: string;
  comment?: string;
}

export interface ProcessedApprovalData {
  header: ApprovalHeader;
  // timeline 可能是数组格式（API 返回）或对象格式（处理后）
  timeline: TimelineData | ArrayTimelineItem[];
}
