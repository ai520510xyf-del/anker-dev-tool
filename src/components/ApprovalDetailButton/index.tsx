import React, { useState, useCallback, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Button, ButtonProps } from 'antd';
import { DEFAULT_CONFIG } from './constants';
import ApprovalDetailContent from './ApprovalDetailContent';
import './styles/variables.less';
import styles from './index.module.less';

/**
 * ApprovalDetailButton 组件 - 基于 Ant Design Button 和 Drawer 的二次封装
 * 审批详情按钮组件，点击按钮打开侧边弹窗展示审批详情
 */
export interface ApprovalDetailButtonProps {
  /** 审批实例 code（必填） */
  code: string;
  /** 系统 code（必填） */
  systemCode: string;
  /** 系统密钥（必填） */
  systemKey: string;
  /** 按钮文本，默认：'审批流程' */
  text?: string;
  /** Button 组件的其他属性 */
  buttonProps?: ButtonProps;
  /** 关闭回调 */
  onClose?: () => void;
  /** 错误回调 */
  onError?: (error: Error) => void;
}

const ApprovalDetailButton: React.FC<ApprovalDetailButtonProps> = ({
  code,
  systemCode,
  systemKey,
  text = DEFAULT_CONFIG.BUTTON_TEXT,
  buttonProps,
  onClose,
  onError,
}) => {
  const [visible, setVisible] = useState(false);

  // 打开弹窗
  const handleOpen = useCallback(() => {
    setVisible(true);
  }, []);

  // 关闭弹窗
  const handleClose = useCallback(() => {
    setVisible(false);
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  // 锁定 body 滚动
  useEffect(() => {
    if (visible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [visible]);

  // 按钮是否禁用（缺少必填参数时禁用）
  const disabled = useMemo(
    () => !code || !systemCode || !systemKey,
    [code, systemCode, systemKey]
  );

  return (
    <>
      <Button
        onClick={handleOpen}
        disabled={disabled}
        className={styles.button}
        {...buttonProps}
      >
        {text}
      </Button>
      {visible && (
        <>
          {/* Backdrop */}
          <div className={styles.backdrop} onClick={handleClose} />

          {/* Drawer */}
          <div className={styles.drawer}>
            <ApprovalDetailContent
              code={code}
              systemCode={systemCode}
              systemKey={systemKey}
              onError={onError}
              onClose={handleClose}
            />
          </div>
        </>
      )}
    </>
  );
};

// Props 校验：PropTypes + TypeScript 类型
ApprovalDetailButton.propTypes = {
  code: PropTypes.string.isRequired,
  systemCode: PropTypes.string.isRequired,
  systemKey: PropTypes.string.isRequired,
  text: PropTypes.string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  buttonProps: PropTypes.object as any,
  onClose: PropTypes.func,
  onError: PropTypes.func,
};

export default ApprovalDetailButton;
