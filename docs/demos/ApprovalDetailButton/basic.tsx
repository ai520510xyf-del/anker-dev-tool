/**
 * title: 基础用法
 * description: 最简单的用法，只需要传入必填的 `code`、`systemCode` 和 `systemKey` 属性即可。点击按钮会从右侧滑出侧边弹窗，展示完整的审批流程。
 */
import React from 'react';
import ApprovalDetailButton from '@/components/ApprovalDetailButton';

const BasicDemo = () => {
  return (
    <ApprovalDetailButton
      code="447F8A25-3C7F-4B18-8F44-7242680D9477"
      systemCode="srm"
      systemKey="srm_secret_key_001"
    />
  );
};

export default BasicDemo;
