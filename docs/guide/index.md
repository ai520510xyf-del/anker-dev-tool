---
toc: content
---

# 快速开始

本文档将帮助你快速上手 Anker Dev Tool，从安装到使用，让你在几分钟内集成业务组件到你的项目中。

## 📦 安装

在开始之前，请确保你的项目已经安装了以下依赖：

- React >= 16.8.0
- React DOM >= 16.8.0
- Ant Design >= 5.0.0

### 使用包管理器安装

选择你熟悉的包管理器进行安装：

```bash
# 使用 npm
npm install cl-dev-tool

# 使用 yarn
yarn add cl-dev-tool

# 使用 pnpm
pnpm add cl-dev-tool
```

### 安装 peerDependencies

如果你的项目还没有安装 Ant Design 和 Axios，需要额外安装：

```bash
# 使用 npm
npm install antd axios

# 使用 yarn
yarn add antd axios

# 使用 pnpm
pnpm add antd axios
```

## 🎯 引入和使用

### 基础用法

最简单的使用方式，直接导入组件：

```ts
import React from 'react';
import { ApprovalDetailButton } from 'cl-dev-tool';

const App = () => {
  return (
    <ApprovalDetailButton
      code="447F8A25-3C7F-4B18-8F44-7242680D9477"
      systemCode="srm"
      systemKey="srm_secret_key_001"
    />
  );
};

export default App;
```

### 按需引入（推荐）

Anker Dev Tool 默认支持基于 ES modules 的 tree shaking，直接引入即可实现按需加载：

```ts
// 只引入你需要的组件
import { ApprovalDetailButton } from 'cl-dev-tool';
```

不需要额外配置，打包工具会自动移除未使用的代码。

### 样式引入

组件库的样式会自动注入，无需手动引入 CSS 文件。如果你遇到样式问题，请检查是否正确配置了 CSS loader。

### 使用示例

这是一个完整的 React 应用示例：

```ts
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ApprovalDetailButton } from 'cl-dev-tool';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';

const App = () => {
  const handleClose = () => {
    console.log('审批详情弹窗已关闭');
  };

  const handleError = (error: Error) => {
    console.error('加载审批详情时出错：', error);
  };

  return (
    <ConfigProvider locale={zhCN}>
      <div style={{ padding: '24px' }}>
        <h1>审批流程示例</h1>
        <ApprovalDetailButton
          code="447F8A25-3C7F-4B18-8F44-7242680D9477"
          systemCode="srm"
          systemKey="srm_secret_key_001"
          text="查看审批详情"
          onClose={handleClose}
          onError={handleError}
        />
      </div>
    </ConfigProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
```

## 🔧 在 TypeScript 中使用

Anker Dev Tool 使用 TypeScript 编写，提供完整的类型定义，无需额外安装 `@types` 包。

### 导入类型定义

```ts
import type { ApprovalDetailButtonProps } from 'cl-dev-tool';

// 使用类型定义
const buttonProps: ApprovalDetailButtonProps = {
  code: '447F8A25-3C7F-4B18-8F44-7242680D9477',
  systemCode: 'srm',
  systemKey: 'srm_secret_key_001',
  text: '查看详情',
};
```

### 类型提示

TypeScript 会为你提供完整的智能提示和类型检查：

```ts
import { ApprovalDetailButton } from 'cl-dev-tool';

<ApprovalDetailButton
  code="xxx"        // ✅ 必填，string 类型
  systemCode="srm"  // ✅ 必填，string 类型
  systemKey="xxx"   // ✅ 必填，string 类型
  text="查看"       // ✅ 可选，string 类型
  onClose={() => {}} // ✅ 可选，() => void 类型
  onError={(err) => {}} // ✅ 可选，(error: Error) => void 类型
  // invalidProp="xxx" // ❌ TypeScript 会报错
/>
```

## 🎨 配合 Ant Design 使用

### 全局配置

使用 Ant Design 的 ConfigProvider 可以统一配置主题、国际化等：

```ts
import { ConfigProvider, theme } from 'antd';
import { ApprovalDetailButton } from 'cl-dev-tool';
import zhCN from 'antd/locale/zh_CN';

const App = () => {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#00b96b',
        },
      }}
    >
      <ApprovalDetailButton
        code="xxx"
        systemCode="xxx"
        systemKey="xxx"
      />
    </ConfigProvider>
  );
};
```

### 暗色主题

组件支持 Ant Design 的暗色主题：

```ts
import { ConfigProvider, theme } from 'antd';
import { ApprovalDetailButton } from 'cl-dev-tool';

const App = () => {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
      }}
    >
      <ApprovalDetailButton
        code="xxx"
        systemCode="xxx"
        systemKey="xxx"
      />
    </ConfigProvider>
  );
};
```

## 🌍 国际化

组件内置中文文案，如果你的应用需要支持多语言，可以配合 Ant Design 的国际化方案：

```ts
import { ConfigProvider } from 'antd';
import enUS from 'antd/locale/en_US';
import zhCN from 'antd/locale/zh_CN';

// 英文环境
<ConfigProvider locale={enUS}>
  {/* 你的应用 */}
</ConfigProvider>

// 中文环境
<ConfigProvider locale={zhCN}>
  {/* 你的应用 */}
</ConfigProvider>
```

## 📝 常见问题

### 样式不生效？

确保你的项目正确配置了 CSS 处理。如果使用 webpack，需要配置 `style-loader` 和 `css-loader`。

### 类型定义找不到？

确保 TypeScript 配置中包含了 `node_modules` 路径：

```json
{
  "compilerOptions": {
    "moduleResolution": "node"
  }
}
```

## 🔗 下一步

- 查看 [组件文档](/components/approval-detail-button) 了解详细的 API 和示例
- 阅读 [主题定制](/guide/theme) 学习如何定制组件样式
- 查看 [浏览器兼容性](/guide/compatibility) 了解浏览器支持情况
