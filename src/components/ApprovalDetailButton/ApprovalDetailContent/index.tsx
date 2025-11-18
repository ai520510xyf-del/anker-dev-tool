import React, { useMemo, useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useApprovalData } from '../hooks/useApprovalData';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import { isTerminalStatus } from '../utils';
import Skeleton from '../common/Skeleton';
import ErrorState from '../common/ErrorState';
import ApprovalTimeline from './ApprovalTimeline';
import styles from './index.module.less';

/**
 * ApprovalDetailContent 组件
 * 审批详情内容组件
 */
export interface ApprovalDetailContentProps {
  /** 审批实例 code */
  code: string;
  /** 系统 code */
  systemCode: string;
  /** 系统密钥 */
  systemKey: string;
  /** 错误回调 */
  onError?: (error: Error) => void;
  /** 关闭回调 */
  onClose?: () => void;
}

const ApprovalDetailContent: React.FC<ApprovalDetailContentProps> = ({
  code,
  systemCode,
  systemKey,
  onError,
  onClose,
}) => {
  const { data, loading, error, refetch } = useApprovalData(
    code,
    systemCode,
    systemKey
  );

  const [isRefreshing, setIsRefreshing] = useState(false);

  // 判断是否应该自动刷新
  const shouldAutoRefresh = useMemo(() => {
    if (!data) return false;

    // 同时满足两个条件时停止:
    // 1. 审批状态为终态
    const isTerminalState = isTerminalStatus(data.header.status);
    // 2. 无待审批节点
    const noPendingNodes = data.timeline.pending.length === 0;

    return !(isTerminalState && noPendingNodes);
  }, [data]);

  // 合并标题:审批详情 - 【审批流程名称】
  const pageTitle = useMemo(
    () => (data ? `审批详情 - ${data.header.approvalName}` : '审批详情'),
    [data]
  );

  const handleRefetch = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  useAutoRefresh(shouldAutoRefresh, handleRefetch);

  // 错误处理
  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  if (loading) {
    return (
      <div className={styles.wrapper}>
        {onClose && (
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="关闭"
          >
            ✕
          </button>
        )}
        <div className={styles.container}>
          <Skeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.wrapper}>
        {onClose && (
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="关闭"
          >
            ✕
          </button>
        )}
        <div className={styles.container}>
          <ErrorState message={error.message} onRetry={refetch} />
        </div>
      </div>
    );
  }

  if (!data) return null;

  // 获取状态徽章类名和文本
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return styles.approved;
      case 'REJECTED':
        return styles.rejected;
      case 'PENDING':
      default:
        return styles.pending;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return '✓ 审批通过';
      case 'REJECTED':
        return '✗ 审批拒绝';
      case 'CANCELED':
        return '⊘ 已撤销';
      case 'PENDING':
      default:
        return '⏳ 审批进行中';
    }
  };

  return (
    <div className={styles.wrapper}>
      {onClose && (
        <button className={styles.closeBtn} onClick={onClose} aria-label="关闭">
          ✕
        </button>
      )}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <h1 className={styles.title}>{pageTitle}</h1>
          <button
            className={styles.refreshButton}
            onClick={handleRefetch}
            disabled={isRefreshing}
            title="刷新数据"
          >
            {isRefreshing ? '🔄' : '↻'}
          </button>
        </div>
        <div className={styles.headerInfo}>
          {(data.header.serialNumber || data.header.instanceId) && (
            <div className={styles.headerInfoItem}>
              <span className={styles.headerInfoLabel}>审批单号:</span>
              <span className={styles.headerInfoValue}>
                {data.header.serialNumber || data.header.instanceId}
              </span>
            </div>
          )}
          <div className={styles.headerInfoItem}>
            <span className={styles.headerInfoLabel}>申请人:</span>
            <span className={styles.headerInfoValue}>
              {data.header.applicant}
            </span>
          </div>
          <div className={styles.headerInfoItem}>
            <span className={styles.headerInfoLabel}>申请时间:</span>
            <span className={styles.headerInfoValue}>
              {data.header.applyTime}
            </span>
          </div>
          <div className={styles.headerInfoItem}>
            <span className={styles.headerInfoLabel}>状态:</span>
            <span
              className={`${styles.headerStatusBadge} ${getStatusBadgeClass(data.header.status)}`}
            >
              {getStatusText(data.header.status)}
            </span>
          </div>
        </div>
      </div>
      <div className={styles.container}>
        <ApprovalTimeline timeline={data.timeline} />
      </div>
    </div>
  );
};

// Props 校验：PropTypes + TypeScript 类型
ApprovalDetailContent.propTypes = {
  code: PropTypes.string.isRequired,
  systemCode: PropTypes.string.isRequired,
  systemKey: PropTypes.string.isRequired,
  onError: PropTypes.func,
  onClose: PropTypes.func,
};

export default ApprovalDetailContent;
