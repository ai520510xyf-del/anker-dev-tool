# 后端服务部署指南

## 部署方式

### 方式 1: 使用云平台（推荐，最简单）

#### Railway

1. 访问 [Railway](https://railway.app)
2. 连接 GitHub 仓库
3. 选择 `server` 目录作为根目录
4. 配置环境变量（从 `.env.example` 复制）
5. Railway 会自动构建和部署

#### Render（推荐，免费）

1. 访问 [Render](https://render.com) 并注册账户
2. 点击 "New +" → "Web Service"
3. 连接 GitHub 仓库 `ai520510xyf-del/cl-dev-tool`
4. 配置服务：
   - **Name**: `cl-dev-tool-server`（或自定义）
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Free`（免费计划）
5. 配置环境变量（在 Environment 部分）：
   - `FEISHU_APP_ID`: `cli_a5a213b8643bd00b`
   - `FEISHU_APP_SECRET`: `9D3VogVdOyaHvfhfCkY2celMNWvTlyRs`
   - `NODE_ENV`: `production`
   - `PORT`: `3000`（Render 会自动设置，但可以显式指定）
   - `LOG_LEVEL`: `info`
   - `DEMO_SYSTEM_KEY`: `demo_secret_key_000`
   - `SRM_SYSTEM_KEY`: `srm_secret_key_001`
   - 其他系统密钥（可选）
6. 点击 "Create Web Service" 开始部署

**注意**：Render 免费计划的服务在 15 分钟无活动后会休眠，首次访问需要几秒唤醒时间。

#### Vercel / Netlify Functions

这些平台主要用于前端，对于 Express 后端，建议使用 Railway 或 Render。

### 方式 2: 使用 Docker

#### 本地构建和运行

```bash
cd server
docker build -t anker-dev-tool-server .
docker run -p 3000:3000 --env-file .env anker-dev-tool-server
```

#### 推送到 Docker Registry

```bash
# 登录 Docker Registry
docker login

# 构建和推送
docker build -t your-registry/anker-dev-tool-server:latest ./server
docker push your-registry/anker-dev-tool-server:latest
```

### 方式 3: 部署到自己的服务器

#### 使用 PM2

```bash
# 在服务器上
cd /opt/anker-dev-tool-server
git clone https://github.com/ai520510xyf-del/cl-dev-tool.git .
cd server
npm install
npm run build

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件

# 使用 PM2 启动
npm install -g pm2
pm2 start dist/index.js --name anker-dev-tool-server
pm2 save
pm2 startup
```

#### 使用 systemd

创建 `/etc/systemd/system/anker-dev-tool-server.service`:

```ini
[Unit]
Description=Anker Dev Tool Server
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/opt/anker-dev-tool-server/server
ExecStart=/usr/bin/node dist/index.js
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

然后：

```bash
sudo systemctl daemon-reload
sudo systemctl enable anker-dev-tool-server
sudo systemctl start anker-dev-tool-server
```

## 环境变量配置

部署时需要配置以下环境变量（在云平台或服务器上）：

```bash
# 必需
FEISHU_APP_ID=your_app_id
FEISHU_APP_SECRET=your_app_secret

# 可选
PORT=3000
NODE_ENV=production
LOG_LEVEL=info
REDIS_HOST=localhost
REDIS_PORT=6379
```

## GitHub Actions 自动部署

项目已配置 GitHub Actions 工作流（`.github/workflows/deploy-server.yml`），支持：

1. **自动构建**：每次推送到 main 分支时自动构建
2. **生成部署包**：创建可部署的 artifact
3. **可选部署**：配置后可以自动部署到服务器

### 启用自动部署

#### SSH 部署

在 GitHub 仓库设置中添加 Secrets：

- `SERVER_HOST` - 服务器地址
- `SERVER_USER` - SSH 用户名
- `SERVER_SSH_KEY` - SSH 私钥

然后取消注释 `.github/workflows/deploy-server.yml` 中的 SSH 部署部分。

#### Docker 部署

在 GitHub 仓库设置中添加 Secrets：

- `DOCKER_REGISTRY` - Docker Registry 地址
- `DOCKER_USERNAME` - Docker 用户名
- `DOCKER_PASSWORD` - Docker 密码

然后取消注释 `.github/workflows/deploy-server.yml` 中的 Docker 部署部分。

## 健康检查

部署后，可以通过以下端点检查服务状态：

```bash
# 健康检查
curl http://your-server:3000/health

# API 信息
curl http://your-server:3000/
```

## 监控和日志

### PM2 监控

```bash
pm2 status
pm2 logs anker-dev-tool-server
pm2 monit
```

### 日志文件

日志文件位于 `server/logs/` 目录：

- `combined.log` - 所有日志
- `error.log` - 错误日志

## 故障排查

1. **检查端口是否被占用**

   ```bash
   lsof -i :3000
   ```

2. **检查环境变量**

   ```bash
   node -e "require('dotenv').config(); console.log(process.env)"
   ```

3. **检查服务日志**

   ```bash
   tail -f server/logs/combined.log
   ```

4. **测试 API**
   ```bash
   curl http://localhost:3000/health
   ```
