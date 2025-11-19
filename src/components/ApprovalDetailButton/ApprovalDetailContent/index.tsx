import React, { useMemo, useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useApprovalData } from '../hooks/useApprovalData';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import { isTerminalStatus } from '../utils';
import Skeleton from '../common/Skeleton';
import ErrorState from '../common/ErrorState';
import type {
  TimelineData,
  ProcessedNode,
  CCNode,
  ArrayTimelineItem,
} from '../types/approval.types';
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

// 统一的时间线节点类型（用于渲染）
interface UnifiedTimelineNode {
  id: string;
  nodeName: string;
  nodeType: 'completed' | 'pending' | 'cc';
  approverName: string;
  approverDept?: string;
  time: string;
  ccTime?: string;
  status: 'approved' | 'rejected' | 'pending' | 'cc';
  comment?: string;
  isTimeClose?: boolean;
  // CC 节点特有字段
  ccNodeName?: string;
  ccPersonName?: string;
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

  // 规范化 timeline 数据：兼容数组和对象两种格式
  const normalizedTimeline = useMemo<TimelineData>(() => {
    if (!data?.timeline) {
      return { completed: [], pending: [], cc: [] };
    }

    // 如果是数组格式，需要转换为对象格式
    if (Array.isArray(data.timeline)) {
      const completed: ProcessedNode[] = [];
      const pending: ProcessedNode[] = [];
      const cc: CCNode[] = [];

      data.timeline.forEach((item: ArrayTimelineItem) => {
        const nodeName = item.name || item.nodeName || '未知节点';
        const approverName =
          item.user || item.approverName || item.approver || '未知';
        const time = item.time || item.timestamp || '';
        const hasTime = Boolean(time); // 有 time 字段说明已完成

        // 根据 type 和 status 字段分类
        if (item.type === 'cc') {
          // CC 类型
          cc.push({
            id: item.id,
            ccNodeName: nodeName,
            ccPersonName: approverName,
            ccPersonDept: item.dept || item.approverDept,
            ccTime: time,
          });
        } else if (item.status === 'approved' || item.status === 'rejected') {
          // 已完成的状态（优先判断 status）
          completed.push({
            id: item.id,
            nodeName: nodeName,
            approverName: approverName,
            approverDept: item.dept || item.approverDept,
            time: time,
            status: item.status === 'approved' ? 'approved' : 'rejected',
            comment: item.comment,
            nodeType: 'APPROVAL',
          });
        } else if (item.status === 'pending') {
          // 待处理的状态
          pending.push({
            id: item.id,
            nodeName: nodeName,
            approverName: approverName,
            approverDept: item.dept || item.approverDept,
            time: time || 'PENDING',
            status: 'pending',
            comment: item.comment,
            nodeType: 'APPROVAL',
          });
        } else if (hasTime) {
          // 有 time 字段说明已完成（数组格式通常只有 type，没有 status）
          completed.push({
            id: item.id,
            nodeName: nodeName,
            approverName: approverName,
            approverDept: item.dept || item.approverDept,
            time: time,
            status: 'approved',
            comment: item.comment,
            nodeType: 'APPROVAL',
          });
        } else if (item.type === 'submit' || item.status === 'completed') {
          // submit 类型或已完成，放入 completed
          completed.push({
            id: item.id,
            nodeName: nodeName,
            approverName: approverName,
            approverDept: item.dept || item.approverDept,
            time: time,
            status: 'approved',
            comment: item.comment,
            nodeType: 'APPROVAL',
          });
        } else {
          // 没有 time 字段，可能是待处理，放入 pending
          pending.push({
            id: item.id,
            nodeName: nodeName,
            approverName: approverName,
            approverDept: item.dept || item.approverDept,
            time: time || 'PENDING',
            status: 'pending',
            comment: item.comment,
            nodeType: 'APPROVAL',
          });
        }
      });

      return { completed, pending, cc };
    }

    // 如果已经是对象格式，直接返回
    return {
      completed: data.timeline.completed || [],
      pending: data.timeline.pending || [],
      cc: data.timeline.cc || [],
    };
  }, [data]);

  // 判断是否应该自动刷新
  const shouldAutoRefresh = useMemo(() => {
    if (!data) return false;

    const isTerminalState = isTerminalStatus(data.header.status);
    const noPendingNodes = normalizedTimeline.pending.length === 0;

    return !(isTerminalState && noPendingNodes);
  }, [data, normalizedTimeline]);

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

  // 获取状态徽章类名 - 参照Java版本，支持多种状态格式
  const getStatusBadgeClass = (status: string) => {
    const upperStatus = status.toUpperCase();
    if (
      upperStatus === 'APPROVED' ||
      status === '已完成' ||
      status === '已通过'
    ) {
      return styles.approved;
    }
    if (upperStatus === 'REJECTED' || status === '已拒绝') {
      return styles.rejected;
    }
    if (upperStatus === 'CANCELED' || status === '已撤销') {
      return styles.canceled || styles.pending;
    }
    // PENDING, 审批中, 进行中
    return styles.pending;
  };

  // 获取状态文本 - 参照Java版本，支持中文状态
  const getStatusText = (status: string) => {
    const upperStatus = status.toUpperCase();
    if (
      upperStatus === 'APPROVED' ||
      status === '已完成' ||
      status === '已通过'
    ) {
      return '✓ 审批通过';
    }
    if (upperStatus === 'REJECTED' || status === '已拒绝') {
      return '✗ 审批拒绝';
    }
    if (upperStatus === 'CANCELED' || status === '已撤销') {
      return '⊘ 已撤销';
    }
    // PENDING, 审批中, 进行中
    return '⏳ 审批进行中';
  };

  // 获取节点徽章类名
  const getNodeBadgeClass = (status: string, nodeType: string) => {
    if (nodeType === 'cc') return `${styles.nodeBadge} ${styles.cc}`;
    if (status === 'approved') return `${styles.nodeBadge} ${styles.approved}`;
    if (status === 'rejected') return `${styles.nodeBadge} ${styles.rejected}`;
    return `${styles.nodeBadge} ${styles.pending}`;
  };

  // 获取节点徽章文本
  const getNodeBadgeText = (status: string, nodeType: string) => {
    if (nodeType === 'cc') return '📧 已抄送';
    if (status === 'approved') return '✓ 已通过';
    if (status === 'rejected') return '✗ 已拒绝';
    return '⏳ 待处理';
  };

  // 渲染时间线节点
  const renderTimelineNode = (
    node: UnifiedTimelineNode,
    type: 'completed' | 'pending' | 'cc'
  ) => {
    const displayTime = (() => {
      const time = node.time || node.ccTime;
      if (time === 'PENDING') {
        return '待处理';
      }
      return time || (type === 'pending' ? '等待中...' : '');
    })();

    const displayNodeName =
      type === 'cc'
        ? node.ccNodeName || node.nodeName || '抄送'
        : node.nodeName || '未知节点';

    const displayPersonName = node.approverName || node.ccPersonName || '未知';

    return (
      <div key={`${type}-${node.id}`} className={styles.timelineNode}>
        <div className={`${styles.nodeDot} ${styles[type]}`}></div>
        <div className={`${styles.nodeContent} ${styles[type]}`}>
          <div className={styles.nodeHeader}>
            <div className={styles.nodeTitle}>
              <span>{displayNodeName}</span>
              <span className={getNodeBadgeClass(node.status, type)}>
                {getNodeBadgeText(node.status, type)}
              </span>
              {node.isTimeClose && (
                <span className={styles.timeCloseHint}>⚡ 几乎同时</span>
              )}
            </div>
            <div className={styles.nodeTime}>{displayTime}</div>
          </div>
          <div className={styles.nodeInfo}>
            <div className={styles.nodeInfoRow}>
              <span className={styles.nodeInfoLabel}>
                {type === 'cc' ? '抄送人:' : '审批人:'}
              </span>
              <span>
                {displayPersonName}
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

  // 渲染分隔线
  const renderDivider = () => (
    <div className={styles.dividerLine}>
      <span className={styles.dividerText}>以下为待审批节点</span>
    </div>
  );

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
        <div className={styles.loadingContainer}>
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
        <div className={styles.errorContainer}>
          <ErrorState message={error.message} onRetry={refetch} />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const completedNodes = normalizedTimeline.completed || [];
  const ccNodes = normalizedTimeline.cc || [];
  const pendingNodes = normalizedTimeline.pending || [];

  // 合并已完成节点和抄送节点，并按时间排序
  const allCompletedNodes: UnifiedTimelineNode[] = [
    ...completedNodes.map((node: ProcessedNode) => ({
      id: node.id,
      nodeName: node.nodeName,
      nodeType: 'completed' as const,
      approverName: node.approverName,
      approverDept: node.approverDept,
      time: node.time,
      status: node.status,
      comment: node.comment,
      isTimeClose: node.isTimeClose,
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
      ccNodeName: node.ccNodeName,
      ccPersonName: node.ccPersonName,
    })),
  ];

  // 按时间排序（最早的在前面）
  allCompletedNodes.sort((a, b) => {
    const timeA = new Date(a.time || a.ccTime || '').getTime();
    const timeB = new Date(b.time || b.ccTime || '').getTime();
    return timeA - timeB;
  });

  // 待审批节点
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
              <span className={styles.headerInfoLabel}>申批单号:</span>
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

      {/* 统一时间线 */}
      <div className={styles.container}>
        <div className={styles.unifiedTimeline}>
          {allCompletedNodes.length === 0 && allPendingNodes.length === 0 ? (
            <div className={styles.emptyState}>暂无审批节点数据</div>
          ) : (
            <>
              {/* 已完成和抄送节点 */}
              {allCompletedNodes.map(node =>
                renderTimelineNode(node, node.nodeType)
              )}

              {/* 分隔线（如果有待审批节点） */}
              {allPendingNodes.length > 0 &&
                allCompletedNodes.length > 0 &&
                renderDivider()}

              {/* 待审批节点 */}
              {allPendingNodes.map(node => renderTimelineNode(node, 'pending'))}
            </>
          )}
        </div>

        {/* 底部说明 */}
        <div className={styles.footerNote}>
          * 审批节点按时间顺序排列
          <br />* 时间接近的节点可能为并行审批或快速连续审批
        </div>
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
