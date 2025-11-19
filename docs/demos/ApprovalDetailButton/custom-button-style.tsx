/**
 * title: 自定义按钮样式
 * description: 通过 `buttonProps` 属性可以传递 Ant Design Button 组件的所有属性，实现按钮样式的自定义，包括类型、尺寸、图标等。
 */
import React from 'react';
import { Space } from 'antd';
import {
  EyeOutlined,
  FileSearchOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { ApprovalDetailButton } from 'cl-dev-tool';

const CustomButtonStyleDemo = () => {
  return (
    <Space wrap>
      <ApprovalDetailButton
        code="E1B6E4B4-390D-461D-9675-6B1D307EBB5F"
        systemCode="srm"
        systemKey="srm_secret_key_001"
        text="主要按钮"
        buttonProps={{
          type: 'primary',
        }}
      />
      <ApprovalDetailButton
        code="AE1905AD-ABA7-4151-ACD1-9E0CA7F437E0"
        systemCode="srm"
        systemKey="srm_secret_key_001"
        text="虚线按钮"
        buttonProps={{
          type: 'dashed',
        }}
      />
      <ApprovalDetailButton
        code="9D4DBE65-C268-4866-AC29-401B562B1ACD"
        systemCode="srm"
        systemKey="srm_secret_key_001"
        text="链接按钮"
        buttonProps={{
          type: 'link',
        }}
      />
      <ApprovalDetailButton
        code="E1B6E4B4-390D-461D-9675-6B1D307EBB5F"
        systemCode="srm"
        systemKey="srm_secret_key_001"
        text="带图标"
        buttonProps={{
          icon: <EyeOutlined />,
          type: 'primary',
        }}
      />
      <ApprovalDetailButton
        code="E1B6E4B4-390D-461D-9675-6B1D307EBB5F"
        systemCode="srm"
        systemKey="srm_secret_key_001"
        text="查看详情"
        buttonProps={{
          icon: <FileSearchOutlined />,
          type: 'default',
        }}
      />
      <ApprovalDetailButton
        code="E1B6E4B4-390D-461D-9675-6B1D307EBB5F"
        systemCode="srm"
        systemKey="srm_secret_key_001"
        text="小尺寸"
        buttonProps={{
          size: 'small',
          icon: <CheckCircleOutlined />,
        }}
      />
      <ApprovalDetailButton
        code="E1B6E4B4-390D-461D-9675-6B1D307EBB5F"
        systemCode="srm"
        systemKey="srm_secret_key_001"
        text="大尺寸"
        buttonProps={{
          size: 'large',
          type: 'primary',
        }}
      />
      <ApprovalDetailButton
        code="E1B6E4B4-390D-461D-9675-6B1D307EBB5F"
        systemCode="srm"
        systemKey="srm_secret_key_001"
        text="危险按钮"
        buttonProps={{
          danger: true,
          type: 'primary',
        }}
      />
    </Space>
  );
};

export default CustomButtonStyleDemo;
