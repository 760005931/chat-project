# 📚 MongoDB 使用指南

本文档详细说明了聊天应用中 MongoDB 数据库的使用、连接和数据模型设计。

## 📋 目录

- [MongoDB 简介](#mongodb-简介)
- [安装和启动](#安装和启动)
- [数据库连接](#数据库连接)
- [数据模型设计](#数据模型设计)
- [数据操作示例](#数据操作示例)
- [常见问题](#常见问题)

## 🎯 MongoDB 简介

### 什么是 MongoDB？

MongoDB 是一个基于文档的 NoSQL 数据库，具有以下特点：

- **文档存储**: 数据以 JSON 格式的文档存储，而不是传统的表格行列
- **灵活的模式**: 不需要预定义严格的表结构，可以随时添加字段
- **高性能**: 适合处理大量读写操作
- **易于扩展**: 支持水平扩展和分片

### 为什么选择 MongoDB？

在聊天应用中，MongoDB 特别适合因为：

1. **消息数据结构灵活**: 不同类型的消息可能有不同的字段
2. **高并发读写**: 聊天应用需要频繁的消息读写
3. **易于开发**: JSON 格式与 JavaScript 天然契合
4. **实时性能好**: 适合实时聊天场景

## 🔧 安装和启动

### Windows 系统安装

#### 1. 下载 MongoDB

访问 [MongoDB 官方下载页面](https://www.mongodb.com/try/download/community)

- 选择 **MongoDB Community Server**
- 选择 **Windows** 平台
- 下载 `.msi` 安装包

#### 2. 安装步骤

1. 运行下载的 `.msi` 安装程序
2. 选择 **Complete** (完整安装)
3. 选择 **Install MongoDB as a Service** (作为服务安装)
4. 记住安装路径，默认为: `C:\Program Files\MongoDB\Server\7.0\`

#### 3. 验证安装

打开命令提示符（CMD）或 PowerShell，运行：

```bash
mongod --version
```

如果显示版本信息，说明安装成功。

### 启动 MongoDB 服务

#### 方式 1: Windows 服务（推荐）

MongoDB 安装时已配置为 Windows 服务，会自动启动。

查看服务状态：
```bash
# 查看服务状态
sc query MongoDB

# 启动服务
net start MongoDB

# 停止服务
net stop MongoDB
```

#### 方式 2: 手动启动

```bash
# 创建数据目录
mkdir C:\data\db

# 启动 MongoDB
mongod --dbpath C:\data\db
```

### 验证 MongoDB 运行

打开新的命令行窗口，运行：

```bash
mongosh
```

如果成功连接，会看到 MongoDB shell 提示符：
```
test>
```

## 🔌 数据库连接

### 连接架构

```
┌─────────────────┐
│  Node.js 应用   │
│   (server.js)   │
└────────┬────────┘
         │
         │ require
         ▼
┌─────────────────┐
│  database.js    │  ← 数据库连接配置
└────────┬────────┘
         │
         │ mongoose.connect()
         ▼
┌─────────────────┐
│  MongoDB 服务   │
│  localhost:27017│
└─────────────────┘
```

### 连接配置详解

#### 1. 连接字符串格式

```javascript
mongodb://[username:password@]host[:port]/database[?options]
```

**本地连接示例**:
```javascript
'mongodb://localhost:27017/chatapp'
```

**参数说明**:
- `mongodb://` - 协议
- `localhost` - 主机地址（本地）
- `27017` - 端口号（MongoDB 默认端口）
- `chatapp` - 数据库名称

#### 2. 连接配置文件 (`backend/config/database.js`)

```javascript
const mongoose = require('mongoose');

// MongoDB 连接 URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chatapp';

// 连接选项
const options = {
  useNewUrlParser: true,      // 使用新的 URL 解析器
  useUnifiedTopology: true,   // 使用新的服务器发现和监控引擎
};

// 连接函数
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, options);
    console.log('✅ MongoDB 连接成功');
    console.log(`📦 数据库: ${mongoose.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB 连接失败:', error.message);
    // 5 秒后重试
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;
```

#### 3. 连接选项说明

| 选项 | 说明 | 推荐值 |
|------|------|--------|
| `useNewUrlParser` | 使用新的 URL 解析器 | `true` |
| `useUnifiedTopology` | 使用新的拓扑引擎 | `true` |
| `serverSelectionTimeoutMS` | 服务器选择超时时间 | `5000` (可选) |
| `socketTimeoutMS` | Socket 超时时间 | `45000` (可选) |

#### 4. 在应用中使用

在 `server.js` 中：

```javascript
const connectDB = require('./config/database');

// 连接数据库
connectDB();
```

### 连接事件监听

```javascript
// 连接成功
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose 已连接到数据库');
});

// 连接错误
mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose 连接错误:', err);
});

// 连接断开
mongoose.connection.on('disconnected', () => {
  console.log('⚠️ Mongoose 已断开连接');
});

// 应用终止时关闭连接
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('👋 Mongoose 连接已关闭');
  process.exit(0);
});
```

## 📊 数据模型设计

### Mongoose 简介

Mongoose 是 MongoDB 的对象文档映射（ODM）库，提供：

- **Schema 定义**: 定义数据结构
- **模型验证**: 数据验证和类型检查
- **查询构建**: 简化数据库操作
- **中间件**: 钩子函数支持

### 数据模型架构

```
┌──────────────────────────────────────┐
│          MongoDB 数据库              │
│         (chatapp)                    │
├──────────────────────────────────────┤
│                                      │
│  ┌────────────────┐                 │
│  │  users 集合    │  ← User 模型    │
│  └────────────────┘                 │
│                                      │
│  ┌────────────────┐                 │
│  │ messages 集合  │  ← Message 模型 │
│  └────────────────┘                 │
│                                      │
│  ┌────────────────┐                 │
│  │privatemessages │  ← PrivateMsg   │
│  │     集合       │     模型        │
│  └────────────────┘                 │
│                                      │
└──────────────────────────────────────┘
```

### 1. User 模型 (用户)

**文件**: `backend/models/User.js`

```javascript
const mongoose = require('mongoose');

// 定义用户 Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,        // 字符串类型
    required: true,      // 必填字段
    unique: true,        // 唯一索引
    trim: true,          // 自动去除首尾空格
    minlength: 1,        // 最小长度
    maxlength: 50        // 最大长度
  },
  socketId: {
    type: String,        // 当前 Socket ID
    default: null
  },
  isOnline: {
    type: Boolean,       // 是否在线
    default: false
  },
  lastActive: {
    type: Date,          // 最后活跃时间
    default: Date.now
  }
}, {
  timestamps: true       // 自动添加 createdAt 和 updatedAt
});

// 创建索引
userSchema.index({ username: 1 });
userSchema.index({ isOnline: 1 });

// 实例方法：设置用户在线
userSchema.methods.setOnline = function(socketId) {
  this.isOnline = true;
  this.socketId = socketId;
  this.lastActive = new Date();
  return this.save();
};

// 实例方法：设置用户离线
userSchema.methods.setOffline = function() {
  this.isOnline = false;
  this.socketId = null;
  this.lastActive = new Date();
  return this.save();
};

// 静态方法：查找或创建用户
userSchema.statics.findOrCreate = async function(username, socketId) {
  let user = await this.findOne({ username });
  
  if (!user) {
    user = await this.create({
      username,
      socketId,
      isOnline: true,
      lastActive: new Date()
    });
  } else {
    await user.setOnline(socketId);
  }
  
  return user;
};

module.exports = mongoose.model('User', userSchema);
```

**数据示例**:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "username": "张三",
  "socketId": "abc123xyz",
  "isOnline": true,
  "lastActive": "2025-11-25T03:50:00.000Z",
  "createdAt": "2025-11-25T03:00:00.000Z",
  "updatedAt": "2025-11-25T03:50:00.000Z"
}
```

### 2. Message 模型 (公共消息)

**文件**: `backend/models/Message.js`

```javascript
const mongoose = require('mongoose');

// 定义消息 Schema
const messageSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['user', 'system'],  // 枚举：只能是这两个值
    required: true
  },
  userId: {
    type: String,              // 用户 Socket ID
    required: function() {
      return this.type === 'user';  // 用户消息必填
    }
  },
  username: {
    type: String,
    required: function() {
      return this.type === 'user';
    }
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000            // 最大 1000 字符
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true                // 创建索引，加速时间查询
  }
}, {
  timestamps: true
});

// 创建复合索引：按时间倒序查询
messageSchema.index({ timestamp: -1 });

// 静态方法：创建用户消息
messageSchema.statics.createUserMessage = async function(userId, username, content) {
  return await this.create({
    type: 'user',
    userId,
    username,
    content,
    timestamp: new Date()
  });
};

// 静态方法：创建系统消息
messageSchema.statics.createSystemMessage = async function(content) {
  return await this.create({
    type: 'system',
    content,
    timestamp: new Date()
  });
};

// 静态方法：获取最近的消息
messageSchema.statics.getRecentMessages = async function(limit = 100) {
  return await this.find()
    .sort({ timestamp: -1 })   // 按时间倒序
    .limit(limit)              // 限制数量
    .lean();                   // 返回普通 JS 对象，性能更好
};

module.exports = mongoose.model('Message', messageSchema);
```

**数据示例**:
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "type": "user",
  "userId": "abc123xyz",
  "username": "张三",
  "content": "大家好！",
  "timestamp": "2025-11-25T03:50:00.000Z",
  "createdAt": "2025-11-25T03:50:00.000Z",
  "updatedAt": "2025-11-25T03:50:00.000Z"
}
```

### 3. PrivateMessage 模型 (私聊消息)

**文件**: `backend/models/PrivateMessage.js`

```javascript
const mongoose = require('mongoose');

// 定义私聊消息 Schema
const privateMessageSchema = new mongoose.Schema({
  fromUserId: {
    type: String,
    required: true,
    index: true                // 创建索引
  },
  fromUsername: {
    type: String,
    required: true
  },
  toUserId: {
    type: String,
    required: true,
    index: true
  },
  toUsername: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// 复合索引：优化会话查询
privateMessageSchema.index({ fromUserId: 1, toUserId: 1, timestamp: -1 });
privateMessageSchema.index({ toUserId: 1, isRead: 1 });

// 静态方法：创建私聊消息
privateMessageSchema.statics.createPrivateMessage = async function(
  fromUserId, fromUsername, toUserId, toUsername, content
) {
  return await this.create({
    fromUserId,
    fromUsername,
    toUserId,
    toUsername,
    content,
    isRead: false,
    timestamp: new Date()
  });
};

// 静态方法：获取两个用户之间的会话历史
privateMessageSchema.statics.getConversationHistory = async function(
  userId1, userId2, limit = 100
) {
  return await this.find({
    $or: [
      { fromUserId: userId1, toUserId: userId2 },
      { fromUserId: userId2, toUserId: userId1 }
    ]
  })
  .sort({ timestamp: -1 })
  .limit(limit)
  .lean();
};

// 静态方法：标记会话为已读
privateMessageSchema.statics.markConversationAsRead = async function(
  currentUserId, otherUserId
) {
  return await this.updateMany(
    {
      fromUserId: otherUserId,
      toUserId: currentUserId,
      isRead: false
    },
    {
      $set: { isRead: true }
    }
  );
};

// 静态方法：获取未读消息数量
privateMessageSchema.statics.getUnreadCount = async function(userId, fromUserId) {
  return await this.countDocuments({
    toUserId: userId,
    fromUserId: fromUserId,
    isRead: false
  });
};

module.exports = mongoose.model('PrivateMessage', privateMessageSchema);
```

**数据示例**:
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "fromUserId": "abc123xyz",
  "fromUsername": "张三",
  "toUserId": "def456uvw",
  "toUsername": "李四",
  "content": "你好，李四！",
  "isRead": false,
  "timestamp": "2025-11-25T03:50:00.000Z",
  "createdAt": "2025-11-25T03:50:00.000Z",
  "updatedAt": "2025-11-25T03:50:00.000Z"
}
```

## 💻 数据操作示例

### 在 server.js 中使用模型

```javascript
const User = require('./models/User');
const Message = require('./models/Message');
const PrivateMessage = require('./models/PrivateMessage');

// 用户登录
socket.on('user:login', async (username) => {
  // 查找或创建用户
  const user = await User.findOrCreate(username, socket.id);
  
  // 获取历史消息
  const messageHistory = await Message.getRecentMessages(100);
  socket.emit('message:history', messageHistory);
});

// 发送公共消息
socket.on('message:send', async (content) => {
  const user = onlineUsers.get(socket.id);
  
  // 保存消息到数据库
  const message = await Message.createUserMessage(
    user.id, 
    user.username, 
    content
  );
  
  // 广播消息
  io.emit('message:new', message);
});

// 发送私聊消息
socket.on('message:private', async ({ targetUserId, content }) => {
  const sender = onlineUsers.get(socket.id);
  const receiver = onlineUsers.get(targetUserId);
  
  // 保存私聊消息
  const privateMessage = await PrivateMessage.createPrivateMessage(
    sender.id,
    sender.username,
    receiver.id,
    receiver.username,
    content
  );
  
  // 发送给双方
  socket.emit('message:private', privateMessage);
  socket.to(receiver.socketId).emit('message:private', privateMessage);
});

// 获取私聊历史
socket.on('message:private:history', async ({ targetUserId }) => {
  const history = await PrivateMessage.getConversationHistory(
    socket.id, 
    targetUserId, 
    100
  );
  
  socket.emit('message:private:history', { targetUserId, messages: history });
  
  // 标记为已读
  await PrivateMessage.markConversationAsRead(socket.id, targetUserId);
});
```

### 常用 Mongoose 操作

#### 创建文档
```javascript
// 方式 1
const user = new User({ username: '张三' });
await user.save();

// 方式 2
const user = await User.create({ username: '张三' });
```

#### 查询文档
```javascript
// 查找一个
const user = await User.findOne({ username: '张三' });

// 查找多个
const users = await User.find({ isOnline: true });

// 按 ID 查找
const user = await User.findById('507f1f77bcf86cd799439011');

// 条件查询
const messages = await Message.find({
  type: 'user',
  timestamp: { $gte: new Date('2025-11-25') }
});
```

#### 更新文档
```javascript
// 方式 1: 查找并修改
const user = await User.findOne({ username: '张三' });
user.isOnline = true;
await user.save();

// 方式 2: 直接更新
await User.updateOne(
  { username: '张三' },
  { $set: { isOnline: true } }
);

// 方式 3: 查找并更新
const user = await User.findOneAndUpdate(
  { username: '张三' },
  { $set: { isOnline: true } },
  { new: true }  // 返回更新后的文档
);
```

#### 删除文档
```javascript
// 删除一个
await User.deleteOne({ username: '张三' });

// 删除多个
await Message.deleteMany({ type: 'system' });

// 查找并删除
const user = await User.findOneAndDelete({ username: '张三' });
```

#### 聚合查询
```javascript
// 统计在线用户数
const onlineCount = await User.countDocuments({ isOnline: true });

// 按用户统计消息数
const stats = await Message.aggregate([
  { $match: { type: 'user' } },
  { $group: { _id: '$username', count: { $sum: 1 } } },
  { $sort: { count: -1 } }
]);
```

## 🔍 使用 MongoDB Shell 查看数据

### 连接到数据库

```bash
# 启动 MongoDB Shell
mongosh

# 切换到 chatapp 数据库
use chatapp
```

### 常用命令

```javascript
// 查看所有集合
show collections

// 查看 users 集合的所有文档
db.users.find()

// 格式化输出
db.users.find().pretty()

// 查看消息数量
db.messages.countDocuments()

// 查询特定用户的消息
db.messages.find({ username: "张三" })

// 查看最新的 10 条消息
db.messages.find().sort({ timestamp: -1 }).limit(10)

// 查看未读私聊消息
db.privatemessages.find({ isRead: false })

// 删除所有消息（慎用！）
db.messages.deleteMany({})

// 查看数据库统计信息
db.stats()
```

## ❓ 常见问题

### 1. 连接失败：`MongoServerError: connect ECONNREFUSED`

**原因**: MongoDB 服务未启动

**解决方案**:
```bash
# 启动 MongoDB 服务
net start MongoDB
```

### 2. 找不到 `mongod` 命令

**原因**: MongoDB 未添加到系统环境变量

**解决方案**:
1. 找到 MongoDB 安装目录，如 `C:\Program Files\MongoDB\Server\7.0\bin`
2. 将此路径添加到系统 PATH 环境变量
3. 重启命令行窗口

### 3. 数据库连接超时

**原因**: 连接字符串错误或网络问题

**解决方案**:
- 检查连接字符串是否正确
- 确认 MongoDB 服务正在运行
- 检查防火墙设置

### 4. 数据没有保存

**原因**: 
- 没有调用 `save()` 或 `create()`
- 数据验证失败
- 连接断开

**解决方案**:
```javascript
try {
  const message = await Message.create({ ... });
  console.log('保存成功:', message);
} catch (error) {
  console.error('保存失败:', error.message);
}
```

### 5. 查询性能慢

**原因**: 缺少索引

**解决方案**:
- 在 Schema 中定义索引
- 使用 `explain()` 分析查询

```javascript
// 查看查询计划
const result = await Message.find({ username: '张三' }).explain();
console.log(result);
```

### 6. 如何清空数据库重新开始？

```javascript
// 在 MongoDB Shell 中
use chatapp
db.dropDatabase()
```

或者在代码中：
```javascript
await mongoose.connection.dropDatabase();
```

## 📚 参考资源

- [MongoDB 官方文档](https://docs.mongodb.com/)
- [Mongoose 官方文档](https://mongoosejs.com/docs/)
- [MongoDB University](https://university.mongodb.com/) - 免费在线课程
- [MongoDB Compass](https://www.mongodb.com/products/compass) - 可视化管理工具

## 🎯 最佳实践

1. **使用索引**: 为常用查询字段创建索引
2. **数据验证**: 在 Schema 中定义验证规则
3. **错误处理**: 使用 try-catch 捕获数据库错误
4. **连接管理**: 应用启动时连接一次，重用连接
5. **查询优化**: 使用 `lean()` 提高查询性能
6. **限制结果**: 使用 `limit()` 避免返回过多数据
7. **定期备份**: 定期备份重要数据

---

**文档版本**: 1.0  
**最后更新**: 2025-11-25  
**作者**: Chat Application Team
