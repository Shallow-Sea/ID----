# 卡密系统

一个完整的卡密管理系统，支持前后端分离，具有卡密验证、自动检验、批量生成等功能，并支持Telegram机器人对接。

## 功能特点

- ✅ 前端卡密验证，内容访问控制
- ✅ 每30分钟自动校验卡密有效性
- ✅ 后台管理系统（用户管理、卡密管理）
- ✅ 支持天卡/月卡/年卡等多种类型
- ✅ 批量生成卡密，支持导出（txt、excel等格式）
- ✅ 前端页面内容自定义
- ✅ Telegram机器人对接（卡密查询、生成、删除等）

## 技术栈

- 前端：Vue 3 + Vite + Element Plus
- 后端：Node.js + Express + Sequelize + MySQL
- 机器人：Telegram Bot API
- 部署：Docker + Nginx

## 快速开始

### 使用Docker（推荐）

1. 确保安装了 Docker 和 Docker Compose
2. 复制环境变量文件并修改配置

```bash
cp .env.example .env
# 编辑 .env 文件，设置数据库密码、TG机器人Token等
```

3. 启动服务

```bash
docker-compose up -d
```

4. 访问系统
   - 前端页面：http://localhost:8080
   - 后台管理：http://localhost:8080/admin

### 手动部署

详细步骤请参考 [手动部署文档](docs/manual-deploy.md)

## 项目结构

```
卡密系统/
├── frontend/     # 前端项目 (Vue 3)
├── backend/      # 后端API (Express)
├── bot/          # Telegram机器人
└── docs/         # 文档
```

## 环境要求

- Node.js 16+
- MySQL 5.7+
- 可选：Redis（用于提高性能）

## 开发说明

请查看 [开发文档](docs/development.md)

## 贡献

欢迎提交PR或Issue！

## 许可证

MIT 