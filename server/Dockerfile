# 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app

# 复制 package 文件
COPY package*.json ./
COPY tsconfig.json ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY src ./src

# 构建
RUN npm run build

# 生产阶段
FROM node:18-alpine

WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 只安装生产依赖
RUN npm ci --only=production

# 从构建阶段复制构建产物
COPY --from=builder /app/dist ./dist

# 创建日志目录
RUN mkdir -p logs

# 暴露端口
EXPOSE 3000

# 启动服务
CMD ["node", "dist/index.js"]

