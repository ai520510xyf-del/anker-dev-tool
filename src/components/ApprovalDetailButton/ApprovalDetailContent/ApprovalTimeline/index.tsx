import React from 'react';
import PropTypes from 'prop-types';
import type { TimelineData } from '../../types/approval.types';
import TimelineItem from '../TimelineItem';
import CCSection from '../CCSection';
import styles from './index.module.less';

/**
 * ApprovalTimeline 组件
 * 显示完整的审批时间线
 */
export interface ApprovalTimelineProps {
  /** 时间线数据 */
  timeline: TimelineData;
}

const ApprovalTimeline: React.FC<ApprovalTimelineProps> = ({ timeline }) => {
  return (
    <div className={styles.container}>
      {/* 已完成部分 */}
      {timeline.completed.length > 0 && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>
            ✅ 已完成 ({timeline.completed.length})
          </h3>
          <div className={styles.list}>
            {/* 列表渲染必须添加唯一 key */}
            {timeline.completed.map((node, index) => (
              <TimelineItem
                key={node.id}
                node={node}
                isCompleted={index < timeline.completed.length - 1}
              />
            ))}
          </div>
        </section>
      )}

      {/* 抄送部分 */}
      <CCSection ccNodes={timeline.cc} />

      {/* 分隔线 */}
      {timeline.pending.length > 0 && (
        <div className={styles.divider}>以下为待审批节点</div>
      )}

      {/* 待审批部分 */}
      {timeline.pending.length > 0 && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>
            ⏳ 待审批 ({timeline.pending.length})
          </h3>
          <div className={styles.list}>
            {/* 列表渲染必须添加唯一 key */}
            {timeline.pending.map(node => (
              <TimelineItem key={node.id} node={node} isCompleted={false} />
            ))}
          </div>
        </section>
      )}

      {/* 底部说明 */}
      <div className={styles.footerNote}>
        <p>* 审批节点按时间顺序排列</p>
        <p>* 时间接近的节点可能为并行审批或快速连续审批</p>
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
  }).isRequired,
};

export default ApprovalTimeline;
