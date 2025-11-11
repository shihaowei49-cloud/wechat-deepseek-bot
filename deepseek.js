import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions';

/**
 * 调用 DeepSeek API 获取回答
 * @param {string} question - 用户的问题
 * @returns {Promise<string>} - AI 的回答
 */
export async function askDeepSeek(question) {
  try {
    if (!DEEPSEEK_API_KEY) {
      throw new Error('DEEPSEEK_API_KEY 未配置，请在 .env 文件中设置');
    }

    const response = await axios.post(
      DEEPSEEK_API_URL,
      {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一个智能助手，请用简洁、准确的方式回答用户的问题。'
          },
          {
            role: 'user',
            content: question
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        },
        timeout: 30000
      }
    );

    if (response.data && response.data.choices && response.data.choices.length > 0) {
      return response.data.choices[0].message.content.trim();
    } else {
      throw new Error('DeepSeek API 返回数据格式异常');
    }
  } catch (error) {
    console.error('调用 DeepSeek API 失败:', error.message);

    if (error.response) {
      console.error('API 错误响应:', error.response.data);
      return `抱歉，DeepSeek API 调用失败: ${error.response.data.error?.message || error.message}`;
    } else if (error.request) {
      return '抱歉，无法连接到 DeepSeek API，请检查网络连接';
    } else {
      return `抱歉，发生错误: ${error.message}`;
    }
  }
}
