---
toc: content
---

# 浏览器兼容性

Anker Dev Tool 支持所有现代浏览器和 IE 11（需要 polyfills）。

## 🌐 支持的浏览器

| 浏览器  | 版本                 |
| ------- | -------------------- |
| Chrome  | 最新两个版本         |
| Firefox | 最新两个版本         |
| Safari  | 最新两个版本         |
| Edge    | 最新两个版本         |
| IE      | 11（需要 polyfills） |

## 📱 移动端支持

- iOS Safari 10+
- Android Chrome 最新两个版本

## 🔧 IE 11 支持

### 安装 Polyfills

```bash
npm install core-js regenerator-runtime
```

### 引入 Polyfills

在应用入口文件最顶部引入：

```ts
// src/index.tsx
import 'core-js/stable';
import 'regenerator-runtime/runtime';

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

ReactDOM.render(<App />, document.getElementById('root'));
```

### Babel 配置

确保 babel 配置正确转译代码：

```js
// babel.config.js
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          ie: '11',
        },
        useBuiltIns: 'usage',
        corejs: 3,
      },
    ],
    '@babel/preset-react',
    '@babel/preset-typescript',
  ],
};
```

## ⚠️ 注意事项

### CSS 变量

IE 11 不支持 CSS 变量。如果你使用了 CSS 变量，需要使用 PostCSS 插件进行转换：

```bash
npm install postcss-custom-properties --save-dev
```

```js
// postcss.config.js
module.exports = {
  plugins: [
    require('postcss-custom-properties')({
      preserve: false,
    }),
  ],
};
```

### Flexbox

IE 11 的 Flexbox 实现有一些 bug，建议添加 [flexibility](https://github.com/jonathantneal/flexibility) polyfill。

## 🚀 性能优化建议

### 条件加载 Polyfills

使用 polyfill.io 服务动态加载：

```html
<script src="https://polyfill.io/v3/polyfill.min.js?features=default,Array.prototype.includes"></script>
```

### 使用 browserslist

在 package.json 中配置目标浏览器：

```json
{
  "browserslist": ["> 1%", "last 2 versions", "not dead", "not ie < 11"]
}
```

## 🔍 检测浏览器兼容性

可以使用 [@babel/preset-env](https://babeljs.io/docs/en/babel-preset-env) 查看需要的 polyfills：

```bash
BROWSERSLIST_ENV=production npx browserslist
```

## 💡 推荐方案

如果你的应用不需要支持 IE 11，建议在 `browserslist` 中排除它，可以显著减少打包体积：

```json
{
  "browserslist": ["> 1%", "last 2 versions", "not dead", "not ie 11"]
}
```

## 📊 浏览器使用统计

查看全球浏览器使用统计：[Can I Use](https://caniuse.com/usage-table)

根据你的目标用户群体，合理选择需要支持的浏览器版本。
