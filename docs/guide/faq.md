---
toc: content
---

# 常见问题

这里列出了使用 Anker Dev Tool 时的常见问题和解决方案。

## 📦 安装相关

### 安装时出现 peer dependencies 警告？

这是正常的提示。Anker Dev Tool 依赖 React、Ant Design 和 Axios，如果你的项目还没有安装这些依赖，请先安装：

```bash
npm install react react-dom antd axios
```

### 如何查看已安装的版本？

```bash
npm list cl-dev-tool
```

### 如何升级到最新版本？

```bash
npm install cl-dev-tool@latest
```

## 🎨 样式相关

### 样式不生效怎么办？

**可能原因 1：CSS Loader 未配置**

如果使用 webpack，确保配置了 CSS 加载器：

```js
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
};
```

**可能原因 2：样式被覆盖**

检查是否有其他样式覆盖了组件样式。可以在浏览器开发工具中检查元素的样式。

**可能原因 3：CSS 优先级问题**

尝试在引入组件后再引入你的自定义样式：

```ts
import { ApprovalDetailButton } from 'cl-dev-tool';
import './your-custom-styles.css'; // 放在组件引入之后
```

### 如何自定义组件样式？

推荐使用 Ant Design 的主题定制功能：

```ts
import { ConfigProvider } from 'antd';

<ConfigProvider
  theme={{
    token: {
      colorPrimary: '#00b96b',
      borderRadius: 4,
    },
  }}
>
  <YourApp />
</ConfigProvider>
```

详见[主题定制指南](/guide/theme)。

### 如何使用暗色主题？

```ts
import { ConfigProvider, theme } from 'antd';

<ConfigProvider
  theme={{
    algorithm: theme.darkAlgorithm,
  }}
>
  <YourApp />
</ConfigProvider>
```

## 🔧 TypeScript 相关

### 类型定义找不到？

确保 tsconfig.json 中的 `moduleResolution` 设置正确：

```json
{
  "compilerOptions": {
    "moduleResolution": "node"
  }
}
```

### 组件 Props 类型如何导入？

所有组件的 Props 类型都可以直接导入：

```ts
import type { ApprovalDetailButtonProps } from 'cl-dev-tool';
```

### 编译时出现类型错误？

确保 TypeScript 版本 >= 4.0，并且安装了 React 类型定义：

```bash
npm install --save-dev @types/react @types/react-dom
```

## ⚙️ 功能相关

### 如何自定义 API 请求地址？

使用 `apiBaseUrl` 属性：

```ts
<ApprovalDetailButton
  code="xxx"
  systemCode="xxx"
  systemKey="xxx"
  apiBaseUrl="https://your-api-domain.com"
/>
```

### API 请求失败怎么办？

1. 检查网络连接
2. 检查 API 地址是否正确
3. 检查 systemCode 和 systemKey 是否正确
4. 使用 `onError` 回调查看详细错误信息：

```ts
<ApprovalDetailButton
  code="xxx"
  systemCode="xxx"
  systemKey="xxx"
  onError={(error) => {
    console.error('API 请求失败：', error);
  }}
/>
```

### 如何监听弹窗关闭事件？

使用 `onClose` 回调：

```ts
<ApprovalDetailButton
  code="xxx"
  systemCode="xxx"
  systemKey="xxx"
  onClose={() => {
    console.log('弹窗已关闭');
  }}
/>
```

## 🌍 兼容性相关

### 支持哪些浏览器？

- Chrome (最新两个版本)
- Firefox (最新两个版本)
- Safari (最新两个版本)
- Edge (最新两个版本)
- IE 11（需要 polyfills）

详见[浏览器兼容性](/guide/compatibility)。

### 如何支持 IE 11？

需要引入必要的 polyfills：

```bash
npm install core-js regenerator-runtime
```

在入口文件顶部引入：

```js
import 'core-js/stable';
import 'regenerator-runtime/runtime';
```

### 在 React 16 中可以使用吗？

可以，Anker Dev Tool 支持 React >= 16.8.0。

## 📱 移动端相关

### 是否支持移动端？

组件基于 Ant Design 构建，支持响应式设计，可以在移动端使用。但审批详情等复杂组件建议在桌面端使用以获得更好的体验。

### 如何适配移动端？

组件会自动适配屏幕尺寸。如需自定义移动端样式，可以使用 CSS 媒体查询：

```css
@media (max-width: 768px) {
  /* 你的移动端样式 */
}
```

## 🚀 性能相关

### 如何优化打包体积？

1. 使用 ES modules 导入（支持 tree-shaking）：

```ts
import { ApprovalDetailButton } from 'cl-dev-tool';
```

2. 确保构建工具支持 tree-shaking（webpack 4+、Rollup、Vite 等）

3. 生产环境构建时启用代码压缩

### 如何按需加载？

组件库默认支持 ES modules，现代打包工具会自动进行 tree-shaking，无需额外配置。

## ❓ 其他问题

### 如何贡献代码？

请阅读[贡献指南](https://github.com/ai520510xyf-del/cl-dev-tool/blob/main/CONTRIBUTING.md)。

### 如何报告 Bug？

请在 [GitHub Issues](https://github.com/ai520510xyf-del/cl-dev-tool/issues) 提交问题，并提供：

1. 问题描述
2. 复现步骤
3. 期望行为
4. 实际行为
5. 环境信息（浏览器、Node 版本等）

### 如何请求新功能？

在 [GitHub Issues](https://github.com/ai520510xyf-del/cl-dev-tool/issues) 提交 Feature Request，详细描述：

1. 功能需求
2. 使用场景
3. 期望的 API 设计

### 在哪里可以获得帮助？

- 查看[文档](/guide)
- 搜索 [GitHub Issues](https://github.com/ai520510xyf-del/cl-dev-tool/issues)
- 提交新的 Issue

---

如果你的问题没有在这里列出，欢迎在 [GitHub Issues](https://github.com/ai520510xyf-del/cl-dev-tool/issues) 提问。
