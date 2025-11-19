/**
 * title: 基础用法
 * description: 最简单的用法，只需要传入必填的 `code`、`systemCode` 和 `systemKey` 属性即可。点击按钮会从右侧滑出侧边弹窗，展示完整的审批流程。
 */
import React from 'react';
import { ApprovalDetailButton } from 'cl-dev-tool';

const BasicDemo = () => {
  return (
    <ApprovalDetailButton
      code="2E313535-5ED7-4D92-95D8-51E85D7298EB"
      systemCode="srm"
      systemKey="srm_secret_key_001"
    />
  );
};

export default BasicDemo;
