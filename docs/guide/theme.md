---
toc: content
---

# 主题定制

Anker Dev Tool 基于 Ant Design 5.x 构建，完全支持 Ant Design 的主题定制系统。

## 🎨 使用 ConfigProvider

通过 Ant Design 的 ConfigProvider 组件，你可以轻松定制主题色、圆角、字体等。

### 基础定制

```ts
import { ConfigProvider } from 'antd';
import { ApprovalDetailButton } from 'anker-dev-tool';

const App = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#00b96b', // 主题色
          borderRadius: 8,          // 圆角
          fontSize: 14,             // 字体大小
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

### 常用 Token

| Token        | 说明     | 默认值  |
| ------------ | -------- | ------- |
| colorPrimary | 主题色   | #1890ff |
| colorSuccess | 成功色   | #52c41a |
| colorWarning | 警告色   | #faad14 |
| colorError   | 错误色   | #ff4d4f |
| borderRadius | 圆角大小 | 2px     |
| fontSize     | 字体大小 | 14px    |

完整 Token 列表请参考 [Ant Design 文档](https://ant.design/docs/react/customize-theme-cn)。

## 🌓 暗色主题

使用 Ant Design 的暗色算法：

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

### 紧凑主题

```ts
<ConfigProvider
  theme={{
    algorithm: theme.compactAlgorithm,
  }}
>
  <YourApp />
</ConfigProvider>
```

### 组合算法

同时使用暗色和紧凑：

```ts
<ConfigProvider
  theme={{
    algorithm: [theme.darkAlgorithm, theme.compactAlgorithm],
  }}
>
  <YourApp />
</ConfigProvider>
```

## 💅 自定义样式

如果需要更精细的样式控制，可以使用 CSS 覆盖：

```css
/* 自定义按钮样式 */
.ant-btn-primary {
  background-color: #00b96b;
  border-color: #00b96b;
}

.ant-btn-primary:hover {
  background-color: #009a5b;
  border-color: #009a5b;
}
```

**注意**：直接覆盖样式可能影响升级，建议优先使用 theme token 定制。

## 🎯 组件级定制

为特定组件设置主题：

```ts
<ConfigProvider
  theme={{
    components: {
      Button: {
        colorPrimary: '#00b96b',
        algorithm: true,
      },
      Drawer: {
        colorBgElevated: '#f5f5f5',
      },
    },
  }}
>
  <YourApp />
</ConfigProvider>
```

## 📖 更多资源

- [Ant Design 主题定制](https://ant.design/docs/react/customize-theme-cn)
- [Design Token](https://ant.design/docs/react/customize-theme-cn#theme)
- [主题编辑器](https://ant.design/theme-editor-cn)
