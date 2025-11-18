import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import type {
  TimelineData,
  ProcessedNode,
  CCNode,
} from '../../types/approval.types';
import TimelineItem from '../TimelineItem';
import styles from './index.module.less';

/**
 * 统一的时间线节点类型
 */
interface UnifiedTimelineNode {
  id: string;
  nodeName: string;
  nodeType: 'completed' | 'pending' | 'cc';
  approverName: string;
  approverDept?: string;
  time: string;
  ccTime?: string; // CC 节点的时间字段
  status: 'approved' | 'rejected' | 'pending' | 'cc';
  comment?: string;
  isTimeClose?: boolean;
}

/**
 * ApprovalTimeline 组件
 * 显示完整的审批时间线（统一格式，按时间排序）
 */
export interface ApprovalTimelineProps {
  /** 时间线数据 */
  timeline: TimelineData;
}

const ApprovalTimeline: React.FC<ApprovalTimelineProps> = ({ timeline }) => {
  // 合并并排序所有节点
  const unifiedNodes = useMemo(() => {
    const completedNodes = timeline.completed || [];
    const ccNodes = timeline.cc || [];
    const pendingNodes = timeline.pending || [];

    // 合并已完成节点和抄送节点（完全对齐参考项目的实现）
    const allCompletedNodes: UnifiedTimelineNode[] = [
      ...completedNodes.map((node: ProcessedNode) => ({
        ...node,
        nodeType: 'completed' as const,
      })),
      ...ccNodes.map((node: CCNode) => ({
        id: node.id,
        nodeName: node.ccNodeName || '抄送',
        nodeType: 'cc' as const,
        approverName: node.ccPersonName,
        approverDept: node.ccPersonDept,
        time: '',
        ccTime: node.ccTime || '',
        status: 'cc' as const,
        comment: undefined,
        isTimeClose: false,
      })),
    ];

    // 按时间排序（最早的在前面）- 对齐参考项目的排序逻辑
    allCompletedNodes.sort((a, b) => {
      const timeA = new Date(a.time || a.ccTime || '').getTime();
      const timeB = new Date(b.time || b.ccTime || '').getTime();
      return timeA - timeB;
    });

    // 合并待审批节点
    const allPendingNodes: UnifiedTimelineNode[] = pendingNodes.map(
      (node: ProcessedNode) => ({
        id: node.id,
        nodeName: node.nodeName,
        nodeType: 'pending' as const,
        approverName: node.approverName,
        approverDept: node.approverDept,
        time: node.time,
        status: node.status,
        comment: node.comment,
        isTimeClose: node.isTimeClose,
      })
    );

    return { completed: allCompletedNodes, pending: allPendingNodes };
  }, [timeline]);

  // 如果所有节点都为空，显示空状态
  if (
    unifiedNodes.completed.length === 0 &&
    unifiedNodes.pending.length === 0
  ) {
    return <div className={styles.emptyState}>暂无审批节点数据</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.unifiedTimeline}>
        {/* 已完成和抄送节点 */}
        {unifiedNodes.completed.map((node, index) => (
          <TimelineItem
            key={node.id}
            node={node}
            isLast={
              index === unifiedNodes.completed.length - 1 &&
              unifiedNodes.pending.length === 0
            }
            nodeType={node.nodeType}
          />
        ))}

        {/* 分隔线（如果有待审批节点） */}
        {unifiedNodes.pending.length > 0 &&
          unifiedNodes.completed.length > 0 && (
            <div className={styles.divider}>
              <span className={styles.dividerText}>以下为待审批节点</span>
            </div>
          )}

        {/* 待审批节点 */}
        {unifiedNodes.pending.map((node, index) => (
          <TimelineItem
            key={node.id}
            node={node}
            isLast={index === unifiedNodes.pending.length - 1}
            nodeType={node.nodeType}
          />
        ))}
      </div>

      {/* 底部说明 */}
      <div className={styles.footerNote}>
        * 审批节点按时间顺序排列
        <br />* 时间接近的节点可能为并行审批或快速连续审批
      </div>
    </div>
  );
};

// Props 校验：PropTypes + TypeScript 类型
ApprovalTimeline.propTypes = {
  timeline: PropTypes.shape({
    completed: PropTypes.array.isRequired,
    pending: PropTypes.array.isRequired,
    cc: PropTypes.array.isRequired,
  }).isRequired as PropTypes.Validator<TimelineData>,
};

export default ApprovalTimeline;
