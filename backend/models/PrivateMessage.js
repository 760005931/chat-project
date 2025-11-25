const mongoose = require('mongoose');

// 私聊消息 Schema
const privateMessageSchema = new mongoose.Schema({
  fromUserId: {
    type: String, // 使用 socketId
    required: true
  },
  fromUsername: {
    type: String,
    required: true
  },
  toUserId: {
    type: String, // 使用 socketId
    required: true
  },
  toUsername: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 500
  },
  conversationId: {
    type: String,
    required: true,
    index: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// 复合索引：用于快速查询会话历史
privateMessageSchema.index({ conversationId: 1, timestamp: -1 });
// 复合索引：用于查询未读消息
privateMessageSchema.index({ toUserId: 1, isRead: 1 });

// 生成会话 ID（确保两个用户之间的会话 ID 唯一）
privateMessageSchema.statics.generateConversationId = function(userId1, userId2) {
  return [userId1, userId2].sort().join('_');
};

// 静态方法：获取会话历史
privateMessageSchema.statics.getConversationHistory = function(userId1, userId2, limit = 100) {
  const conversationId = this.generateConversationId(userId1, userId2);
  return this.find({ conversationId })
    .sort({ timestamp: 1 }) // 按时间升序
    .limit(limit)
    .lean();
};

// 静态方法：创建私聊消息
privateMessageSchema.statics.createPrivateMessage = function(fromUserId, fromUsername, toUserId, toUsername, content) {
  const conversationId = this.generateConversationId(fromUserId, toUserId);
  
  return this.create({
    fromUserId,
    fromUsername,
    toUserId,
    toUsername,
    content,
    conversationId,
    isRead: false,
    timestamp: new Date()
  });
};

// 静态方法：获取未读消息数量
privateMessageSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({ toUserId: userId, isRead: false });
};

// 静态方法：标记会话消息为已读
privateMessageSchema.statics.markConversationAsRead = function(userId, otherUserId) {
  const conversationId = this.generateConversationId(userId, otherUserId);
  return this.updateMany(
    { conversationId, toUserId: userId, isRead: false },
    { $set: { isRead: true } }
  );
};

// 实例方法：标记单条消息为已读
privateMessageSchema.methods.markAsRead = function() {
  this.isRead = true;
  return this.save();
};

const PrivateMessage = mongoose.model('PrivateMessage', privateMessageSchema);

module.exports = PrivateMessage;
