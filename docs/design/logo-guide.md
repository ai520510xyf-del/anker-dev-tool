# Logo 设计指南

## 当前状态

项目目前使用 Ant Design 的默认 Logo。为了建立独特的品牌形象，建议设计专属 Logo。

## 设计要求

### 尺寸规格

- **Favicon**: 16x16, 32x32, 48x48
- **网站标题**: 120x40 (横向)
- **文档页面**: 200x60 (横向)
- **社交媒体**: 512x512 (方形)
- **App Icon**: 1024x1024 (方形)

### 设计原则

1. **简洁性**: Logo 应简洁明了，易于识别
2. **可缩放性**: 在各种尺寸下都清晰可见
3. **单色适配**: 支持单色版本用于特殊场景
4. **品牌一致性**: 与 Ant Design 设计语言协调

### 配色建议

- **主色**: #1890ff (Ant Design 主题蓝)
- **辅助色**: #52c41a, #fa8c16
- **中性色**: #595959, #8c8c8c

## 设计工具

推荐使用以下工具进行设计：

- **Figma**: https://figma.com
- **Sketch**: https://sketch.com
- **Adobe Illustrator**: 矢量图设计
- **在线工具**: https://www.canva.com

## 实现步骤

### 1. 准备 Logo 文件

```
public/
  ├── logo.svg          # 矢量格式（推荐）
  ├── logo.png          # PNG 格式
  ├── logo-dark.svg     # 暗色主题版本
  ├── logo-dark.png
  └── favicon.ico       # 浏览器图标
```

### 2. 更新配置

在 `.dumirc.ts` 中更新 logo 配置：

```typescript
export default {
  themeConfig: {
    logo: '/logo.svg',
    favicon: '/favicon.ico',
  },
};
```

### 3. 更新 README

在 README.md 中添加 Logo：

```markdown
<p align="center">
  <img src="./public/logo.svg" width="200" alt="Anker Dev Tool Logo" />
</p>
```

## 参考案例

- **Ant Design**: https://ant.design
- **Material-UI**: https://mui.com
- **Chakra UI**: https://chakra-ui.com
- **Arco Design**: https://arco.design

## 临时方案

在设计专属 Logo 之前，可以使用以下临时方案：

1. **文字 Logo**: 使用项目名称作为 Logo
2. **图标 + 文字**: 结合简单图标与文字
3. **首字母**: 使用 "ADT" 作为 Logo

## 设计检查清单

- [ ] 准备所有尺寸的 Logo 文件
- [ ] 包含亮色和暗色两个版本
- [ ] 生成 favicon.ico
- [ ] 更新 .dumirc.ts 配置
- [ ] 更新 README.md
- [ ] 更新 package.json 的 icon 字段（如需要）
- [ ] 测试在不同背景下的显示效果

## 版权说明

请确保 Logo 设计：

- 不侵犯他人版权
- 符合开源协议要求
- 可用于商业和非商业用途
