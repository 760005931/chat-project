const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// 配置 CORS
app.use(cors());

// 配置 Socket.IO 并允许跨域
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173", // Vite 默认端口
    methods: ["GET", "POST"]
  }
});

// 存储在线用户和消息历史
const users = new Map(); // userId -> { id, username, socketId }
const messageHistory = []; // 存储所有消息
const MAX_HISTORY = 100; // 最多保存100条历史消息

// Socket.IO 连接处理
io.on('connection', (socket) => {
  console.log('新用户连接:', socket.id);

  // 用户登录
  socket.on('user:login', (username) => {
    const user = {
      id: socket.id,
      username: username,
      socketId: socket.id,
      joinTime: new Date()
    };
    
    users.set(socket.id, user);
    
    // 发送历史消息给新用户
    socket.emit('message:history', messageHistory);
    
    // 通知所有人用户列表更新
    io.emit('users:update', Array.from(users.values()));
    
    // 广播系统消息：用户加入
    const systemMessage = {
      id: Date.now(),
      type: 'system',
      content: `${username} 加入了聊天室`,
      timestamp: new Date()
    };
    io.emit('message:new', systemMessage);
    
    console.log(`用户 ${username} 已登录`);
  });

  // 接收新消息
  socket.on('message:send', (content) => {
    const user = users.get(socket.id);
    if (!user) {
      socket.emit('error', '请先登录');
      return;
    }

    const message = {
      id: Date.now(),
      type: 'user',
      userId: user.id,
      username: user.username,
      content: content,
      timestamp: new Date()
    };

    // 保存到历史记录
    messageHistory.push(message);
    if (messageHistory.length > MAX_HISTORY) {
      messageHistory.shift(); // 删除最旧的消息
    }

    // 广播给所有用户
    io.emit('message:new', message);
    
    console.log(`${user.username}: ${content}`);
  });

  // 用户断开连接
  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user) {
      users.delete(socket.id);
      
      // 通知所有人用户列表更新
      io.emit('users:update', Array.from(users.values()));
      
      // 广播系统消息：用户离开
      const systemMessage = {
        id: Date.now(),
        type: 'system',
        content: `${user.username} 离开了聊天室`,
        timestamp: new Date()
      };
      io.emit('message:new', systemMessage);
      
      console.log(`用户 ${user.username} 已断开连接`);
    }
  });
});

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    users: users.size,
    messages: messageHistory.length 
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`WebSocket 服务已启动`);
});
