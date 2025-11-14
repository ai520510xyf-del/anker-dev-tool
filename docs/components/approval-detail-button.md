---
title: ApprovalDetailButton 审批详情按钮
nav:
  title: 组件
  order: 2
group:
  title: 业务组件
  order: 1
atomId: ApprovalDetailButton
description: 审批详情按钮组件，基于 Ant Design Button 和 Drawer 二次封装，用于在业务系统中快速集成审批流程可视化功能
keywords:
  - 审批
  - 流程
  - Approval
  - Button
  - Drawer
  - 业务组件
category: 业务组件
toc: content
---

# ApprovalDetailButton 审批详情按钮

审批详情按钮组件，基于 Ant Design Button 和 Drawer 二次封装，用于在业务系统中快速集成审批流程可视化功能。点击按钮后，会从右侧滑出侧边弹窗，展示完整的审批流程信息，包括审批人、审批时间、审批意见等。

## 何时使用

- 需要在列表页或详情页中快速查看审批流程详情
- 需要展示审批流程的可视化时间线
- 需要支持审批流程的自动刷新（待审批状态）
- 需要统一的审批详情展示体验
- 需要与现有业务系统的审批中心集成

## 代码演示

### 基础用法

最基础的用法，只需要传入必填的 `code`、`systemCode` 和 `systemKey` 属性。

<code src="../demos/ApprovalDetailButton/basic.tsx"></code>

### 自定义按钮文本

通过 `text` 属性可以自定义按钮显示的文本内容，适应不同的业务场景。

<code src="../demos/ApprovalDetailButton/custom-text.tsx"></code>

### 自定义按钮样式

通过 `buttonProps` 属性可以传递 Ant Design Button 组件的所有属性，实现丰富的按钮样式定制。

<code src="../demos/ApprovalDetailButton/custom-button-style.tsx"></code>

### 自定义 API 地址

通过 `apiBaseUrl` 属性可以自定义 API 请求的基础地址，适用于不同环境的部署。

<code src="../demos/ApprovalDetailButton/custom-api.tsx"></code>

### 事件回调

通过 `onClose` 和 `onError` 回调函数，可以在弹窗关闭或发生错误时执行自定义逻辑。

<code src="../demos/ApprovalDetailButton/with-callbacks.tsx"></code>

### 在表格中使用

在表格的操作列中使用审批详情按钮，这是最常见的业务场景。

<code src="../demos/ApprovalDetailButton/in-table.tsx"></code>

## API

### ApprovalDetailButton

| 参数        | 说明                                | 类型                                                       | 默认值                        | 必填 |
| ----------- | ----------------------------------- | ---------------------------------------------------------- | ----------------------------- | ---- |
| code        | 审批实例的唯一标识码                | `string`                                                   | -                             | 是   |
| systemCode  | 业务系统的唯一标识码                | `string`                                                   | -                             | 是   |
| systemKey   | 业务系统的密钥，用于 API 鉴权       | `string`                                                   | -                             | 是   |
| text        | 按钮显示的文本内容                  | `string`                                                   | `'审批流程'`                  | 否   |
| apiBaseUrl  | API 请求的基础地址，可根据环境配置  | `string`                                                   | `'http://localhost:3000/api'` | 否   |
| buttonProps | 透传给 Ant Design Button 组件的属性 | [ButtonProps](https://ant.design/components/button-cn#api) | -                             | 否   |
| onClose     | 弹窗关闭时的回调函数                | `() => void`                                               | -                             | 否   |
| onError     | 数据加载失败时的回调函数            | `(error: Error) => void`                                   | -                             | 否   |

## 设计指引

### 按钮放置位置

- **列表页**：建议放置在表格的操作列，使用 `link` 类型按钮，节省空间
- **详情页**：可以放置在页面头部或关键信息区域，使用 `default` 或 `primary` 类型按钮
- **卡片内**：建议使用小尺寸按钮，与卡片内容协调

### 文本建议

- 列表操作：`查看详情`、`审批详情`
- 详情页面：`审批流程`、`查看审批`
- 状态相关：`审批进度`、`流程详情`

### 样式建议

- **表格中**：`type="link"` + `size="small"`
- **详情页**：`type="default"` + `size="middle"`
- **卡片中**：`type="default"` + `size="small"`

## 常见问题

### 如何处理 API 请求失败？

使用 `onError` 回调函数来处理请求失败的情况：

```ts
<ApprovalDetailButton
  code="xxx"
  systemCode="srm"
  systemKey="xxx"
  onError={(error) => {
    // 显示错误提示
    message.error(`加载失败: ${error.message}`);
    // 上报错误日志
    reportError(error);
  }}
/>
```

### 如何在弹窗关闭后刷新数据？

使用 `onClose` 回调函数在弹窗关闭后执行数据刷新：

```ts
<ApprovalDetailButton
  code="xxx"
  systemCode="srm"
  systemKey="xxx"
  onClose={() => {
    // 刷新列表数据
    refetch();
  }}
/>
```

### 如何自定义按钮图标？

通过 `buttonProps` 传递 `icon` 属性：

```ts
import { FileSearchOutlined } from '@ant-design/icons';

<ApprovalDetailButton
  code="xxx"
  systemCode="srm"
  systemKey="xxx"
  text="查看详情"
  buttonProps={{
    icon: <FileSearchOutlined />,
  }}
/>
```

### 按钮为什么是禁用状态？

当缺少必填参数（`code`、`systemCode`、`systemKey`）时，按钮会自动禁用，请检查这些参数是否正确传入。
