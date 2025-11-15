/**
 * Timeline Processor Service
 * Transforms raw Feishu approval data into processed timeline format
 */

import {
  FeishuApprovalData,
  TimelineNode,
  NodeStatus,
  NodeType as FeishuNodeType,
} from '../../models/FeishuResponse';
import { logger } from '../../utils/logger';

export type DisplayStatus = 'approved' | 'rejected' | 'pending';
export type NodeType = 'START' | 'APPROVAL' | 'CC' | 'END';

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

export interface ApprovalHeader {
  instanceId: string;
  approvalName: string;
  serialNumber?: string;
  applicant: string;
  applicantDept?: string;
  applyTime: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELED' | 'DELETED';
}

export interface ProcessedApprovalData {
  header: ApprovalHeader;
  timeline: TimelineData;
}

export class TimelineProcessorService {
  /**
   * Process Feishu approval instance into timeline format
   * @param rawData - Raw Feishu approval data
   * @param userInfoMap - Optional map of user_id to user name
   */
  processApprovalData(
    rawData: FeishuApprovalData,
    userInfoMap?: Map<string, string>
  ): ProcessedApprovalData {
    try {
      logger.debug(`Processing approval instance: ${rawData.instance_code}`);

      const timeline = this.processTimeline(
        rawData.timeline || [],
        userInfoMap
      );

      // Find the START node to get applicant info
      const startNode = rawData.timeline?.find(node => node.type === 'START');
      // Use open_id for mapping (preferred over user_id since Contact API uses open_id)
      const applicantId =
        startNode?.open_id ||
        startNode?.user_id ||
        rawData.open_id ||
        rawData.user_id ||
        'Unknown';
      const applicant = this.getUserName(applicantId, userInfoMap);

      return {
        header: {
          instanceId: rawData.instance_code, // Use instance_code for display
          approvalName: rawData.approval_name,
          serialNumber: rawData.serial_number,
          applicant: applicant,
          applicantDept: undefined, // Feishu API doesn't provide department in basic response
          applyTime: this.formatTimestamp(rawData.start_time),
          status: this.mapStatus(rawData.status),
        },
        timeline,
      };
    } catch (error) {
      logger.error('Timeline processing error', error);
      throw error;
    }
  }

  /**
   * Get user name from map or fall back to user_id
   */
  private getUserName(
    userId: string,
    userInfoMap?: Map<string, string>
  ): string {
    if (userInfoMap && userInfoMap.has(userId)) {
      return userInfoMap.get(userId)!;
    }
    return userId;
  }

  /**
   * Process timeline nodes into completed, pending, and CC sections
   */
  private processTimeline(
    nodes: TimelineNode[],
    userInfoMap?: Map<string, string>
  ): TimelineData {
    const completed: ProcessedNode[] = [];
    const pending: ProcessedNode[] = [];
    const cc: CCNode[] = [];

    nodes.forEach((node, index) => {
      // Handle CC nodes
      if (node.type === 'CC') {
        const ccNode = this.processCCNode(node, index, userInfoMap);
        if (ccNode) {
          cc.push(ccNode);
        }
        return;
      }

      // Skip START nodes (initiator)
      if (node.type === 'START') {
        return;
      }

      // Handle approval-related nodes (APPROVAL, PASS, REJECT, TRANSFER, etc.)
      if (this.isApprovalNode(node.type)) {
        const processedNode = this.processApprovalNode(
          node,
          index,
          userInfoMap
        );

        // Map Feishu event types to completed/pending status
        if (this.isCompletedNodeType(node.type)) {
          completed.push(processedNode);
        } else {
          pending.push(processedNode);
        }
      }
    });

    // Sort completed by time (earliest first)
    completed.sort((a, b) => {
      const timeA = this.parseFormattedTime(a.time);
      const timeB = this.parseFormattedTime(b.time);
      return timeA - timeB;
    });

    // Calculate time closeness for consecutive nodes
    for (let i = 1; i < completed.length; i++) {
      const currentTime = this.parseFormattedTime(completed[i].time);
      const previousTime = this.parseFormattedTime(completed[i - 1].time);
      const diffSeconds = Math.abs(currentTime - previousTime) / 1000;

      // Mark as close if within 60 seconds
      if (diffSeconds <= 60) {
        completed[i].isTimeClose = true;
        completed[i].timeDiffSeconds = diffSeconds;
        if (diffSeconds < 5) {
          completed[i].timeCloseNote = '几乎同时';
        } else {
          completed[i].timeCloseNote = `相隔 ${Math.floor(diffSeconds)} 秒`;
        }
      }
    }

    logger.debug('Timeline processed', {
      completed: completed.length,
      pending: pending.length,
      cc: cc.length,
    });

    return { completed, pending, cc };
  }

  /**
   * Parse formatted time string back to timestamp
   */
  private parseFormattedTime(timeStr: string): number {
    // Parse "YYYY-MM-DD HH:mm:ss" format
    return new Date(timeStr).getTime();
  }

  /**
   * Check if node type is an approval-related action
   */
  private isApprovalNode(type: FeishuNodeType | string): boolean {
    const approvalTypes = [
      'APPROVAL',
      'PASS',
      'REJECT',
      'TRANSFER',
      'REMOVE_REPEAT',
      'ADD_APPROVER_BEFORE',
      'ADD_APPROVER_AFTER',
    ];
    return approvalTypes.includes(type);
  }

  /**
   * Check if node type represents a completed action
   */
  private isCompletedNodeType(type: FeishuNodeType | string): boolean {
    const completedTypes = ['PASS', 'REJECT', 'TRANSFER', 'REMOVE_REPEAT'];
    return completedTypes.includes(type);
  }

  /**
   * Process approval node
   */
  private processApprovalNode(
    node: TimelineNode,
    index: number,
    userInfoMap?: Map<string, string>
  ): ProcessedNode {
    const timestamp =
      node.end_time || node.create_time || new Date().toISOString();
    // Use open_id for mapping (preferred over user_id since Contact API uses open_id)
    const userId = node.open_id || node.user_id || 'Unknown';
    const approverName = this.getUserName(userId, userInfoMap);

    return {
      id: node.node_id || `node-${index}`,
      nodeName: node.node_name || this.getNodeNameFromType(node.type),
      nodeType: 'APPROVAL',
      approverName: approverName,
      approverDept: undefined, // Feishu API doesn't provide department in basic response
      time: this.formatTimestamp(timestamp),
      status: this.mapNodeTypeToDisplayStatus(node.type, node.status),
      comment: node.comment,
    };
  }

  /**
   * Get friendly node name from Feishu type
   */
  private getNodeNameFromType(type: FeishuNodeType | string): string {
    const typeNames: Record<string, string> = {
      PASS: '审批通过',
      REJECT: '审批驳回',
      TRANSFER: '审批转交',
      REMOVE_REPEAT: '自动通过',
      ADD_APPROVER_BEFORE: '前加签',
      ADD_APPROVER_AFTER: '后加签',
      APPROVAL: '审批节点',
    };
    return typeNames[type] || '审批节点';
  }

  /**
   * Map Feishu node type to display status
   */
  private mapNodeTypeToDisplayStatus(
    type: FeishuNodeType | string,
    status?: NodeStatus
  ): DisplayStatus {
    // If status is provided, use it
    if (status) {
      return this.mapNodeStatusToDisplay(status);
    }

    // Otherwise infer from type
    switch (type) {
      case 'PASS':
      case 'REMOVE_REPEAT':
        return 'approved';
      case 'REJECT':
        return 'rejected';
      case 'TRANSFER':
        return 'approved'; // Treat transfer as approved
      default:
        return 'pending';
    }
  }

  /**
   * Map Feishu node status to display status
   */
  private mapNodeStatusToDisplay(status: NodeStatus): DisplayStatus {
    switch (status) {
      case 'APPROVED':
        return 'approved';
      case 'REJECTED':
        return 'rejected';
      case 'TRANSFERRED':
        return 'approved'; // Treat transferred as approved
      case 'PENDING':
      case 'APPROVING':
      default:
        return 'pending';
    }
  }

  /**
   * Process CC node
   */
  private processCCNode(
    node: TimelineNode,
    index: number,
    userInfoMap?: Map<string, string>
  ): CCNode | null {
    const timestamp = node.end_time || node.create_time;
    if (!timestamp) {
      return null; // Skip CC nodes without timestamp
    }

    // Handle cc_user_list if available
    if (node.cc_user_list && node.cc_user_list.length > 0) {
      const firstCc = node.cc_user_list[0];
      // Use open_id for mapping (preferred over user_id since Contact API uses open_id)
      const userId = firstCc.open_id || firstCc.user_id || 'Unknown';
      const ccPersonName = this.getUserName(userId, userInfoMap);

      return {
        id: firstCc.cc_id || `cc-${index}`,
        ccPersonName: ccPersonName,
        ccPersonDept: undefined, // Feishu API doesn't provide department in basic response
        ccTime: this.formatTimestamp(timestamp),
      };
    }

    // Fallback to single user
    // Use open_id for mapping (preferred over user_id since Contact API uses open_id)
    const userId = node.open_id || node.user_id || 'Unknown';
    const ccPersonName = this.getUserName(userId, userInfoMap);

    return {
      id: node.node_id || `cc-${index}`,
      ccPersonName: ccPersonName,
      ccPersonDept: undefined, // Feishu API doesn't provide department in basic response
      ccTime: this.formatTimestamp(timestamp),
    };
  }

  /**
   * Map Feishu instance status to processed status
   */
  private mapStatus(
    status: string
  ): 'APPROVED' | 'REJECTED' | 'PENDING' | 'CANCELED' | 'DELETED' {
    switch (status) {
      case 'APPROVED':
        return 'APPROVED';
      case 'REJECTED':
        return 'REJECTED';
      case 'CANCELED':
        return 'CANCELED';
      case 'DELETED':
        return 'DELETED';
      case 'PENDING':
      case 'PROCESSING':
      default:
        return 'PENDING';
    }
  }

  /**
   * Format timestamp to readable date string
   */
  private formatTimestamp(timestamp: string): string {
    // Feishu timestamps are in milliseconds
    const date = new Date(parseInt(timestamp));

    // Format as YYYY-MM-DD HH:mm:ss
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
}

export const timelineProcessor = new TimelineProcessorService();
