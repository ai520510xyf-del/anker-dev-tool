import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import type { ProcessedNode } from '../../types/approval.types';
import StatusBadge from '../../common/StatusBadge';
import styles from './index.module.less';

/**
 * TimelineItem 组件
 * 显示单个时间线节点
 */
export interface TimelineItemProps {
  /** 节点数据 */
  node: ProcessedNode;
  /** 是否已完成（用于显示连接线） */
  isCompleted: boolean;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ node, isCompleted }) => {
  const itemClassName = useMemo(
    () =>
      [styles.container, node.isTimeClose ? styles.timeClose : '']
        .filter(Boolean)
        .join(' '),
    [node.isTimeClose]
  );

  return (
    <div className={itemClassName}>
      <div className={styles.indicator}>
        <div className={`${styles.dot} ${styles[node.status]}`}></div>
        {isCompleted && <div className={styles.line}></div>}
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <span className={styles.nodeName}>{node.nodeName}</span>
          <StatusBadge status={node.status} />
        </div>

        <div className={styles.info}>
          <div className={styles.infoRow}>
            <span className={styles.label}>审批人:</span>
            <span className={styles.value}>
              {node.approverName}
              {node.approverDept && ` (${node.approverDept})`}
            </span>
          </div>
          <div className={styles.time}>{node.time}</div>
        </div>

        {node.comment && (
          <div className={styles.comment}>
            <span className={styles.commentLabel}>审批意见:</span>
            <span className={styles.commentText}>{node.comment}</span>
          </div>
        )}

        {node.isTimeClose && node.timeCloseNote && (
          <div className={styles.timeCloseNote}>⚠️ {node.timeCloseNote}</div>
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
    nodeType: PropTypes.oneOf(['START', 'APPROVAL', 'CC', 'END']).isRequired,
    approverName: PropTypes.string.isRequired,
    approverDept: PropTypes.string,
    time: PropTypes.string.isRequired,
    status: PropTypes.oneOf(['approved', 'rejected', 'pending']).isRequired,
    comment: PropTypes.string,
    isTimeClose: PropTypes.bool,
    timeDiffSeconds: PropTypes.number,
    timeCloseNote: PropTypes.string,
  }).isRequired as PropTypes.Validator<ProcessedNode>,
  isCompleted: PropTypes.bool.isRequired,
};

export default TimelineItem;
