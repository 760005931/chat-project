# Node.js 基础知识指南

## 什么是 Node.js?

Node.js 是一个基于 Chrome V8 引擎的 JavaScript 运行时环境,让 JavaScript 可以在服务器端运行。它使用事件驱动、非阻塞 I/O 模型,非常适合构建高性能的网络应用。

### 核心特点

- **单线程事件循环**: 使用事件驱动模型处理并发
- **非阻塞 I/O**: 异步操作不会阻塞程序执行
- **NPM 生态系统**: 拥有世界上最大的开源库生态系统
- **跨平台**: 可在 Windows、Linux、macOS 上运行

### 事件循环 (Event Loop) 详解

Node.js 的核心是**事件循环**,这是理解 Node.js 异步特性的关键。

#### 什么是事件循环?

事件循环是一个不断运行的循环,负责处理和分发事件。它让 Node.js 能够在单线程中执行非阻塞 I/O 操作。

#### 事件循环的 6 个阶段

```
   ┌───────────────────────────┐
┌─>│  1. timers (定时器)        │  ← 从这里开始
│  └─────────────┬─────────────┘
│                ↓
│  ┌─────────────┴─────────────┐
│  │  2. pending callbacks     │  系统操作回调
│  └─────────────┬─────────────┘
│                ↓
│  ┌─────────────┴─────────────┐
│  │  3. idle, prepare         │  内部使用
│  └─────────────┬─────────────┘
│                ↓
│  ┌─────────────┴─────────────┐
│  │  4. poll (轮询) ⭐        │  最重要!获取新的 I/O 事件
│  └─────────────┬─────────────┘
│                ↓
│  ┌─────────────┴─────────────┐
│  │  5. check (检查)          │  执行 setImmediate
│  └─────────────┬─────────────┘
│                ↓
│  ┌─────────────┴─────────────┐
└──│  6. close callbacks       │  关闭事件回调
   └───────────────────────────┘
        │
        └─────> 回到第 1 阶段,继续循环
```

**各阶段详解:**

1. **timers (定时器阶段)** - 执行 `setTimeout()` 和 `setInterval()` 的回调
   ```javascript
   setTimeout(() => {
     console.log('在 timers 阶段执行');
   }, 1000);
   ```

2. **pending callbacks** - 执行一些系统操作的回调(如 TCP 错误),普通开发者很少直接接触

3. **idle, prepare** - Node.js 内部使用,不需要关心

4. **poll (轮询阶段)** ⭐ **最重要的阶段**
   - 获取新的 I/O 事件(文件读取完成、网络请求返回等)
   - 执行 I/O 相关的回调
   - 如果没有定时器,会在这里等待新事件
   ```javascript
   const fs = require('fs');
   fs.readFile('file.txt', (err, data) => {
     console.log('在 poll 阶段执行');
   });
   ```

5. **check (检查阶段)** - 执行 `setImmediate()` 的回调
   ```javascript
   setImmediate(() => {
     console.log('在 check 阶段执行');
   });
   ```

6. **close callbacks** - 执行关闭事件的回调
   ```javascript
   socket.on('close', () => {
     console.log('在 close callbacks 阶段执行');
   });
   ```

#### 实际示例:理解执行顺序

```javascript
console.log('1. 同步代码开始');

setTimeout(() => {
  console.log('2. setTimeout - timers 阶段');
}, 0);

setImmediate(() => {
  console.log('3. setImmediate - check 阶段');
});

Promise.resolve().then(() => {
  console.log('4. Promise - 微任务');
});

console.log('5. 同步代码结束');

// 输出顺序:
// 1. 同步代码开始
// 5. 同步代码结束
// 4. Promise - 微任务 (在当前阶段结束后立即执行)
// 2. setTimeout - timers 阶段
// 3. setImmediate - check 阶段
```

**执行流程解释:**
1. **同步代码先执行** → 输出 1 和 5
2. **微任务队列** (Promise) → 输出 4
3. **进入事件循环**:
   - timers 阶段 → 输出 2
   - poll 阶段 (没有 I/O 事件)
   - check 阶段 → 输出 3

#### 微任务 vs 宏任务

**微任务** (在每个阶段结束后立即执行,优先级高):
- `Promise.then()`, `Promise.catch()`, `Promise.finally()`
- `process.nextTick()` (优先级最高,在微任务之前)
- `async/await` (本质是 Promise)

**宏任务** (在事件循环的特定阶段执行):
- `setTimeout()`, `setInterval()` → timers 阶段
- `setImmediate()` → check 阶段
- I/O 回调 → poll 阶段
- `socket.on('close')` → close callbacks 阶段

```javascript
// 微任务 vs 宏任务示例
setTimeout(() => console.log('宏任务: setTimeout'), 0);
Promise.resolve().then(() => console.log('微任务: Promise'));
process.nextTick(() => console.log('微任务: nextTick (最优先)'));

// 输出顺序:
// 微任务: nextTick (最优先)
// 微任务: Promise
// 宏任务: setTimeout
```

#### 阻塞 vs 非阻塞

```javascript
const fs = require('fs');

// ❌ 阻塞代码 - 会卡住整个程序
const data = fs.readFileSync('large-file.txt', 'utf8');
console.log(data);
console.log('这行代码要等文件读完才执行');

// ✅ 非阻塞代码 - 不会卡住程序
fs.readFile('large-file.txt', 'utf8', (err, data) => {
  if (err) throw err;
  console.log(data);
});
console.log('这行代码立即执行,不等文件读取');
```

#### 常见误区

```javascript
// ❌ 误区 1: setTimeout(fn, 0) 会立即执行
setTimeout(() => {
  console.log('不是立即执行!要等到 timers 阶段');
}, 0);

// ✅ 正确理解: 同步代码总是先执行
console.log('这个先执行');
setTimeout(() => console.log('这个后执行'), 0);

// ❌ 误区 2: setImmediate 比 setTimeout 更快
// 实际上取决于当前在事件循环的哪个阶段

// ✅ 正确理解: 在 I/O 回调中,setImmediate 总是先于 setTimeout
fs.readFile('file.txt', () => {
  setTimeout(() => console.log('setTimeout'), 0);
  setImmediate(() => console.log('setImmediate - 这个先执行'));
});
```

#### 为什么理解事件循环很重要?

1. ✅ **写出高性能的异步代码** - 避免阻塞事件循环
2. ✅ **理解代码执行顺序** - 调试异步问题更容易
3. ✅ **优化应用性能** - 合理安排任务优先级
4. ✅ **避免常见陷阱** - 如内存泄漏、回调地狱

> [!IMPORTANT]
> 在 Node.js 中,**永远不要使用同步方法**(如 `readFileSync`)处理 I/O 操作,除非是在应用启动时读取配置文件。同步操作会阻塞事件循环,导致整个应用无响应。

---

## 1. 模块系统

Node.js 使用模块化的方式组织代码,主要有两种模块系统:

### CommonJS (传统方式)

```javascript
// 导出模块
// math.js
module.exports = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b
};

// 或者单个导出
module.exports.multiply = (a, b) => a * b;

// 导入模块
const math = require('./math');
console.log(math.add(2, 3)); // 5
```

### ES6 Modules (现代方式)

```javascript
// 导出模块
// math.js
export const add = (a, b) => a + b;
export const subtract = (a, b) => a - b;

// 或者默认导出
export default function multiply(a, b) {
  return a * b;
}

// 导入模块
import { add, subtract } from './math.js';
import multiply from './math.js';
```

> [!NOTE]
> 在你的项目中,`package.json` 中如果有 `"type": "module"`,则使用 ES6 模块;否则默认使用 CommonJS。

### 模块加载机制深入

#### require() 的工作原理

Node.js 使用 `require()` 加载模块时,会经历以下步骤:

```javascript
// 1. 路径解析
const myModule = require('./myModule');

// Node.js 会按以下顺序查找:
// - ./myModule.js
// - ./myModule.json
// - ./myModule.node
// - ./myModule/index.js
```

**查找顺序:**
1. **核心模块**(如 `fs`, `http`):直接从内存加载
2. **文件模块**(以 `./` 或 `../` 开头):从文件系统加载
3. **node_modules 模块**:从 `node_modules` 目录查找

```javascript
// 核心模块
const fs = require('fs');

// 文件模块
const myModule = require('./myModule');
const config = require('../config/database');

// node_modules 模块
const express = require('express');
```

#### 模块缓存

Node.js 会缓存已加载的模块,多次 `require()` 同一个模块只会执行一次。

```javascript
// counter.js
let count = 0;
module.exports = {
  increment: () => ++count,
  getCount: () => count
};

// app.js
const counter1 = require('./counter');
const counter2 = require('./counter');

counter1.increment();
console.log(counter2.getCount()); // 输出: 1
// counter1 和 counter2 是同一个对象!

// 查看模块缓存
console.log(require.cache);

// 清除缓存(不推荐)
delete require.cache[require.resolve('./counter')];
```

#### 循环依赖问题

```javascript
// a.js
console.log('a.js 开始');
const b = require('./b');
console.log('在 a.js 中,b.done =', b.done);
module.exports = { done: true };
console.log('a.js 结束');

// b.js
console.log('b.js 开始');
const a = require('./a');
console.log('在 b.js 中,a.done =', a.done);
module.exports = { done: true };
console.log('b.js 结束');

// main.js
const a = require('./a');

// 输出:
// a.js 开始
// b.js 开始
// 在 b.js 中,a.done = undefined  (a 还没执行完)
// b.js 结束
// 在 a.js 中,b.done = true
// a.js 结束
```

> [!WARNING]
> 避免循环依赖!如果必须使用,要理解 Node.js 返回的是**未完成的副本**。

#### module.exports vs exports

```javascript
// ✅ 正确:直接赋值给 module.exports
module.exports = {
  name: 'MyModule',
  version: '1.0.0'
};

// ✅ 正确:给 exports 添加属性
exports.name = 'MyModule';
exports.version = '1.0.0';

// ❌ 错误:直接赋值给 exports 不会生效
exports = {
  name: 'MyModule'  // 这不会导出!
};

// 原因:exports 只是 module.exports 的引用
// 相当于: const exports = module.exports
```

**记忆技巧:**
- `module.exports` 是真正的导出对象
- `exports` 只是 `module.exports` 的快捷方式
- 如果要导出单个值(函数、类),用 `module.exports`
- 如果要导出多个属性,可以用 `exports.xxx`

---

## 2. NPM (Node Package Manager)

NPM 是 Node.js 的包管理工具,用于安装、管理项目依赖。

### 常用命令

```bash
# 初始化项目,创建 package.json
npm init

# 安装依赖包
npm install express          # 安装并添加到 dependencies
npm install --save-dev jest  # 安装并添加到 devDependencies
npm install                  # 安装 package.json 中的所有依赖

# 运行脚本
npm start                    # 运行 package.json 中的 start 脚本
npm run dev                  # 运行自定义脚本

# 卸载依赖
npm uninstall express
```

### package.json 文件

这是 Node.js 项目的配置文件:

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "description": "项目描述",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.0",
    "socket.io": "^4.5.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.0"
  }
}
```

**关键字段说明:**
- `dependencies`: 生产环境需要的依赖
- `devDependencies`: 开发环境需要的依赖
- `scripts`: 可执行的脚本命令
- `main`: 项目入口文件

---

## 3. 异步编程

Node.js 的核心是异步编程,有三种主要方式:

### 回调函数 (Callback)

```javascript
const fs = require('fs');

// 异步读取文件
fs.readFile('file.txt', 'utf8', (err, data) => {
  if (err) {
    console.error('读取失败:', err);
    return;
  }
  console.log('文件内容:', data);
});
```

### Promise

```javascript
const fs = require('fs').promises;

// 使用 Promise
fs.readFile('file.txt', 'utf8')
  .then(data => {
    console.log('文件内容:', data);
  })
  .catch(err => {
    console.error('读取失败:', err);
  });
```

### Async/Await (推荐)

```javascript
const fs = require('fs').promises;

async function readFileContent() {
  try {
    const data = await fs.readFile('file.txt', 'utf8');
    console.log('文件内容:', data);
  } catch (err) {
    console.error('读取失败:', err);
  }
}

readFileContent();
```

> [!TIP]
> `async/await` 是最现代、最易读的异步编程方式,推荐在新项目中使用。

### 异步编程深入解析

#### Promise 链式调用

```javascript
const fs = require('fs').promises;

// Promise 链
fs.readFile('user.json', 'utf8')
  .then(data => JSON.parse(data))
  .then(user => {
    console.log('用户名:', user.name);
    return fs.readFile(`${user.id}.txt`, 'utf8');
  })
  .then(content => {
    console.log('内容:', content);
  })
  .catch(err => {
    console.error('错误:', err);
  })
  .finally(() => {
    console.log('操作完成');
  });
```

#### Async/Await 错误处理

```javascript
// ✅ 推荐:使用 try-catch
async function getUserData(userId) {
  try {
    const user = await User.findById(userId);
    const posts = await Post.find({ author: userId });
    return { user, posts };
  } catch (error) {
    console.error('获取用户数据失败:', error);
    throw error; // 重新抛出或返回默认值
  }
}

// ❌ 不推荐:没有错误处理
async function getUserDataBad(userId) {
  const user = await User.findById(userId); // 如果失败会导致未捕获的错误
  return user;
}
```

#### 并行执行多个异步操作

```javascript
// ❌ 串行执行 - 慢
async function getDataSerial() {
  const user = await User.findById(1);      // 等待 100ms
  const posts = await Post.find({ userId: 1 }); // 等待 100ms
  const comments = await Comment.find({ userId: 1 }); // 等待 100ms
  // 总时间: 300ms
  return { user, posts, comments };
}

// ✅ 并行执行 - 快
async function getDataParallel() {
  const [user, posts, comments] = await Promise.all([
    User.findById(1),
    Post.find({ userId: 1 }),
    Comment.find({ userId: 1 })
  ]);
  // 总时间: 100ms (同时执行)
  return { user, posts, comments };
}
```

#### Promise 工具方法

```javascript
// Promise.all - 全部成功才成功
const results = await Promise.all([
  fetch('/api/users'),
  fetch('/api/posts'),
  fetch('/api/comments')
]);
// 如果任何一个失败,整个 Promise.all 失败

// Promise.allSettled - 等待全部完成(无论成功失败)
const results = await Promise.allSettled([
  fetch('/api/users'),
  fetch('/api/posts'),
  fetch('/api/comments')
]);
// 返回: [{ status: 'fulfilled', value: ... }, { status: 'rejected', reason: ... }]

// Promise.race - 返回最快完成的
const fastest = await Promise.race([
  fetch('/api/server1'),
  fetch('/api/server2'),
  fetch('/api/server3')
]);

// Promise.any - 返回最快成功的
const firstSuccess = await Promise.any([
  fetch('/api/backup1'),
  fetch('/api/backup2'),
  fetch('/api/backup3')
]);
```

#### 实战:超时控制

```javascript
// 创建超时 Promise
function timeout(ms) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('操作超时')), ms);
  });
}

// 使用超时控制
async function fetchWithTimeout(url, ms = 5000) {
  try {
    const result = await Promise.race([
      fetch(url),
      timeout(ms)
    ]);
    return result;
  } catch (error) {
    if (error.message === '操作超时') {
      console.error(`请求 ${url} 超时`);
    }
    throw error;
  }
}

// 使用
try {
  const data = await fetchWithTimeout('/api/slow-endpoint', 3000);
  console.log(data);
} catch (error) {
  console.error('请求失败:', error);
}
```

#### 实战:重试机制

```javascript
// 通用重试函数
async function retry(fn, maxAttempts = 3, delay = 1000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error; // 最后一次尝试失败,抛出错误
      }
      console.log(`尝试 ${attempt} 失败,${delay}ms 后重试...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// 使用
async function fetchData() {
  return await retry(
    () => fetch('/api/unreliable-endpoint'),
    3,    // 最多重试 3 次
    2000  // 每次间隔 2 秒
  );
}
```

#### 常见陷阱

```javascript
// ❌ 陷阱 1: 忘记 await
async function bad1() {
  const user = User.findById(1); // 返回 Promise,不是用户对象!
  console.log(user.name); // undefined
}

// ✅ 正确
async function good1() {
  const user = await User.findById(1);
  console.log(user.name);
}

// ❌ 陷阱 2: 在循环中串行执行
async function bad2(userIds) {
  const users = [];
  for (const id of userIds) {
    users.push(await User.findById(id)); // 一个一个等待
  }
  return users;
}

// ✅ 正确:并行执行
async function good2(userIds) {
  return await Promise.all(
    userIds.map(id => User.findById(id))
  );
}

// ❌ 陷阱 3: 没有处理 Promise rejection
async function bad3() {
  doSomethingAsync(); // 如果失败,会产生未处理的 Promise rejection
}

// ✅ 正确
async function good3() {
  try {
    await doSomethingAsync();
  } catch (error) {
    console.error('错误:', error);
  }
}
```

---

## 4. Express 框架

Express 是 Node.js 最流行的 Web 框架,简化了 HTTP 服务器的创建。

### 基础示例

```javascript
const express = require('express');
const app = express();

// 中间件:解析 JSON 请求体
app.use(express.json());

// 路由:GET 请求
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// 路由:POST 请求
app.post('/api/users', (req, res) => {
  const user = req.body;
  res.json({ message: '用户创建成功', user });
});

// 启动服务器
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
```

### 中间件

中间件是处理请求的函数,可以访问 `req` (请求)、`res` (响应) 和 `next` (下一个中间件):

```javascript
// 自定义中间件
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next(); // 调用下一个中间件
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('服务器错误!');
});
```

---

## 5. Socket.IO (实时通信)

Socket.IO 用于实现客户端和服务器之间的实时双向通信,非常适合聊天应用。

### 服务器端

```javascript
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 监听客户端连接
io.on('connection', (socket) => {
  console.log('用户连接:', socket.id);

  // 监听自定义事件
  socket.on('chat:message', (msg) => {
    console.log('收到消息:', msg);
    // 广播给所有客户端
    io.emit('chat:message', msg);
  });

  // 监听断开连接
  socket.on('disconnect', () => {
    console.log('用户断开:', socket.id);
  });
});

server.listen(3000, () => {
  console.log('服务器运行在 3000 端口');
});
```

### 客户端 (React)

```javascript
import { io } from 'socket.io-client';

// 连接服务器
const socket = io('http://localhost:3000');

// 发送消息
socket.emit('chat:message', { text: 'Hello!' });

// 接收消息
socket.on('chat:message', (msg) => {
  console.log('收到消息:', msg);
});
```

### 常用方法

| 方法 | 说明 |
|------|------|
| `socket.emit(event, data)` | 发送事件给服务器 |
| `socket.on(event, callback)` | 监听事件 |
| `io.emit(event, data)` | 广播给所有客户端 |
| `socket.broadcast.emit(event, data)` | 广播给除自己外的所有客户端 |
| `socket.to(room).emit(event, data)` | 发送给指定房间 |

---

## 6. 环境变量

使用 `.env` 文件管理敏感配置:

### 安装 dotenv

```bash
npm install dotenv
```

### 创建 .env 文件

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/chatdb
JWT_SECRET=your_secret_key
```

### 使用环境变量

```javascript
require('dotenv').config();

const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGODB_URI;

console.log('端口:', port);
```

> [!IMPORTANT]
> 永远不要将 `.env` 文件提交到 Git 仓库!在 `.gitignore` 中添加 `.env`。

---

## 7. MongoDB 集成

在你的项目中使用 Mongoose 连接 MongoDB:

### 安装依赖

```bash
npm install mongoose
```

### 连接数据库

```javascript
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/chatdb')
  .then(() => console.log('MongoDB 连接成功'))
  .catch(err => console.error('MongoDB 连接失败:', err));
```

### 定义模型

```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
```

### 使用模型

```javascript
const User = require('./models/User');

// 创建用户
async function createUser() {
  const user = new User({
    username: 'john',
    email: 'john@example.com'
  });
  await user.save();
}

// 查询用户
async function findUsers() {
  const users = await User.find({ username: 'john' });
  console.log(users);
}
```

---

## 8. 调试技巧

### 使用 console.log

```javascript
console.log('普通日志');
console.error('错误日志');
console.warn('警告日志');
console.table([{ name: 'Alice', age: 25 }, { name: 'Bob', age: 30 }]);
```

### 使用 nodemon 自动重启

```bash
npm install --save-dev nodemon
```

在 `package.json` 中添加:

```json
{
  "scripts": {
    "dev": "nodemon server.js"
  }
}
```

运行 `npm run dev`,文件修改后会自动重启服务器。

### VS Code 调试

在 `.vscode/launch.json` 中配置:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "启动程序",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/backend/server.js"
    }
  ]
}
```

---

## 9. 你的项目结构解析

基于你当前打开的文件,这里是项目的关键部分:

### backend/server.js
这是后端的入口文件,负责:
- 创建 Express 应用
- 配置 Socket.IO 实时通信
- 连接 MongoDB 数据库
- 定义 API 路由和 WebSocket 事件

### backend/models/User.js 和 Message.js
这些是 Mongoose 模型,定义了数据库的数据结构:
- `User`: 用户信息
- `Message`: 聊天消息

### backend/package.json
定义了项目依赖和脚本命令。

---

## 10. 常见问题

### Q: require 和 import 有什么区别?
**A:** `require` 是 CommonJS 语法(Node.js 传统方式),`import` 是 ES6 模块语法(现代方式)。在 Node.js 中使用 `import` 需要在 `package.json` 中添加 `"type": "module"`。

### Q: 为什么要使用 async/await?
**A:** 因为 Node.js 的很多操作(如数据库查询、文件读写)都是异步的。`async/await` 让异步代码看起来像同步代码,更易读易维护。

### Q: 什么是中间件?
**A:** 中间件是处理请求的函数,可以在请求到达最终处理函数之前进行预处理,如身份验证、日志记录、错误处理等。

### Q: Socket.IO 和 HTTP 有什么区别?
**A:** HTTP 是单向请求-响应模式,Socket.IO 是双向实时通信。聊天应用需要服务器主动推送消息给客户端,所以使用 Socket.IO。

---

## 11. 学习资源

- **官方文档**: [nodejs.org](https://nodejs.org/)
- **Express 文档**: [expressjs.com](https://expressjs.com/)
- **Socket.IO 文档**: [socket.io](https://socket.io/)
- **Mongoose 文档**: [mongoosejs.com](https://mongoosejs.com/)
- **MDN JavaScript**: [developer.mozilla.org](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript)

---

---

## 12. 你的项目实战知识点

基于你的聊天应用代码,这里详细解析项目中实际使用的 Node.js 技术。

### 12.1 Map 数据结构

在 [server.js](file:///d:/project/backend/server.js#L30) 中使用 `Map` 存储在线用户:

```javascript
// 临时存储在线用户的 socket 映射
const onlineUsers = new Map(); // socketId -> { id, username, socketId }

// 添加用户
onlineUsers.set(socket.id, {
  id: socket.id,
  username: username,
  socketId: socket.id
});

// 获取用户
const user = onlineUsers.get(socket.id);

// 删除用户
onlineUsers.delete(socket.id);

// 获取所有用户
const onlineUsersList = Array.from(onlineUsers.values());

// 获取在线用户数量
const count = onlineUsers.size;
```

**为什么使用 Map 而不是普通对象?**
- Map 的键可以是任何类型,对象的键只能是字符串
- Map 有 `.size` 属性,对象需要 `Object.keys(obj).length`
- Map 的性能在频繁增删操作时更好
- Map 有内置的迭代器,可以直接用 `for...of`

---

### 12.2 Socket.IO 事件系统

#### 服务器端事件监听

```javascript
// 监听客户端连接
io.on('connection', (socket) => {
  console.log('新用户连接:', socket.id);

  // 监听自定义事件
  socket.on('user:login', async (username) => {
    // 处理用户登录
  });

  socket.on('message:send', async (content) => {
    // 处理发送消息
  });

  socket.on('disconnect', async () => {
    // 处理断开连接
  });
});
```

#### 不同的消息发送方式

| 方法 | 说明 | 项目中的使用 |
|------|------|-------------|
| `socket.emit(event, data)` | 发送给当前客户端 | [server.js:61](file:///d:/project/backend/server.js#L61) 发送历史消息 |
| `io.emit(event, data)` | 广播给所有客户端 | [server.js:107](file:///d:/project/backend/server.js#L107) 广播新消息 |
| `socket.broadcast.emit(event, data)` | 广播给除自己外的所有客户端 | 未使用 |
| `socket.to(socketId).emit(event, data)` | 发送给指定客户端 | [server.js:155](file:///d:/project/backend/server.js#L155) 私聊消息 |

#### 项目中的实际应用

**1. 用户登录事件** ([server.js:39-82](file:///d:/project/backend/server.js#L39-L82))

```javascript
socket.on('user:login', async (username) => {
  try {
    // 1. 在数据库中查找或创建用户
    const user = await User.findOrCreate(username, socket.id);
    
    // 2. 存储到在线用户映射
    onlineUsers.set(socket.id, {
      id: socket.id,
      username: username,
      socketId: socket.id
    });
    
    // 3. 发送历史消息给新用户（只发给这个用户）
    socket.emit('message:history', formattedHistory);
    
    // 4. 广播用户列表更新（发给所有人）
    io.emit('users:update', onlineUsersList);
    
    // 5. 广播系统消息（发给所有人）
    io.emit('message:new', formattedSystemMsg);
  } catch (error) {
    socket.emit('error', '登录失败，请重试');
  }
});
```

**2. 私聊消息** ([server.js:117-162](file:///d:/project/backend/server.js#L117-L162))

```javascript
socket.on('message:private', async ({ targetUserId, content }) => {
  const sender = onlineUsers.get(socket.id);
  const receiver = onlineUsers.get(targetUserId);
  
  // 保存到数据库
  const privateMessage = await PrivateMessage.createPrivateMessage(
    sender.id, sender.username,
    receiver.id, receiver.username,
    content
  );
  
  // 发送给发送者（自己）
  socket.emit('message:private', formattedMessage);
  
  // 发送给接收者（指定用户）
  socket.to(receiver.socketId).emit('message:private', formattedMessage);
});
```

---

### 12.3 Mongoose 模型方法

#### 静态方法 vs 实例方法

**静态方法**: 直接在模型上调用,用于操作多个文档或创建新文档

```javascript
// 定义静态方法
userSchema.statics.findOrCreate = async function(username, socketId) {
  let user = await this.findOne({ username });
  if (!user) {
    user = await this.create({ username, socketId, isOnline: true });
  }
  return user;
};

// 使用静态方法
const user = await User.findOrCreate('Alice', 'socket123');
```

**实例方法**: 在文档实例上调用,用于操作单个文档

```javascript
// 定义实例方法
userSchema.methods.setOnline = function(socketId) {
  this.isOnline = true;
  this.socketId = socketId;
  return this.save();
};

// 使用实例方法
const user = await User.findOne({ username: 'Alice' });
await user.setOnline('socket123');
```

#### 项目中的实际应用

**User 模型** ([models/User.js](file:///d:/project/backend/models/User.js))

```javascript
// 静态方法：查找或创建用户
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

// 实例方法：设置用户在线
userSchema.methods.setOnline = function(socketId) {
  this.isOnline = true;
  this.socketId = socketId;
  this.lastSeen = new Date();
  return this.save();
};
```

**Message 模型** ([models/Message.js](file:///d:/project/backend/models/Message.js))

```javascript
// 静态方法：获取最近的消息
messageSchema.statics.getRecentMessages = function(limit = 100) {
  return this.find()
    .sort({ timestamp: -1 })  // 降序排列
    .limit(limit)
    .lean()  // 返回普通 JS 对象,不是 Mongoose 文档
    .then(messages => messages.reverse()); // 反转顺序
};

// 静态方法：创建系统消息
messageSchema.statics.createSystemMessage = function(content) {
  return this.create({
    type: 'system',
    content,
    timestamp: new Date()
  });
};
```

**PrivateMessage 模型** ([models/PrivateMessage.js](file:///d:/project/backend/models/PrivateMessage.js))

```javascript
// 生成会话 ID（确保两个用户之间的会话 ID 唯一）
privateMessageSchema.statics.generateConversationId = function(userId1, userId2) {
  return [userId1, userId2].sort().join('_');
};

// 获取会话历史
privateMessageSchema.statics.getConversationHistory = function(userId1, userId2, limit = 100) {
  const conversationId = this.generateConversationId(userId1, userId2);
  return this.find({ conversationId })
    .sort({ timestamp: 1 })
    .limit(limit)
    .lean();
};

// 标记会话消息为已读
privateMessageSchema.statics.markConversationAsRead = function(userId, otherUserId) {
  const conversationId = this.generateConversationId(userId, otherUserId);
  return this.updateMany(
    { conversationId, toUserId: userId, isRead: false },
    { $set: { isRead: true } }
  );
};
```

---

### 12.4 Mongoose Schema 高级特性

#### 字段验证

```javascript
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,      // 必填
    unique: true,        // 唯一
    trim: true,          // 自动去除首尾空格
    minlength: 2,        // 最小长度
    maxlength: 20        // 最大长度
  },
  isOnline: {
    type: Boolean,
    default: false       // 默认值
  }
});
```

#### 条件验证

```javascript
const messageSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: function() {
      // 只有当 type 为 'user' 时才必填
      return this.type === 'user';
    }
  }
});
```

#### 枚举值

```javascript
const messageSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['system', 'user'],  // 只能是这两个值之一
    required: true
  }
});
```

#### 自动时间戳

```javascript
const userSchema = new mongoose.Schema({
  username: String
}, {
  timestamps: true  // 自动添加 createdAt 和 updatedAt
});
```

#### 索引优化

```javascript
// 单字段索引
userSchema.index({ username: 1 }, { unique: true });

// 复合索引
privateMessageSchema.index({ conversationId: 1, timestamp: -1 });

// 条件索引
privateMessageSchema.index({ toUserId: 1, isRead: 1 });
```

> [!TIP]
> 索引可以大幅提升查询性能,但会占用额外空间。在经常查询的字段上建立索引。

---

### 12.5 错误处理模式

#### Try-Catch 包裹异步操作

项目中所有的 Socket.IO 事件处理都使用了 try-catch:

```javascript
socket.on('message:send', async (content) => {
  try {
    const user = onlineUsers.get(socket.id);
    if (!user) {
      socket.emit('error', '请先登录');
      return;
    }

    const message = await Message.createUserMessage(user.id, user.username, content);
    io.emit('message:new', formattedMessage);
  } catch (error) {
    console.error('发送消息错误:', error);
    socket.emit('error', '发送消息失败');
  }
});
```

#### 数据库连接错误处理

在 [config/database.js](file:///d:/project/backend/config/database.js) 中:

```javascript
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, options);
    console.log('✅ MongoDB 连接成功');
  } catch (error) {
    console.error('❌ MongoDB 连接失败:', error.message);
    // 连接失败后等待 5 秒重试
    setTimeout(connectDB, 5000);
  }
};
```

#### 监听数据库事件

```javascript
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose 已连接到数据库');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose 连接错误:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  Mongoose 已断开连接');
});
```

---

### 12.6 环境变量

在 [config/database.js](file:///d:/project/backend/config/database.js#L4) 中使用环境变量:

```javascript
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chatapp';
const PORT = process.env.PORT || 3000;
```

**使用方式:**

1. 创建 `.env` 文件:
```
MONGODB_URI=mongodb://localhost:27017/chatapp
PORT=3000
```

2. 安装并使用 dotenv:
```bash
npm install dotenv
```

3. 在 server.js 顶部加载:
```javascript
require('dotenv').config();
```

---

### 12.7 进程信号处理

在 [config/database.js](file:///d:/project/backend/config/database.js#L41-L45) 中优雅关闭数据库连接:

```javascript
// 监听 Ctrl+C 信号
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('👋 Mongoose 连接已关闭（应用终止）');
  process.exit(0);
});
```

**常见进程信号:**
- `SIGINT`: Ctrl+C 中断信号
- `SIGTERM`: 终止信号(通常由系统或进程管理器发送)
- `SIGUSR1`: 用户自定义信号 1
- `SIGUSR2`: 用户自定义信号 2

---

### 12.8 HTTP 健康检查端点

在 [server.js:237-258](file:///d:/project/backend/server.js#L237-L258) 中实现了健康检查:

```javascript
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
```

**用途:**
- 监控服务器状态
- 检查数据库连接
- 查看统计信息
- 用于负载均衡器的健康检查

**访问方式:**
```bash
curl http://localhost:3000/health
```

---

### 12.9 数据格式化技巧

#### MongoDB ObjectId 转字符串

```javascript
const formattedHistory = messageHistory.map(msg => ({
  id: msg._id.toString(),  // 将 ObjectId 转为字符串
  type: msg.type,
  content: msg.content,
  timestamp: msg.timestamp
}));
```

#### 使用 .lean() 提升性能

```javascript
// 不使用 .lean() - 返回 Mongoose 文档(包含方法和虚拟属性)
const messages = await Message.find().sort({ timestamp: -1 });

// 使用 .lean() - 返回普通 JS 对象(更快,内存占用更少)
const messages = await Message.find().sort({ timestamp: -1 }).lean();
```

> [!TIP]
> 当你只需要读取数据而不需要修改时,使用 `.lean()` 可以提升 5-10 倍的性能。

---

### 12.10 数组操作技巧

#### Array.from() 转换 Map

```javascript
const onlineUsers = new Map();
// ... 添加用户

// 将 Map 的值转为数组
const onlineUsersList = Array.from(onlineUsers.values());
```

#### 数组排序和反转

```javascript
// 生成唯一的会话 ID
generateConversationId(userId1, userId2) {
  // 排序确保 'user1_user2' 和 'user2_user1' 得到相同的 ID
  return [userId1, userId2].sort().join('_');
}

// 反转数组顺序
messageSchema.statics.getRecentMessages = function(limit = 100) {
  return this.find()
    .sort({ timestamp: -1 })  // 数据库降序
    .limit(limit)
    .lean()
    .then(messages => messages.reverse()); // JS 反转为升序
};
```

---

### 12.11 项目依赖说明

在 [package.json](file:///d:/project/backend/package.json) 中的依赖:

```json
{
  "dependencies": {
    "express": "^4.18.2",      // Web 框架
    "socket.io": "^4.6.1",     // WebSocket 实时通信
    "cors": "^2.8.5",          // 跨域资源共享
    "mongoose": "^7.0.0"       // MongoDB ODM
  }
}
```

#### 各依赖的作用

| 依赖 | 作用 | 项目中的使用 |
|------|------|-------------|
| `express` | HTTP 服务器框架 | 创建服务器、定义路由 |
| `socket.io` | WebSocket 库 | 实现实时聊天功能 |
| `cors` | 处理跨域请求 | 允许前端(5173端口)访问后端(3000端口) |
| `mongoose` | MongoDB 对象模型工具 | 定义数据模型、操作数据库 |

---

### 12.12 CORS 跨域配置

```javascript
// Express CORS
app.use(cors());

// Socket.IO CORS
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",  // 允许的前端地址
    methods: ["GET", "POST"]          // 允许的 HTTP 方法
  }
});
```

**为什么需要 CORS?**
- 前端运行在 `http://localhost:5173` (Vite 开发服务器)
- 后端运行在 `http://localhost:3000`
- 不同端口被视为不同源,浏览器会阻止跨域请求
- CORS 配置告诉浏览器允许这种跨域访问

---

### 12.13 代码组织最佳实践

#### 模块化结构

```
backend/
├── server.js              # 主入口文件
├── config/
│   └── database.js        # 数据库配置
├── models/
│   ├── User.js           # 用户模型
│   ├── Message.js        # 消息模型
│   └── PrivateMessage.js # 私聊消息模型
└── package.json
```

#### 关注点分离

- **server.js**: 服务器启动、路由、Socket.IO 事件处理
```
---

### 12.7 进程信号处理

在 [config/database.js](file:///d:/project/backend/config/database.js#L41-L45) 中优雅关闭数据库连接:

```javascript
// 监听 Ctrl+C 信号
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('👋 Mongoose 连接已关闭（应用终止）');
  process.exit(0);
});
```

**常见进程信号:**
- `SIGINT`: Ctrl+C 中断信号
- `SIGTERM`: 终止信号(通常由系统或进程管理器发送)
- `SIGUSR1`: 用户自定义信号 1
- `SIGUSR2`: 用户自定义信号 2

---

### 12.8 HTTP 健康检查端点

在 [server.js:237-258](file:///d:/project/backend/server.js#L237-L258) 中实现了健康检查:

```javascript
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
```

**用途:**
- 监控服务器状态
- 检查数据库连接
- 查看统计信息
- 用于负载均衡器的健康检查

**访问方式:**
```bash
curl http://localhost:3000/health
```

---

### 12.9 数据格式化技巧

#### MongoDB ObjectId 转字符串

```javascript
const formattedHistory = messageHistory.map(msg => ({
  id: msg._id.toString(),  // 将 ObjectId 转为字符串
  type: msg.type,
  content: msg.content,
  timestamp: msg.timestamp
}));
```

#### 使用 .lean() 提升性能

```javascript
// 不使用 .lean() - 返回 Mongoose 文档(包含方法和虚拟属性)
const messages = await Message.find().sort({ timestamp: -1 });

// 使用 .lean() - 返回普通 JS 对象(更快,内存占用更少)
const messages = await Message.find().sort({ timestamp: -1 }).lean();
```

> [!TIP]
> 当你只需要读取数据而不需要修改时,使用 `.lean()` 可以提升 5-10 倍的性能。

---

### 12.10 数组操作技巧

#### Array.from() 转换 Map

```javascript
const onlineUsers = new Map();
// ... 添加用户

// 将 Map 的值转为数组
const onlineUsersList = Array.from(onlineUsers.values());
```

#### 数组排序和反转

```javascript
// 生成唯一的会话 ID
generateConversationId(userId1, userId2) {
  // 排序确保 'user1_user2' 和 'user2_user1' 得到相同的 ID
  return [userId1, userId2].sort().join('_');
}

// 反转数组顺序
messageSchema.statics.getRecentMessages = function(limit = 100) {
  return this.find()
    .sort({ timestamp: -1 })  // 数据库降序
    .limit(limit)
    .lean()
    .then(messages => messages.reverse()); // JS 反转为升序
};
```

---

### 12.11 项目依赖说明

在 [package.json](file:///d:/project/backend/package.json) 中的依赖:

```json
{
  "dependencies": {
    "express": "^4.18.2",      // Web 框架
    "socket.io": "^4.6.1",     // WebSocket 实时通信
    "cors": "^2.8.5",          // 跨域资源共享
    "mongoose": "^7.0.0"       // MongoDB ODM
  }
}
```

#### 各依赖的作用

| 依赖 | 作用 | 项目中的使用 |
|------|------|-------------|
| `express` | HTTP 服务器框架 | 创建服务器、定义路由 |
| `socket.io` | WebSocket 库 | 实现实时聊天功能 |
| `cors` | 处理跨域请求 | 允许前端(5173端口)访问后端(3000端口) |
| `mongoose` | MongoDB 对象模型工具 | 定义数据模型、操作数据库 |

---

### 12.12 CORS 跨域配置

```javascript
// Express CORS
app.use(cors());

// Socket.IO CORS
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",  // 允许的前端地址
    methods: ["GET", "POST"]          // 允许的 HTTP 方法
  }
});
```

**为什么需要 CORS?**
- 前端运行在 `http://localhost:5173` (Vite 开发服务器)
- 后端运行在 `http://localhost:3000`
- 不同端口被视为不同源,浏览器会阻止跨域请求
- CORS 配置告诉浏览器允许这种跨域访问

---

### 12.13 代码组织最佳实践

#### 模块化结构

```
backend/
├── server.js              # 主入口文件
├── config/
│   └── database.js        # 数据库配置
├── models/
│   ├── User.js           # 用户模型
│   ├── Message.js        # 消息模型
│   └── PrivateMessage.js # 私聊消息模型
└── package.json
```

#### 关注点分离

- **server.js**: 服务器启动、路由、Socket.IO 事件处理
- **config/database.js**: 数据库连接逻辑
- **models/**: 数据模型定义和业务逻辑

---

## 下一步建议

1. **阅读你的项目代码**: 从 [server.js](file:///d:/project/backend/server.js) 开始,理解服务器是如何启动的
2. **实验修改**: 尝试添加新的 Socket.IO 事件或 API 路由
3. **学习调试**: 使用 `console.log` 和 VS Code 调试器理解代码执行流程
4. **查看文档**: 遇到不懂的 API 时查阅官方文档
5. **动手实践**: 尝试实现以下功能来巩固知识:
   - 添加消息删除功能
   - 实现用户头像上传
   - 添加消息已读/未读状态
   - 实现群组聊天功能

> [!TIP]
> 学习编程最好的方式是动手实践!尝试修改代码,看看会发生什么,不要害怕出错。

---

## 附录 A: 错误处理最佳实践

### 自定义错误类

```javascript
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(resource) {
    super(`${resource} 未找到`, 404);
  }
}

// 使用
if (!user) {
  throw new NotFoundError('用户');
}
```

### 全局错误处理

```javascript
// Express 全局错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message
    });
  }
  
  res.status(500).json({
    status: 'error',
    message: '服务器内部错误'
  });
});

// 未捕获异常
process.on('uncaughtException', (err) => {
  console.error('未捕获异常:', err);
  process.exit(1);
});

// 未处理 Promise rejection
process.on('unhandledRejection', (reason) => {
  console.error('未处理 Promise rejection:', reason);
  process.exit(1);
});
```

---

## 附录 B: 性能优化技巧

### 1. 集群模式

```javascript
const cluster = require('cluster');
const os = require('os');

if (cluster.isMaster) {
  const numCPUs = os.cpus().length;
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  require('./app').listen(3000);
}
```

### 2. 缓存策略

```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 });

async function getUser(id) {
  const cached = cache.get(`user:${id}`);
  if (cached) return cached;
  
  const user = await User.findById(id);
  cache.set(`user:${id}`, user);
  return user;
}
```

### 3. 数据库优化

```javascript
// 使用 lean() 提升性能
const users = await User.find().lean();

// 只选择需要的字段
const users = await User.find().select('username email');

// 使用索引
userSchema.index({ email: 1 });
```

### 4. 流式处理

```javascript
// ✅ 使用流处理大文件
const stream = fs.createReadStream('large-file.zip');
stream.pipe(res);

// ❌ 一次性读取
const data = fs.readFileSync('large-file.zip');
res.send(data);
```

---

## 附录 C: 安全最佳实践

### 1. 输入验证

```javascript
const Joi = require('joi');

const schema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required()
});

const { error, value } = schema.validate(req.body);
```

### 2. 防止注入

```javascript
// 使用 mongoose-sanitize
const mongoSanitize = require('express-mongo-sanitize');
app.use(mongoSanitize());

// 验证输入类型
if (typeof username !== 'string') {
  throw new Error('无效输入');
}
```

### 3. 安全头

```javascript
const helmet = require('helmet');
app.use(helmet());
```

### 4. 速率限制

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use('/api/', limiter);
```

### 5. 密码加密

```javascript
const bcrypt = require('bcrypt');

// 加密
const hash = await bcrypt.hash(password, 10);

// 验证
const isValid = await bcrypt.compare(password, hash);
```

> [!CAUTION]
> 永远不要将敏感信息(密码、API 密钥)硬编码在代码中!使用环境变量。

---

## 总结

这份文档涵盖了 Node.js 的核心概念和实战技巧:

✅ **基础概念**: 事件循环、模块系统、异步编程  
✅ **Web 开发**: Express 中间件、路由、错误处理  
✅ **实时通信**: Socket.IO 房间、命名空间、中间件  
✅ **数据库**: Mongoose 模型、查询、索引优化  
✅ **生产环境**: 错误处理、性能优化、安全最佳实践  

继续学习的资源:
- [Node.js 官方文档](https://nodejs.org/)
- [Express 文档](https://expressjs.com/)
- [Socket.IO 文档](https://socket.io/)
- [Mongoose 文档](https://mongoosejs.com/)

**祝你学习顺利! 🚀**不要害怕出错。
```
