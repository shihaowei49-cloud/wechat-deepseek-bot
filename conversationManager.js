/**
 * 对话历史管理器
 * 为每个用户维护独立的对话历史
 */
class ConversationManager {
  constructor(maxHistoryPerUser = 10, timeoutMinutes = 30) {
    // 存储格式: { userId: [messages] }
    this.conversations = new Map();
    // 存储最后活动时间: { userId: timestamp }
    this.lastActivityTime = new Map();
    // 每个用户最多保留的对话轮数（一问一答算一轮）
    this.maxHistoryPerUser = maxHistoryPerUser;
    // 对话超时时间（分钟）
    this.timeoutMinutes = timeoutMinutes;
    // 超时时间（毫秒）
    this.timeoutMs = timeoutMinutes * 60 * 1000;
  }

  /**
   * 添加用户消息到历史
   * @param {string} userId - 用户ID
   * @param {string} question - 用户的问题
   */
  addUserMessage(userId, question) {
    // 检查是否超时，如果超时则清除历史
    this._checkAndClearIfTimeout(userId);

    if (!this.conversations.has(userId)) {
      this.conversations.set(userId, []);
    }

    const history = this.conversations.get(userId);
    history.push({
      role: 'user',
      content: question
    });

    // 更新最后活动时间
    this.lastActivityTime.set(userId, Date.now());

    // 如果历史记录过长，删除最早的一轮对话（一问一答）
    this._trimHistory(userId);
  }

  /**
   * 添加 AI 回复到历史
   * @param {string} userId - 用户ID
   * @param {string} answer - AI 的回答
   */
  addAssistantMessage(userId, answer) {
    if (!this.conversations.has(userId)) {
      this.conversations.set(userId, []);
    }

    const history = this.conversations.get(userId);
    history.push({
      role: 'assistant',
      content: answer
    });

    // 更新最后活动时间
    this.lastActivityTime.set(userId, Date.now());

    this._trimHistory(userId);
  }

  /**
   * 获取用户的对话历史
   * @param {string} userId - 用户ID
   * @returns {Array} 消息历史数组
   */
  getHistory(userId) {
    return this.conversations.get(userId) || [];
  }

  /**
   * 清除用户的对话历史
   * @param {string} userId - 用户ID
   */
  clearHistory(userId) {
    this.conversations.delete(userId);
    this.lastActivityTime.delete(userId);
  }

  /**
   * 清除所有对话历史
   */
  clearAll() {
    this.conversations.clear();
    this.lastActivityTime.clear();
  }

  /**
   * 修剪历史记录，保持在限制范围内
   * @param {string} userId - 用户ID
   * @private
   */
  _trimHistory(userId) {
    const history = this.conversations.get(userId);
    if (!history) return;

    // 保留最近的 N 轮对话（N*2 条消息）
    const maxMessages = this.maxHistoryPerUser * 2;
    if (history.length > maxMessages) {
      // 删除最早的消息，保留最新的
      const trimmed = history.slice(history.length - maxMessages);
      this.conversations.set(userId, trimmed);
    }
  }

  /**
   * 获取当前管理的用户数量
   * @returns {number}
   */
  getUserCount() {
    return this.conversations.size;
  }

  /**
   * 获取某个用户的对话轮数
   * @param {string} userId - 用户ID
   * @returns {number}
   */
  getConversationCount(userId) {
    const history = this.getHistory(userId);
    return Math.floor(history.length / 2);
  }

  /**
   * 检查用户对话是否超时，如果超时则清除
   * @param {string} userId - 用户ID
   * @private
   */
  _checkAndClearIfTimeout(userId) {
    const lastTime = this.lastActivityTime.get(userId);

    // 如果没有记录，说明是新对话，不需要清除
    if (!lastTime) {
      return;
    }

    const now = Date.now();
    const timeSinceLastActivity = now - lastTime;

    // 如果超过超时时间，清除历史
    if (timeSinceLastActivity > this.timeoutMs) {
      console.log(`⏰ 用户对话超时 (${this.timeoutMinutes}分钟)，已自动清除历史记录`);
      this.clearHistory(userId);
    }
  }

  /**
   * 获取用户距离上次活动的时间（分钟）
   * @param {string} userId - 用户ID
   * @returns {number} 分钟数，如果没有记录返回 -1
   */
  getTimeSinceLastActivity(userId) {
    const lastTime = this.lastActivityTime.get(userId);
    if (!lastTime) {
      return -1;
    }
    return Math.floor((Date.now() - lastTime) / 60000);
  }
}

// 创建全局单例
// 参数: 最多保留10轮对话，30分钟超时
const conversationManager = new ConversationManager(10, 30);

export default conversationManager;
