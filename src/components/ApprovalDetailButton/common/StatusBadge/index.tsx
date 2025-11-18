import React from 'react';
import PropTypes from 'prop-types';
import styles from './index.module.less';

/**
 * StatusBadge 组件 - 基于 Ant Design Badge 的二次封装
 * 用于显示审批状态
 */
export interface StatusBadgeProps {
  /** 状态类型 */
  status: 'approved' | 'rejected' | 'pending';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  // 状态配置
  const statusConfig = {
    approved: {
      text: '已通过',
      icon: '✓',
      className: styles.badgeApproved,
    },
    rejected: {
      text: '已拒绝',
      icon: '✗',
      className: styles.badgeRejected,
    },
    pending: {
      text: '审批进行中',
      icon: '⏳',
      className: styles.badgePending,
    },
  };

  const config = statusConfig[status];

  return (
    <span className={config.className}>
      <span className={styles.icon}>{config.icon}</span>
      {config.text}
    </span>
  );
};

// Props 校验：PropTypes + TypeScript 类型
StatusBadge.propTypes = {
  status: PropTypes.oneOf(['approved', 'rejected', 'pending'])
    .isRequired as PropTypes.Validator<'approved' | 'rejected' | 'pending'>,
};

export default StatusBadge;
