# 微信 DeepSeek 智能体

一个基于 Wechaty 的微信机器人，集成 DeepSeek API，当消息以 "shihao" 开头时自动回答问题。

## 功能特点

- 🤖 自动检测以 "shihao" 开头的消息
- 💬 将问题发送给 DeepSeek API 并返回智能回答
- 👥 支持私聊和群聊
- ⚡ 快速响应，实时处理

## 安装步骤

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并填写配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入你的 DeepSeek API Key：

```env
DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions
TRIGGER_PREFIX=shihao
```

### 3. 获取 DeepSeek API Key

1. 访问 [DeepSeek 官网](https://platform.deepseek.com/)
2. 注册并登录账号
3. 在控制台创建 API Key
4. 将 API Key 填入 `.env` 文件

### 4. 启动机器人

```bash
npm start
```

### 5. 扫码登录

启动后会显示二维码链接，使用微信扫码登录即可。

## 使用方法

### 私聊使用

直接给机器人发送消息，格式为：

```
shihao 你的问题
```

例如：
```
shihao 什么是人工智能？
```

### 群聊使用

在群里发送消息，格式相同：

```
shihao 北京今天天气怎么样？
```

机器人会自动回复并 @ 你。

## 配置说明

### 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `DEEPSEEK_API_KEY` | DeepSeek API 密钥 | 必填 |
| `DEEPSEEK_API_URL` | DeepSeek API 地址 | https://api.deepseek.com/v1/chat/completions |
| `TRIGGER_PREFIX` | 触发前缀 | shihao |

### 修改触发前缀

如果想使用其他前缀，可以修改 `.env` 文件中的 `TRIGGER_PREFIX`：

```env
TRIGGER_PREFIX=你想要的前缀
```

## 项目结构

```
.
├── index.js           # 主程序入口
├── deepseek.js        # DeepSeek API 集成模块
├── package.json       # 项目配置
├── .env               # 环境变量配置（需自行创建）
├── .env.example       # 环境变量示例
├── .gitignore         # Git 忽略文件
└── README.md          # 项目说明
```

## 注意事项

1. **微信限制**：使用网页版微信协议，某些账号可能无法登录
2. **API 配额**：注意 DeepSeek API 的调用限制和费用
3. **网络环境**：确保服务器能够访问 DeepSeek API
4. **消息频率**：避免频繁调用导致被限流

## 常见问题

### Q: 无法登录微信？
A: 部分微信账号已被限制使用网页版协议，建议：
- 使用小号进行测试
- 尝试使用其他 puppet（如 puppet-padlocal）

### Q: API 调用失败？
A: 检查以下几点：
- API Key 是否正确
- 网络是否能访问 DeepSeek API
- API 配额是否充足

### Q: 如何修改回答风格？
A: 编辑 `deepseek.js` 文件中的 system prompt：

```javascript
{
  role: 'system',
  content: '你是一个智能助手...' // 修改这里
}
```

## PM2 后台运行（本地）

如果想让机器人在后台持续运行（关闭终端后仍运行）：

```bash
# 启动
npm run pm2:start

# 查看状态
npm run pm2:status

# 查看日志
npm run pm2:logs

# 停止
npm run pm2:stop

# 重启
npm run pm2:restart
```

## 部署到 Zeabur

### 前提条件
- 注册 [Zeabur](https://zeabur.com/) 账号
- 将代码推送到 GitHub 仓库

### 部署步骤

1. **推送代码到 GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-github-repo-url
   git push -u origin main
   ```

2. **在 Zeabur 创建项目**
   - 登录 Zeabur 控制台
   - 点击 "New Project"
   - 选择 "Deploy from GitHub"
   - 选择你的仓库

3. **配置环境变量**

   在 Zeabur 项目设置中添加以下环境变量：
   ```
   DEEPSEEK_API_KEY=your_deepseek_api_key
   DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions
   TRIGGER_PREFIX=shihao
   ```

4. **部署完成**

   Zeabur 会自动检测 Dockerfile 并构建部署。

### ⚠️ 重要提示

**微信登录问题**：
- 部署到云端后，需要通过日志查看二维码链接进行扫码登录
- 容器重启后可能需要重新扫码
- 建议使用小号测试，避免主号被限制

**查看登录二维码**：
1. 在 Zeabur 控制台查看应用日志
2. 找到类似 `https://wechaty.js.org/qrcode/...` 的链接
3. 复制链接到浏览器打开，扫描二维码登录

### 替代方案

如果网页版微信不稳定，可以考虑：
1. 使用付费的 puppet-padlocal（更稳定）
2. 使用其他平台（如飞书、钉钉）的机器人 API
3. 部署到个人服务器（阿里云、腾讯云等）

## 技术栈

- [Wechaty](https://wechaty.js.org/) - 微信机器人框架
- [DeepSeek API](https://platform.deepseek.com/) - AI 对话 API
- [Node.js](https://nodejs.org/) - 运行环境
- [PM2](https://pm2.keymetrics.io/) - 进程管理器
- [Zeabur](https://zeabur.com/) - 部署平台

## License

MIT
