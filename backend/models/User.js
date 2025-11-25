const mongoose = require('mongoose');

// 用户 Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 2,
    maxlength: 20
  },
  socketId: {
    type: String,
    default: null
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // 自动添加 createdAt 和 updatedAt
});

// 索引
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ isOnline: 1 });

// 实例方法：设置用户在线
userSchema.methods.setOnline = function(socketId) {
  this.isOnline = true;
  this.socketId = socketId;
  this.lastSeen = new Date();
  return this.save();
};

// 实例方法：设置用户离线
userSchema.methods.setOffline = function() {
  this.isOnline = false;
  this.socketId = null;
  this.lastSeen = new Date();
  return this.save();
};

// 静态方法：获取所有在线用户
userSchema.statics.getOnlineUsers = function() {
  return this.find({ isOnline: true }).select('username socketId');
};

// 静态方法：通过用户名查找或创建用户
userSchema.statics.findOrCreate = async function(username, socketId) {
  let user = await this.findOne({ username });
  
  if (!user) {
    user = await this.create({
      username,
      socketId,
      isOnline: true,
      lastSeen: new Date()
    });
  } else {
    await user.setOnline(socketId);
  }
  
  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
