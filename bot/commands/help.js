/**
 * 注册帮助相关命令
 * @param {object} bot - TG机器人实例
 * @param {object} api - API请求实例
 */
function register(bot, api) {
  // 启动命令
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const username = msg.from.username || msg.from.first_name;
    
    const welcomeMessage = `
欢迎使用卡密系统机器人，${username}！

本机器人可以帮助您进行以下操作：
- 检查卡密状态
- 生成新的卡密
- 删除无效卡密

请使用 /help 命令查看详细使用说明。
`;
    
    bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
  });
  
  // 帮助命令
  bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    
    const helpMessage = `
*卡密系统机器人使用帮助*

可用命令列表：

*卡密管理*
/checkcard <卡密> - 检查卡密状态
/gencard <类型> <数量> - 生成新的卡密
  类型: day(天卡), month(月卡), year(年卡)
  数量: 默认为1，最大50
/deletecard <卡密> - 删除指定卡密

*其他命令*
/start - 开始使用机器人
/help - 显示此帮助信息

*示例*
检查卡密: \`/checkcard abc123\`
生成3个月卡: \`/gencard month 3\`
生成1个天卡: \`/gencard day\`
删除卡密: \`/deletecard abc123\`
`;
    
    bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
  });
}

module.exports = {
  register
}; 