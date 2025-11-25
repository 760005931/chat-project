const mongoose = require('mongoose');

// 公共消息 Schema
const messageSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['system', 'user'],
    required: true
  },
  userId: {
    type: String, // 使用 socketId 作为 userId
    required: function() {
      return this.type === 'user';
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
    maxlength: 500
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// 索引：按时间降序排列，用于快速获取最新消息
messageSchema.index({ timestamp: -1 });
messageSchema.index({ userId: 1 });

// 静态方法：获取最近的 N 条消息
messageSchema.statics.getRecentMessages = function(limit = 100) {
  return this.find()
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean()
    .then(messages => messages.reverse()); // 反转顺序，最旧的在前
};

// 静态方法：创建系统消息
messageSchema.statics.createSystemMessage = function(content) {
  return this.create({
    type: 'system',
    content,
    timestamp: new Date()
  });
};

// 静态方法：创建用户消息
messageSchema.statics.createUserMessage = function(userId, username, content) {
  return this.create({
    type: 'user',
    userId,
    username,
    content,
    timestamp: new Date()
  });
};

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
