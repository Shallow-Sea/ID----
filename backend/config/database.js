module.exports = {
  development: {
    username: process.env.DB_USER || 'card_user',
    password: process.env.DB_PASSWORD || 'user_password_here',
    database: process.env.DB_NAME || 'card_system',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: console.log,
    timezone: '+08:00', // 东八区
  },
  test: {
    username: process.env.DB_USER || 'card_user',
    password: process.env.DB_PASSWORD || 'user_password_here',
    database: process.env.DB_NAME || 'card_system_test',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false,
    timezone: '+08:00',
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
    timezone: '+08:00',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
}; 