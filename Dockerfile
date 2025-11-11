# 使用 Node.js 官方镜像
FROM node:18-slim

# 设置工作目录
WORKDIR /app

# 安装必要的系统依赖
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install --production

# 复制项目文件
COPY . .

# 创建日志目录
RUN mkdir -p logs

# 暴露端口（如果需要）
EXPOSE 3000

# 启动应用
CMD ["node", "index.js"]
