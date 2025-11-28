# Ant Design 组件详解

> 基于登录页面的 Card、Input、Button 组件深度解析

## 📋 目录

- [Card 组件](#card-组件)
- [Input 组件](#input-组件)
- [Button 组件](#button-组件)
- [组件组合实战](#组件组合实战)

---

## Card 组件

### 基础用法

```jsx
<Card className="login-card" bordered={false}>
  {/* 卡片内容 */}
</Card>
```

### 组件说明

**Card** 是 Ant Design 的卡片容器组件，用于将内容组织在一个有边框和阴影的容器中。

### 属性详解

#### 1. `className="login-card"`

**作用**：添加自定义 CSS 类名

```jsx
// JSX
<Card className="login-card" />

// CSS (Login.css)
.login-card {
  width: 400px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 24px;
}
```

**用途**：
- 自定义卡片样式
- 覆盖默认样式
- 添加特定的视觉效果

#### 2. `bordered={false}`

**作用**：移除卡片边框

```jsx
// 有边框（默认）
<Card bordered={true} />  // 或 <Card />

// 无边框
<Card bordered={false} />
```

**对比效果**：

```
bordered={true}  (默认)
┌─────────────────┐
│                 │  ← 有 1px 边框
│   Card Content  │
│                 │
└─────────────────┘

bordered={false}
                    
   Card Content      ← 无边框，只有阴影
                    
```

**使用场景**：
- ✅ `bordered={false}`：现代化、扁平化设计
- ✅ `bordered={true}`：需要明确边界的场景

### Card 的其他常用属性

```jsx
<Card
  // 标题
  title="登录"
  
  // 额外操作（右上角）
  extra={<a href="#">更多</a>}
  
  // 卡片样式
  style={{ width: 300 }}
  
  // 内容区域样式
  bodyStyle={{ padding: 24 }}
  
  // 头部样式
  headStyle={{ borderBottom: 'none' }}
  
  // 加载状态
  loading={true}
  
  // 鼠标悬停效果
  hoverable={true}
  
  // 封面图片
  cover={<img src="cover.jpg" />}
  
  // 操作按钮组
  actions={[
    <Button>操作1</Button>,
    <Button>操作2</Button>
  ]}
>
  卡片内容
</Card>
```

### 项目中的完整使用

```jsx
<Card className="login-card" bordered={false}>
  <div className="login-header">
    <h1>💬 欢迎来到聊天室</h1>
    <p>输入您的用户名开始聊天</p>
  </div>
  <div className="login-form">
    {/* Input 和 Button */}
  </div>
</Card>
```

**设计思路**：
- 使用 Card 作为登录表单的容器
- `bordered={false}` 实现现代化无边框设计
- 通过自定义 CSS 添加圆角和阴影效果

---

## Input 组件

### 基础用法

```jsx
<Input
  size="large"
  placeholder="请输入用户名"
  prefix={<UserOutlined />}
  value={username}
  onChange={(e) => setUsername(e.target.value)}
  onKeyPress={handleKeyPress}
  maxLength={20}
/>
```

### 组件说明

**Input** 是 Ant Design 的输入框组件，支持多种输入类型和丰富的配置选项。

### 属性详解

#### 1. `size="large"`

**作用**：设置输入框尺寸

```jsx
// 小尺寸
<Input size="small" />   // 高度: 24px

// 默认尺寸
<Input size="middle" />  // 或 <Input />  高度: 32px

// 大尺寸
<Input size="large" />   // 高度: 40px
```

**视觉对比**：

```
small:  [  输入框  ]  ← 24px 高度
middle: [   输入框   ]  ← 32px 高度（默认）
large:  [    输入框    ]  ← 40px 高度
```

**使用场景**：
- `small`：表格内嵌、紧凑布局
- `middle`：常规表单
- `large`：登录页、重要表单、移动端

#### 2. `placeholder="请输入用户名"`

**作用**：输入框为空时显示的提示文本

```jsx
<Input placeholder="请输入用户名" />
```

**效果**：

```
空值时:  [ 请输入用户名 ]  ← 灰色提示文本
有值时:  [ Alice ]         ← 用户输入的内容
```

**最佳实践**：
- ✅ 使用简短、清晰的提示
- ✅ 说明输入格式或要求
- ❌ 不要用 placeholder 替代 label

```jsx
// ✅ 好的做法
<Input placeholder="请输入2-20个字符" />

// ❌ 不好的做法
<Input placeholder="用户名（必填，2-20个字符，只能包含字母数字下划线）" />
```

#### 3. `prefix={<UserOutlined />}`

**作用**：在输入框前面添加图标或文本

```jsx
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';

// 用户图标
<Input prefix={<UserOutlined />} />

// 锁图标
<Input prefix={<LockOutlined />} />

// 邮件图标
<Input prefix={<MailOutlined />} />

// 文本前缀
<Input prefix="https://" />
```

**视觉效果**：

```
[ 👤 | 请输入用户名 ]
  ↑
 prefix
```

**对应的 suffix 属性**：

```jsx
// 后缀图标
<Input suffix={<EyeOutlined />} />

// 效果
[ 请输入密码 | 👁 ]
              ↑
            suffix
```

#### 4. `value={username}`

**作用**：设置输入框的值（受控组件）

```jsx
const [username, setUsername] = useState('');

<Input value={username} />
```

**受控组件 vs 非受控组件**：

```jsx
// ✅ 受控组件（推荐）
const [value, setValue] = useState('');
<Input 
  value={value} 
  onChange={(e) => setValue(e.target.value)} 
/>

// ❌ 非受控组件（不推荐）
<Input defaultValue="初始值" />
// 无法通过 React 状态控制输入框的值
```

**受控组件的优势**：
- ✅ 完全控制输入值
- ✅ 可以实时验证
- ✅ 可以格式化输入
- ✅ 易于测试

#### 5. `onChange={(e) => setUsername(e.target.value)}`

**作用**：输入框值变化时的回调函数

```jsx
const handleChange = (e) => {
  const value = e.target.value;
  console.log('输入值:', value);
  setUsername(value);
};

<Input onChange={handleChange} />
```

**事件对象 `e` 的结构**：

```javascript
e = {
  target: {
    value: '用户输入的内容',  // 最常用
    name: 'username',
    type: 'text',
    // ...
  },
  // ...
}
```

**常见用法**：

```jsx
// 1. 直接更新状态
<Input onChange={(e) => setUsername(e.target.value)} />

// 2. 转换为大写
<Input onChange={(e) => setUsername(e.target.value.toUpperCase())} />

// 3. 移除空格
<Input onChange={(e) => setUsername(e.target.value.trim())} />

// 4. 限制只能输入数字
<Input onChange={(e) => {
  const value = e.target.value.replace(/\D/g, '');
  setUsername(value);
}} />

// 5. 实时验证
<Input onChange={(e) => {
  const value = e.target.value;
  setUsername(value);
  
  if (value.length < 2) {
    setError('用户名至少2个字符');
  } else {
    setError('');
  }
}} />
```

#### 6. `onKeyPress={handleKeyPress}`

**作用**：键盘按键按下时的回调函数

```jsx
const handleKeyPress = (e) => {
  if (e.key === 'Enter') {
    handleSubmit();  // 按 Enter 键提交表单
  }
};

<Input onKeyPress={handleKeyPress} />
```

**常用键盘事件**：

```jsx
// 1. onKeyPress（已废弃，建议用 onKeyDown）
<Input onKeyPress={(e) => {
  if (e.key === 'Enter') {
    console.log('按下 Enter');
  }
}} />

// 2. onKeyDown（推荐）
<Input onKeyDown={(e) => {
  if (e.key === 'Enter') {
    console.log('按下 Enter');
  }
  if (e.key === 'Escape') {
    console.log('按下 Esc');
  }
}} />

// 3. onKeyUp
<Input onKeyUp={(e) => {
  console.log('释放按键:', e.key);
}} />
```

**常用按键值**：

```javascript
e.key === 'Enter'      // 回车键
e.key === 'Escape'     // Esc 键
e.key === 'Tab'        // Tab 键
e.key === 'Backspace'  // 退格键
e.key === 'ArrowUp'    // 上箭头
e.key === 'ArrowDown'  // 下箭头
```

**项目中的实现**：

```jsx
const handleKeyPress = (e) => {
  if (e.key === 'Enter') {
    handleSubmit();  // Enter 键提交
  }
};

// 支持 Enter 提交，Shift+Enter 换行
const handleKeyPress = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();  // 阻止默认换行
    handleSubmit();
  }
};
```

#### 7. `maxLength={20}`

**作用**：限制输入框的最大字符数

```jsx
<Input maxLength={20} />
```

**效果**：
- 用户最多只能输入 20 个字符
- 超过 20 个字符后无法继续输入
- 不会显示错误提示

**配合字符计数使用**：

```jsx
const [username, setUsername] = useState('');

<Input
  maxLength={20}
  value={username}
  onChange={(e) => setUsername(e.target.value)}
  suffix={`${username.length}/20`}
/>

// 效果: [ Alice | 5/20 ]
```

**与 showCount 属性配合**：

```jsx
<Input
  maxLength={20}
  showCount
  value={username}
  onChange={(e) => setUsername(e.target.value)}
/>

// 自动显示字符计数
```

### Input 的其他常用属性

```jsx
<Input
  // 输入框类型
  type="text"  // text, password, email, number, tel, url
  
  // 禁用状态
  disabled={true}
  
  // 只读状态
  readOnly={true}
  
  // 允许清除
  allowClear
  
  // 自动聚焦
  autoFocus
  
  // 自动完成
  autoComplete="off"
  
  // 字符计数
  showCount
  
  // 后缀图标
  suffix={<EyeOutlined />}
  
  // 前置标签
  addonBefore="http://"
  
  // 后置标签
  addonAfter=".com"
  
  // 状态（验证状态）
  status="error"  // error, warning
  
  // 自定义样式
  style={{ width: 200 }}
  
  // 失去焦点事件
  onBlur={(e) => console.log('失去焦点')}
  
  // 获得焦点事件
  onFocus={(e) => console.log('获得焦点')}
  
  // 按下回车事件
  onPressEnter={(e) => console.log('按下回车')}
/>
```

### Input 的变体

```jsx
// 1. 密码输入框
import { Input } from 'antd';
<Input.Password 
  placeholder="请输入密码"
  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
/>

// 2. 文本域
<Input.TextArea 
  rows={4}
  placeholder="请输入内容"
  maxLength={500}
  showCount
/>

// 3. 搜索框
<Input.Search
  placeholder="搜索"
  onSearch={(value) => console.log(value)}
  enterButton
/>

// 4. 数字输入框
import { InputNumber } from 'antd';
<InputNumber 
  min={1}
  max={100}
  defaultValue={1}
/>
```

---

## Button 组件

### 基础用法

```jsx
<Button
  type="primary"
  size="large"
  block
  loading={loading}
  onClick={handleSubmit}
>
  进入聊天室
</Button>
```

### 组件说明

**Button** 是 Ant Design 的按钮组件，支持多种类型、尺寸和状态。

### 属性详解

#### 1. `type="primary"`

**作用**：设置按钮类型（样式）

```jsx
// 主要按钮（蓝色背景）
<Button type="primary">Primary</Button>

// 默认按钮（白色背景，灰色边框）
<Button type="default">Default</Button>  // 或 <Button>Default</Button>

// 虚线按钮
<Button type="dashed">Dashed</Button>

// 文本按钮（无边框）
<Button type="text">Text</Button>

// 链接按钮
<Button type="link">Link</Button>
```

**视觉对比**：

```
primary:  [ 进入聊天室 ]  ← 蓝色背景，白色文字（最突出）
default:  [ 进入聊天室 ]  ← 白色背景，黑色文字，灰色边框
dashed:   [ 进入聊天室 ]  ← 白色背景，虚线边框
text:       进入聊天室     ← 无背景，无边框
link:       进入聊天室     ← 蓝色文字，无背景，无边框
```

**使用场景**：
- `primary`：主要操作（提交、确认、登录）
- `default`：次要操作（取消、返回）
- `dashed`：添加操作（上传、新增）
- `text`：辅助操作（编辑、删除）
- `link`：跳转链接

**最佳实践**：

```jsx
// ✅ 一个页面只有一个 primary 按钮
<>
  <Button type="primary">提交</Button>
  <Button>取消</Button>
</>

// ❌ 避免多个 primary 按钮
<>
  <Button type="primary">提交</Button>
  <Button type="primary">保存</Button>  {/* 不推荐 */}
</>
```

#### 2. `size="large"`

**作用**：设置按钮尺寸

```jsx
// 小按钮
<Button size="small">Small</Button>

// 中等按钮（默认）
<Button size="middle">Middle</Button>  // 或 <Button>Middle</Button>

// 大按钮
<Button size="large">Large</Button>
```

**尺寸对比**：

```
small:  [ 按钮 ]      ← 高度 24px
middle: [  按钮  ]    ← 高度 32px（默认）
large:  [   按钮   ]  ← 高度 40px
```

**使用场景**：
- `small`：表格操作、标签、紧凑布局
- `middle`：常规表单、工具栏
- `large`：登录页、重要操作、移动端

**与 Input 尺寸保持一致**：

```jsx
// ✅ 好的做法：Input 和 Button 尺寸一致
<Input size="large" />
<Button size="large">提交</Button>

// ❌ 不好的做法：尺寸不一致
<Input size="large" />
<Button size="small">提交</Button>  {/* 视觉不协调 */}
```

#### 3. `block`

**作用**：按钮宽度充满父容器

```jsx
// 块级按钮（宽度 100%）
<Button block>Block Button</Button>

// 行内按钮（宽度自适应）
<Button>Inline Button</Button>
```

**视觉对比**：

```
block:
┌─────────────────────────────┐
│      进入聊天室              │  ← 宽度 100%
└─────────────────────────────┘

inline:
[ 进入聊天室 ]  ← 宽度自适应内容
```

**使用场景**：
- ✅ 移动端表单
- ✅ 登录/注册页面
- ✅ 模态框底部按钮
- ✅ 需要强调的单个按钮

**项目中的使用**：

```jsx
<div className="login-form">
  <Input size="large" placeholder="请输入用户名" />
  <Button type="primary" size="large" block>
    进入聊天室
  </Button>
</div>

// CSS
.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
```

#### 4. `loading={loading}`

**作用**：显示加载状态

```jsx
const [loading, setLoading] = useState(false);

<Button loading={loading} onClick={() => {
  setLoading(true);
  // 执行异步操作
  setTimeout(() => setLoading(false), 2000);
}}>
  提交
</Button>
```

**效果**：

```
loading={false}:  [ 提交 ]
loading={true}:   [ ⟳ 提交 ]  ← 显示旋转图标，按钮禁用
```

**自定义加载图标**：

```jsx
<Button loading={{ delay: 200 }}>
  提交
</Button>

// 延迟 200ms 显示加载状态（避免闪烁）
```

**使用场景**：
- ✅ 表单提交
- ✅ 数据保存
- ✅ 异步请求
- ✅ 文件上传

**最佳实践**：

```jsx
const handleSubmit = async () => {
  setLoading(true);
  
  try {
    await api.submit(data);
    message.success('提交成功');
  } catch (error) {
    message.error('提交失败');
  } finally {
    setLoading(false);  // 确保 loading 状态被重置
  }
};

<Button loading={loading} onClick={handleSubmit}>
  提交
</Button>
```

#### 5. `onClick={handleSubmit}`

**作用**：点击按钮时的回调函数

```jsx
const handleSubmit = () => {
  console.log('按钮被点击');
};

<Button onClick={handleSubmit}>提交</Button>
```

**事件对象**：

```jsx
<Button onClick={(e) => {
  console.log('事件对象:', e);
  e.preventDefault();   // 阻止默认行为
  e.stopPropagation();  // 阻止事件冒泡
}}>
  提交
</Button>
```

**常见用法**：

```jsx
// 1. 直接调用函数
<Button onClick={handleSubmit}>提交</Button>

// 2. 传递参数
<Button onClick={() => handleDelete(id)}>删除</Button>

// 3. 异步操作
<Button onClick={async () => {
  await api.submit();
}}>提交</Button>

// 4. 条件判断
<Button onClick={() => {
  if (!username) {
    message.warning('请输入用户名');
    return;
  }
  handleSubmit();
}}>提交</Button>
```

**项目中的完整实现**：

```jsx
const [username, setUsername] = useState('');
const [loading, setLoading] = useState(false);

const handleSubmit = () => {
  // 1. 表单验证
  if (!username.trim()) {
    message.warning('请输入用户名');
    return;
  }

  if (username.trim().length < 2) {
    message.warning('用户名至少需要2个字符');
    return;
  }

  // 2. 设置加载状态
  setLoading(true);
  
  // 3. 模拟异步登录
  setTimeout(() => {
    onLogin(username.trim());  // 调用父组件的回调
    setLoading(false);
  }, 500);
};

<Button
  type="primary"
  size="large"
  block
  loading={loading}
  onClick={handleSubmit}
>
  进入聊天室
</Button>
```

### Button 的其他常用属性

```jsx
<Button
  // 危险按钮（红色）
  danger
  
  // 幽灵按钮（透明背景）
  ghost
  
  // 禁用状态
  disabled={true}
  
  // 图标
  icon={<SearchOutlined />}
  
  // 形状
  shape="circle"  // circle, round
  
  // HTML 类型
  htmlType="submit"  // submit, button, reset
  
  // 目标链接（type="link" 时）
  href="https://example.com"
  target="_blank"
  
  // 自定义样式
  style={{ width: 120 }}
  
  // CSS 类名
  className="custom-button"
/>
```

### Button 的组合用法

```jsx
// 1. 按钮组
import { Button, Space } from 'antd';

<Space>
  <Button type="primary">确定</Button>
  <Button>取消</Button>
</Space>

// 2. 按钮组（紧密排列）
import { Button } from 'antd';

<Button.Group>
  <Button>左</Button>
  <Button>中</Button>
  <Button>右</Button>
</Button.Group>

// 3. 带图标的按钮
<Button type="primary" icon={<SearchOutlined />}>
  搜索
</Button>

// 4. 只有图标的按钮
<Button type="primary" icon={<SearchOutlined />} />

// 5. 下拉按钮
import { Dropdown } from 'antd';

<Dropdown.Button menu={menu}>
  操作
</Dropdown.Button>
```

---

## 组件组合实战

### 完整登录表单实现

```jsx
import { useState } from 'react';
import { Card, Input, Button, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import './Login.css';

function Login({ onLogin }) {
  // 状态管理
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  // 提交处理
  const handleSubmit = () => {
    // 表单验证
    if (!username.trim()) {
      message.warning('请输入用户名');
      return;
    }

    if (username.trim().length < 2) {
      message.warning('用户名至少需要2个字符');
      return;
    }

    // 异步提交
    setLoading(true);
    setTimeout(() => {
      onLogin(username.trim());
      setLoading(false);
    }, 500);
  };

  // 键盘事件
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card" bordered={false}>
        <div className="login-header">
          <h1>💬 欢迎来到聊天室</h1>
          <p>输入您的用户名开始聊天</p>
        </div>
        <div className="login-form">
          <Input
            size="large"
            placeholder="请输入用户名"
            prefix={<UserOutlined />}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={handleKeyPress}
            maxLength={20}
          />
          <Button
            type="primary"
            size="large"
            block
            loading={loading}
            onClick={handleSubmit}
          >
            进入聊天室
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default Login;
```

### 组件协作流程

```
用户操作流程：
1. 用户在 Input 中输入用户名
   ↓
2. onChange 事件触发，更新 username 状态
   ↓
3. Input 的 value 更新，显示新输入的内容
   ↓
4. 用户按下 Enter 键或点击 Button
   ↓
5. onKeyPress 或 onClick 事件触发
   ↓
6. 执行 handleSubmit 函数
   ↓
7. 表单验证（检查用户名是否有效）
   ↓
8. 设置 loading={true}，Button 显示加载状态
   ↓
9. 执行异步操作（模拟登录）
   ↓
10. 调用 onLogin(username)，通知父组件
   ↓
11. 设置 loading={false}，恢复 Button 状态
```

### 数据流向图

```
┌─────────────────────────────────────────────────────┐
│                    Login 组件                        │
│                                                      │
│  State:                                              │
│  ├─ username: ''                                     │
│  └─ loading: false                                   │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │              Card 容器                      │    │
│  │                                              │    │
│  │  ┌────────────────────────────────────┐    │    │
│  │  │         Input 输入框                │    │    │
│  │  │                                      │    │    │
│  │  │  value={username} ←─────────────────┼────┼─── username 状态
│  │  │                                      │    │    │
│  │  │  onChange={(e) => ──────────────────┼────┼──→ setUsername(e.target.value)
│  │  │    setUsername(e.target.value)}     │    │    │
│  │  │                                      │    │    │
│  │  │  onKeyPress={handleKeyPress} ───────┼────┼──→ Enter 键提交
│  │  │                                      │    │    │
│  │  └────────────────────────────────────┘    │    │
│  │                                              │    │
│  │  ┌────────────────────────────────────┐    │    │
│  │  │        Button 按钮                  │    │    │
│  │  │                                      │    │    │
│  │  │  loading={loading} ←────────────────┼────┼─── loading 状态
│  │  │                                      │    │    │
│  │  │  onClick={handleSubmit} ────────────┼────┼──→ 提交表单
│  │  │                                      │    │    │
│  │  └────────────────────────────────────┘    │    │
│  │                                              │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
│  handleSubmit() ─────────────────────────────────→ onLogin(username)
│                                                      │
└──────────────────────────────────────────────────────┘
                                                       │
                                                       ↓
                                              传递给父组件 (App)
```

### 样式配合（CSS）

```css
/* Login.css */

.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 400px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-header h1 {
  font-size: 28px;
  margin-bottom: 8px;
  color: #1890ff;
}

.login-header p {
  font-size: 14px;
  color: #8c8c8c;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
```

### 响应式设计

```jsx
// 移动端适配
<Card 
  className="login-card" 
  bordered={false}
  style={{
    width: window.innerWidth < 768 ? '90%' : 400
  }}
>
  {/* ... */}
</Card>

// 或使用 CSS 媒体查询
```

```css
/* 响应式 CSS */
@media (max-width: 768px) {
  .login-card {
    width: 90%;
    margin: 0 16px;
  }
  
  .login-header h1 {
    font-size: 24px;
  }
}
```

### 表单验证增强

```jsx
const [errors, setErrors] = useState({});

const validateUsername = (value) => {
  const newErrors = {};
  
  if (!value.trim()) {
    newErrors.username = '请输入用户名';
  } else if (value.trim().length < 2) {
    newErrors.username = '用户名至少需要2个字符';
  } else if (value.trim().length > 20) {
    newErrors.username = '用户名最多20个字符';
  } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
    newErrors.username = '用户名只能包含字母、数字和下划线';
  }
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

<Input
  size="large"
  placeholder="请输入用户名"
  prefix={<UserOutlined />}
  value={username}
  onChange={(e) => {
    setUsername(e.target.value);
    validateUsername(e.target.value);
  }}
  status={errors.username ? 'error' : ''}
/>
{errors.username && (
  <div style={{ color: 'red', fontSize: 12 }}>
    {errors.username}
  </div>
)}
```

---

## 总结

### Card 组件核心要点

- ✅ 用作内容容器，提供统一的视觉风格
- ✅ `bordered={false}` 实现现代化无边框设计
- ✅ 通过 `className` 自定义样式
- ✅ 支持 `title`、`extra`、`actions` 等丰富配置

### Input 组件核心要点

- ✅ `size` 控制尺寸，与 Button 保持一致
- ✅ `placeholder` 提供友好的输入提示
- ✅ `prefix/suffix` 添加图标或文本
- ✅ `value + onChange` 实现受控组件
- ✅ `onKeyPress` 支持键盘快捷操作
- ✅ `maxLength` 限制输入长度

### Button 组件核心要点

- ✅ `type` 区分按钮重要性（primary 最突出）
- ✅ `size` 控制尺寸，与 Input 保持一致
- ✅ `block` 实现全宽按钮
- ✅ `loading` 显示异步操作状态
- ✅ `onClick` 处理点击事件

### 组件组合最佳实践

1. **尺寸一致性**：Input 和 Button 使用相同的 size
2. **状态管理**：使用 useState 管理表单状态
3. **表单验证**：在提交前进行客户端验证
4. **用户体验**：支持 Enter 键提交、加载状态显示
5. **错误处理**：使用 message 组件显示友好提示
6. **样式协调**：通过 CSS 实现统一的视觉风格

---

**文档版本**: v1.0  
**最后更新**: 2024-01-01  
**作者**: Kiro AI Assistant


---

## TextArea 组件

### 基础用法

```jsx
const { TextArea } = Input;

<TextArea
  placeholder="输入消息... (Enter 发送, Shift+Enter 换行)"
  value={inputMessage}
  onChange={(e) => setInputMessage(e.target.value)}
  onKeyPress={handleKeyPress}
  autoSize={{ minRows: 1, maxRows: 4 }}
  maxLength={500}
/>
```

### 组件说明

**TextArea** 是 Input 组件的多行文本输入变体，适用于需要输入较长文本的场景。

### 属性详解

#### 1. `autoSize={{ minRows: 1, maxRows: 4 }}`

**作用**：自动调整文本域高度

```jsx
// 固定行数
<TextArea rows={4} />

// 自动调整（最小1行，最大4行）
<TextArea autoSize={{ minRows: 1, maxRows: 4 }} />

// 自动调整（无限制）
<TextArea autoSize />
```

**效果对比**：

```
固定 rows={4}:
┌─────────────────┐
│                 │
│                 │  ← 始终4行高度
│                 │
│                 │
└─────────────────┘

autoSize={{ minRows: 1, maxRows: 4 }}:
┌─────────────────┐
│ 一行文本        │  ← 1行时
└─────────────────┘

┌─────────────────┐
│ 第一行          │
│ 第二行          │  ← 2行时自动扩展
└─────────────────┘

┌─────────────────┐
│ 第一行          │
│ 第二行          │
│ 第三行          │  ← 最多4行
│ 第四行          │
└─────────────────┘
```

**使用场景**：
- ✅ 聊天输入框（自适应内容）
- ✅ 评论框
- ✅ 动态表单

#### 2. 键盘事件处理

```jsx
const handleKeyPress = (e) => {
  // Enter 发送，Shift+Enter 换行
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();  // 阻止默认换行
    handleSendMessage();
  }
};

<TextArea onKeyPress={handleKeyPress} />
```

**常见键盘组合**：

```jsx
// 1. Enter 提交，Shift+Enter 换行
if (e.key === 'Enter' && !e.shiftKey) {
  e.preventDefault();
  handleSubmit();
}

// 2. Ctrl+Enter 提交
if (e.key === 'Enter' && e.ctrlKey) {
  e.preventDefault();
  handleSubmit();
}

// 3. Esc 清空
if (e.key === 'Escape') {
  setInputMessage('');
}
```

### TextArea 的其他常用属性

```jsx
<TextArea
  // 行数
  rows={4}
  
  // 自动调整高度
  autoSize
  
  // 字符计数
  showCount
  
  // 最大长度
  maxLength={500}
  
  // 允许清除
  allowClear
  
  // 禁用状态
  disabled
  
  // 只读状态
  readOnly
  
  // 自动聚焦
  autoFocus
  
  // 样式
  style={{ resize: 'none' }}  // 禁止手动调整大小
/>
```

### 项目中的完整实现

```jsx
<div className="input-container">
  <TextArea
    placeholder="输入消息... (Enter 发送, Shift+Enter 换行)"
    value={inputMessage}
    onChange={(e) => setInputMessage(e.target.value)}
    onKeyPress={(e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    }}
    autoSize={{ minRows: 1, maxRows: 4 }}
    maxLength={500}
  />
  <Button
    type="primary"
    icon={<SendOutlined />}
    onClick={handleSendMessage}
    disabled={!isConnected}
  >
    发送
  </Button>
</div>
```

---

## List 组件

### 基础用法

```jsx
<List
  dataSource={onlineUsers}
  renderItem={(user) => (
    <List.Item onClick={() => handleStartPrivateChat(user)}>
      <List.Item.Meta
        avatar={<Avatar icon={<UserOutlined />} />}
        title={user.username}
      />
    </List.Item>
  )}
/>
```

### 组件说明

**List** 是 Ant Design 的列表组件，用于展示一系列结构化的数据。

### 属性详解

#### 1. `dataSource={onlineUsers}`

**作用**：提供列表数据源

```jsx
const onlineUsers = [
  { id: '1', username: 'Alice' },
  { id: '2', username: 'Bob' },
  { id: '3', username: 'Charlie' }
];

<List dataSource={onlineUsers} />
```

**数据结构**：
- 必须是数组
- 每个元素可以是任意对象
- 通过 `renderItem` 定义如何渲染每一项

#### 2. `renderItem={(user) => (...)}`

**作用**：定义列表项的渲染方式

```jsx
<List
  dataSource={users}
  renderItem={(user, index) => (
    <List.Item key={user.id}>
      {index + 1}. {user.username}
    </List.Item>
  )}
/>
```

**参数**：
- `user`: 当前列表项的数据
- `index`: 当前项的索引（可选）

#### 3. `List.Item`

**作用**：列表项容器

```jsx
<List.Item
  // 额外操作（右侧）
  actions={[
    <Button>编辑</Button>,
    <Button>删除</Button>
  ]}
  
  // 额外内容（下方）
  extra={<img src="avatar.jpg" />}
  
  // 点击事件
  onClick={() => console.log('clicked')}
  
  // 样式
  style={{ cursor: 'pointer' }}
  className="user-item"
>
  列表项内容
</List.Item>
```

#### 4. `List.Item.Meta`

**作用**：列表项的元信息（头像、标题、描述）

```jsx
<List.Item.Meta
  // 头像
  avatar={<Avatar icon={<UserOutlined />} />}
  
  // 标题
  title="用户名"
  
  // 描述
  description="这是描述信息"
/>
```

**视觉结构**：

```
┌────────────────────────────────┐
│  [头像]  标题                   │
│          描述信息               │
└────────────────────────────────┘
```

### List 的其他常用属性

```jsx
<List
  // 数据源
  dataSource={data}
  
  // 渲染函数
  renderItem={(item) => <List.Item>{item}</List.Item>}
  
  // 列表头部
  header={<div>列表头部</div>}
  
  // 列表底部
  footer={<div>列表底部</div>}
  
  // 边框
  bordered
  
  // 尺寸
  size="small"  // small, default, large
  
  // 分割线
  split={true}
  
  // 加载状态
  loading={true}
  
  // 栅格布局
  grid={{ gutter: 16, column: 4 }}
  
  // 分页
  pagination={{
    pageSize: 10,
    total: 100
  }}
  
  // 空状态
  locale={{ emptyText: '暂无数据' }}
/>
```

### 项目中的完整实现

```jsx
<Card 
  className="users-card"
  title={`在线用户 (${onlineUsers.length})`}
  bordered={false}
>
  <List
    dataSource={onlineUsers}
    renderItem={(user) => (
      <List.Item 
        className={`user-item ${user.username !== username ? 'clickable' : ''}`}
        onClick={() => handleStartPrivateChat(user)}
        style={{ cursor: user.username !== username ? 'pointer' : 'default' }}
      >
        <List.Item.Meta
          avatar={
            <Badge dot status="success">
              <Avatar icon={<UserOutlined />} />
            </Badge>
          }
          title={
            <span className={user.username === username ? 'current-user' : ''}>
              {user.username}
              {user.username === username && ' (你)'}
            </span>
          }
        />
      </List.Item>
    )}
  />
</Card>
```

**设计亮点**：
- 动态标题显示在线用户数量
- 条件样式：当前用户不可点击
- 头像带在线状态徽章
- 当前用户显示 "(你)" 标识

---

## Avatar 组件

### 基础用法

```jsx
<Avatar icon={<UserOutlined />} />
```

### 组件说明

**Avatar** 是头像组件，用于展示用户头像或图标。

### 常用形式

```jsx
// 1. 图标头像
<Avatar icon={<UserOutlined />} />

// 2. 文字头像
<Avatar>A</Avatar>
<Avatar>Alice</Avatar>

// 3. 图片头像
<Avatar src="https://example.com/avatar.jpg" />

// 4. 自定义内容
<Avatar>
  <img src="avatar.jpg" alt="avatar" />
</Avatar>
```

### 属性详解

```jsx
<Avatar
  // 尺寸
  size={64}  // 数字或 'large' | 'small' | 'default'
  size="large"
  size={{ xs: 24, sm: 32, md: 40, lg: 64, xl: 80, xxl: 100 }}
  
  // 形状
  shape="circle"  // circle | square
  
  // 图标
  icon={<UserOutlined />}
  
  // 图片
  src="avatar.jpg"
  srcSet="avatar@2x.jpg 2x"
  
  // 替代文本
  alt="User Avatar"
  
  // 图片加载失败回调
  onError={() => true}
  
  // 样式
  style={{ backgroundColor: '#87d068' }}
  
  // 间距（文字头像）
  gap={4}
/>
```

### 尺寸对比

```jsx
<Avatar size={24} icon={<UserOutlined />} />  // 小
<Avatar size={32} icon={<UserOutlined />} />  // 默认
<Avatar size={40} icon={<UserOutlined />} />  // 中
<Avatar size={64} icon={<UserOutlined />} />  // 大
```

**视觉效果**：

```
size={24}:  [👤]
size={32}:  [ 👤 ]
size={40}:  [  👤  ]
size={64}:  [   👤   ]
```

### Avatar.Group（头像组）

```jsx
<Avatar.Group>
  <Avatar src="user1.jpg" />
  <Avatar src="user2.jpg" />
  <Avatar src="user3.jpg" />
  <Avatar>+5</Avatar>
</Avatar.Group>

// 最大显示数量
<Avatar.Group maxCount={3} maxStyle={{ color: '#f56a00', backgroundColor: '#fde3cf' }}>
  <Avatar src="user1.jpg" />
  <Avatar src="user2.jpg" />
  <Avatar src="user3.jpg" />
  <Avatar src="user4.jpg" />
  <Avatar src="user5.jpg" />
</Avatar.Group>
```

### 项目中的使用

```jsx
<Badge dot status="success">
  <Avatar icon={<UserOutlined />} />
</Badge>
```

**组合效果**：
- Avatar 显示用户图标
- Badge 显示在线状态（绿点）

---

## Badge 组件

### 基础用法

```jsx
// 1. 数字徽章
<Badge count={5}>
  <Avatar icon={<UserOutlined />} />
</Badge>

// 2. 状态点
<Badge dot>
  <Avatar icon={<UserOutlined />} />
</Badge>

// 3. 状态徽章
<Badge status="success" text="在线" />
```

### 组件说明

**Badge** 是徽章组件，用于展示数字、状态点或状态文本。

### 属性详解

#### 1. `count={number}`

**作用**：显示数字徽章

```jsx
<Badge count={5}>
  <Button>消息</Button>
</Badge>

<Badge count={99}>
  <Button>通知</Button>
</Badge>

<Badge count={100}>
  <Button>邮件</Button>
</Badge>
```

**效果**：

```
count={5}:   [ 消息 ⑤ ]
count={99}:  [ 通知 99 ]
count={100}: [ 邮件 99+ ]  ← 默认最大显示99+
```

**自定义最大值**：

```jsx
<Badge count={100} overflowCount={999}>
  <Button>消息</Button>
</Badge>
// 显示: 100

<Badge count={1000} overflowCount={999}>
  <Button>消息</Button>
</Badge>
// 显示: 999+
```

#### 2. `dot`

**作用**：显示小红点（不显示数字）

```jsx
<Badge dot>
  <Avatar icon={<UserOutlined />} />
</Badge>
```

**效果**：

```
[ 👤 ● ]  ← 右上角红点
```

**使用场景**：
- ✅ 有新消息但不显示具体数量
- ✅ 在线状态提示
- ✅ 更新提示

#### 3. `status`

**作用**：显示状态徽章

```jsx
<Badge status="success" text="在线" />
<Badge status="error" text="离线" />
<Badge status="default" text="默认" />
<Badge status="processing" text="处理中" />
<Badge status="warning" text="警告" />
```

**效果**：

```
● 在线      (绿色)
● 离线      (红色)
● 默认      (灰色)
⟳ 处理中    (蓝色，带动画)
● 警告      (橙色)
```

#### 4. `offset={[x, y]}`

**作用**：设置徽章位置偏移

```jsx
<Badge count={5} offset={[10, 0]}>
  <Avatar icon={<UserOutlined />} />
</Badge>
```

**参数**：
- `x`: 水平偏移（正数向右，负数向左）
- `y`: 垂直偏移（正数向下，负数向上）

### Badge 的其他常用属性

```jsx
<Badge
  // 数字
  count={5}
  
  // 最大显示数字
  overflowCount={99}
  
  // 显示0
  showZero
  
  // 小红点
  dot
  
  // 状态
  status="success"  // success, processing, default, error, warning
  
  // 状态文本
  text="在线"
  
  // 偏移量
  offset={[10, 10]}
  
  // 自定义内容
  count={<ClockCircleOutlined />}
  
  // 颜色
  color="blue"
  
  // 标题（鼠标悬停提示）
  title="5条未读消息"
  
  // 尺寸
  size="small"  // default, small
/>
```

### 项目中的使用场景

#### 1. 在线状态显示

```jsx
<Badge dot status="success">
  <Avatar icon={<UserOutlined />} />
</Badge>
```

#### 2. 未读消息计数

```jsx
<Badge count={unreadCounts[tab.userId] || 0} offset={[10, 0]}>
  👤 {tab.username}
</Badge>
```

#### 3. 连接状态显示

```jsx
<Badge 
  status={isConnected ? 'success' : 'error'} 
  text={isConnected ? '在线' : '离线'} 
/>
```

**完整效果**：

```
连接成功:  ● 在线   (绿色)
连接失败:  ● 离线   (红色)
```

---

## message 组件

### 基础用法

```jsx
import { message } from 'antd';

// 成功提示
message.success('操作成功');

// 错误提示
message.error('操作失败');

// 警告提示
message.warning('请输入用户名');

// 信息提示
message.info('这是一条信息');

// 加载提示
message.loading('加载中...');
```

### 组件说明

**message** 是全局提示组件，用于向用户显示操作反馈。

### 方法详解

#### 1. `message.success(content, duration)`

**作用**：显示成功提示

```jsx
message.success('登录成功');

// 自定义持续时间（秒）
message.success('保存成功', 3);

// 回调函数
message.success('删除成功', 2, () => {
  console.log('提示已关闭');
});
```

**效果**：

```
┌────────────────────────┐
│  ✓  登录成功            │  ← 绿色图标，2秒后自动消失
└────────────────────────┘
```

#### 2. `message.error(content)`

**作用**：显示错误提示

```jsx
message.error('登录失败');
message.error('网络连接失败，请重试');
```

**效果**：

```
┌────────────────────────┐
│  ✕  登录失败            │  ← 红色图标
└────────────────────────┘
```

#### 3. `message.warning(content)`

**作用**：显示警告提示

```jsx
message.warning('请输入用户名');
message.warning('用户名至少需要2个字符');
```

**效果**：

```
┌────────────────────────┐
│  ⚠  请输入用户名        │  ← 橙色图标
└────────────────────────┘
```

#### 4. `message.info(content)`

**作用**：显示信息提示

```jsx
message.info('这是一条提示信息');
```

#### 5. `message.loading(content, duration)`

**作用**：显示加载提示

```jsx
const hide = message.loading('加载中...', 0);  // duration=0 表示不自动关闭

// 手动关闭
setTimeout(() => {
  hide();
  message.success('加载完成');
}, 2000);
```

### 高级用法

#### 1. 自定义持续时间

```jsx
// 默认3秒
message.success('操作成功');

// 自定义5秒
message.success('操作成功', 5);

// 不自动关闭
message.success('操作成功', 0);
```

#### 2. 手动关闭

```jsx
const hide = message.loading('加载中...', 0);

// 异步操作完成后关闭
setTimeout(() => {
  hide();
}, 2000);
```

#### 3. Promise 接口

```jsx
message.success('操作成功').then(() => {
  console.log('提示已显示');
});
```

#### 4. 更新消息内容

```jsx
const key = 'updatable';

message.loading({ content: '加载中...', key });

setTimeout(() => {
  message.success({ content: '加载完成!', key, duration: 2 });
}, 1000);
```

#### 5. 自定义配置

```jsx
message.config({
  top: 100,              // 距离顶部的位置
  duration: 2,           // 默认持续时间
  maxCount: 3,           // 最大显示数量
  rtl: false,            // 是否RTL布局
  prefixCls: 'my-message' // 自定义类名前缀
});
```

### 项目中的使用场景

#### 1. 连接状态提示

```jsx
newSocket.on('connect', () => {
  setIsConnected(true);
  message.success('已连接到服务器');
});

newSocket.on('disconnect', () => {
  setIsConnected(false);
  message.error('与服务器断开连接');
});
```

#### 2. 表单验证提示

```jsx
const handleSubmit = () => {
  if (!username.trim()) {
    message.warning('请输入用户名');
    return;
  }

  if (username.trim().length < 2) {
    message.warning('用户名至少需要2个字符');
    return;
  }
  
  // 提交逻辑
};
```

#### 3. 操作反馈

```jsx
const handleSendMessage = () => {
  if (!isConnected) {
    message.error('未连接到服务器');
    return;
  }
  
  socket.emit('message:send', inputMessage.trim());
  setInputMessage('');
};
```

#### 4. 错误处理

```jsx
newSocket.on('error', (error) => {
  message.error(error);
});
```

### message vs notification

**对比**：

```jsx
// message: 轻量级提示（顶部中央）
message.success('操作成功');

// notification: 通知提醒（右上角）
notification.success({
  message: '操作成功',
  description: '您的操作已成功完成',
  duration: 4.5
});
```

**使用场景**：
- `message`: 简单的操作反馈（成功、失败、警告）
- `notification`: 需要详细描述的通知（系统通知、复杂提示）

---

## 组件组合实战案例

### 案例1：聊天输入区域

```jsx
<div className="input-container">
  <TextArea
    placeholder="输入消息... (Enter 发送, Shift+Enter 换行)"
    value={inputMessage}
    onChange={(e) => setInputMessage(e.target.value)}
    onKeyPress={(e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    }}
    autoSize={{ minRows: 1, maxRows: 4 }}
    maxLength={500}
  />
  <Button
    type="primary"
    icon={<SendOutlined />}
    onClick={handleSendMessage}
    disabled={!isConnected}
  >
    发送
  </Button>
</div>
```

**组件协作**：
- TextArea: 多行输入，自动调整高度
- Button: 发送按钮，根据连接状态禁用
- 键盘事件: Enter 发送，Shift+Enter 换行

### 案例2：用户列表项

```jsx
<List.Item 
  onClick={() => handleStartPrivateChat(user)}
  style={{ cursor: 'pointer' }}
>
  <List.Item.Meta
    avatar={
      <Badge dot status="success">
        <Avatar icon={<UserOutlined />} />
      </Badge>
    }
    title={
      <span>
        {user.username}
        {user.username === username && ' (你)'}
      </span>
    }
  />
</List.Item>
```

**组件协作**：
- List.Item: 列表项容器，可点击
- List.Item.Meta: 元信息布局
- Badge: 在线状态指示
- Avatar: 用户头像

### 案例3：私聊标签页

```jsx
<div className="chat-tab" onClick={() => setActiveTab(tab.userId)}>
  <Badge count={unreadCounts[tab.userId] || 0} offset={[10, 0]}>
    👤 {tab.username}
  </Badge>
  <CloseOutlined onClick={(e) => handleClosePrivateChat(tab.userId, e)} />
</div>
```

**组件协作**：
- Badge: 显示未读消息数
- CloseOutlined: 关闭按钮
- 事件处理: 点击切换标签，点击关闭按钮关闭标签

### 案例4：连接状态显示

```jsx
<div className="header-actions">
  <Badge 
    status={isConnected ? 'success' : 'error'} 
    text={isConnected ? '在线' : '离线'} 
  />
  <Button 
    type="text" 
    icon={<LogoutOutlined />} 
    onClick={handleLogout}
  >
    退出
  </Button>
</div>
```

**组件协作**：
- Badge: 状态指示器
- Button: 退出按钮
- 动态样式: 根据连接状态改变颜色

---

## 总结

### 新增组件核心要点

#### TextArea
- ✅ `autoSize` 自动调整高度
- ✅ 支持 Enter 和 Shift+Enter 组合键
- ✅ `maxLength` 限制字符数
- ✅ 适用于多行文本输入

#### List
- ✅ `dataSource` 提供数据源
- ✅ `renderItem` 自定义渲染
- ✅ `List.Item.Meta` 标准化布局
- ✅ 支持头像、标题、描述组合

#### Avatar
- ✅ 支持图标、文字、图片三种形式
- ✅ `size` 控制尺寸
- ✅ `shape` 控制形状（圆形/方形）
- ✅ 常与 Badge 组合使用

#### Badge
- ✅ `count` 显示数字徽章
- ✅ `dot` 显示小红点
- ✅ `status` 显示状态指示
- ✅ `offset` 调整位置

#### message
- ✅ 全局提示组件
- ✅ 5种类型：success、error、warning、info、loading
- ✅ 自动消失，可自定义持续时间
- ✅ 适用于操作反馈

### 组件组合最佳实践

1. **语义化组合**：使用合适的组件表达正确的语义
2. **状态联动**：组件状态相互关联，保持一致性
3. **用户体验**：提供即时反馈和清晰的视觉提示
4. **性能优化**：避免不必要的重新渲染
5. **可访问性**：确保键盘操作和屏幕阅读器支持

---

**文档版本**: v1.1  
**最后更新**: 2024-01-01  
**作者**: Kiro AI Assistant
