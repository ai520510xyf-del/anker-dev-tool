/**
 * Feishu API Response Types
 */

export interface FeishuTokenResponse {
  code: number;
  msg: string;
  tenant_access_token: string;
  expire: number;
}

export type ApprovalStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELED'
  | 'DELETED';

export type NodeType =
  | 'START'
  | 'APPROVAL'
  | 'CC'
  | 'END'
  | 'PASS'
  | 'REJECT'
  | 'TRANSFER'
  | 'REMOVE_REPEAT'
  | 'ADD_APPROVER_BEFORE'
  | 'ADD_APPROVER_AFTER';

export type NodeStatus =
  | 'APPROVED'
  | 'REJECTED'
  | 'PENDING'
  | 'APPROVING'
  | 'TRANSFERRED'
  | 'CANCELED';

export interface TimelineNode {
  node_id?: string;
  node_name?: string;
  node_key?: string;
  type: NodeType | string;
  user_id?: string;
  open_id?: string;
  user_name?: string;
  start_time?: string;
  end_time?: string;
  create_time?: string;
  status?: NodeStatus;
  comment?: string;
  read_status?: 'READ' | 'UNREAD';
  read_time?: string;
  task_id?: string;
  ext?: string;
  cc_user_list?: Array<{
    cc_id: string;
    open_id: string;
    user_id: string;
  }>;
  user_id_list?: string[];
  open_id_list?: string[];
}

export interface ApprovalTask {
  id: string;
  user_id?: string;
  open_id?: string;
  title?: string;
  node_id?: string;
  node_name?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'TRANSFERRED' | 'DONE';
}

export interface FeishuApprovalData {
  instance_id: string;
  instance_code: string;
  approval_code: string;
  approval_name: string;
  serial_number?: string;
  start_time: string;
  end_time?: string;
  status: ApprovalStatus;
  user_id: string;
  open_id: string;
  timeline: TimelineNode[];
  task_list?: ApprovalTask[];
  form?: Record<string, any>;
}

export interface FeishuApprovalResponse {
  code: number;
  msg: string;
  data: FeishuApprovalData;
}
