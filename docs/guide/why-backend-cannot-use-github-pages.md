# 为什么后端服务不能使用 GitHub Pages？

## 核心区别

### GitHub Pages 的工作原理

GitHub Pages 是一个**静态网站托管服务**，它的工作方式是：

1. **只托管静态文件**：HTML、CSS、JavaScript（客户端代码）
2. **无需服务器运行**：文件直接通过 CDN 分发
3. **构建后部署**：将构建好的静态文件上传到 GitHub 的服务器
4. **按需访问**：用户访问时直接返回文件，无需执行代码

```
用户请求 → GitHub CDN → 返回静态文件（HTML/CSS/JS）
```

### 后端服务的工作原理

后端服务需要：

1. **持续运行的进程**：Node.js 服务器需要 7x24 小时运行
2. **处理动态请求**：接收 HTTP 请求，执行代码逻辑，返回结果
3. **维护状态**：可能连接数据库、Redis 等
4. **实时响应**：随时准备处理来自前端的 API 请求

```
前端请求 → 后端服务器（运行中）→ 执行代码 → 查询数据库 → 返回 JSON
```

## 技术限制对比

| 特性           | GitHub Pages        | 后端服务              |
| -------------- | ------------------- | --------------------- |
| **运行方式**   | 静态文件托管        | 需要持续运行的进程    |
| **资源消耗**   | 低（仅存储）        | 高（CPU、内存、网络） |
| **成本**       | 免费（GitHub 承担） | 需要服务器资源        |
| **可执行代码** | ❌ 不支持           | ✅ 必须支持           |
| **数据库连接** | ❌ 不支持           | ✅ 需要支持           |
| **实时处理**   | ❌ 不支持           | ✅ 必须支持           |
| **环境变量**   | ❌ 不支持           | ✅ 需要支持           |

## 为什么 GitHub 不提供免费后端托管？

### 1. **资源成本**

- **静态文件**：存储成本低，访问时直接返回文件
- **后端服务**：需要持续占用 CPU、内存、网络带宽

如果 GitHub 提供免费后端托管，成本会急剧上升：

- 每个服务需要 24/7 运行
- 需要分配 CPU 和内存资源
- 需要处理大量并发请求

### 2. **安全风险**

- **静态文件**：只读，无法执行恶意代码
- **后端服务**：可以执行任意代码，存在安全风险

### 3. **架构设计**

GitHub Pages 的设计目标就是托管静态网站，而不是运行服务器应用。

## 替代方案

### 1. **Serverless Functions（推荐）**

一些平台提供免费的 Serverless Functions，可以运行后端代码：

#### Vercel Functions（免费）

```javascript
// api/hello.js
export default function handler(req, res) {
  res.status(200).json({ message: 'Hello' });
}
```

#### Netlify Functions（免费）

```javascript
// netlify/functions/hello.js
exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Hello' }),
  };
};
```

**限制**：

- 适合简单的 API 端点
- 不适合长时间运行的服务
- 有执行时间限制（通常 10-30 秒）

### 2. **云平台免费套餐**

#### Render（推荐）

- ✅ 免费套餐可用
- ✅ 支持 Express.js
- ⚠️ 15 分钟无活动会休眠（首次访问需要唤醒）

#### Railway

- ✅ 简单易用
- ⚠️ 免费额度有限

#### Fly.io

- ✅ 免费套餐
- ✅ 全球部署

### 3. **GitHub Actions（不适合生产）**

GitHub Actions 可以运行代码，但：

- ❌ 只能运行有限时间（最长 6 小时）
- ❌ 不是为长期运行的服务设计的
- ❌ 不适合处理实时请求

## 我们的项目架构

```
┌─────────────────┐
│  GitHub Pages   │  ← 前端文档（静态文件）
│  (免费托管)      │
└────────┬────────┘
         │
         │ HTTP 请求
         ▼
┌─────────────────┐
│  Render/Railway │  ← 后端 API（需要运行的服务）
│  (免费/付费)     │
└─────────────────┘
```

## 总结

- **GitHub Pages** = 静态文件托管（免费）
- **后端服务** = 需要持续运行的进程（需要服务器资源）

这就是为什么我们需要使用 Render、Railway 或其他云平台来托管后端服务，而不能使用 GitHub Pages。

## 相关资源

- [GitHub Pages 文档](https://docs.github.com/en/pages)
- [Render 免费套餐](https://render.com/pricing)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)
