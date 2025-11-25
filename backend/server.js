const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

// 导入数据库配置和模型
const connectDB = require('./config/database');
const User = require('./models/User');
const Message = require('./models/Message');
const PrivateMessage = require('./models/PrivateMessage');

const app = express();
const server = http.createServer(app);

// 连接数据库
connectDB();

// 配置 CORS
app.use(cors());

// 配置 Socket.IO 并允许跨域
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173", // Vite 默认端口
    methods: ["GET", "POST"]
  }
});

// 临时存储在线用户的 socket 映射（用于实时通信）
const onlineUsers = new Map(); // socketId -> { id, username, socketId }



// Socket.IO 连接处理
io.on('connection', (socket) => {
  console.log('新用户连接:', socket.id);

  // 用户登录
  socket.on('user:login', async (username) => {
    try {
      // 在数据库中查找或创建用户
      const user = await User.findOrCreate(username, socket.id);
      
      // 存储到在线用户映射
      onlineUsers.set(socket.id, {
        id: socket.id,
        username: username,
        socketId: socket.id
      });
      
      // 获取并发送历史消息给新用户
      const messageHistory = await Message.getRecentMessages(100);
      const formattedHistory = messageHistory.map(msg => ({
        id: msg._id.toString(),
        type: msg.type,
        userId: msg.userId,
        username: msg.username,
        content: msg.content,
        timestamp: msg.timestamp
      }));
      socket.emit('message:history', formattedHistory);
      
      // 获取所有在线用户并通知
      const onlineUsersList = Array.from(onlineUsers.values());
      io.emit('users:update', onlineUsersList);
      
      // 创建并广播系统消息：用户加入
      const systemMessage = await Message.createSystemMessage(`${username} 加入了聊天室`);
      const formattedSystemMsg = {
        id: systemMessage._id.toString(),
        type: systemMessage.type,
        content: systemMessage.content,
        timestamp: systemMessage.timestamp
      };
      io.emit('message:new', formattedSystemMsg);
      
      console.log(`用户 ${username} 已登录`);
    } catch (error) {
      console.error('用户登录错误:', error);
      socket.emit('error', '登录失败，请重试');
    }
  });

  // 接收新消息
  socket.on('message:send', async (content) => {
    try {
      const user = onlineUsers.get(socket.id);
      if (!user) {
        socket.emit('error', '请先登录');
        return;
      }

      // 保存消息到数据库
      const message = await Message.createUserMessage(user.id, user.username, content);
      
      // 格式化消息
      const formattedMessage = {
        id: message._id.toString(),
        type: message.type,
        userId: message.userId,
        username: message.username,
        content: message.content,
        timestamp: message.timestamp
      };

      // 广播给所有用户
      io.emit('message:new', formattedMessage);
      
      console.log(`${user.username}: ${content}`);
    } catch (error) {
      console.error('发送消息错误:', error);
      socket.emit('error', '发送消息失败');
    }
  });

  // 发送私聊消息
  socket.on('message:private', async ({ targetUserId, content }) => {
    try {
      const sender = onlineUsers.get(socket.id);
      const receiver = onlineUsers.get(targetUserId);
      
      if (!sender) {
        socket.emit('error', '请先登录');
        return;
      }
      
      if (!receiver) {
        socket.emit('error', '目标用户不在线');
        return;
      }

      // 保存私聊消息到数据库
      const privateMessage = await PrivateMessage.createPrivateMessage(
        sender.id,
        sender.username,
        receiver.id,
        receiver.username,
        content
      );

      // 格式化消息
      const formattedMessage = {
        id: privateMessage._id.toString(),
        type: 'private',
        fromUserId: privateMessage.fromUserId,
        fromUsername: privateMessage.fromUsername,
        toUserId: privateMessage.toUserId,
        toUsername: privateMessage.toUsername,
        content: privateMessage.content,
        timestamp: privateMessage.timestamp
      };

      // 发送给发送者和接收者
      socket.emit('message:private', formattedMessage);
      socket.to(receiver.socketId).emit('message:private', formattedMessage);
      
      console.log(`私聊 ${sender.username} -> ${receiver.username}: ${content}`);
    } catch (error) {
      console.error('发送私聊消息错误:', error);
      socket.emit('error', '发送私聊消息失败');
    }
  });

  // 获取私聊历史记录
  socket.on('message:private:history', async ({ targetUserId }) => {
    try {
      const user = onlineUsers.get(socket.id);
      if (!user) {
        socket.emit('error', '请先登录');
        return;
      }

      // 从数据库获取会话历史
      const history = await PrivateMessage.getConversationHistory(socket.id, targetUserId, 100);
      
      // 格式化消息
      const formattedHistory = history.map(msg => ({
        id: msg._id.toString(),
        type: 'private',
        fromUserId: msg.fromUserId,
        fromUsername: msg.fromUsername,
        toUserId: msg.toUserId,
        toUsername: msg.toUsername,
        content: msg.content,
        timestamp: msg.timestamp
      }));
      
      socket.emit('message:private:history', { targetUserId, messages: formattedHistory });
      
      // 标记消息为已读
      await PrivateMessage.markConversationAsRead(socket.id, targetUserId);
      
      console.log(`用户 ${user.username} 请求与 ${targetUserId} 的私聊历史`);
    } catch (error) {
      console.error('获取私聊历史错误:', error);
      socket.emit('error', '获取私聊历史失败');
    }
  });


  // 用户断开连接
  socket.on('disconnect', async () => {
    try {
      const user = onlineUsers.get(socket.id);
      if (user) {
        // 从在线用户列表中移除
        onlineUsers.delete(socket.id);
        
        // 更新数据库中的用户状态
        const dbUser = await User.findOne({ username: user.username });
        if (dbUser) {
          await dbUser.setOffline();
        }
        
        // 通知所有人用户列表更新
        io.emit('users:update', Array.from(onlineUsers.values()));
        
        // 创建并广播系统消息：用户离开
        const systemMessage = await Message.createSystemMessage(`${user.username} 离开了聊天室`);
        const formattedSystemMsg = {
          id: systemMessage._id.toString(),
          type: systemMessage.type,
          content: systemMessage.content,
          timestamp: systemMessage.timestamp
        };
        io.emit('message:new', formattedSystemMsg);
        
        console.log(`用户 ${user.username} 已断开连接`);
      }
    } catch (error) {
      console.error('用户断开连接错误:', error);
    }
  });
});

// 健康检查端点
app.get('/health', async (req, res) => {
  try {
    const messageCount = await Message.countDocuments();
    const userCount = await User.countDocuments();
    const privateMessageCount = await PrivateMessage.countDocuments();
    
    res.json({ 
      status: 'ok',
      database: 'connected',
      onlineUsers: onlineUsers.size,
      totalUsers: userCount,
      totalMessages: messageCount,
      totalPrivateMessages: privateMessageCount
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      database: 'disconnected',
      message: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`WebSocket 服务已启动`);
});
