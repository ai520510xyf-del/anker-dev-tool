/**
 * title: 自定义按钮文本
 * description: 通过 `text` 属性可以自定义按钮显示的文本内容，适应不同的业务场景。默认文本为"审批流程"。
 */
import React from 'react';
import { Space } from 'antd';
import ApprovalDetailButton from '@/components/ApprovalDetailButton';

const CustomTextDemo = () => {
  return (
    <Space>
      <ApprovalDetailButton
        code="447F8A25-3C7F-4B18-8F44-7242680D9477"
        systemCode="srm"
        systemKey="srm_secret_key_001"
        apiBaseUrl="https://cl-dev-tool-server.onrender.com/api"
        text="查看审批详情"
      />
      <ApprovalDetailButton
        code="447F8A25-3C7F-4B18-8F44-7242680D9477"
        systemCode="srm"
        systemKey="srm_secret_key_001"
        apiBaseUrl="https://cl-dev-tool-server.onrender.com/api"
        text="审批进度"
      />
      <ApprovalDetailButton
        code="447F8A25-3C7F-4B18-8F44-7242680D9477"
        systemCode="srm"
        systemKey="srm_secret_key_001"
        apiBaseUrl="https://cl-dev-tool-server.onrender.com/api"
        text="流程详情"
      />
    </Space>
  );
};

export default CustomTextDemo;
