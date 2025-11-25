# 💬 实时聊天应用

一个基于 React + Ant Design 前端和 Node.js + Socket.IO 后端的实时聊天应用。

## ✨ 功能特性

- 🔐 用户登录(用户名)
- 💬 实时消息发送和接收
- 👥 在线用户列表
- 📜 消息历史记录
- ⏰ 消息时间戳
- 💌 一对一私聊功能
- 🔔 私聊未读消息提示
- 🎨 现代化 UI 设计
- 📱 响应式布局

## 🛠️ 技术栈

### 前端
- React 19
- Ant Design 5
- Socket.IO Client
- Vite

### 后端
- Node.js
- Express
- Socket.IO
- MongoDB + Mongoose
- CORS

## 📦 安装和运行

### 前置要求

- Node.js (推荐 v16 或更高版本)
- MongoDB (本地安装或使用 MongoDB Atlas)

### MongoDB 配置

1. **本地 MongoDB 安装**:
   - 下载并安装 [MongoDB Community Server](https://www.mongodb.com/try/download/community)
   - 启动 MongoDB 服务
   - 默认连接地址:`mongodb://localhost:27017/chat-app`

2. **配置数据库连接**:
   - 在 `backend/config/database.js` 中配置 MongoDB 连接字符串
   - 默认使用本地数据库,也可以使用 MongoDB Atlas 云数据库

### 后端服务器

```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 启动服务器
npm start
```

后端服务器将在 `http://localhost:3000` 运行。

### 前端应用

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端应用将在 `http://localhost:5173` 运行。

## 🚀 使用说明

1. 确保 MongoDB 服务已启动
2. 启动后端服务器
3. 启动前端应用
4. 在浏览器中打开 `http://localhost:5173`
5. 输入用户名登录
6. 开始聊天!

## 💡 多用户测试

要测试多用户聊天功能,可以:
- 在不同的浏览器中打开应用
- 使用浏览器的隐私/无痕模式
- 打开多个浏览器标签页

## 📁 项目结构

```
project/
├── backend/              # 后端服务器
│   ├── config/          # 配置文件
│   │   └── database.js  # 数据库连接配置
│   ├── models/          # 数据模型
│   │   ├── User.js      # 用户模型
│   │   ├── Message.js   # 公共消息模型
│   │   └── PrivateMessage.js  # 私聊消息模型
│   ├── server.js        # 主服务器文件
│   ├── package.json     # 后端依赖
│   └── .gitignore
├── frontend/            # 前端应用
│   ├── src/
│   │   ├── components/  # React 组件
│   │   │   ├── Login.jsx
│   │   │   ├── Login.css
│   │   │   ├── ChatRoom.jsx
│   │   │   └── ChatRoom.css
│   │   ├── App.jsx      # 主应用组件
│   │   ├── App.css      # 全局样式
│   │   └── main.jsx     # 应用入口
│   ├── package.json     # 前端依赖
│   └── vite.config.js   # Vite 配置
└── README.md            # 项目文档
```

## 🔧 配置说明

### 修改服务器端口

编辑 `backend/server.js`:
```javascript
const PORT = process.env.PORT || 3000; // 修改为你想要的端口
```

### 修改 WebSocket 连接地址

编辑 `frontend/src/components/ChatRoom.jsx`:
```javascript
const newSocket = io('http://localhost:3000'); // 修改为你的后端地址
```

## 💾 数据持久化

应用使用 MongoDB 数据库存储以下数据:

- **用户信息**: 用户名、在线状态、最后活跃时间
- **公共消息**: 聊天室消息历史记录
- **私聊消息**: 一对一私聊消息及已读状态

数据库连接状态可通过访问 `http://localhost:3000/health` 查看。

## 📝 待扩展功能

- [x] 私聊功能
- [x] 私聊消息持久化存储
- [x] 数据库持久化(MongoDB)
- [ ] 文件传输
- [ ] 表情包支持
- [ ] 用户认证(密码)
- [ ] 消息已读状态
- [ ] 打字状态提示

## 📄 License

MIT
