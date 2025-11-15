/**
 * title: 自定义 API 地址
 * description: 通过 `apiBaseUrl` 属性可以自定义 API 请求的基础地址，适用于不同环境（开发、测试、生产）的部署。默认使用 `http://localhost:3000/api`。
 */
import React from 'react';
import { Space, Tag } from 'antd';
import { ApprovalDetailButton } from 'cl-dev-tool';

const CustomApiDemo = () => {
  return (
    <Space direction="vertical">
      <div>
        <Tag color="blue">开发环境</Tag>
        <ApprovalDetailButton
          code="447F8A25-3C7F-4B18-8F44-7242680D9477"
          systemCode="srm"
          systemKey="srm_secret_key_001"
          apiBaseUrl="http://dev.api.example.com"
          text="开发环境"
        />
      </div>
      <div>
        <Tag color="orange">测试环境</Tag>
        <ApprovalDetailButton
          code="447F8A25-3C7F-4B18-8F44-7242680D9477"
          systemCode="srm"
          systemKey="srm_secret_key_001"
          apiBaseUrl="http://test.api.example.com"
          text="测试环境"
        />
      </div>
      <div>
        <Tag color="green">生产环境</Tag>
        <ApprovalDetailButton
          code="447F8A25-3C7F-4B18-8F44-7242680D9477"
          systemCode="srm"
          systemKey="srm_secret_key_001"
          apiBaseUrl="https://cl-dev-tool-server.onrender.com/api"
          text="生产环境"
        />
      </div>
    </Space>
  );
};

export default CustomApiDemo;
