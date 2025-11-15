# Anker Dev Tool

<div align="center">

企业级 React 业务组件库，基于 Ant Design 构建，专注于提供高质量、开箱即用的业务场景组件

[![NPM version](https://img.shields.io/npm/v/cl-dev-tool.svg?style=flat)](https://npmjs.org/package/cl-dev-tool)
[![NPM downloads](https://img.shields.io/npm/dm/cl-dev-tool.svg?style=flat)](https://npmjs.org/package/cl-dev-tool)
[![License](https://img.shields.io/npm/l/anker-dev-tool.svg?style=flat)](https://github.com/ai520510xyf-del/cl-dev-tool/blob/main/LICENSE)

[English](./README.md) | 简体中文

[文档网站](https://ai520510xyf-del.github.io/cl-dev-tool) · [更新日志](./CHANGELOG.md) · [报告问题](https://github.com/ai520510xyf-del/cl-dev-tool/issues)

</div>

## ✨ 特性

- 🎨 **设计精美** - 基于 Ant Design 5.x 设计规范，提供一致的视觉体验
- 📦 **开箱即用** - 精选业务场景组件，安装即可使用，大幅提升开发效率
- 🔧 **TypeScript** - 使用 TypeScript 编写，提供完整的类型定义文件
- 🎯 **业务导向** - 专注于真实业务场景，经过生产环境验证
- ⚡️ **性能优异** - 优化的包大小，按需加载，Tree-shaking 支持
- 🌍 **国际化** - 内置国际化支持，轻松构建面向全球用户的应用

## 📦 安装

```bash
# 使用 npm
npm install cl-dev-tool

# 使用 yarn
yarn add cl-dev-tool

# 使用 pnpm
pnpm add cl-dev-tool
```

### 依赖要求

```json
{
  "react": ">=16.8.0",
  "react-dom": ">=16.8.0",
  "antd": ">=5.0.0",
  "axios": ">=1.0.0"
}
```

## 🔨 使用

### 基础用法

```tsx
import React from 'react';
import { ApprovalDetailButton } from 'cl-dev-tool';

const App = () => {
  return (
    <ApprovalDetailButton
      code="447F8A25-3C7F-4B18-8F44-7242680D9477"
      systemCode="srm"
      systemKey="srm_secret_key_001"
      text="查看审批详情"
    />
  );
};

export default App;
```

### 配合 Ant Design 使用

```tsx
import React from 'react';
import { ConfigProvider } from 'antd';
import { ApprovalDetailButton } from 'cl-dev-tool';
import zhCN from 'antd/locale/zh_CN';

const App = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <ApprovalDetailButton code="xxx" systemCode="srm" systemKey="xxx" />
    </ConfigProvider>
  );
};
```

更多示例请参考 [快速开始文档](https://ai520510xyf-del.github.io/cl-dev-tool/guide)。

## 📚 组件列表

| 组件名称                                                                                                | 说明                           | 版本   |
| ------------------------------------------------------------------------------------------------------- | ------------------------------ | ------ |
| [ApprovalDetailButton](https://ai520510xyf-del.github.io/cl-dev-tool/components/approval-detail-button) | 审批详情按钮，展示完整审批流程 | 0.1.0+ |

更多组件正在开发中...

## 🖥 浏览器兼容性

现代浏览器和 IE11（需要配置相应的 polyfills）。

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br>Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br>Safari |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Edge                                                                                                                                                                                                 | last 2 versions                                                                                                                                                                                                  | last 2 versions                                                                                                                                                                                              | last 2 versions                                                                                                                                                                                              |

## 🔗 链接

- [文档网站](https://ai520510xyf-del.github.io/cl-dev-tool)
- [组件文档](https://ai520510xyf-del.github.io/cl-dev-tool/components/approval-detail-button)
- [更新日志](./CHANGELOG.md)
- [贡献指南](./CONTRIBUTING.md)
- [问题反馈](https://github.com/ai520510xyf-del/cl-dev-tool/issues)

## 🤝 参与贡献

我们欢迎所有形式的贡献，无论是新功能、bug 修复还是文档改进。

```bash
# 克隆项目
git clone https://github.com/ai520510xyf-del/cl-dev-tool.git
cd anker-dev-tool

# 安装依赖
npm install

# 启动组件开发服务器
npm run dev

# 启动文档网站
npm run docs:dev

# 运行测试
npm test

# 构建
npm run build
```

请阅读 [贡献指南](./CONTRIBUTING.md) 了解详细信息。

## 📄 开发

### 项目结构

```
anker-dev-tool/
├── src/                    # 源代码
│   ├── components/         # 组件目录
│   │   └── ApprovalDetailButton/
│   ├── styles/             # 全局样式
│   ├── types/              # 类型定义
│   ├── utils/              # 工具函数
│   └── index.ts            # 入口文件
├── docs/                   # 文档目录
│   ├── components/         # 组件文档
│   ├── guide/              # 指南文档
│   └── demos/              # 示例代码
├── dist/                   # 构建输出
├── .dumirc.ts              # Dumi 配置
├── vite.config.ts          # Vite 配置
└── package.json
```

### 开发命令

```bash
# 开发
npm run dev              # 启动组件开发服务器
npm run docs:dev         # 启动文档网站

# 构建
npm run build            # 构建组件库
npm run docs:build       # 构建文档网站

# 代码质量
npm run lint             # ESLint 检查
npm run lint:fix         # 自动修复 ESLint 问题
npm run format           # Prettier 格式化
npm run type-check       # TypeScript 类型检查

# 测试
npm test                 # 运行测试
npm run test:coverage    # 测试覆盖率
```

### 代码规范

- 使用 React 函数式组件
- CSS 隔离使用 CSS Modules
- 颜色/尺寸等数值必须从设计系统变量引用
- Props 校验使用 PropTypes + TypeScript 类型
- 列表渲染必须添加唯一 key
- 业务组件基于 Ant Design 二次封装

详细规范请参考 [CODE_STANDARDS.md](./CODE_STANDARDS.md)

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

更多问题请查看 [FAQ 文档](https://ai520510xyf-del.github.io/cl-dev-tool/guide/faq)。

## 👥 贡献者

感谢所有贡献者的付出！

## 📄 许可证

[MIT](./LICENSE) © Anker

---

<div align="center">

Made with ❤️ by Anker

</div>
