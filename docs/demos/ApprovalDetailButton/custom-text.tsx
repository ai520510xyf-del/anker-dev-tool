/**
 * title: 自定义按钮文本
 * description: 通过 `text` 属性可以自定义按钮显示的文本内容，适应不同的业务场景。默认文本为"审批流程"。
 */
import React from 'react';
import { Space } from 'antd';
import { ApprovalDetailButton } from 'cl-dev-tool';

const CustomTextDemo = () => {
  return (
    <Space>
      <ApprovalDetailButton
        code="E1B6E4B4-390D-461D-9675-6B1D307EBB5F"
        systemCode="srm"
        systemKey="srm_secret_key_001"
        text="查看审批详情"
      />
      <ApprovalDetailButton
        code="E1B6E4B4-390D-461D-9675-6B1D307EBB5F"
        systemCode="srm"
        systemKey="srm_secret_key_001"
        text="审批进度"
      />
      <ApprovalDetailButton
        code="E1B6E4B4-390D-461D-9675-6B1D307EBB5F"
        systemCode="srm"
        systemKey="srm_secret_key_001"
        text="流程详情"
      />
    </Space>
  );
};

export default CustomTextDemo;
