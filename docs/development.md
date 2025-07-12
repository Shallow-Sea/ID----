# 卡密系统开发文档

## 技术栈

### 前端
- **框架**: Vue 3 + Vite
- **UI组件库**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router
- **HTTP请求**: Axios

### 后端
- **框架**: Express.js
- **数据库ORM**: Sequelize
- **数据库**: MySQL
- **身份验证**: JWT

### 机器人
- **框架**: node-telegram-bot-api

## 项目结构

```
卡密系统/
├── frontend/                  # 前端项目
│   ├── src/
│   │   ├── api/               # API请求
│   │   ├── assets/            # 静态资源
│   │   ├── components/        # 组件
│   │   ├── router/            # 路由
│   │   ├── store/             # Pinia状态管理
│   │   ├── utils/             # 工具函数
│   │   └── views/             # 页面视图
│   │       └── admin/         # 管理员页面
│   ├── public/                # 公共资源
│   └── Dockerfile             # 前端Docker配置
│
├── backend/                   # 后端项目
│   ├── config/                # 配置文件
│   ├── controllers/           # 控制器
│   ├── middlewares/           # 中间件
│   ├── models/                # 数据模型
│   ├── routes/                # 路由
│   ├── services/              # 业务逻辑
│   ├── utils/                 # 工具函数
│   ├── sql/                   # SQL文件
│   └── Dockerfile             # 后端Docker配置
│
├── bot/                       # Telegram机器人
│   ├── commands/              # 机器人命令
│   ├── services/              # 机器人服务
│   └── Dockerfile             # 机器人Docker配置
│
└── docker-compose.yml         # Docker编排文件
```

## 开发指南

### 环境准备
1. Node.js 16+
2. MySQL 5.7+
3. IDE (推荐 VS Code)

### 本地开发

#### 前端开发
```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

#### 后端开发
```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 创建.env文件（根据.env.example）
cp .env.example .env

# 初始化数据库
npm run init-db

# 启动开发服务器
npm run dev
```

#### 机器人开发
```bash
# 进入机器人目录
cd bot

# 安装依赖
npm install

# 创建.env文件（需要设置TG_BOT_TOKEN）
cp ../.env.example .env

# 启动机器人
npm run dev
```

### 编码规范

#### 前端
- 使用ESLint和Prettier保持代码风格一致
- 组件使用PascalCase命名（例如：UserCard.vue）
- 使用组合式API（Composition API）
- 页面放在views目录，可复用组件放在components目录

#### 后端
- 使用ESLint保持代码风格一致
- 控制器采用RESTful风格
- 业务逻辑放在services目录
- 错误处理统一使用middleware处理

## API文档

### 身份验证
所有管理员API都需要在请求头中包含JWT令牌：
```
Authorization: Bearer <token>
```

### 卡密API
| 路径 | 方法 | 描述 | 权限 |
|------|------|------|------|
| /api/card/verify | POST | 验证卡密 | 无 |
| /api/card/status/:code | GET | 获取卡密状态 | 无 |

### 内容API
| 路径 | 方法 | 描述 | 权限 |
|------|------|------|------|
| /api/content/list | GET | 获取内容列表 | 有效卡密 |
| /api/content/detail/:id | GET | 获取内容详情 | 有效卡密 |

### 管理员API
| 路径 | 方法 | 描述 | 权限 |
|------|------|------|------|
| /api/admin/login | POST | 管理员登录 | 无 |
| /api/admin/dashboard | GET | 获取仪表盘数据 | 管理员 |
| /api/admin/users | GET | 获取用户列表 | 管理员 |
| /api/admin/cards | GET | 获取卡密列表 | 管理员 |
| /api/admin/content | GET | 获取内容列表 | 管理员 |

## 前端路由

| 路径 | 组件 | 描述 | 权限 |
|------|------|------|------|
| / | Home | 首页 | 无 |
| /verify | CardVerify | 卡密验证 | 无 |
| /content | Content | 内容页 | 有效卡密 |
| /login | Login | 管理员登录 | 无 |
| /admin/* | Admin/* | 管理后台 | 管理员 |

## 测试

### 单元测试
```bash
# 在各个目录执行
npm run test
```

### 端到端测试
```bash
# 在根目录执行
npm run e2e
```

## 构建部署

详见 [manual-deploy.md](manual-deploy.md) 文档。 