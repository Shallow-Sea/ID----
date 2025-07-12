const cardCommands = require('./card');
const userCommands = require('./user');
const helpCommands = require('./help');

/**
 * 注册所有机器人命令
 * @param {object} bot - TG机器人实例
 * @param {object} api - API请求实例
 */
function registerCommands(bot, api) {
  // 设置命令列表
  bot.setMyCommands([
    { command: '/start', description: '开始使用机器人' },
    { command: '/help', description: '获取帮助信息' },
    { command: '/checkcard', description: '检查卡密状态' },
    { command: '/gencard', description: '生成卡密' },
    { command: '/deletecard', description: '删除卡密' }
  ]);

  // 注册帮助命令
  helpCommands.register(bot, api);
  
  // 注册卡密相关命令
  cardCommands.register(bot, api);
  
  // 注册用户相关命令
  userCommands.register(bot, api);
  
  // 处理未知命令
  bot.onText(/\/.*/, (msg, match) => {
    const command = match[0].split('@')[0];
    const knownCommands = [
      '/start', '/help', 
      '/checkcard', '/gencard', '/deletecard',
      '/bind', '/unbind', '/mystatus'
    ];
    
    if (!knownCommands.includes(command)) {
      bot.sendMessage(msg.chat.id, `未知命令: ${command}，请使用 /help 获取帮助。`);
    }
  });
}

module.exports = {
  registerCommands
}; 