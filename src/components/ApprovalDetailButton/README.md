# ApprovalDetailButton 组件

审批详情按钮组件，点击按钮打开侧边弹窗展示审批详情。

## 特性

- ✅ 基于 Ant Design Button 二次封装
- ✅ 自定义 Drawer 弹窗，从右侧滑入
- ✅ 完整的审批流程可视化展示
- ✅ 支持自动刷新（待审批状态）
- ✅ 错误处理和重试机制
- ✅ 响应式设计，支持移动端
- ✅ 完整的 TypeScript 类型支持

## 安装

```bash
npm install anker-dev-tool
# 或
yarn add anker-dev-tool
# 或
pnpm add anker-dev-tool
```

## 基础用法

```tsx
import { ApprovalDetailButton } from 'anker-dev-tool';

function App() {
  return (
    <ApprovalDetailButton
      code="447F8A25-3C7F-4B18-8F44-7242680D9477"
      systemCode="srm"
      systemKey="srm_secret_key_001"
    />
  );
}
```

## Props

| 属性        | 类型                   | 必填 | 默认值                      | 说明                                              |
| ----------- | ---------------------- | ---- | --------------------------- | ------------------------------------------------- |
| code        | string                 | 是   | -                           | 审批实例 code                                     |
| systemCode  | string                 | 是   | -                           | 系统 code（如：srm、demo）                        |
| systemKey   | string                 | 是   | -                           | 系统密钥                                          |
| text        | string                 | 否   | '审批流程'                  | 按钮文本                                          |
| apiBaseUrl  | string                 | 否   | 'http://localhost:3000/api' | API 基础地址                                      |
| buttonProps | ButtonProps            | 否   | -                           | Button 组件的其他属性，会透传给 Ant Design Button |
| onClose     | () => void             | 否   | -                           | 关闭弹窗回调                                      |
| onError     | (error: Error) => void | 否   | -                           | 错误回调                                          |

## 使用示例

### 示例 1：基础用法

```tsx
import { ApprovalDetailButton } from 'anker-dev-tool';

function MyComponent() {
  return (
    <ApprovalDetailButton
      code="447F8A25-3C7F-4B18-8F44-7242680D9477"
      systemCode="srm"
      systemKey="srm_secret_key_001"
    />
  );
}
```

### 示例 2：自定义按钮文本和样式

```tsx
import { ApprovalDetailButton } from 'anker-dev-tool';

function MyComponent() {
  return (
    <ApprovalDetailButton
      code="447F8A25-3C7F-4B18-8F44-7242680D9477"
      systemCode="srm"
      systemKey="srm_secret_key_001"
      text="查看审批"
      buttonProps={{
        type: 'primary',
        size: 'small',
        icon: <EyeOutlined />,
      }}
    />
  );
}
```

### 示例 3：自定义 API 地址

```tsx
import { ApprovalDetailButton } from 'anker-dev-tool';

function MyComponent() {
  return (
    <ApprovalDetailButton
      code="447F8A25-3C7F-4B18-8F44-7242680D9477"
      systemCode="srm"
      systemKey="srm_secret_key_001"
      apiBaseUrl="https://api.example.com/api"
    />
  );
}
```

### 示例 4：在列表中使用

```tsx
import { ApprovalDetailButton } from 'anker-dev-tool';
import { Table } from 'antd';

function ApprovalList({ list }) {
  const columns = [
    {
      title: '审批单号',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <ApprovalDetailButton
          code={record.code}
          systemCode="srm"
          systemKey="srm_secret_key_001"
          text="审批详情"
          buttonProps={{ type: 'link', size: 'small' }}
        />
      ),
    },
  ];

  return <Table dataSource={list} columns={columns} />;
}
```

### 示例 5：错误处理

```tsx
import { ApprovalDetailButton } from 'anker-dev-tool';
import { message } from 'antd';

function MyComponent() {
  const handleError = (error: Error) => {
    message.error(`获取审批数据失败: ${error.message}`);
  };

  return (
    <ApprovalDetailButton
      code="447F8A25-3C7F-4B18-8F44-7242680D9477"
      systemCode="srm"
      systemKey="srm_secret_key_001"
      onError={handleError}
    />
  );
}
```

### 示例 6：关闭回调

```tsx
import { ApprovalDetailButton } from 'anker-dev-tool';

function MyComponent() {
  const handleClose = () => {
    console.log('审批详情弹窗已关闭');
    // 可以在这里执行一些清理操作，如刷新列表等
  };

  return (
    <ApprovalDetailButton
      code="447F8A25-3C7F-4B18-8F44-7242680D9477"
      systemCode="srm"
      systemKey="srm_secret_key_001"
      onClose={handleClose}
    />
  );
}
```

## API 接口设计

### 接口概述

组件通过调用后端 RESTful API 获取审批数据。接口采用标准的 HTTP 协议，支持 JSON 格式的请求和响应。

### 接口地址

```
GET {apiBaseUrl}/approval/{code}
```

**路径参数**:

- `{apiBaseUrl}`: API 基础地址，默认 `http://localhost:3000/api`
- `{code}`: 审批实例 code（路径参数）

### 请求说明

#### 请求方法

```
GET
```

#### 请求头（Headers）

| 请求头          | 类型   | 必填 | 说明                                              |
| --------------- | ------ | ---- | ------------------------------------------------- |
| `x-system-name` | string | 是   | 系统标识符，如：`srm`、`demo`、`erp`、`crm`、`oa` |
| `x-system-key`  | string | 是   | 系统认证密钥，需要与后端配置的系统密钥一致        |
| `Content-Type`  | string | 否   | 固定值：`application/json`（自动设置）            |
| `Accept`        | string | 否   | 固定值：`application/json`（自动设置）            |

#### 路径参数

| 参数名 | 类型   | 必填 | 说明          | 格式要求                                    |
| ------ | ------ | ---- | ------------- | ------------------------------------------- |
| `code` | string | 是   | 审批实例 code | 仅支持字母、数字、连字符（-）和下划线（\_） |

#### 请求示例

```bash
curl 'http://localhost:3000/api/approval/447F8A25-3C7F-4B18-8F44-7242680D9477' \
  -H 'x-system-name: srm' \
  -H 'x-system-key: srm_secret_key_001'
```

### 响应说明

#### 成功响应（200 OK）

**响应格式**:

```json
{
  "success": true,
  "data": {
    "header": {
      "instanceId": "string",
      "approvalName": "string",
      "serialNumber": "string",
      "applicant": "string",
      "applicantDept": "string",
      "applyTime": "string",
      "status": "PENDING" | "APPROVED" | "REJECTED" | "CANCELED" | "DELETED"
    },
    "timeline": {
      "completed": ProcessedNode[],
      "pending": ProcessedNode[],
      "cc": CCNode[]
    }
  },
  "timestamp": 1234567890123
}
```

**响应字段说明**:

| 字段                        | 类型    | 说明                                                                                                                 |
| --------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------- |
| `success`                   | boolean | 请求是否成功，成功时为 `true`                                                                                        |
| `data`                      | object  | 审批数据对象                                                                                                         |
| `data.header`               | object  | 审批头部信息                                                                                                         |
| `data.header.instanceId`    | string  | 审批实例 ID                                                                                                          |
| `data.header.approvalName`  | string  | 审批流程名称                                                                                                         |
| `data.header.serialNumber`  | string  | 审批单号（可选）                                                                                                     |
| `data.header.applicant`     | string  | 申请人姓名                                                                                                           |
| `data.header.applicantDept` | string  | 申请人部门（可选）                                                                                                   |
| `data.header.applyTime`     | string  | 申请时间，格式：`YYYY-MM-DD HH:mm:ss`                                                                                |
| `data.header.status`        | string  | 审批状态：`PENDING`（待处理）、`APPROVED`（已通过）、`REJECTED`（已拒绝）、`CANCELED`（已取消）、`DELETED`（已删除） |
| `data.timeline`             | object  | 审批时间线数据                                                                                                       |
| `data.timeline.completed`   | array   | 已完成的审批节点列表                                                                                                 |
| `data.timeline.pending`     | array   | 待审批的节点列表                                                                                                     |
| `data.timeline.cc`          | array   | 抄送节点列表                                                                                                         |
| `timestamp`                 | number  | 响应时间戳（毫秒）                                                                                                   |

**数据模型定义**:

```typescript
// ProcessedNode - 审批节点
interface ProcessedNode {
  id: string; // 节点 ID
  nodeName: string; // 节点名称
  nodeType: 'START' | 'APPROVAL' | 'CC' | 'END'; // 节点类型
  approverName: string; // 审批人姓名
  approverDept?: string; // 审批人部门（可选）
  time: string; // 审批时间，格式：YYYY-MM-DD HH:mm:ss
  status: 'approved' | 'rejected' | 'pending'; // 节点状态
  comment?: string; // 审批意见（可选）
  isTimeClose?: boolean; // 是否时间接近（可选）
  timeDiffSeconds?: number; // 时间差（秒，可选）
  timeCloseNote?: string; // 时间接近提示（可选）
}

// CCNode - 抄送节点
interface CCNode {
  id: string; // 节点 ID
  ccPersonName: string; // 抄送人姓名
  ccPersonDept?: string; // 抄送人部门（可选）
  ccTime?: string; // 抄送时间（可选）
}
```

**成功响应示例**:

```json
{
  "success": true,
  "data": {
    "header": {
      "instanceId": "447F8A25-3C7F-4B18-8F44-7242680D9477",
      "approvalName": "采购申请审批",
      "serialNumber": "202511104344",
      "applicant": "Yoyo Huang",
      "applicantDept": "采购部",
      "applyTime": "2025-11-10 17:21:28",
      "status": "APPROVED"
    },
    "timeline": {
      "completed": [
        {
          "id": "node_1",
          "nodeName": "审批通过",
          "nodeType": "APPROVAL",
          "approverName": "Walker Lee",
          "approverDept": "财务部",
          "time": "2025-11-10 17:22:22",
          "status": "approved",
          "comment": "同意"
        }
      ],
      "pending": [],
      "cc": [
        {
          "id": "cc_1",
          "ccPersonName": "Alef Ge",
          "ccPersonDept": "技术部",
          "ccTime": "2025-11-10 17:22:23"
        }
      ]
    }
  },
  "timestamp": 1699621348000
}
```

#### 错误响应

**响应格式**:

```json
{
  "success": false,
  "error": {
    "code": "string",
    "message": "string",
    "details": any
  },
  "timestamp": 1234567890123
}
```

**HTTP 状态码**:

| 状态码 | 说明                   | 错误码                 | 错误信息示例                                                              |
| ------ | ---------------------- | ---------------------- | ------------------------------------------------------------------------- |
| 200    | 请求成功               | -                      | -                                                                         |
| 400    | 请求参数错误           | `INVALID_PARAMETER`    | `Invalid instanceId format`                                               |
| 401    | 认证失败（缺少认证头） | `MISSING_AUTH_HEADERS` | `Missing authentication headers: x-system-name and x-system-key required` |
| 403    | 认证失败（密钥错误）   | `INVALID_SYSTEM_KEY`   | `Invalid system key`                                                      |
| 404    | 资源不存在             | `NOT_FOUND`            | `Approval instance not found`                                             |
| 500    | 服务器内部错误         | `INTERNAL_ERROR`       | `Failed to fetch approval data`                                           |

**错误响应示例**:

```json
// 400 - 参数错误
{
  "success": false,
  "error": {
    "code": "INVALID_PARAMETER",
    "message": "Invalid instanceId format",
    "details": null
  },
  "timestamp": 1699621348000
}

// 401 - 缺少认证头
{
  "success": false,
  "error": {
    "code": "MISSING_AUTH_HEADERS",
    "message": "Missing authentication headers: x-system-name and x-system-key required",
    "details": null
  },
  "timestamp": 1699621348000
}

// 403 - 密钥错误
{
  "success": false,
  "error": {
    "code": "INVALID_SYSTEM_KEY",
    "message": "Invalid system key",
    "details": null
  },
  "timestamp": 1699621348000
}

// 500 - 服务器错误
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Failed to fetch approval data",
    "details": {
      "stack": "..."
    }
  },
  "timestamp": 1699621348000
}
```

### 接口特性

#### 缓存机制

- 接口支持 Redis 缓存，根据审批状态设置不同的缓存时间：
  - `PENDING`（待处理）：较短缓存时间（通常 30 秒）
  - `APPROVED`（已通过）：较长缓存时间（通常 1 小时）
  - `REJECTED`（已拒绝）：较长缓存时间（通常 1 小时）
  - `CANCELED`（已取消）：较长缓存时间（通常 1 小时）

#### 超时设置

- 请求超时时间：10 秒
- 如果请求超时，会抛出网络错误

#### 认证机制

- 使用 Header 认证方式
- 需要在请求头中携带 `x-system-name` 和 `x-system-key`
- 系统密钥需要与后端配置的受信任系统密钥一致

### 系统配置

后端支持以下系统标识符：

| 系统标识符 | 说明               | 环境变量          |
| ---------- | ------------------ | ----------------- |
| `srm`      | 供应商关系管理系统 | `SRM_SYSTEM_KEY`  |
| `demo`     | 演示系统           | `DEMO_SYSTEM_KEY` |
| `erp`      | 企业资源规划系统   | `ERP_SYSTEM_KEY`  |
| `crm`      | 客户关系管理系统   | `CRM_SYSTEM_KEY`  |
| `oa`       | 办公自动化系统     | `OA_SYSTEM_KEY`   |

**注意**：系统密钥需要在后端环境变量中配置，或通过配置文件设置。

## 功能特性

### 自动刷新

当审批状态为待审批时，组件会自动每 30 秒刷新一次数据，直到：

- 审批状态变为终态（已通过、已拒绝、已取消）
- 且没有待审批节点

### 错误处理

- 网络错误：显示错误提示，支持重试
- 认证失败：显示 403 错误提示
- 数据加载失败：显示错误状态，支持重试

### 响应式设计

- 桌面端：Drawer 宽度 800px
- 移动端：Drawer 全屏显示（100vw）

## 样式定制

组件使用 CSS Modules 进行样式隔离，所有样式都使用 CSS 变量，可以通过覆盖 CSS 变量来定制样式：

```css
:root {
  --color-primary: #2c3e50;
  --color-primary-dark: #34495e;
  --color-success: #52c41a;
  --color-error: #ff4d4f;
  --color-warning: #fa8c16;
  --bg-page: #f0f2f5;
  --bg-card: #ffffff;
  --spacing-card: 24px;
  --spacing-section: 32px;
  --radius-card: 2px;
}
```

## 注意事项

1. **必填参数**：`code`、`systemCode`、`systemKey` 为必填，缺少任意一个时按钮会自动禁用
2. **API 地址**：确保后端 API 服务已启动，默认地址为 `http://localhost:3000/api`
3. **系统密钥**：确保 `systemKey` 与后端配置的系统密钥一致
4. **CORS**：如果前端和后端不在同一域名，需要配置 CORS
5. **依赖**：组件依赖 `react`、`react-dom`、`antd`、`axios`，确保已安装

## 类型定义

```typescript
export interface ApprovalDetailButtonProps {
  code: string;
  systemCode: string;
  systemKey: string;
  text?: string;
  apiBaseUrl?: string;
  buttonProps?: ButtonProps;
  onClose?: () => void;
  onError?: (error: Error) => void;
}
```

## 常见问题

### Q: 按钮点击后没有反应？

A: 检查以下几点：

1. 确保 `code`、`systemCode`、`systemKey` 都已正确传入
2. 检查浏览器控制台是否有错误信息
3. 确保后端 API 服务已启动

### Q: 显示 403 错误？

A: 检查 `systemCode` 和 `systemKey` 是否正确，确保与后端配置的系统密钥一致。

### Q: 如何自定义弹窗宽度？

A: 目前弹窗宽度固定为 800px（移动端 100vw），如需自定义，可以修改组件源码中的样式。

### Q: 如何禁用自动刷新？

A: 自动刷新功能是内置的，当审批状态为终态且无待审批节点时会自动停止。如需完全禁用，需要修改组件源码。

## 更新日志

### v0.1.0

- 初始版本
- 支持基础审批详情展示
- 支持自动刷新
- 支持错误处理和重试
