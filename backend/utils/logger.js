const winston = require('winston');
const path = require('path');
const fs = require('fs');

// 创建日志目录
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 配置日志格式
const logFormat = winston.format.printf(({ level, message, timestamp, ...rest }) => {
  let logMessage = `${timestamp} [${level.toUpperCase()}]: ${message}`;
  
  // 添加额外信息
  if (Object.keys(rest).length > 0) {
    logMessage += ` ${JSON.stringify(rest)}`;
  }
  
  return logMessage;
});

// 创建日志记录器
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    logFormat
  ),
  defaultMeta: { service: 'card-system-backend' },
  transports: [
    // 控制台输出
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        logFormat
      )
    }),
    // 记录所有日志
    new winston.transports.File({ 
      filename: path.join(logDir, 'app.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // 记录错误日志
    new winston.transports.File({ 
      filename: path.join(logDir, 'error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ],
  // 不要退出程序
  exitOnError: false
});

// 添加请求日志中间件
logger.requestMiddleware = (req, res, next) => {
  const start = Date.now();
  
  // 响应结束时计算请求耗时并记录日志
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    
    logger[logLevel](`${req.method} ${req.originalUrl}`, {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      statusCode: res.statusCode,
      userAgent: req.headers['user-agent'],
      duration: `${duration}ms`
    });
  });
  
  next();
};

module.exports = logger; 