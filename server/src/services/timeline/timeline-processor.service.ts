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
  ccNodeName?: string; // Added to store specific CC target description
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
        rawData.task_list || [],
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
    tasks: any[],
    userInfoMap?: Map<string, string>
  ): TimelineData {
    const completed: ProcessedNode[] = [];
    const pending: ProcessedNode[] = [];
    const cc: CCNode[] = [];

    // 🔍 DEBUG: Log all raw nodes and tasks
    logger.debug('🔍 RAW TIMELINE NODES:', {
      totalNodes: nodes.length,
      totalTasks: tasks.length,
      nodes: nodes.map((node, idx) => ({
        index: idx,
        type: node.type,
        status: node.status,
        node_id: node.node_id,
        node_name: node.node_name,
        user_id: node.user_id,
        open_id: node.open_id,
        create_time: node.create_time,
        end_time: node.end_time,
      })),
      tasks: tasks.map((task, idx) => ({
        index: idx,
        id: task.id,
        status: task.status,
        node_name: task.node_name,
        user_id: task.user_id,
        open_id: task.open_id,
      })),
    });

    // Create a mapping from task index to node name for proper node name resolution
    // Since the Feishu API doesn't provide index field in task_list, we use the array index
    const taskIndexToNodeNameMap = new Map<number, string>();
    tasks.forEach((task, taskIndex) => {
      logger.debug(`🔍 Checking task ${taskIndex}:`, {
        id: task.id,
        nodeName: task.node_name,
        hasNodeName: !!task.node_name,
        taskIndex: taskIndex,
      });

      if (task.node_name) {
        taskIndexToNodeNameMap.set(taskIndex, task.node_name);
        logger.debug(
          `🔍 Adding task index mapping: ${taskIndex} -> ${task.node_name}`
        );
      }
    });

    logger.debug('🔍 TASK INDEX TO NODE NAME MAPPING:', {
      mapping: Array.from(taskIndexToNodeNameMap.entries()).map(
        ([taskIndex, nodeName]) => ({
          taskIndex,
          nodeName,
        })
      ),
    });

    nodes.forEach((node, index) => {
      // Handle CC nodes
      if (node.type === 'CC') {
        logger.debug(
          `🔍 Processing CC node [${index}]: ${node.node_name || 'unnamed'}`
        );
        const ccNode = this.processCCNode(node, index, userInfoMap);
        if (ccNode) {
          cc.push(ccNode);
        }
        return;
      }

      // Skip START nodes (initiator)
      if (node.type === 'START') {
        logger.debug(
          `🔍 Skipping START node [${index}]: ${node.node_name || 'unnamed'}`
        );
        return;
      }

      // Handle approval-related nodes (APPROVAL, PASS, REJECT, TRANSFER, etc.)
      if (this.isApprovalNode(node.type)) {
        const processedNode = this.processApprovalNode(
          node,
          index,
          userInfoMap,
          taskIndexToNodeNameMap
        );
        const isCompleted = this.isCompletedNodeType(node.type);

        logger.debug(`🔍 Processing approval node [${index}]:`, {
          type: node.type,
          status: node.status,
          nodeName: processedNode.nodeName, // Use the resolved node name
          isCompleted: isCompleted,
          willAddTo: isCompleted ? 'COMPLETED' : 'PENDING',
        });

        // Map Feishu event types to completed/pending status
        if (isCompleted) {
          completed.push(processedNode);
        } else {
          pending.push(processedNode);
        }
      } else {
        logger.debug(`🔍 Skipping non-approval node [${index}]:`, {
          type: node.type,
          nodeName: node.node_name,
        });
      }
    });

    // Process task_list for pending approvals
    tasks.forEach((task, index) => {
      // Only process PENDING tasks
      if (task.status === 'PENDING') {
        logger.debug(`🔍 Processing PENDING task [${index}]:`, {
          id: task.id,
          node_name: task.node_name,
          status: task.status,
          user_id: task.user_id,
          open_id: task.open_id,
        });

        const userId = task.open_id || task.user_id || 'Unknown';
        const approverName = this.getUserName(userId, userInfoMap);

        const pendingNode: ProcessedNode = {
          id: task.id || `task-${index}`,
          nodeName: task.node_name || '待审批',
          nodeType: 'APPROVAL',
          approverName: approverName,
          approverDept: undefined,
          time: 'PENDING', // Tasks don't have timestamps yet - show as pending
          status: 'pending',
        };

        pending.push(pendingNode);
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

    logger.debug('🔍 TIMELINE PROCESSING COMPLETE:', {
      completed: completed.length,
      pending: pending.length,
      cc: cc.length,
      completedNodes: completed.map(n => ({
        nodeName: n.nodeName,
        approver: n.approverName,
        status: n.status,
      })),
      pendingNodes: pending.map(n => ({
        nodeName: n.nodeName,
        approver: n.approverName,
        status: n.status,
      })),
      ccNodes: cc.map(n => ({
        ccPerson: n.ccPersonName,
      })),
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
    userInfoMap?: Map<string, string>,
    taskIndexToNodeNameMap?: Map<number, string>
  ): ProcessedNode {
    // For pending nodes, use special identifier; for completed nodes, use actual timestamp
    const timestamp = node.end_time || node.create_time || 'PENDING';
    // Use open_id for mapping (preferred over user_id since Contact API uses open_id)
    const userId = node.open_id || node.user_id || 'Unknown';
    const approverName = this.getUserName(userId, userInfoMap);

    // Get the proper node name from task_list mapping first, then fallback to generic name
    let nodeName = node.node_name;

    // Calculate the corresponding task index for this approval node
    // Skip START nodes when calculating task mapping (index 0 is usually START, so approval nodes start from index 1)
    const approvalNodeIndex = index - 1; // Adjust for START node being at index 0

    // Try to get specific node name from task_list mapping by index
    if (
      taskIndexToNodeNameMap &&
      taskIndexToNodeNameMap.has(approvalNodeIndex)
    ) {
      nodeName = taskIndexToNodeNameMap.get(approvalNodeIndex)!;
      logger.debug(
        `🔍 Using task_list node name for task index ${approvalNodeIndex}: ${nodeName}`
      );
    } else if (!nodeName) {
      // Fallback to generic name based on type
      nodeName = this.getNodeNameFromType(node.type);
      logger.debug(
        `🔍 Using fallback node name for type ${node.type}: ${nodeName}`
      );
    }

    return {
      id: node.node_id || `node-${index}`,
      nodeName: nodeName,
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
    // CC nodes should show actual timestamp since CC is an instant action that's already completed
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
        ccNodeName: node.node_name || '抄送', // Use specific node name from Feishu API
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
      ccNodeName: node.node_name || '抄送', // Use specific node name from Feishu API
      ccPersonName: ccPersonName,
      ccPersonDept: undefined, // Feishu API doesn't provide department in basic response
      ccTime: this.formatTimestamp(timestamp),
    };
  }

  /**
   * Generate descriptive CC node name based on context
   */
  private generateCCNodeName(node: TimelineNode, ccPersonName: string): string {
    // If node has explicit node_name, use it first
    if (node.node_name && node.node_name.trim() && node.node_name !== 'CC') {
      return node.node_name;
    }

    // Try to generate descriptive name based on context
    // If person name contains specific patterns, generate targeted description
    if (ccPersonName && ccPersonName !== 'Unknown') {
      // Check for common department patterns in names
      if (ccPersonName.includes('财务') || ccPersonName.includes('Finance')) {
        return '抄送财务部门';
      }
      if (
        ccPersonName.includes('风控') ||
        ccPersonName.includes('风险') ||
        ccPersonName.includes('Risk')
      ) {
        return '抄送风险管理部门';
      }
      if (ccPersonName.includes('审计') || ccPersonName.includes('Audit')) {
        return '抄送审计部门';
      }
      if (ccPersonName.includes('采购') || ccPersonName.includes('Purchase')) {
        return '抄送采购部门';
      }
      if (ccPersonName.includes('HR') || ccPersonName.includes('人事')) {
        return '抄送人事部门';
      }

      // For names that don't match patterns, create generic but specific description
      const firstName = ccPersonName.split(' ')[0] || ccPersonName;
      return `抄送${firstName}`;
    }

    // Default fallback
    return '抄送';
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
    // Handle special case for pending nodes
    if (timestamp === 'PENDING') {
      return 'PENDING';
    }

    let date: Date;

    // Handle different timestamp formats
    if (timestamp.includes('T') && timestamp.includes('Z')) {
      // ISO format like "2025-11-16T03:54:31.311Z"
      date = new Date(timestamp);
    } else {
      // Feishu timestamps are in milliseconds (numeric string)
      date = new Date(parseInt(timestamp));
    }

    // Validate the date
    if (isNaN(date.getTime())) {
      // If timestamp is invalid, use current time
      date = new Date();
    }

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
