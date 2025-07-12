require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const logger = require('./services/logger');
const { registerCommands } = require('./commands');

// 获取TG机器人Token
const token = process.env.TG_BOT_TOKEN;

if (!token) {
  logger.error('TG_BOT_TOKEN未配置，请在.env文件中设置');
  process.exit(1);
}

// 创建机器人实例
const bot = new TelegramBot(token, { polling: true });

// API基础URL
const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:3000/api';

// 创建API请求实例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 注册命令
registerCommands(bot, api);

// 启动事件
bot.on('polling_error', (error) => {
  logger.error('轮询错误:', error);
});

bot.on('error', (error) => {
  logger.error('机器人错误:', error);
});

// 启动通知
logger.info('TG机器人已启动');
console.log('TG机器人已启动');

// 处理未捕获的异常和Promise rejection
process.on('uncaughtException', (err) => {
  logger.error('未捕获的异常:', err);
  console.error('未捕获的异常:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('未处理的Promise拒绝:', reason);
  console.error('未处理的Promise拒绝:', reason);
}); 