# 💬 实时聊天应用

一个基于 React + Ant Design 前端和 Node.js + Socket.IO 后端的实时聊天应用。

## ✨ 功能特性

- 🔐 用户登录（用户名）
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
- CORS

## 📦 安装和运行

### 后端服务器

```bash
# 进入后端目录


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

1. 确保后端服务器已启动
2. 启动前端应用
3. 在浏览器中打开 `http://localhost:5173`
4. 输入用户名登录
5. 开始聊天！

## 💡 多用户测试

要测试多用户聊天功能，可以：
- 在不同的浏览器中打开应用
- 使用浏览器的隐私/无痕模式
- 打开多个浏览器标签页

## 📁 项目结构

```
project/
├── backend/              # 后端服务器
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

编辑 `backend/server.js`：
```javascript
const PORT = process.env.PORT || 3000; // 修改为你想要的端口
```

### 修改 WebSocket 连接地址

编辑 `frontend/src/components/ChatRoom.jsx`：
```javascript
const newSocket = io('http://localhost:3000'); // 修改为你的后端地址
```

## 📝 待扩展功能

- [x] 私聊功能
- [ ] 私聊消息持久化存储
- [ ] 文件传输
- [ ] 表情包支持
- [ ] 用户认证（密码）
- [ ] 数据库持久化
- [ ] 消息已读状态
- [ ] 打字状态提示

## 📄 License

MIT
