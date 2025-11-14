import React from 'react';
import PropTypes from 'prop-types';
import type { CCNode } from '../../types/approval.types';
import styles from './index.module.less';

/**
 * CCSection 组件
 * 显示抄送信息
 */
export interface CCSectionProps {
  /** 抄送节点列表 */
  ccNodes: CCNode[];
}

const CCSection: React.FC<CCSectionProps> = ({ ccNodes }) => {
  if (ccNodes.length === 0) return null;

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>📧 抄送 ({ccNodes.length})</h3>
      <div className={styles.list}>
        {/* 列表渲染必须添加唯一 key */}
        {ccNodes.map(node => (
          <div key={node.id} className={styles.ccItem}>
            <div className={styles.ccPerson}>
              {node.ccPersonName}
              {node.ccPersonDept && ` (${node.ccPersonDept})`}
            </div>
            {node.ccTime && <div className={styles.ccTime}>{node.ccTime}</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

// Props 校验：PropTypes + TypeScript 类型
CCSection.propTypes = {
  ccNodes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      ccPersonName: PropTypes.string.isRequired,
      ccPersonDept: PropTypes.string,
      ccTime: PropTypes.string,
    })
  ).isRequired as PropTypes.Validator<CCNode[]>,
};

export default CCSection;
