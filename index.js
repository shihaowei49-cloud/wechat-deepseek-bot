import { WechatyBuilder } from 'wechaty';
import dotenv from 'dotenv';
import { askDeepSeek } from './deepseek.js';

dotenv.config();

const TRIGGER_PREFIX = process.env.TRIGGER_PREFIX || 'shihao';

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
});

// 监听登出事件
bot.on('logout', (user) => {
  console.log(`❌ 用户 ${user} 已登出`);
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
      await message.say('你好！我是 DeepSeek 智能助手。请在 "shihao" 后面输入你的问题。');
      return;
    }

    console.log(`📝 处理问题: ${question}`);

    // 发送"正在思考"的提示
    await message.say('正在思考中...');

    // 调用 DeepSeek API 获取回答
    const answer = await askDeepSeek(question);

    console.log(`💡 回答: ${answer}`);

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

// 优雅退出
process.on('SIGINT', async () => {
  console.log('\n正在关闭机器人...');
  await bot.stop();
  process.exit(0);
});
