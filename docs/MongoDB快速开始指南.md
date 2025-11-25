# MongoDB 数据库集成 - 快速开始指南

本指南将帮助您第一次使用 MongoDB，从安装到运行聊天应用。

## 📋 前置要求

- Windows 操作系统
- Node.js 已安装
- 聊天应用项目代码

---

## 第一步：安装 MongoDB

### 1.1 下载 MongoDB

1. 访问 MongoDB 官网下载页面：
   ```
   https://www.mongodb.com/try/download/community
   ```

2. 选择以下配置：
   - **Version**: 选择最新版本（如 7.0.x）
   - **Platform**: Windows
   - **Package**: MSI

3. 点击 **Download** 下载安装程序

### 1.2 安装 MongoDB

1. 双击下载的 `.msi` 文件启动安装程序

2. 安装向导步骤：
   - 点击 **Next**
   - 接受许可协议，点击 **Next**
   - 选择 **Complete** 完整安装
   - **重要**：勾选 "Install MongoDB as a Service"（作为服务安装）
   - **可选**：勾选 "Install MongoDB Compass"（图形化管理工具，推荐安装）
   - 点击 **Install** 开始安装
   - 等待安装完成，点击 **Finish**

### 1.3 验证安装

1. 打开命令提示符（CMD）或 PowerShell

2. 输入以下命令验证 MongoDB 是否安装成功：
   ```bash
   mongod --version
   ```

3. 如果显示版本信息，说明安装成功！

---

## 第二步：启动 MongoDB 服务

### Windows 服务方式（推荐）

MongoDB 已作为 Windows 服务安装，通常会自动启动。

**检查服务状态**：
```bash
net start | findstr MongoDB
```

**如果服务未启动，手动启动**：
```bash
net start MongoDB
```

**停止服务**（如需要）：
```bash
net stop MongoDB
```

---

## 第三步：安装项目依赖

### 3.1 安装后端依赖

1. 打开命令提示符

2. 进入后端目录：
   ```bash
   cd d:\project\backend
   ```

3. 安装依赖（包括 mongoose）：
   ```bash
   npm install
   ```

   这将安装：
   - express
   - socket.io
   - cors
   - **mongoose**（新增的 MongoDB 驱动）

---

## 第四步：配置环境变量（可选）

创建 `backend/.env` 文件（可选，使用默认配置可跳过）：

```env
# MongoDB 连接字符串（默认本地数据库）
MONGODB_URI=mongodb://localhost:27017/chatapp

# 服务器端口
PORT=3000
```

如果不创建 `.env` 文件，程序会使用默认配置。

---

## 第五步：启动应用

### 5.1 启动后端服务器

在 `backend` 目录下运行：

```bash
npm start
```

**成功启动的标志**：
```
✅ MongoDB 连接成功
📦 数据库: chatapp
🔗 Mongoose 已连接到数据库
服务器运行在 http://localhost:3000
WebSocket 服务已启动
```

### 5.2 启动前端应用

打开新的命令提示符窗口：

```bash
cd d:\project\frontend
npm run dev
```

前端将在 `http://localhost:5173` 运行。

---

## 第六步：测试数据库功能

### 6.1 测试聊天功能

1. 在浏览器打开 `http://localhost:5173`
2. 输入用户名登录
3. 发送几条消息
4. 刷新页面或重新登录
5. **验证**：历史消息应该还在！

### 6.2 使用 MongoDB Compass 查看数据（可选）

如果安装了 MongoDB Compass：

1. 打开 MongoDB Compass
2. 连接字符串输入：`mongodb://localhost:27017`
3. 点击 **Connect**
4. 在左侧找到 `chatapp` 数据库
5. 查看三个集合：
   - `users` - 用户数据
   - `messages` - 公共消息
   - `privatemessages` - 私聊消息

### 6.3 测试健康检查端点

在浏览器访问：
```
http://localhost:3000/health
```

应该看到类似输出：
```json
{
  "status": "ok",
  "database": "connected",
  "onlineUsers": 1,
  "totalUsers": 2,
  "totalMessages": 5,
  "totalPrivateMessages": 3
}
```

---

## 常见问题解决

### 问题 1：MongoDB 连接失败

**错误信息**：
```
❌ MongoDB 连接失败: connect ECONNREFUSED 127.0.0.1:27017
```

**解决方法**：
1. 检查 MongoDB 服务是否启动：
   ```bash
   net start MongoDB
   ```
2. 如果服务启动失败，尝试重启计算机

### 问题 2：端口被占用

**错误信息**：
```
Error: listen EADDRINUSE: address already in use :::3000
```

**解决方法**：
1. 更改端口号（在 `backend/server.js` 最后一行）
2. 或者关闭占用端口的程序

### 问题 3：找不到 mongoose 模块

**错误信息**：
```
Error: Cannot find module 'mongoose'
```

**解决方法**：
```bash
cd d:\project\backend
npm install mongoose
```

---

## 数据库管理命令

### 查看所有数据库
```bash
mongosh
show dbs
```

### 切换到聊天数据库
```bash
use chatapp
```

### 查看所有集合
```bash
show collections
```

### 查看用户数据
```bash
db.users.find().pretty()
```

### 查看消息数据
```bash
db.messages.find().pretty()
```

### 清空所有数据（谨慎使用）
```bash
db.users.deleteMany({})
db.messages.deleteMany({})
db.privatemessages.deleteMany({})
```

---

## 下一步

现在您已经成功集成了 MongoDB！可以：

1. ✅ 消息会永久保存
2. ✅ 用户数据会持久化
3. ✅ 私聊历史会保留
4. ✅ 服务器重启后数据不丢失

**建议**：
- 定期备份数据库
- 学习 MongoDB 基础操作
- 探索 MongoDB Compass 图形化工具

---

## 技术支持

如果遇到问题：
1. 检查 MongoDB 服务是否运行
2. 查看后端控制台的错误信息
3. 确认所有依赖已正确安装
4. 检查防火墙设置

祝您使用愉快！🎉
