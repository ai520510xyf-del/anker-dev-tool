/**
 * title: 事件回调
 * description: 通过 `onClose` 和 `onError` 回调函数，可以在弹窗关闭或发生错误时执行自定义逻辑，例如显示提示信息、上报埋点、刷新数据等。
 */
import React, { useState } from 'react';
import { message, Space, Typography } from 'antd';
import { ApprovalDetailButton } from 'cl-dev-tool';

const { Text } = Typography;

const WithCallbacksDemo = () => {
  const [closeCount, setCloseCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);

  const handleClose = () => {
    setCloseCount(prev => prev + 1);
    message.info('审批详情弹窗已关闭');
    console.log('弹窗关闭，可以在这里执行其他逻辑');
  };

  const handleError = (error: Error) => {
    setErrorCount(prev => prev + 1);
    message.error(`获取审批数据失败: ${error.message}`);
    console.error('审批数据加载失败：', error);
  };

  return (
    <Space direction="vertical">
      <ApprovalDetailButton
        code="447F8A25-3C7F-4B18-8F44-7242680D9477"
        systemCode="srm"
        systemKey="srm_secret_key_001"
        apiBaseUrl="https://cl-dev-tool-server.onrender.com/api"
        onClose={handleClose}
        onError={handleError}
      />
      <div>
        <Text type="secondary">关闭次数: {closeCount}</Text>
        <br />
        <Text type="secondary">错误次数: {errorCount}</Text>
      </div>
    </Space>
  );
};

export default WithCallbacksDemo;
