const mongoose = require('mongoose');

// MongoDB 连接配置
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chatapp';

// 连接选项
const options = {
  // 使用新的 URL 解析器
  useNewUrlParser: true,
  // 使用新的服务器发现和监控引擎
  useUnifiedTopology: true,
};

// 连接到 MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, options);
    console.log('✅ MongoDB 连接成功');
    console.log(`📦 数据库: ${mongoose.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB 连接失败:', error.message);
    // 连接失败后等待 5 秒重试
    setTimeout(connectDB, 5000);
  }
};

// 监听连接事件
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose 已连接到数据库');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose 连接错误:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  Mongoose 已断开连接');
});

// 优雅关闭
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('👋 Mongoose 连接已关闭（应用终止）');
  process.exit(0);
});

module.exports = connectDB;
