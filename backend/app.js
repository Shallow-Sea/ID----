require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { sequelize } = require('./models');
const logger = require('./utils/logger');

// 导入路由
const cardRoutes = require('./routes/card.routes');
const contentRoutes = require('./routes/content.routes');
const adminRoutes = require('./routes/admin.routes');

// 创建Express应用
const app = express();

// 配置中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// API路由
app.use('/api/card', cardRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/admin', adminRoutes);

// 静态文件服务（用于导出的文件等）
app.use('/api/static', express.static(path.join(__dirname, 'public')));

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  
  res.status(err.status || 500).json({
    message: err.message || '服务器内部错误',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
});

// 处理404路由
app.use((req, res) => {
  res.status(404).json({ message: '请求的资源不存在' });
});

// 启动服务器
const PORT = process.env.PORT || 3000;

// 数据库连接与服务器启动
sequelize
  .sync()
  .then(() => {
    app.listen(PORT, () => {
      logger.info(`服务器在端口 ${PORT} 上运行`);
      console.log(`服务器在端口 ${PORT} 上运行`);
    });
  })
  .catch((err) => {
    logger.error('数据库连接失败:', err);
    console.error('数据库连接失败:', err);
  });

// 处理未捕获的异常和Promise rejection
process.on('uncaughtException', (err) => {
  logger.error('未捕获的异常:', err);
  console.error('未捕获的异常:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('未处理的Promise拒绝:', reason);
  console.error('未处理的Promise拒绝:', reason);
});

module.exports = app; 