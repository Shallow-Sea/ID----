/**
 * 注册卡密相关命令
 * @param {object} bot - TG机器人实例
 * @param {object} api - API请求实例
 */
function register(bot, api) {
  // 检查卡密命令
  bot.onText(/\/checkcard(?:@\w+)?\s+(.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const cardCode = match[1].trim();
    
    if (!cardCode) {
      bot.sendMessage(chatId, '请输入要检查的卡密，例如：/checkcard abc123');
      return;
    }
    
    try {
      bot.sendMessage(chatId, '正在查询卡密状态，请稍候...');
      
      const response = await api.get(`/card/status/${cardCode}`);
      const { valid, expiresAt, type, activatedAt } = response.data;
      
      let statusMessage;
      if (valid) {
        const expireDate = new Date(expiresAt).toLocaleString('zh-CN');
        const activateDate = activatedAt ? new Date(activatedAt).toLocaleString('zh-CN') : '未激活';
        
        statusMessage = `
卡密: \`${cardCode}\`
状态: ✅ 有效
类型: ${getCardTypeName(type)}
激活时间: ${activateDate}
过期时间: ${expireDate}
`;
      } else {
        statusMessage = `
卡密: \`${cardCode}\`
状态: ❌ 无效或已过期
`;
      }
      
      bot.sendMessage(chatId, statusMessage, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('查询卡密出错:', error.response?.data || error.message);
      
      const errorMessage = error.response?.data?.message || '查询卡密失败，请稍后重试';
      bot.sendMessage(chatId, `❌ 错误: ${errorMessage}`);
    }
  });
  
  // 检查卡密命令（不带参数的情况）
  bot.onText(/^\/checkcard(?:@\w+)?$/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, '请输入要检查的卡密，例如：/checkcard abc123');
  });
  
  // 生成卡密命令
  bot.onText(/\/gencard(?:@\w+)?\s*(\w+)?(?:\s+(\d+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    let type = match[1]?.toLowerCase() || 'month'; // 默认为月卡
    const countParam = match[2];
    let count = countParam ? parseInt(countParam, 10) : 1; // 默认生成1个
    
    // 验证类型
    if (!['day', 'month', 'year'].includes(type)) {
      bot.sendMessage(chatId, '无效的卡密类型，可选值: day(天卡), month(月卡), year(年卡)');
      return;
    }
    
    // 限制数量
    if (isNaN(count) || count < 1) count = 1;
    if (count > 50) count = 50; // 最多生成50个
    
    try {
      bot.sendMessage(chatId, `正在生成 ${count} 个${getCardTypeName(type)}，请稍候...`);
      
      // 调用API生成卡密
      const userId = msg.from.id.toString();
      const response = await api.post('/admin/cards/bot-generate', {
        type,
        count,
        telegram_id: userId
      });
      
      const { cards } = response.data;
      
      if (!cards || cards.length === 0) {
        bot.sendMessage(chatId, '生成卡密失败，请联系管理员');
        return;
      }
      
      // 构建响应消息
      let resultMessage = `✅ 成功生成 ${cards.length} 个${getCardTypeName(type)}:\n\n`;
      
      cards.forEach((card, index) => {
        resultMessage += `${index + 1}. \`${card.cardCode}\`\n`;
      });
      
      resultMessage += '\n使用 /checkcard 命令可查询卡密状态';
      
      // 发送消息
      bot.sendMessage(chatId, resultMessage, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('生成卡密出错:', error.response?.data || error.message);
      
      const errorMessage = error.response?.data?.message || '生成卡密失败，可能是权限不足或系统错误';
      bot.sendMessage(chatId, `❌ 错误: ${errorMessage}`);
    }
  });
  
  // 删除卡密命令
  bot.onText(/\/deletecard(?:@\w+)?\s+(.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const cardCode = match[1].trim();
    
    if (!cardCode) {
      bot.sendMessage(chatId, '请输入要删除的卡密，例如：/deletecard abc123');
      return;
    }
    
    try {
      bot.sendMessage(chatId, '正在处理删除请求，请稍候...');
      
      // 调用API删除卡密
      const userId = msg.from.id.toString();
      const response = await api.delete(`/admin/cards/bot-delete/${cardCode}`, {
        data: { telegram_id: userId }
      });
      
      bot.sendMessage(chatId, `✅ 卡密 \`${cardCode}\` 已成功删除`, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('删除卡密出错:', error.response?.data || error.message);
      
      const errorMessage = error.response?.data?.message || '删除卡密失败，可能是权限不足或卡密不存在';
      bot.sendMessage(chatId, `❌ 错误: ${errorMessage}`);
    }
  });
  
  // 删除卡密命令（不带参数的情况）
  bot.onText(/^\/deletecard(?:@\w+)?$/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, '请输入要删除的卡密，例如：/deletecard abc123');
  });
}

/**
 * 获取卡密类型的中文名称
 * @param {string} type - 卡密类型
 * @returns {string} 中文名称
 */
function getCardTypeName(type) {
  switch (type.toLowerCase()) {
    case 'day': return '天卡';
    case 'month': return '月卡';
    case 'year': return '年卡';
    case 'custom': return '自定义卡';
    default: return type;
  }
}

module.exports = {
  register
}; 