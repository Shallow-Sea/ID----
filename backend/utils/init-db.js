require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User, Setting } = require('../models');
const logger = require('./logger');

/**
 * 初始化数据库
 */
async function initDatabase() {
  try {
    logger.info('正在初始化数据库...');
    
    // 同步数据库表结构
    await sequelize.sync({ force: false });
    logger.info('数据库表结构同步完成');
    
    // 创建默认管理员账号
    await createDefaultAdmin();
    
    // 创建默认系统设置
    await createDefaultSettings();
    
    logger.info('数据库初始化完成');
    process.exit(0);
  } catch (error) {
    logger.error('数据库初始化失败:', error);
    process.exit(1);
  }
}

/**
 * 创建默认管理员账号
 */
async function createDefaultAdmin() {
  try {
    const adminExists = await User.findOne({
      where: { username: 'admin' }
    });
    
    if (!adminExists) {
      // 生成密码哈希
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      // 创建管理员账号
      await User.create({
        username: 'admin',
        password: hashedPassword,
        email: 'admin@example.com',
        role: 'super',
        status: 'active'
      });
      
      logger.info('默认管理员账号创建成功：admin / admin123');
    } else {
      logger.info('默认管理员账号已存在，跳过创建');
    }
  } catch (error) {
    logger.error('创建默认管理员账号失败:', error);
    throw error;
  }
}

/**
 * 创建默认系统设置
 */
async function createDefaultSettings() {
  try {
    const defaultSettings = [
      { key: 'site_name', value: '卡密系统', type: 'string', description: '网站名称', isSystem: true },
      { key: 'site_description', value: '一个高效的卡密管理系统', type: 'string', description: '网站描述', isSystem: true },
      { key: 'allow_register', value: 'false', type: 'boolean', description: '是否允许注册', isSystem: true },
      { key: 'card_prefix', value: 'CARD_', type: 'string', description: '卡密前缀', isSystem: true },
      { key: 'homepage_notice', value: '欢迎使用卡密系统！', type: 'string', description: '首页公告', isSystem: true },
      { key: 'check_interval', value: '30', type: 'number', description: '卡密检查间隔（分钟）', isSystem: true },
      { key: 'telegram_bot_enabled', value: 'false', type: 'boolean', description: '是否启用Telegram机器人', isSystem: true },
      { key: 'card_types', value: JSON.stringify(['day', 'month', 'year', 'custom']), type: 'json', description: '卡密类型', isSystem: true },
    ];
    
    for (const setting of defaultSettings) {
      const exists = await Setting.findOne({
        where: { key: setting.key }
      });
      
      if (!exists) {
        await Setting.create(setting);
        logger.info(`创建系统设置: ${setting.key}`);
      } else {
        logger.info(`系统设置 ${setting.key} 已存在，跳过创建`);
      }
    }
  } catch (error) {
    logger.error('创建默认系统设置失败:', error);
    throw error;
  }
}

// 执行初始化
initDatabase(); 