# 代码规范文档

本文档定义了 `anker-dev-tool` 项目的代码规范和最佳实践。

## 目录

- [React 组件规范](#react-组件规范)
- [样式规范](#样式规范)
- [TypeScript 规范](#typescript-规范)
- [Props 校验规范](#props-校验规范)
- [注释规范](#注释规范)
- [组件设计规范](#组件设计规范)
- [性能优化规范](#性能优化规范)
- [代码组织规范](#代码组织规范)

---

## React 组件规范

### 1. 必须使用函数式组件

**要求：**

- ✅ 使用 React 函数式组件
- ❌ 禁止使用类组件

**示例：**

```tsx
// ✅ 正确：使用函数式组件
const MyComponent: React.FC<Props> = ({ prop1, prop2 }) => {
  return <div>{prop1}</div>;
};

// ❌ 错误：禁止使用类组件
class MyComponent extends React.Component {
  render() {
    return <div>{this.props.prop1}</div>;
  }
}
```

### 2. 组件代码顺序规范

**要求：**
遵循 React 函数式组件开发规范，正确调整代码块顺序：

1. **导入语句** (imports)
2. **类型定义** (TypeScript interfaces/types)
3. **常量定义** (constants)
4. **组件函数** (component function)
   - Hooks 调用
   - 事件处理函数
   - 渲染逻辑
5. **PropTypes 定义** (PropTypes validation)
6. **导出语句** (export)

**示例：**

```tsx
// 1. 导入语句
import React from 'react';
import PropTypes from 'prop-types';
import { Button, ButtonProps, theme } from 'antd';
import styles from './index.module.less';

// 2. 常量定义
const { useToken } = theme;

// 3. 类型定义
export interface ExampleButtonProps extends ButtonProps {
  /** 按钮文本 */
  children: React.ReactNode;
}

// 4. 组件函数
const ExampleButton: React.FC<ExampleButtonProps> = ({
  type = 'primary',
  children,
  className,
  ...restProps
}) => {
  // Hooks 调用
  const { token } = useToken();

  // 渲染逻辑
  return (
    <Button
      type={type}
      className={`${styles.container} ${className || ''}`}
      {...restProps}
    >
      {children}
    </Button>
  );
};

// 5. PropTypes 定义
ExampleButton.propTypes = {
  type: PropTypes.oneOf(['primary', 'default', 'dashed', 'link', 'text']),
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

// 6. 导出语句
export default ExampleButton;
```

### 3. 列表渲染必须添加唯一 key

**要求：**
使用 `map` 渲染列表时，必须为每个元素添加唯一的 `key` 属性。

**示例：**

```tsx
// ✅ 正确：添加唯一 key
{
  items.map(item => <ItemComponent key={item.id} data={item} />);
}

// ✅ 正确：使用索引作为 key（仅在列表不会重新排序时）
{
  items.map((item, index) => <ItemComponent key={index} data={item} />);
}

// ❌ 错误：缺少 key
{
  items.map(item => <ItemComponent data={item} />);
}
```

---

## 样式规范

### 1. CSS 隔离要求

**要求：**

- ✅ 必须使用 CSS Modules 或 CSS-in-JS
- ❌ 禁止全局样式污染
- 所有样式必须嵌套在容器类下

**示例：**

```less
// ✅ 正确：使用 CSS Modules，样式嵌套在 .container 下
// index.module.less
.container {
  font-weight: 500;

  .button {
    padding: 8px 16px;
  }

  &:hover {
    transform: translateY(-1px);
  }
}
```

```tsx
// ✅ 正确：使用 CSS Modules
import styles from './index.module.less';

<div className={styles.container}>
  <button className={styles.button}>Click</button>
</div>;
```

```css
/* ❌ 错误：全局样式污染 */
.button {
  padding: 8px 16px;
}
```

### 2. 设计系统变量使用

**要求：**

- ✅ 颜色/尺寸等数值必须从设计系统变量引用
- ❌ 禁止使用硬编码颜色值（如 `#1890ff`）
- 使用 Ant Design 的 theme token 或自定义设计系统变量

**示例：**

```tsx
// ✅ 正确：使用设计系统变量
import { theme } from 'antd';

const { token } = theme.useToken();

<Button
  style={{
    color: token.colorText,
    backgroundColor: token.colorPrimary,
    fontSize: token.fontSize,
  }}
>
  Button
</Button>

// ❌ 错误：硬编码颜色
<Button
  style={{
    color: '#1890ff',  // 禁止硬编码
    backgroundColor: '#fff',
  }}
>
  Button
</Button>
```

---

## TypeScript 规范

### 1. 类型定义要求

**要求：**

- 所有组件 Props 必须定义 TypeScript 类型
- 使用 `interface` 定义组件 Props
- 导出类型供外部使用

**示例：**

```tsx
// ✅ 正确：定义并导出类型
export interface ExampleButtonProps extends ButtonProps {
  /** 按钮文本 */
  children: React.ReactNode;
  /** 按钮类型 */
  type?: 'primary' | 'default' | 'dashed';
}

const ExampleButton: React.FC<ExampleButtonProps> = props => {
  // ...
};
```

---

## Props 校验规范

### 1. 双重校验要求

**要求：**

- React 组件必须同时定义 **PropTypes** 和 **TypeScript 类型**
- 运行时校验使用 PropTypes
- 编译时校验使用 TypeScript

**示例：**

```tsx
import React from 'react';
import PropTypes from 'prop-types';
import { ButtonProps } from 'antd';

// TypeScript 类型定义
export interface ExampleButtonProps extends ButtonProps {
  /** 按钮文本 */
  children: React.ReactNode;
  /** 按钮类型 */
  type?: 'primary' | 'default' | 'dashed' | 'link' | 'text';
}

const ExampleButton: React.FC<ExampleButtonProps> = ({
  type = 'primary',
  children,
  ...restProps
}) => {
  return (
    <Button type={type} {...restProps}>
      {children}
    </Button>
  );
};

// PropTypes 运行时校验
ExampleButton.propTypes = {
  type: PropTypes.oneOf(['primary', 'default', 'dashed', 'link', 'text']),
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default ExampleButton;
```

---

## 注释规范

### 1. 注释使用规则

**要求：**

- 普通代码使用**单行简单注释**
- 组件或函数使用**多行注释**（JSDoc 风格）
- Props 使用 JSDoc 注释说明

**示例：**

```tsx
/**
 * ExampleButton 组件 - 基于 Ant Design Button 的二次封装
 * 提供统一的按钮样式和交互行为
 */
export interface ExampleButtonProps extends ButtonProps {
  /** 按钮文本 */
  children: React.ReactNode;
  /** 按钮类型 */
  type?: 'primary' | 'default' | 'dashed';
}

const ExampleButton: React.FC<ExampleButtonProps> = ({
  type = 'primary',
  children,
  className,
  ...restProps
}) => {
  // 使用设计系统变量获取主题 token
  const { token } = useToken();

  // 根据类型设置颜色
  const color =
    type === 'primary' ? token.colorTextLightSolid : token.colorText;

  return (
    <Button type={type} style={{ color }} {...restProps}>
      {children}
    </Button>
  );
};
```

---

## 组件设计规范

### 1. 业务组件二次封装

**要求：**

- 业务组件必须基于基础 UI 库（Ant Design）二次封装
- 不要直接使用基础组件，而是封装成业务组件
- 封装后的组件应该符合业务需求，提供统一的 API

**示例：**

```tsx
// ✅ 正确：基于 Antd Button 二次封装
import { Button, ButtonProps } from 'antd';

export interface SubmitButtonProps extends ButtonProps {
  loading?: boolean;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({
  loading = false,
  children,
  ...restProps
}) => {
  return (
    <Button type="primary" htmlType="submit" loading={loading} {...restProps}>
      {children}
    </Button>
  );
};

// ❌ 错误：直接使用基础组件
<Button type="primary" htmlType="submit">
  提交
</Button>;
```

### 2. 文件拆分原则

**要求：**

- 如果组件中只有少量常量和少量的接口，就没必要拆分单独的文件出来
- 保持代码简洁，避免过度拆分

**示例：**

```tsx
// ✅ 正确：少量常量放在组件文件内
const DEFAULT_SIZE = 'middle';
const DEFAULT_TYPE = 'primary';

const MyComponent: React.FC<Props> = () => {
  // ...
};

// ❌ 错误：过度拆分，只有 1-2 个常量也单独建文件
// constants.ts
export const DEFAULT_SIZE = 'middle';
```

---

## 性能优化规范

### 1. 代码质量要求

**要求：**
优化组件时要注意：

- ✅ **可维护性**：代码结构清晰，易于理解和修改
- ✅ **可读性**：命名规范，逻辑清晰
- ✅ **性能优化**：合理使用 memo、useMemo、useCallback
- ✅ **代码简洁**：避免冗余代码，保持简洁明了

**示例：**

```tsx
// ✅ 正确：使用 memo 优化性能
import React, { memo, useMemo, useCallback } from 'react';

interface ListProps {
  items: Item[];
  onItemClick: (id: string) => void;
}

const List: React.FC<ListProps> = memo(({ items, onItemClick }) => {
  // 使用 useMemo 缓存计算结果
  const sortedItems = useMemo(
    () => items.sort((a, b) => a.order - b.order),
    [items]
  );

  // 使用 useCallback 缓存回调函数
  const handleClick = useCallback(
    (id: string) => {
      onItemClick(id);
    },
    [onItemClick]
  );

  return (
    <ul>
      {sortedItems.map(item => (
        <li key={item.id} onClick={() => handleClick(item.id)}>
          {item.name}
        </li>
      ))}
    </ul>
  );
});
```

---

## 代码组织规范

### 1. 项目结构

```
src/
├── components/          # 组件目录
│   └── ComponentName/
│       ├── index.tsx           # 组件主文件
│       ├── index.module.less   # 组件样式（CSS Modules）
│       └── types.ts            # 组件类型定义（可选）
├── styles/             # 全局样式
├── types/              # 全局类型定义
├── utils/              # 工具函数
└── index.ts            # 入口文件
```

### 2. 命名规范

- **组件文件**：使用 PascalCase，如 `ExampleButton.tsx`
- **样式文件**：使用 `index.module.less` 或 `ComponentName.module.less`
- **类型定义**：使用 PascalCase，如 `ExampleButtonProps`
- **常量**：使用 UPPER_SNAKE_CASE，如 `DEFAULT_SIZE`
- **函数/变量**：使用 camelCase，如 `handleClick`

---

## 总结

遵循以上规范可以确保：

- ✅ 代码风格统一
- ✅ 易于维护和扩展
- ✅ 性能优化
- ✅ 类型安全
- ✅ 样式隔离
- ✅ 符合 React 最佳实践

---

## 参考资源

- [React 官方文档](https://react.dev/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)
- [Ant Design 官方文档](https://ant.design/)
- [CSS Modules 文档](https://github.com/css-modules/css-modules)
