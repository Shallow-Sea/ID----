# 卡密系统手动部署指南

本文档提供了不使用Docker的情况下，手动部署卡密系统的详细步骤。

## 系统要求

- Node.js 16+
- MySQL 5.7+
- Nginx (用于前端部署)
- 域名和SSL证书 (可选，但推荐用于生产环境)

## 部署流程

### 1. 准备服务器环境

#### 安装Node.js
```bash
# 使用NVM安装Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
source ~/.bashrc
nvm install 16
nvm use 16
```

#### 安装MySQL
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mysql-server

# CentOS
sudo yum install mysql-server
sudo systemctl start mysqld
sudo systemctl enable mysqld

# 配置MySQL
sudo mysql_secure_installation
```

#### 安装Nginx
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS
sudo yum install epel-release
sudo yum install nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 2. 创建数据库

登录MySQL并创建数据库：
```sql
CREATE DATABASE card_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'card_user'@'localhost' IDENTIFIED BY '您的密码';
GRANT ALL PRIVILEGES ON card_system.* TO 'card_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. 部署后端

#### 克隆代码
```bash
# 假设部署在/var/www目录下
cd /var/www
git clone https://github.com/yourusername/card-system.git
cd card-system
```

#### 配置后端
```bash
cd backend

# 安装依赖
npm install

# 创建和编辑环境变量文件
cp .env.example .env
vi .env
```

编辑`.env`文件，设置数据库连接信息和JWT密钥等：
```
DB_HOST=localhost
DB_USER=card_user
DB_PASSWORD=您的密码
DB_NAME=card_system
NODE_ENV=production
PORT=3000
JWT_SECRET=生成一个随机字符串作为密钥
```

#### 初始化数据库和启动服务
```bash
# 初始化数据库
npm run init-db

# 使用PM2启动服务（需要全局安装PM2）
npm install -g pm2
pm2 start app.js --name card-system-backend
pm2 save
pm2 startup # 按照提示执行命令，实现开机自启
```

### 4. 部署前端

#### 构建前端
```bash
cd /var/www/card-system/frontend

# 安装依赖
npm install

# 修改API地址（如有需要）
vi .env.production

# 构建前端
npm run build
```

#### 配置Nginx
创建Nginx配置文件：
```bash
sudo vi /etc/nginx/sites-available/card-system
```

写入以下内容：
```nginx
server {
    listen 80;
    server_name your-domain.com; # 替换为您的域名或服务器IP

    # 前端静态文件
    root /var/www/card-system/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API请求代理
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 静态资源缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 30d;
    }
}
```

启用配置并重启Nginx：
```bash
sudo ln -s /etc/nginx/sites-available/card-system /etc/nginx/sites-enabled/
sudo nginx -t # 检查配置是否正确
sudo systemctl restart nginx
```

### 5. 部署Telegram机器人 (可选)

如果需要使用Telegram机器人功能：

```bash
cd /var/www/card-system/bot

# 安装依赖
npm install

# 创建和编辑环境变量文件
cp ../.env.example .env
vi .env
```

编辑`.env`文件，设置Telegram机器人Token：
```
TG_BOT_TOKEN=您的Telegram机器人Token
BACKEND_URL=http://localhost:3000/api
```

使用PM2启动机器人：
```bash
pm2 start bot.js --name card-system-bot
pm2 save
```

### 6. 配置HTTPS (推荐)

建议使用Let's Encrypt为您的网站配置HTTPS。

安装Certbot：
```bash
# Ubuntu/Debian
sudo apt-get install certbot python3-certbot-nginx

# CentOS
sudo yum install certbot python3-certbot-nginx
```

获取并安装证书：
```bash
sudo certbot --nginx -d your-domain.com
```

### 7. 维护和更新

#### 备份数据库
定期备份数据库是很重要的：
```bash
# 创建备份脚本
vi /var/www/backup-db.sh
```

写入以下内容：
```bash
#!/bin/bash
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
BACKUP_DIR="/var/www/backups"
mkdir -p "$BACKUP_DIR"
mysqldump -u card_user -p'您的密码' card_system > "$BACKUP_DIR/card_system_$TIMESTAMP.sql"
```

设置执行权限并添加到定时任务：
```bash
chmod +x /var/www/backup-db.sh
crontab -e
# 添加以下行，每天凌晨2点执行备份
0 2 * * * /var/www/backup-db.sh
```

#### 更新系统

当有新代码需要部署时：
```bash
cd /var/www/card-system
git pull

# 更新后端
cd backend
npm install
pm2 restart card-system-backend

# 更新前端
cd ../frontend
npm install
npm run build

# 更新机器人
cd ../bot
npm install
pm2 restart card-system-bot
```

## 常见问题排查

### 后端服务无法启动
- 检查环境变量是否正确配置
- 检查数据库连接是否正常
- 查看日志：`pm2 logs card-system-backend`

### 前端无法访问
- 检查Nginx配置是否正确
- 检查Nginx服务是否运行
- 查看Nginx错误日志：`sudo cat /var/log/nginx/error.log`

### 机器人无法响应
- 检查TG_BOT_TOKEN是否正确
- 确保机器人已在Telegram中激活
- 查看日志：`pm2 logs card-system-bot`

### 数据库连接问题
- 确认MySQL服务正常运行：`sudo systemctl status mysql`
- 检查数据库用户权限是否正确
- 检查防火墙设置是否允许所需端口

## 性能优化建议

1. 启用Nginx缓存以提高前端性能
2. 配置MySQL优化参数，适应服务器内存和CPU
3. 为数据库表添加适当的索引
4. 考虑添加Redis缓存以减轻数据库负担
5. 定期清理过期的卡密和日志数据 
 