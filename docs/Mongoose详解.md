# 🍃 Mongoose 详解

Mongoose 是 MongoDB 的对象文档映射（ODM）库，为 Node.js 应用提供了一个优雅的 MongoDB 对象建模解决方案。

## 📋 目录

- [Mongoose 简介](#mongoose-简介)
- [核心概念](#核心概念)
- [Schema 详解](#schema-详解)
- [Model 详解](#model-详解)
- [查询操作](#查询操作)
- [中间件 Middleware](#中间件-middleware)
- [验证 Validation](#验证-validation)
- [虚拟属性 Virtuals](#虚拟属性-virtuals)
- [实例方法和静态方法](#实例方法和静态方法)
- [最佳实践](#最佳实践)

## 🎯 Mongoose 简介

### 什么是 Mongoose？

Mongoose 是一个 **对象文档映射（ODM）** 库，它在 MongoDB 和 Node.js 之间提供了一个抽象层。

```
┌─────────────────┐
│  Node.js 应用   │
│   (JavaScript)  │
└────────┬────────┘
         │
         │ Mongoose ODM
         │ (对象 ↔ 文档映射)
         │
         ▼
┌─────────────────┐
│    MongoDB      │
│  (JSON 文档)    │
└─────────────────┘
```

### 为什么使用 Mongoose？

#### 原生 MongoDB 驱动 vs Mongoose

**原生 MongoDB 驱动**:
```javascript
// 没有类型检查，容易出错
db.collection('users').insertOne({
  username: 'zhangsan',
  age: '25',  // 字符串，可能不是你想要的
  email: 'invalid-email'  // 没有验证
});
```

**使用 Mongoose**:
```javascript
// 有 Schema 定义和验证
const user = new User({
  username: 'zhangsan',
  age: '25',  // 会自动转换为数字
  email: 'invalid-email'  // 验证失败，抛出错误
});
await user.save();  // ValidationError: email is invalid
```

### Mongoose 的优势

1. ✅ **Schema 定义**: 为文档定义结构
2. ✅ **数据验证**: 自动验证数据类型和格式
3. ✅ **类型转换**: 自动转换数据类型
4. ✅ **查询构建**: 链式查询 API
5. ✅ **中间件**: 钩子函数支持
6. ✅ **关系管理**: 支持文档引用和填充
7. ✅ **虚拟属性**: 计算属性支持

## 🏗️ 核心概念

### Mongoose 架构

```
Schema (模式)
    ↓ 定义结构
Model (模型)
    ↓ 创建实例
Document (文档)
    ↓ 保存
MongoDB Collection (集合)
```

### 1. Schema (模式)

Schema 定义了文档的结构、默认值、验证规则等。

```javascript
const mongoose = require('mongoose');

// 定义 Schema
const userSchema = new mongoose.Schema({
  username: String,
  age: Number,
  email: String
});
```

### 2. Model (模型)

Model 是根据 Schema 编译出来的构造函数，用于创建和查询文档。

```javascript
// 创建 Model
const User = mongoose.model('User', userSchema);

// 使用 Model 创建文档
const user = new User({ username: 'zhangsan' });
```

### 3. Document (文档)

Document 是 Model 的实例，代表 MongoDB 中的一个文档。

```javascript
// Document 实例
const user = new User({ username: 'zhangsan' });

// Document 有自己的方法
await user.save();
await user.remove();
```

## 📐 Schema 详解

### Schema 类型

Mongoose 支持以下 Schema 类型：

```javascript
const schema = new mongoose.Schema({
  // 字符串
  name: String,
  
  // 数字
  age: Number,
  
  // 布尔值
  isActive: Boolean,
  
  // 日期
  createdAt: Date,
  
  // Buffer (二进制数据)
  avatar: Buffer,
  
  // ObjectId (MongoDB ID)
  userId: mongoose.Schema.Types.ObjectId,
  
  // 数组
  tags: [String],
  hobbies: Array,
  
  // 嵌套对象
  address: {
    street: String,
    city: String,
    zipCode: String
  },
  
  // Mixed (任意类型)
  metadata: mongoose.Schema.Types.Mixed,
  
  // Map
  socialLinks: Map
});
```

### Schema 选项

```javascript
const userSchema = new mongoose.Schema({
  username: {
    type: String,           // 类型
    required: true,         // 必填
    unique: true,           // 唯一
    trim: true,             // 去除首尾空格
    lowercase: true,        // 转小写
    uppercase: false,       // 转大写
    minlength: 3,          // 最小长度
    maxlength: 50,         // 最大长度
    match: /^[a-zA-Z0-9]+$/, // 正则验证
    enum: ['user', 'admin'], // 枚举值
    default: 'user',        // 默认值
    index: true,            // 创建索引
    sparse: true,           // 稀疏索引
    select: true,           // 查询时是否包含
    immutable: false,       // 是否不可变
    alias: 'name'           // 别名
  },
  
  age: {
    type: Number,
    min: 0,                 // 最小值
    max: 150,               // 最大值
    validate: {             // 自定义验证
      validator: function(v) {
        return v >= 18;
      },
      message: '年龄必须大于等于 18'
    }
  },
  
  email: {
    type: String,
    required: [true, '邮箱是必填的'],  // 自定义错误消息
    validate: {
      validator: function(v) {
        return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
      },
      message: props => `${props.value} 不是有效的邮箱地址`
    }
  }
}, {
  // Schema 级别选项
  timestamps: true,         // 自动添加 createdAt 和 updatedAt
  collection: 'users',      // 指定集合名称
  versionKey: '__v',        // 版本键名称
  strict: true,             // 严格模式
  strictQuery: true,        // 严格查询模式
  toJSON: { virtuals: true }, // toJSON 时包含虚拟属性
  toObject: { virtuals: true } // toObject 时包含虚拟属性
});
```

### 实际应用示例

#### User Schema (用户模型)

```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, '用户名是必填的'],
    unique: true,
    trim: true,
    minlength: [3, '用户名至少 3 个字符'],
    maxlength: [50, '用户名最多 50 个字符'],
    match: [/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线']
  },
  
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
      },
      message: '请输入有效的邮箱地址'
    }
  },
  
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false  // 查询时默认不返回密码
  },
  
  age: {
    type: Number,
    min: [0, '年龄不能为负数'],
    max: [150, '年龄不能超过 150']
  },
  
  role: {
    type: String,
    enum: {
      values: ['user', 'admin', 'moderator'],
      message: '{VALUE} 不是有效的角色'
    },
    default: 'user'
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  profile: {
    avatar: String,
    bio: {
      type: String,
      maxlength: 500
    },
    location: String
  },
  
  tags: [String],
  
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,  // 自动添加 createdAt 和 updatedAt
  collection: 'users'
});

// 创建索引
userSchema.index({ username: 1, email: 1 });

module.exports = mongoose.model('User', userSchema);
```

## 🔧 Model 详解

### 创建 Model

```javascript
// 方式 1: 基本创建
const User = mongoose.model('User', userSchema);

// 方式 2: 指定集合名称
const User = mongoose.model('User', userSchema, 'users');
```

### Model 的静态方法

Model 本身有很多内置的静态方法：

```javascript
// 创建文档
await User.create({ username: 'zhangsan', email: 'zhang@example.com' });

// 批量创建
await User.create([
  { username: 'user1', email: 'user1@example.com' },
  { username: 'user2', email: 'user2@example.com' }
]);

// 查找
await User.find({ isActive: true });
await User.findOne({ username: 'zhangsan' });
await User.findById('507f1f77bcf86cd799439011');

// 更新
await User.updateOne({ username: 'zhangsan' }, { age: 25 });
await User.updateMany({ isActive: false }, { isActive: true });
await User.findByIdAndUpdate('507f...', { age: 26 }, { new: true });

// 删除
await User.deleteOne({ username: 'zhangsan' });
await User.deleteMany({ isActive: false });
await User.findByIdAndDelete('507f...');

// 计数
await User.countDocuments({ isActive: true });
await User.estimatedDocumentCount();

// 聚合
await User.aggregate([
  { $match: { isActive: true } },
  { $group: { _id: '$role', count: { $sum: 1 } } }
]);
```

## 🔍 查询操作

### 基础查询

```javascript
// 查找所有
const users = await User.find();

// 条件查询
const activeUsers = await User.find({ isActive: true });

// 查找一个
const user = await User.findOne({ username: 'zhangsan' });

// 按 ID 查找
const user = await User.findById('507f1f77bcf86cd799439011');
```

### 查询条件

```javascript
// 比较操作符
await User.find({ age: { $gt: 18 } });        // 大于
await User.find({ age: { $gte: 18 } });       // 大于等于
await User.find({ age: { $lt: 60 } });        // 小于
await User.find({ age: { $lte: 60 } });       // 小于等于
await User.find({ age: { $ne: 25 } });        // 不等于
await User.find({ age: { $in: [18, 25, 30] } }); // 在数组中
await User.find({ age: { $nin: [18, 25] } }); // 不在数组中

// 逻辑操作符
await User.find({
  $and: [
    { age: { $gte: 18 } },
    { isActive: true }
  ]
});

await User.find({
  $or: [
    { role: 'admin' },
    { role: 'moderator' }
  ]
});

await User.find({
  age: { $not: { $lt: 18 } }
});

// 正则表达式
await User.find({ username: /^zhang/ });      // 以 zhang 开头
await User.find({ username: /san$/ });        // 以 san 结尾
await User.find({ username: /zhang/i });      // 不区分大小写

// 存在性检查
await User.find({ email: { $exists: true } });

// 数组操作
await User.find({ tags: 'javascript' });      // 包含某个元素
await User.find({ tags: { $all: ['js', 'node'] } }); // 包含所有元素
await User.find({ tags: { $size: 3 } });      // 数组长度
```

### 查询选项

```javascript
// 选择字段
await User.find().select('username email');   // 只返回这些字段
await User.find().select('-password');        // 排除密码字段

// 排序
await User.find().sort({ age: 1 });           // 升序
await User.find().sort({ age: -1 });          // 降序
await User.find().sort('username -age');      // 多字段排序

// 限制数量
await User.find().limit(10);                  // 最多返回 10 条

// 跳过
await User.find().skip(20);                   // 跳过前 20 条

// 分页
const page = 2;
const pageSize = 10;
await User.find()
  .skip((page - 1) * pageSize)
  .limit(pageSize);

// 链式调用
await User.find({ isActive: true })
  .select('username email')
  .sort({ createdAt: -1 })
  .limit(10)
  .skip(0);

// lean() - 返回普通 JS 对象，性能更好
const users = await User.find().lean();

// exec() - 执行查询
const users = await User.find({ isActive: true }).exec();
```

### 高级查询

```javascript
// 填充关联文档 (populate)
const postSchema = new mongoose.Schema({
  title: String,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

const Post = mongoose.model('Post', postSchema);

// 查询时填充 author
const posts = await Post.find().populate('author');
// 结果: author 字段会是完整的 User 对象

// 选择性填充
await Post.find().populate('author', 'username email');

// 多层填充
await Post.find().populate({
  path: 'author',
  select: 'username',
  populate: {
    path: 'profile'
  }
});

// 条件填充
await Post.find().populate({
  path: 'author',
  match: { isActive: true }
});
```

## ⚙️ 中间件 (Middleware)

中间件（也称为钩子）是在特定操作前后执行的函数。

### 中间件类型

1. **文档中间件**: `save`, `validate`, `remove`, `updateOne`, `deleteOne`
2. **查询中间件**: `find`, `findOne`, `findOneAndUpdate`, 等
3. **聚合中间件**: `aggregate`
4. **模型中间件**: `insertMany`

### Pre 中间件 (前置钩子)

```javascript
// save 前执行
userSchema.pre('save', function(next) {
  console.log('即将保存用户:', this.username);
  
  // this 指向当前文档
  this.lastModified = new Date();
  
  next();  // 必须调用 next()
});

// 异步操作
userSchema.pre('save', async function() {
  // 密码加密示例
  if (this.isModified('password')) {
    const bcrypt = require('bcrypt');
    this.password = await bcrypt.hash(this.password, 10);
  }
});

// 查询中间件
userSchema.pre('find', function() {
  // this 指向查询对象
  this.where({ isActive: true });
});

userSchema.pre('findOne', function() {
  console.log('查询条件:', this.getQuery());
});

// remove 前执行
userSchema.pre('remove', async function() {
  // 删除用户前，删除其所有文章
  await Post.deleteMany({ author: this._id });
});
```

### Post 中间件 (后置钩子)

```javascript
// save 后执行
userSchema.post('save', function(doc) {
  console.log('用户已保存:', doc.username);
});

// 错误处理
userSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    next(new Error('用户名已存在'));
  } else {
    next(error);
  }
});

// find 后执行
userSchema.post('find', function(docs) {
  console.log(`找到 ${docs.length} 个用户`);
});
```

### 实际应用示例

```javascript
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String
});

// 保存前加密密码
userSchema.pre('save', async function() {
  // 只在密码被修改时加密
  if (!this.isModified('password')) return;
  
  this.password = await bcrypt.hash(this.password, 10);
});

// 保存后发送欢迎邮件
userSchema.post('save', async function(doc) {
  if (doc.isNew) {
    // 发送欢迎邮件
    await sendWelcomeEmail(doc.email);
  }
});

// 查询时自动排除已删除的用户
userSchema.pre(/^find/, function() {
  this.where({ isDeleted: { $ne: true } });
});

const User = mongoose.model('User', userSchema);
```

## ✅ 验证 (Validation)

### 内置验证器

```javascript
const schema = new mongoose.Schema({
  // 字符串验证
  username: {
    type: String,
    required: true,           // 必填
    minlength: 3,            // 最小长度
    maxlength: 50,           // 最大长度
    trim: true,              // 去空格
    lowercase: true,         // 转小写
    uppercase: true,         // 转大写
    match: /^[a-z]+$/,       // 正则匹配
    enum: ['small', 'large'] // 枚举
  },
  
  // 数字验证
  age: {
    type: Number,
    min: 0,                  // 最小值
    max: 150                 // 最大值
  },
  
  // 日期验证
  birthDate: {
    type: Date,
    min: '1900-01-01',
    max: Date.now
  }
});
```

### 自定义验证器

```javascript
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    validate: {
      validator: function(v) {
        return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
      },
      message: props => `${props.value} 不是有效的邮箱地址`
    }
  },
  
  age: {
    type: Number,
    validate: {
      validator: function(v) {
        return v >= 18;
      },
      message: '年龄必须大于等于 18 岁'
    }
  },
  
  // 异步验证
  username: {
    type: String,
    validate: {
      validator: async function(v) {
        const count = await mongoose.model('User').countDocuments({ username: v });
        return count === 0;
      },
      message: '用户名已存在'
    }
  }
});
```

### 条件验证

```javascript
const schema = new mongoose.Schema({
  role: String,
  adminCode: {
    type: String,
    required: function() {
      // 只有当 role 是 admin 时才必填
      return this.role === 'admin';
    }
  }
});
```

### 验证错误处理

```javascript
const user = new User({
  username: 'ab',  // 太短
  email: 'invalid',
  age: 15
});

try {
  await user.save();
} catch (error) {
  if (error.name === 'ValidationError') {
    // 遍历所有验证错误
    for (let field in error.errors) {
      console.log(field, error.errors[field].message);
    }
    
    // 输出:
    // username: 用户名至少 3 个字符
    // email: 请输入有效的邮箱地址
    // age: 年龄必须大于等于 18 岁
  }
}
```

## 🎭 虚拟属性 (Virtuals)

虚拟属性是不存储在 MongoDB 中的计算属性。

### 基础虚拟属性

```javascript
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String
});

// 定义虚拟属性
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// 使用
const user = new User({
  firstName: '张',
  lastName: '三'
});

console.log(user.fullName);  // "张 三"
```

### 可设置的虚拟属性

```javascript
userSchema.virtual('fullName')
  .get(function() {
    return `${this.firstName} ${this.lastName}`;
  })
  .set(function(v) {
    const parts = v.split(' ');
    this.firstName = parts[0];
    this.lastName = parts[1];
  });

// 使用
const user = new User();
user.fullName = '李 四';
console.log(user.firstName);  // "李"
console.log(user.lastName);   // "四"
```

### 虚拟填充

```javascript
const userSchema = new mongoose.Schema({
  username: String
});

const postSchema = new mongoose.Schema({
  title: String,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// 虚拟属性：用户的所有文章
userSchema.virtual('posts', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'author'
});

// 使用
const user = await User.findById(userId).populate('posts');
console.log(user.posts);  // 该用户的所有文章
```

## 🔨 实例方法和静态方法

### 实例方法

实例方法是文档实例的方法。

```javascript
// 定义实例方法
userSchema.methods.comparePassword = async function(candidatePassword) {
  const bcrypt = require('bcrypt');
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.getPublicProfile = function() {
  return {
    username: this.username,
    email: this.email,
    createdAt: this.createdAt
  };
};

// 使用实例方法
const user = await User.findOne({ username: 'zhangsan' });
const isMatch = await user.comparePassword('password123');
const profile = user.getPublicProfile();
```

### 静态方法

静态方法是 Model 的方法。

```javascript
// 定义静态方法
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

userSchema.statics.findOrCreate = async function(username, data) {
  let user = await this.findOne({ username });
  if (!user) {
    user = await this.create({ username, ...data });
  }
  return user;
};

// 使用静态方法
const user = await User.findByEmail('zhang@example.com');
const activeUsers = await User.findActive();
const user = await User.findOrCreate('zhangsan', { email: 'zhang@example.com' });
```

### 查询助手

```javascript
// 定义查询助手
userSchema.query.byUsername = function(username) {
  return this.where({ username: new RegExp(username, 'i') });
};

userSchema.query.active = function() {
  return this.where({ isActive: true });
};

// 使用查询助手
const users = await User.find().byUsername('zhang').active();
```

## 🎯 最佳实践

### 1. 使用 timestamps

```javascript
const schema = new mongoose.Schema({
  // ...字段定义
}, {
  timestamps: true  // 自动添加 createdAt 和 updatedAt
});
```

### 2. 创建索引

```javascript
// 单字段索引
userSchema.index({ email: 1 });

// 复合索引
userSchema.index({ username: 1, email: 1 });

// 唯一索引
userSchema.index({ username: 1 }, { unique: true });

// 文本索引（全文搜索）
userSchema.index({ bio: 'text' });
```

### 3. 使用 lean() 提高性能

```javascript
// 返回普通 JS 对象，而不是 Mongoose 文档
const users = await User.find().lean();
// 性能更好，但失去了 Mongoose 的方法
```

### 4. 选择性返回字段

```javascript
// 只返回需要的字段
const users = await User.find().select('username email');

// 排除敏感字段
const users = await User.find().select('-password -__v');
```

### 5. 错误处理

```javascript
try {
  const user = await User.create(userData);
} catch (error) {
  if (error.name === 'ValidationError') {
    // 验证错误
  } else if (error.code === 11000) {
    // 唯一索引冲突
  } else {
    // 其他错误
  }
}
```

### 6. 使用事务

```javascript
const session = await mongoose.startSession();
session.startTransaction();

try {
  const user = await User.create([{ username: 'zhangsan' }], { session });
  const post = await Post.create([{ author: user[0]._id }], { session });
  
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

### 7. 分页最佳实践

```javascript
async function getPaginatedUsers(page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  const [users, total] = await Promise.all([
    User.find()
      .select('username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments()
  ]);
  
  return {
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
}
```

### 8. 环境配置

```javascript
// 开发环境：显示查询日志
if (process.env.NODE_ENV === 'development') {
  mongoose.set('debug', true);
}

// 生产环境：禁用自动索引创建
if (process.env.NODE_ENV === 'production') {
  mongoose.set('autoIndex', false);
}
```

## 📚 常用代码片段

### 完整的用户模型示例

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
      },
      message: '请输入有效的邮箱地址'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// 索引
userSchema.index({ username: 1, email: 1 });

// 虚拟属性
userSchema.virtual('profile').get(function() {
  return {
    username: this.username,
    email: this.email,
    role: this.role
  };
});

// 保存前加密密码
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// 实例方法：验证密码
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// 静态方法：查找活跃用户
userSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

module.exports = mongoose.model('User', userSchema);
```

## 🔗 参考资源

- [Mongoose 官方文档](https://mongoosejs.com/docs/)
- [Mongoose API 文档](https://mongoosejs.com/docs/api.html)
- [MongoDB 大学](https://university.mongodb.com/)

---

**文档版本**: 1.0  
**最后更新**: 2025-11-25  
**作者**: Chat Application Team
