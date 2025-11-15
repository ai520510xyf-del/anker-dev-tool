# Anker Dev Tool Backend Server

审批流程可视化 API 服务后端。

## 功能特性

- 🚀 Express + TypeScript 构建
- 🔐 系统认证中间件
- 📦 Redis 缓存支持（可选）
- 📝 Winston 日志系统
- 🎯 飞书审批流程 API 集成

## 快速开始

### 安装依赖

```bash
npm install
# 或从项目根目录
npm run server:install
```

### 配置环境变量

复制 `.env.example` 为 `.env` 并配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入你的配置信息。

### 开发模式

```bash
npm run dev
# 或从项目根目录
npm run server:dev
```

### 构建

```bash
npm run build
# 或从项目根目录
npm run server:build
```

### 生产模式

```bash
npm start
# 或从项目根目录
npm run server:start
```

## API 端点

### 健康检查

```
GET /health
```

### 获取审批详情

```
GET /api/approval/:instanceId
```

**请求头：**

- `x-system-name`: 系统名称（如：demo, erp, crm, oa）
- `x-system-key`: 系统密钥

**示例：**

```bash
curl -H "x-system-name: demo" \
     -H "x-system-key: demo_secret_key_000" \
     http://localhost:3000/api/approval/YOUR_INSTANCE_CODE
```

## 环境变量说明

| 变量名              | 说明         | 默认值      |
| ------------------- | ------------ | ----------- |
| `PORT`              | 服务器端口   | 3000        |
| `NODE_ENV`          | 运行环境     | development |
| `LOG_LEVEL`         | 日志级别     | info        |
| `FEISHU_APP_ID`     | 飞书应用 ID  | -           |
| `FEISHU_APP_SECRET` | 飞书应用密钥 | -           |
| `REDIS_HOST`        | Redis 主机   | localhost   |
| `REDIS_PORT`        | Redis 端口   | 6379        |

## 项目结构

```
server/
├── src/
│   ├── config/          # 配置文件
│   ├── controllers/     # 控制器
│   ├── middleware/      # 中间件
│   ├── routes/          # 路由
│   ├── services/        # 业务逻辑
│   ├── types/           # 类型定义
│   ├── utils/           # 工具函数
│   └── index.ts         # 入口文件
├── dist/                # 编译输出
├── logs/                # 日志文件
├── package.json
└── tsconfig.json
```

## 开发

### 代码规范

- 使用 TypeScript 编写
- 遵循 ESLint 规则
- 使用 Prettier 格式化

### 测试

```bash
npm test
```

## 部署

### Docker（推荐）

```bash
docker build -t anker-dev-tool-server .
docker run -p 3000:3000 --env-file .env anker-dev-tool-server
```

### PM2

```bash
npm run build
pm2 start dist/index.js --name anker-dev-tool-server
```

## 许可证

MIT
