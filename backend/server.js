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
const privateMessages = new Map(); // 存储私聊消息历史 conversationId -> [messages]

// 生成会话ID（确保两个用户之间的会话ID唯一）
const getConversationId = (userId1, userId2) => {
  return [userId1, userId2].sort().join('_');
};

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

  // 发送私聊消息
  socket.on('message:private', ({ targetUserId, content }) => {
    const sender = users.get(socket.id);
    const receiver = users.get(targetUserId);
    
    if (!sender) {
      socket.emit('error', '请先登录');
      return;
    }
    
    if (!receiver) {
      socket.emit('error', '目标用户不在线');
      return;
    }

    const privateMessage = {
      id: Date.now(),
      type: 'private',
      fromUserId: sender.id,
      fromUsername: sender.username,
      toUserId: receiver.id,
      toUsername: receiver.username,
      content: content,
      timestamp: new Date()
    };

    // 保存到私聊历史记录
    const conversationId = getConversationId(sender.id, receiver.id);
    if (!privateMessages.has(conversationId)) {
      privateMessages.set(conversationId, []);
    }
    const conversation = privateMessages.get(conversationId);
    conversation.push(privateMessage);
    if (conversation.length > MAX_HISTORY) {
      conversation.shift();
    }

    // 发送给发送者和接收者
    socket.emit('message:private', privateMessage);
    socket.to(receiver.socketId).emit('message:private', privateMessage);
    
    console.log(`私聊 ${sender.username} -> ${receiver.username}: ${content}`);
  });

  // 获取私聊历史记录
  socket.on('message:private:history', ({ targetUserId }) => {
    const user = users.get(socket.id);
    if (!user) {
      socket.emit('error', '请先登录');
      return;
    }

    const conversationId = getConversationId(socket.id, targetUserId);
    const history = privateMessages.get(conversationId) || [];
    socket.emit('message:private:history', { targetUserId, messages: history });
    
    console.log(`用户 ${user.username} 请求与 ${targetUserId} 的私聊历史`);
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
