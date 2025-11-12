import { WechatyBuilder } from 'wechaty';
import dotenv from 'dotenv';
import { askDeepSeek } from './deepseek.js';
import conversationManager from './conversationManager.js';

dotenv.config();

const TRIGGER_PREFIX = process.env.TRIGGER_PREFIX || 'aishihao';

// 重连配置
let isLoggedIn = false;
let heartbeatInterval = null;
const HEARTBEAT_INTERVAL = 60000; // 60秒心跳检测

// 创建微信机器人实例
const bot = WechatyBuilder.build({
  name: 'deepseek-bot',
  puppet: 'wechaty-puppet-wechat4u',
});

// 监听扫码登录事件
bot.on('scan', (qrcode, status) => {
  console.log(`扫码状态: ${status}`);
  console.log(`请使用微信扫描二维码登录: https://wechaty.js.org/qrcode/${encodeURIComponent(qrcode)}`);
});

// 监听登录成功事件
bot.on('login', (user) => {
  console.log(`✅ 用户 ${user} 登录成功`);
  isLoggedIn = true;

  // 启动心跳检测
  startHeartbeat();
});

// 监听登出事件
bot.on('logout', (user) => {
  console.log(`❌ 用户 ${user} 已登出`);
  isLoggedIn = false;

  // 停止心跳检测
  stopHeartbeat();

  // 尝试重新启动
  console.log('⚠️ 检测到登出，5秒后尝试重新启动...');
  setTimeout(() => {
    if (!isLoggedIn) {
      console.log('🔄 正在重新启动机器人...');
      restartBot();
    }
  }, 5000);
});

// 监听消息事件
bot.on('message', async (message) => {
  try {
    // 获取消息文本
    const text = message.text();
    const contact = message.talker();
    const room = message.room();

    console.log(`收到消息: ${text} (来自: ${contact.name()})`);

    // 检查是否包含触发前缀
    if (!text.startsWith(TRIGGER_PREFIX)) {
      return;
    }

    // 提取问题内容（去除前缀）
    const question = text.substring(TRIGGER_PREFIX.length).trim();

    if (!question) {
      await message.say('你好！我是 DeepSeek 智能助手。请在 "aishihao" 后面输入你的问题。');
      return;
    }

    // 检查是否是清除历史指令
    if (question === '清除记忆' || question === '清空记忆' || question === '重置对话') {
      // 使用群ID或用户ID作为上下文ID
      const contextId = room ? room.id : contact.id;
      const contextName = room ? `群聊【${await room.topic()}】` : `用户【${contact.name()}】`;

      conversationManager.clearHistory(contextId);
      await message.say('✅ 已清除对话记忆，开始新的对话！');
      console.log(`🗑️ 已清除${contextName}的对话历史`);
      return;
    }

    console.log(`📝 处理问题: ${question}`);

    // 发送"正在思考"的提示
    await message.say('正在思考中...');

    // 获取上下文ID：群聊使用群ID，私聊使用用户ID
    const contextId = room ? room.id : contact.id;
    const contextName = room ? await room.topic() : contact.name();

    // 添加用户消息到历史
    conversationManager.addUserMessage(contextId, question);

    // 获取对话历史
    const history = conversationManager.getHistory(contextId);

    // 调用 DeepSeek API 获取回答（传入历史记录）
    const answer = await askDeepSeek(question, history);

    // 添加 AI 回复到历史
    conversationManager.addAssistantMessage(contextId, answer);

    console.log(`💡 回答: ${answer}`);
    console.log(`📊 ${room ? '群聊' : '私聊'}【${contextName}】当前对话轮数: ${conversationManager.getConversationCount(contextId)}`);

    // 发送回答
    if (room) {
      // 如果是群聊，@提问者
      await room.say(answer, contact);
    } else {
      // 如果是私聊，直接回复
      await message.say(answer);
    }
  } catch (error) {
    console.error('处理消息时出错:', error);
    await message.say('抱歉，处理消息时发生错误，请稍后再试。');
  }
});

// 监听错误事件
bot.on('error', (error) => {
  console.error('机器人错误:', error);

  // 如果是致命错误，尝试重启
  if (error.message.includes('ETIMEDOUT') || error.message.includes('ECONNRESET')) {
    console.log('⚠️ 检测到网络错误，30秒后尝试重启...');
    setTimeout(() => {
      if (!isLoggedIn) {
        console.log('🔄 正在重新启动机器人...');
        restartBot();
      }
    }, 30000);
  }
});

// 启动机器人
bot.start()
  .then(() => {
    console.log('🚀 微信 DeepSeek 机器人已启动');
    console.log(`📌 触发前缀: ${TRIGGER_PREFIX}`);
  })
  .catch((error) => {
    console.error('启动失败:', error);
    process.exit(1);
  });

// 心跳检测函数
function startHeartbeat() {
  stopHeartbeat(); // 先停止旧的心跳

  heartbeatInterval = setInterval(async () => {
    if (isLoggedIn) {
      try {
        // 检查机器人状态
        const isReady = bot.isLoggedIn;
        if (!isReady) {
          console.log('⚠️ 心跳检测：机器人未登录状态');
          isLoggedIn = false;
          stopHeartbeat();
        } else {
          console.log('💓 心跳检测：机器人运行正常');
        }
      } catch (error) {
        console.error('心跳检测失败:', error.message);
      }
    }
  }, HEARTBEAT_INTERVAL);

  console.log('💓 心跳检测已启动');
}

function stopHeartbeat() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
    console.log('💔 心跳检测已停止');
  }
}

// 重启机器人函数
async function restartBot() {
  try {
    console.log('🔄 正在停止当前机器人实例...');
    stopHeartbeat();

    await bot.stop();

    console.log('🔄 等待3秒后重新启动...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('🔄 正在重新启动机器人...');
    await bot.start();

    console.log('✅ 机器人重启完成，等待扫码登录');
  } catch (error) {
    console.error('❌ 重启失败:', error);
    console.log('⚠️ 将在60秒后再次尝试重启...');
    setTimeout(() => restartBot(), 60000);
  }
}

// 优雅退出
process.on('SIGINT', async () => {
  console.log('\n正在关闭机器人...');
  stopHeartbeat();
  await bot.stop();
  process.exit(0);
});
