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
  status?: string; // 参照Java版本：CC节点状态（completed）
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
  status: string; // 参照Java版本：返回中文状态（已通过、已拒绝、已撤销、进行中）
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
          status: this.mapStatus(rawData.status), // 返回中文状态
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
   * 参照Java版本的逻辑：从timeline事件中处理审批事件和抄送事件，从task_list中处理待审批任务
   */
  private processTimeline(
    nodes: TimelineNode[],
    tasks: any[],
    userInfoMap?: Map<string, string>
  ): TimelineData {
    const completed: ProcessedNode[] = [];
    const pending: ProcessedNode[] = [];
    const cc: CCNode[] = [];

    let approvalId = 1;
    let ccId = 1;

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
        task_id: node.task_id,
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

    // 处理timeline事件 - 参照Java版本的逻辑
    if (nodes && Array.isArray(nodes)) {
      for (const event of nodes) {
        const eventType = event.type;

        // 处理审批事件：通过、移除重复、审批拒绝
        if (
          eventType === 'PASS' ||
          eventType === 'REMOVE_REPEAT' ||
          eventType === 'REJECT'
        ) {
          const createTime = event.create_time;
          const userId = event.user_id || null;
          const openId = event.open_id || null;
          const taskId = event.task_id || null;

          // 从task_list中根据taskId获取节点名称
          let nodeName = this.getNodeNameFromTaskList(tasks, taskId);
          if (!nodeName) {
            nodeName = '审批节点';
          }

          // 获取审批人姓名
          const approverId = openId || userId || 'Unknown';
          const approverName = this.getUserName(approverId, userInfoMap);

          const time = this.formatTimestamp(createTime || '');
          const status = eventType === 'REJECT' ? 'rejected' : 'approved';

          // 提取评论信息
          const comment = event.comment || undefined;

          const node: ProcessedNode = {
            id: String(approvalId++),
            nodeName: nodeName,
            nodeType: 'APPROVAL',
            approverName: approverName,
            approverDept: undefined,
            time: time,
            status: status,
            comment: comment,
          };

          completed.push(node);
        }
        // 处理抄送事件
        else if (eventType === 'CC') {
          const createTime = event.create_time;

          // 处理cc_user_list数组
          if (event.cc_user_list && Array.isArray(event.cc_user_list)) {
            for (const ccUser of event.cc_user_list) {
              const ccUserId = ccUser.user_id || null;
              const ccOpenId = ccUser.open_id || null;

              const ccPersonId = ccOpenId || ccUserId || 'Unknown';
              const ccPersonName = this.getUserName(ccPersonId, userInfoMap);
              const ccTime = this.formatTimestamp(createTime || '');

              const ccNode: CCNode = {
                id: 'cc' + ccId++,
                ccNodeName: '抄送',
                ccPersonName: ccPersonName,
                ccPersonDept: undefined,
                ccTime: ccTime,
                status: 'completed', // 参照Java版本：CC节点状态
              };

              cc.push(ccNode);
            }
          }
        }
      }
    }

    // 处理待审批任务 - 从task_list中处理PENDING状态的任务
    if (tasks && Array.isArray(tasks)) {
      for (const task of tasks) {
        const taskStatus = task.status;
        if (taskStatus === 'PENDING') {
          const nodeName = task.node_name || '待审批';
          const userId = task.user_id || null;
          const openId = task.open_id || null;
          const startTime = task.start_time || null;

          const approverId = openId || userId || 'Unknown';
          const approverName = this.getUserName(approverId, userInfoMap);
          const time = startTime ? this.formatTimestamp(startTime) : 'PENDING';

          const node: ProcessedNode = {
            id: String(approvalId++),
            nodeName: nodeName,
            nodeType: 'APPROVAL',
            approverName: approverName,
            approverDept: undefined,
            time: time,
            status: 'pending',
          };

          pending.push(node);
        }
      }
    }

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
   * 从task_list中根据taskId获取节点名称 - 参照Java版本的逻辑
   */
  private getNodeNameFromTaskList(
    tasks: any[],
    taskId: string | null
  ): string | null {
    if (!taskId || !tasks || !Array.isArray(tasks)) {
      return null;
    }

    for (const task of tasks) {
      if (task.id === taskId) {
        return task.node_name || null;
      }
    }

    return null;
  }

  /**
   * Parse formatted time string back to timestamp
   */
  private parseFormattedTime(timeStr: string): number {
    // Parse "YYYY-MM-DD HH:mm:ss" format
    return new Date(timeStr).getTime();
  }

  /**
   * Map Feishu instance status to processed status - 参照Java版本的逻辑
   */
  private mapStatus(status: string): string {
    if (!status) {
      return '进行中';
    }

    switch (status.toUpperCase()) {
      case 'APPROVED':
        return '已通过';
      case 'REJECTED':
        return '已拒绝';
      case 'CANCELED':
        return '已撤销';
      case 'PENDING':
      default:
        return '进行中';
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
