/**
 * 注册用户相关命令
 * @param {object} bot - TG机器人实例
 * @param {object} api - API请求实例
 */
function register(bot, api) {
  // 用户状态命令
  bot.onText(/\/mystatus/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const username = msg.from.username || msg.from.first_name;
    
    try {
      bot.sendMessage(chatId, '正在查询您的信息，请稍候...');
      
      // 获取用户状态
      const response = await api.get(`/admin/users/telegram/${userId}`);
      const { user, cards } = response.data;
      
      let statusMessage;
      
      if (user) {
        // 用户存在
        const activeCards = cards.filter(card => card.status === 'used' && new Date(card.expiresAt) > new Date());
        const expiredCards = cards.filter(card => card.status === 'expired' || (card.status === 'used' && new Date(card.expiresAt) <= new Date()));
        const unusedCards = cards.filter(card => card.status === 'unused');
        
        statusMessage = `
*用户信息*
ID: ${user.id}
Telegram ID: ${userId}
角色: ${user.role === 'admin' ? '管理员' : user.role === 'super' ? '超级管理员' : '普通用户'}
状态: ${user.status === 'active' ? '✅ 正常' : '❌ 已禁用'}

*卡密统计*
有效卡密: ${activeCards.length}
过期卡密: ${expiredCards.length}
未使用卡密: ${unusedCards.length}
总卡密数: ${cards.length}
`;

        // 如果有活跃卡密，显示详情
        if (activeCards.length > 0) {
          statusMessage += '\n*有效卡密列表*\n';
          activeCards.forEach((card, index) => {
            const expireDate = new Date(card.expiresAt).toLocaleString('zh-CN');
            statusMessage += `${index + 1}. \`${card.cardCode}\` - 到期: ${expireDate}\n`;
          });
        }
      } else {
        // 用户不存在
        statusMessage = `
您尚未在系统中注册，或者您的 Telegram 账号尚未与系统账号绑定。

如需使用更多功能，请联系管理员添加您的账号或绑定现有账号。
`;
      }
      
      bot.sendMessage(chatId, statusMessage, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('查询用户状态出错:', error.response?.data || error.message);
      
      const errorMessage = error.response?.data?.message || '查询用户状态失败，请稍后重试';
      bot.sendMessage(chatId, `❌ 错误: ${errorMessage}`);
    }
  });
  
  // 绑定用户账号
  bot.onText(/\/bind(?:@\w+)?\s+(.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id;
    const bindToken = match[1].trim();
    
    if (!bindToken) {
      bot.sendMessage(chatId, '请输入绑定令牌，例如：/bind your_token');
      return;
    }
    
    try {
      bot.sendMessage(chatId, '正在处理绑定请求，请稍候...');
      
      // 调用API绑定账号
      const response = await api.post('/admin/users/bind-telegram', {
        telegramId,
        bindToken
      });
      
      const { username } = response.data;
      
      bot.sendMessage(chatId, `✅ 成功绑定到账号: ${username}`);
    } catch (error) {
      console.error('绑定账号出错:', error.response?.data || error.message);
      
      const errorMessage = error.response?.data?.message || '绑定账号失败，请检查令牌是否正确';
      bot.sendMessage(chatId, `❌ 错误: ${errorMessage}`);
    }
  });
  
  // 解绑用户账号
  bot.onText(/\/unbind/, async (msg) => {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id;
    
    // 确认解绑
    const keyboard = {
      inline_keyboard: [
        [
          { text: '确认解绑', callback_data: 'confirm_unbind' },
          { text: '取消', callback_data: 'cancel_unbind' }
        ]
      ]
    };
    
    bot.sendMessage(
      chatId, 
      '⚠️ 您确定要解绑当前 Telegram 账号吗？解绑后将无法使用此机器人的管理功能。',
      { reply_markup: keyboard }
    );
  });
  
  // 处理按钮回调
  bot.on('callback_query', async (callbackQuery) => {
    const action = callbackQuery.data;
    const msg = callbackQuery.message;
    const chatId = msg.chat.id;
    const telegramId = callbackQuery.from.id;
    
    if (action === 'confirm_unbind') {
      try {
        // 调用API解绑账号
        const response = await api.post('/admin/users/unbind-telegram', {
          telegramId
        });
        
        bot.answerCallbackQuery(callbackQuery.id);
        bot.editMessageText(
          '✅ 您的 Telegram 账号已成功解绑',
          { chat_id: chatId, message_id: msg.message_id }
        );
      } catch (error) {
        console.error('解绑账号出错:', error.response?.data || error.message);
        
        const errorMessage = error.response?.data?.message || '解绑账号失败，请稍后重试';
        
        bot.answerCallbackQuery(callbackQuery.id);
        bot.editMessageText(
          `❌ 错误: ${errorMessage}`,
          { chat_id: chatId, message_id: msg.message_id }
        );
      }
    } else if (action === 'cancel_unbind') {
      bot.answerCallbackQuery(callbackQuery.id);
      bot.editMessageText(
        '❓ 已取消解绑操作',
        { chat_id: chatId, message_id: msg.message_id }
      );
    }
  });
  
  // 绑定命令（不带参数的情况）
  bot.onText(/^\/bind(?:@\w+)?$/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, '请输入绑定令牌，例如：/bind your_token\n\n您可以在网站管理后台获取绑定令牌。');
  });
}

module.exports = {
  register
}; 