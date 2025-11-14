import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
// 从发布的 npm 包导入组件（样式已自动导入，无需手动导入）
// import { ApprovalDetailButton } from 'anker-dev-tool';
import ApprovalDetailButton from '../components/ApprovalDetailButton';
import './index.less';

// eslint-disable-next-line react-refresh/only-export-components
const App: React.FC = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <div style={{ padding: '50px' }}>
        <h1>Anker Dev Tool - 组件预览</h1>

        {/* ApprovalDetailButton 示例 */}
        <section style={{ marginTop: '40px' }}>
          <h2>ApprovalDetailButton 组件</h2>
          <div
            style={{
              marginTop: '20px',
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap',
            }}
          >
            <ApprovalDetailButton
              code="447F8A25-3C7F-4B18-8F44-7242680D9477"
              systemCode="srm"
              systemKey="srm_secret_key_001"
              text="审批流程"
              apiBaseUrl="http://localhost:3000/api"
              onClose={() => {
                console.log('审批详情弹窗已关闭');
              }}
              onError={error => {
                console.error('获取审批数据失败:', error);
                alert(`获取审批数据失败: ${error.message}`);
              }}
            />
          </div>
          <div
            style={{
              marginTop: '20px',
              padding: '16px',
              background: '#f5f5f5',
              borderRadius: '4px',
            }}
          >
            <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
              <strong>使用说明：</strong>
            </p>
            <ul
              style={{
                margin: 0,
                paddingLeft: '20px',
                fontSize: '14px',
                color: '#666',
              }}
            >
              <li>点击按钮打开审批详情侧边弹窗</li>
              <li>
                需要确保后端 API 服务已启动（默认: http://localhost:3000/api）
              </li>
              <li>{'API 接口: GET /api/approval/{code}'}</li>
              <li>Headers: x-system-name, x-system-key</li>
            </ul>
          </div>
        </section>
      </div>
    </ConfigProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
