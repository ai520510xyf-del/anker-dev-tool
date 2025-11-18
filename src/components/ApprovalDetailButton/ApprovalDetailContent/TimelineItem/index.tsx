import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import StatusBadge from '../../common/StatusBadge';
import styles from './index.module.less';

/**
 * 统一的时间线节点数据
 */
interface UnifiedTimelineNode {
  id: string;
  nodeName: string;
  nodeType: 'completed' | 'pending' | 'cc';
  approverName: string;
  approverDept?: string;
  time: string;
  status: 'approved' | 'rejected' | 'pending' | 'cc';
  comment?: string;
  isTimeClose?: boolean;
}

/**
 * TimelineItem 组件
 * 显示单个时间线节点
 */
export interface TimelineItemProps {
  /** 节点数据 */
  node: UnifiedTimelineNode;
  /** 是否是最后一个节点（用于隐藏连接线） */
  isLast: boolean;
  /** 节点类型 */
  nodeType: 'completed' | 'pending' | 'cc';
}

const TimelineItem: React.FC<TimelineItemProps> = ({
  node,
  isLast,
  nodeType,
}) => {
  // 获取状态徽章信息
  const badgeInfo = useMemo(() => {
    if (node.status === 'cc') {
      return { emoji: '📧', text: '已抄送', className: 'cc' };
    } else if (node.status === 'approved') {
      return { emoji: '✓', text: '已通过', className: 'approved' };
    } else if (node.status === 'rejected') {
      return { emoji: '✗', text: '已拒绝', className: 'rejected' };
    } else {
      return { emoji: '⏳', text: '待处理', className: 'pending' };
    }
  }, [node.status]);

  // 显示时间（完全对齐参考项目的逻辑）
  const displayTime = useMemo(() => {
    const time = node.time;
    if (time === 'PENDING') {
      return '待处理';
    }
    return time || (node.nodeType === 'pending' ? '等待中...' : '');
  }, [node.time, node.nodeType]);

  // 使用 nodeType prop 或 node.nodeType
  const actualNodeType = nodeType || node.nodeType;

  return (
    <div className={`${styles.timelineNode} ${isLast ? styles.lastNode : ''}`}>
      {/* 节点指示器 */}
      <div className={`${styles.nodeDot} ${styles[actualNodeType]}`}></div>

      {/* 节点内容 */}
      <div className={`${styles.nodeContent} ${styles[actualNodeType]}`}>
        <div className={styles.nodeHeader}>
          <div className={styles.nodeTitle}>
            <span>{node.nodeName}</span>
            <span
              className={`${styles.nodeBadge} ${styles[badgeInfo.className]}`}
            >
              {badgeInfo.emoji} {badgeInfo.text}
            </span>
            {node.isTimeClose && (
              <span className={styles.timeCloseHint}>⚡ 几乎同时</span>
            )}
          </div>
          {displayTime && <div className={styles.nodeTime}>{displayTime}</div>}
        </div>

        <div className={styles.nodeInfo}>
          <div className={styles.nodeInfoRow}>
            <span className={styles.nodeInfoLabel}>
              {node.status === 'cc' ? '抄送人:' : '审批人:'}
            </span>
            <span>
              {node.approverName}
              {node.approverDept && ` (${node.approverDept})`}
            </span>
          </div>
        </div>

        {node.comment && (
          <div className={styles.nodeComment}>{node.comment}</div>
        )}
      </div>
    </div>
  );
};

// Props 校验：PropTypes + TypeScript 类型
TimelineItem.propTypes = {
  node: PropTypes.shape({
    id: PropTypes.string.isRequired,
    nodeName: PropTypes.string.isRequired,
    nodeType: PropTypes.oneOf(['completed', 'pending', 'cc']).isRequired,
    approverName: PropTypes.string.isRequired,
    approverDept: PropTypes.string,
    time: PropTypes.string.isRequired,
    status: PropTypes.oneOf(['approved', 'rejected', 'pending', 'cc'])
      .isRequired,
    comment: PropTypes.string,
    isTimeClose: PropTypes.bool,
  }).isRequired as PropTypes.Validator<UnifiedTimelineNode>,
  isLast: PropTypes.bool.isRequired,
  nodeType: PropTypes.oneOf(['completed', 'pending', 'cc']).isRequired,
};

export default TimelineItem;
