import React from 'react';
import PropTypes from 'prop-types';
import styles from './index.module.less';

/**
 * DrawerHeader 组件
 * Drawer 头部组件，包含标题和关闭按钮
 */
export interface DrawerHeaderProps {
  /** 标题 */
  title: string;
  /** 关闭回调 */
  onClose?: () => void;
}

const DrawerHeader: React.FC<DrawerHeaderProps> = ({ title, onClose }) => {
  return (
    <div className={styles.header}>
      <div className={styles.title}>{title}</div>
      {onClose && (
        <button className={styles.closeBtn} onClick={onClose} aria-label="关闭">
          ✕
        </button>
      )}
    </div>
  );
};

// Props 校验：PropTypes + TypeScript 类型
DrawerHeader.propTypes = {
  title: PropTypes.string.isRequired,
  onClose: PropTypes.func,
};

export default DrawerHeader;
