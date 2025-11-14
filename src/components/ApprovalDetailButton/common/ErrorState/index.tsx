import React from 'react';
import PropTypes from 'prop-types';
import { Empty, Button, ButtonProps } from 'antd';
import styles from './index.module.less';

/**
 * ErrorState 组件 - 基于 Ant Design Empty 的二次封装
 * 用于显示错误状态和重试按钮
 */
export interface ErrorStateProps {
  /** 错误消息 */
  message: string;
  /** 重试回调函数 */
  onRetry: () => void;
  /** 重试按钮属性 */
  retryButtonProps?: ButtonProps;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  message,
  onRetry,
  retryButtonProps,
}) => {
  return (
    <div className={styles.container}>
      <Empty
        description={message}
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        className={styles.empty}
      >
        <Button type="primary" onClick={onRetry} {...retryButtonProps}>
          重试
        </Button>
      </Empty>
    </div>
  );
};

// Props 校验：PropTypes + TypeScript 类型
ErrorState.propTypes = {
  message: PropTypes.string.isRequired,
  onRetry: PropTypes.func.isRequired,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  retryButtonProps: PropTypes.object as any,
};

export default ErrorState;
