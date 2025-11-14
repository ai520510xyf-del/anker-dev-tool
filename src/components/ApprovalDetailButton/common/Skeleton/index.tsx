import React from 'react';
import {
  Skeleton as AntSkeleton,
  SkeletonProps as AntSkeletonProps,
} from 'antd';
import styles from './index.module.less';

/**
 * Skeleton 组件 - 基于 Ant Design Skeleton 的二次封装
 * 用于加载状态占位
 */
export interface SkeletonProps extends AntSkeletonProps {
  /** 是否显示动画效果 */
  active?: boolean;
}

const Skeleton: React.FC<SkeletonProps> = ({ active = true, ...restProps }) => {
  return (
    <div className={styles.container}>
      <AntSkeleton
        active={active}
        avatar
        paragraph={{ rows: 4 }}
        {...restProps}
      />
      <AntSkeleton
        active={active}
        paragraph={{ rows: 3 }}
        className={styles.skeletonItem}
        {...restProps}
      />
      <AntSkeleton
        active={active}
        paragraph={{ rows: 3 }}
        className={styles.skeletonItem}
        {...restProps}
      />
    </div>
  );
};

export default Skeleton;
