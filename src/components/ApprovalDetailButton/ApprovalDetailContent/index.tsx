import React, { useMemo, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useApprovalData } from '../hooks/useApprovalData';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import { isTerminalStatus } from '../utils';
import Skeleton from '../common/Skeleton';
import ErrorState from '../common/ErrorState';
import ApprovalHeader from './ApprovalHeader';
import ApprovalTimeline from './ApprovalTimeline';
import DrawerHeader from './DrawerHeader';
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
    await refetch();
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
      <>
        <DrawerHeader title="审批详情" onClose={onClose} />
        <div className={styles.container}>
          <Skeleton />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <DrawerHeader title="审批详情" onClose={onClose} />
        <div className={styles.container}>
          <ErrorState message={error.message} onRetry={refetch} />
        </div>
      </>
    );
  }

  if (!data) return null;

  return (
    <>
      <DrawerHeader title={pageTitle} onClose={onClose} />
      <div className={styles.container}>
        <ApprovalHeader header={data.header} />
        <ApprovalTimeline timeline={data.timeline} />
      </div>
    </>
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
