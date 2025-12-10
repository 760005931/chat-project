# 📗 React 完整学习指南

从零基础到进阶的 React 系统学习笔记，涵盖所有核心概念和最佳实践。

---

## 🚀 快速导航

-   [第一章：React 基础](#第一章react-基础)
-   [第二章：组件与 Props](#第二章组件与-props)
-   [第三章：State 与生命周期](#第三章state-与生命周期)
-   [第四章：Hooks 深入](#第四章hooks-深入)
-   [第五章：路由与状态管理](#第五章路由与状态管理)
-   [第六章：性能优化与进阶](#第六章性能优化与进阶)

---

## 第一章：React 基础

### 1.1 什么是 React？

React 是一个用于构建用户界面的 **JavaScript 库**。

**核心特点**：

-   **声明式**：描述 UI 应该是什么样子
-   **组件化**：将 UI 拆分成独立、可复用的部分
-   **一次学习，随处编写**：React Native、React VR 等
-   **虚拟 DOM**：高效的 DOM 更新机制

---

### 1.2 创建第一个 React 应用

#### 使用 Create React App

```bash
# 创建项目
npx create-react-app my-app

# 进入项目
cd my-app

# 启动开发服务器
npm start
```

#### 使用 Vite（更快，推荐）

```bash
# 创建项目
npm create vite@latest my-react-app -- --template react

# 进入项目
cd my-react-app

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

---

### 1.3 JSX 语法

JSX 是 JavaScript 的语法扩展，看起来像 HTML，但实际上是 JavaScript。

#### 基础用法

```jsx
// 简单的 JSX
const element = <h1>Hello, React!</h1>;

// 嵌入表达式
const name = 'Alice';
const element = <h1>Hello, {name}!</h1>;

// 表达式可以是任何 JavaScript 表达式
const element = <h1>{1 + 1}</h1>; // 2
const element = <h1>{user.name}</h1>;
const element = <h1>{formatName(user)}</h1>;
```

#### JSX 属性

```jsx
// 字符串属性
const element = <img src="logo.png" alt="Logo" />;

// 表达式属性
const element = <img src={user.avatarUrl} />;

// className 代替 class
const element = <div className="container"></div>;

// style 是对象
const element = <div style={{ color: 'red', fontSize: '20px' }}></div>;

// 布尔属性
const element = <input type="checkbox" checked />;
const element = <input type="checkbox" checked={true} />;
```

#### JSX 子元素

```jsx
// 嵌套元素
const element = (
    <div>
        <h1>标题</h1>
        <p>段落</p>
    </div>
);

// 列表渲染
const numbers = [1, 2, 3, 4, 5];
const listItems = numbers.map((number) => <li key={number}>{number}</li>);

// 条件渲染
const element = <div>{isLoggedIn ? <UserGreeting /> : <GuestGreeting />}</div>;

// 逻辑与 &&
const element = (
    <div>
        {messages.length > 0 && <h2>你有 {messages.length} 条未读消息</h2>}
    </div>
);
```

**JSX 注意事项**：

-   JSX 必须有一个根元素（或使用 Fragment `<>...</>`）
-   所有标签必须闭合
-   `className` 代替 `class`，`htmlFor` 代替 `for`
-   事件名采用小驼峰命名：`onClick`、`onChange`

---

### 1.4 组件基础

#### 函数组件（推荐）

```jsx
// 简单函数组件
function Welcome(props) {
    return <h1>Hello, {props.name}</h1>;
}

// 箭头函数
const Welcome = (props) => {
    return <h1>Hello, {props.name}</h1>;
};

// 简写（单行返回）
const Welcome = (props) => <h1>Hello, {props.name}</h1>;

// 使用组件
<Welcome name="Alice" />;
```

#### 类组件（了解即可）

```jsx
import React, { Component } from 'react';

class Welcome extends Component {
    render() {
        return <h1>Hello, {this.props.name}</h1>;
    }
}
```

**现代 React 推荐使用函数组件 + Hooks**。

---

### 1.5 事件处理

```jsx
function Button() {
    // 事件处理函数
    const handleClick = () => {
        alert('按钮被点击了');
    };

    // 带参数的事件处理
    const handleClickWithParam = (name) => {
        alert(`Hello, ${name}`);
    };

    // 访问事件对象
    const handleChange = (event) => {
        console.log(event.target.value);
    };

    return (
        <div>
            {/* 直接绑定 */}
            <button onClick={handleClick}>点击</button>

            {/* 内联箭头函数 */}
            <button onClick={() => alert('点击')}>点击</button>

            {/* 传递参数 */}
            <button onClick={() => handleClickWithParam('Alice')}>点击</button>

            {/* 阻止默认行为 */}
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    console.log('提交表单');
                }}
            >
                <button type="submit">提交</button>
            </form>

            {/* 输入事件 */}
            <input onChange={handleChange} />
        </div>
    );
}
```

**React 事件 vs 原生事件**：

-   React 事件是合成事件（SyntheticEvent），跨浏览器兼容
-   事件名采用小驼峰：`onClick`、`onChange`
-   不能通过返回 `false` 阻止默认行为，必须显式调用 `e.preventDefault()`

---

### 1.6 条件渲染

```jsx
function Greeting({ isLoggedIn }) {
    // if/else
    if (isLoggedIn) {
        return <h1>欢迎回来！</h1>;
    } else {
        return <h1>请先登录</h1>;
    }
}

function Greeting({ isLoggedIn }) {
    // 三元运算符
    return <div>{isLoggedIn ? <h1>欢迎回来！</h1> : <h1>请先登录</h1>}</div>;
}

function Mailbox({ unreadMessages }) {
    // 逻辑与 &&
    return (
        <div>
            <h1>邮箱</h1>
            {unreadMessages.length > 0 && (
                <h2>你有 {unreadMessages.length} 条未读消息</h2>
            )}
        </div>
    );
}

function LoginControl() {
    // 元素变量
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    let button;
    if (isLoggedIn) {
        button = <button onClick={() => setIsLoggedIn(false)}>登出</button>;
    } else {
        button = <button onClick={() => setIsLoggedIn(true)}>登录</button>;
    }

    return <div>{button}</div>;
}
```

---

### 1.7 列表渲染

```jsx
function TodoList() {
    const todos = [
        { id: 1, text: '学习 React' },
        { id: 2, text: '写代码' },
        { id: 3, text: '睡觉' },
    ];

    return (
        <ul>
            {todos.map((todo) => (
                <li key={todo.id}>{todo.text}</li>
            ))}
        </ul>
    );
}

// 提取为组件
function TodoItem({ todo }) {
    return <li>{todo.text}</li>;
}

function TodoList() {
    const todos = [
        { id: 1, text: '学习 React' },
        { id: 2, text: '写代码' },
    ];

    return (
        <ul>
            {todos.map((todo) => (
                <TodoItem key={todo.id} todo={todo} />
            ))}
        </ul>
    );
}
```

**key 的重要性**：

-   `key` 帮助 React 识别哪些元素改变了
-   `key` 应该是稳定的、唯一的标识符
-   **不要用索引作为 key**（除非列表不会重新排序）

---

## 第二章：组件与 Props

### 2.1 Props（属性）

Props 是组件的输入，类似于函数的参数。

#### 传递 Props

```jsx
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}

// 使用
<Welcome name="Alice" />
<Welcome name="Bob" />
```

#### Props 解构

```jsx
// 不解构
function Welcome(props) {
    return <h1>Hello, {props.name}</h1>;
}

// 解构（推荐）
function Welcome({ name }) {
    return <h1>Hello, {name}</h1>;
}

// 多个 props
function UserCard({ name, age, avatar }) {
    return (
        <div>
            <img src={avatar} alt={name} />
            <h2>{name}</h2>
            <p>年龄: {age}</p>
        </div>
    );
}
```

#### Props 默认值

```jsx
function Greeting({ name = 'Guest' }) {
  return <h1>Hello, {name}</h1>;
}

// 使用
<Greeting /> // Hello, Guest
<Greeting name="Alice" /> // Hello, Alice
```

#### Props 类型检查（PropTypes）

```jsx
import PropTypes from 'prop-types';

function UserCard({ name, age, isActive }) {
    return (
        <div>
            {name} - {age}
        </div>
    );
}

UserCard.propTypes = {
    name: PropTypes.string.isRequired,
    age: PropTypes.number,
    isActive: PropTypes.bool,
};

UserCard.defaultProps = {
    age: 18,
    isActive: false,
};
```

**TypeScript 类型定义（推荐）**：

```tsx
interface UserCardProps {
    name: string;
    age?: number;
    isActive?: boolean;
}

function UserCard({ name, age = 18, isActive = false }: UserCardProps) {
    return (
        <div>
            {name} - {age}
        </div>
    );
}
```

---

### 2.2 Props 是只读的

```jsx
// ❌ 错误：不能修改 props
function Welcome({ name }) {
    name = 'Bob'; // 错误！
    return <h1>Hello, {name}</h1>;
}

// ✅ 正确：使用 state
function Welcome({ initialName }) {
    const [name, setName] = useState(initialName);

    return (
        <div>
            <h1>Hello, {name}</h1>
            <button onClick={() => setName('Bob')}>改名</button>
        </div>
    );
}
```

---

### 2.3 组件组合

```jsx
// 容器组件
function Card({ children }) {
    return <div className="card">{children}</div>;
}

// 使用
function App() {
    return (
        <Card>
            <h1>标题</h1>
            <p>内容</p>
        </Card>
    );
}

// 具名插槽
function Layout({ header, sidebar, content }) {
    return (
        <div>
            <header>{header}</header>
            <aside>{sidebar}</aside>
            <main>{content}</main>
        </div>
    );
}

// 使用
<Layout
    header={<h1>网站标题</h1>}
    sidebar={<nav>导航</nav>}
    content={<p>主要内容</p>}
/>;
```

---

## 第三章：State 与生命周期

### 3.1 useState Hook

```jsx
import { useState } from 'react';

function Counter() {
    // 声明 state
    const [count, setCount] = useState(0);

    return (
        <div>
            <p>你点击了 {count} 次</p>
            <button onClick={() => setCount(count + 1)}>点击</button>
        </div>
    );
}
```

#### 多个 State

```jsx
function Form() {
    const [name, setName] = useState('');
    const [age, setAge] = useState(0);
    const [email, setEmail] = useState('');

    return (
        <form>
            <input value={name} onChange={(e) => setName(e.target.value)} />
            <input
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
            />
            <input value={email} onChange={(e) => setEmail(e.target.value)} />
        </form>
    );
}
```

#### State 是对象

```jsx
function Form() {
    const [user, setUser] = useState({
        name: '',
        age: 0,
        email: '',
    });

    const handleChange = (field, value) => {
        setUser({
            ...user,
            [field]: value,
        });
    };

    return (
        <form>
            <input
                value={user.name}
                onChange={(e) => handleChange('name', e.target.value)}
            />
            <input
                value={user.age}
                onChange={(e) => handleChange('age', Number(e.target.value))}
            />
        </form>
    );
}
```

#### State 更新是异步的

```jsx
function Counter() {
    const [count, setCount] = useState(0);

    const handleClick = () => {
        // ❌ 错误：基于旧值更新
        setCount(count + 1);
        setCount(count + 1);
        setCount(count + 1);
        // count 只会增加 1

        // ✅ 正确：使用函数式更新
        setCount((c) => c + 1);
        setCount((c) => c + 1);
        setCount((c) => c + 1);
        // count 会增加 3
    };

    return <button onClick={handleClick}>{count}</button>;
}
```

---

### 3.2 useEffect Hook

`useEffect` 用于处理副作用（数据获取、订阅、手动修改 DOM 等）。

#### 基础用法

```jsx
import { useState, useEffect } from 'react';

function Example() {
    const [count, setCount] = useState(0);

    // 每次渲染后执行
    useEffect(() => {
        document.title = `你点击了 ${count} 次`;
    });

    return (
        <button onClick={() => setCount(count + 1)}>点击了 {count} 次</button>
    );
}
```

#### 依赖数组

```jsx
function Example() {
    const [count, setCount] = useState(0);

    // 只在 count 变化时执行
    useEffect(() => {
        document.title = `你点击了 ${count} 次`;
    }, [count]);

    // 只在组件挂载时执行一次
    useEffect(() => {
        console.log('组件挂载了');
    }, []);

    return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

#### 清理副作用

```jsx
function Timer() {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCount((c) => c + 1);
        }, 1000);

        // 清理函数
        return () => {
            clearInterval(timer);
        };
    }, []);

    return <div>{count}</div>;
}
```

#### 数据获取

```jsx
function UserProfile({ userId }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);

        fetch(`/api/users/${userId}`)
            .then((res) => res.json())
            .then((data) => {
                setUser(data);
                setLoading(false);
            });
    }, [userId]); // userId 变化时重新获取

    if (loading) return <div>加载中...</div>;
    return <div>{user.name}</div>;
}
```

---

### 3.3 生命周期对比

**类组件生命周期 → Hooks 对应**：

| 类组件                 | Hooks                                      |
| ---------------------- | ------------------------------------------ |
| `componentDidMount`    | `useEffect(() => {}, [])`                  |
| `componentDidUpdate`   | `useEffect(() => {})`                      |
| `componentWillUnmount` | `useEffect(() => { return () => {} }, [])` |

```jsx
// 类组件
class Example extends React.Component {
    componentDidMount() {
        console.log('挂载');
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.count !== this.state.count) {
            console.log('count 更新');
        }
    }

    componentWillUnmount() {
        console.log('卸载');
    }
}

// Hooks 等价写法
function Example() {
    const [count, setCount] = useState(0);

    useEffect(() => {
        console.log('挂载');

        return () => {
            console.log('卸载');
        };
    }, []);

    useEffect(() => {
        console.log('count 更新');
    }, [count]);
}
```

---

## 第四章：Hooks 深入

### 4.1 useContext（跨层级传递数据）

```jsx
import { createContext, useContext, useState } from 'react';

// 创建 Context
const ThemeContext = createContext();

// 提供者组件
function App() {
    const [theme, setTheme] = useState('light');

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            <Toolbar />
        </ThemeContext.Provider>
    );
}

// 中间组件（不需要传递 props）
function Toolbar() {
    return <ThemedButton />;
}

// 消费者组件
function ThemedButton() {
    const { theme, setTheme } = useContext(ThemeContext);

    return (
        <button
            style={{ background: theme === 'light' ? '#fff' : '#333' }}
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        >
            切换主题
        </button>
    );
}
```

---

### 4.2 useReducer（复杂状态管理）

```jsx
import { useReducer } from 'react';

// Reducer 函数
function reducer(state, action) {
    switch (action.type) {
        case 'increment':
            return { count: state.count + 1 };
        case 'decrement':
            return { count: state.count - 1 };
        case 'reset':
            return { count: 0 };
        default:
            throw new Error();
    }
}

function Counter() {
    const [state, dispatch] = useReducer(reducer, { count: 0 });

    return (
        <div>
            <p>Count: {state.count}</p>
            <button onClick={() => dispatch({ type: 'increment' })}>+</button>
            <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
            <button onClick={() => dispatch({ type: 'reset' })}>重置</button>
        </div>
    );
}
```

**useReducer vs useState**：

-   简单状态用 `useState`
-   复杂状态逻辑用 `useReducer`
-   多个相关状态用 `useReducer`

---

### 4.3 useRef（访问 DOM 和保存值）

```jsx
import { useRef, useEffect } from 'react';

function TextInput() {
    const inputRef = useRef(null);

    useEffect(() => {
        // 自动聚焦
        inputRef.current.focus();
    }, []);

    return <input ref={inputRef} />;
}

// 保存上一次的值
function Counter() {
    const [count, setCount] = useState(0);
    const prevCountRef = useRef();

    useEffect(() => {
        prevCountRef.current = count;
    });

    const prevCount = prevCountRef.current;

    return (
        <div>
            <p>
                当前: {count}, 之前: {prevCount}
            </p>
            <button onClick={() => setCount(count + 1)}>+1</button>
        </div>
    );
}
```

**useRef vs useState**：

-   `useRef` 改变不会触发重新渲染
-   `useState` 改变会触发重新渲染

---

### 4.4 useMemo 和 useCallback（性能优化）

#### useMemo（缓存计算结果）

```jsx
import { useMemo, useState } from 'react';

function ExpensiveComponent({ items }) {
    const [filter, setFilter] = useState('');

    // 只有 items 或 filter 变化时才重新计算
    const filteredItems = useMemo(() => {
        console.log('计算 filteredItems');
        return items.filter((item) => item.includes(filter));
    }, [items, filter]);

    return (
        <div>
            <input value={filter} onChange={(e) => setFilter(e.target.value)} />
            <ul>
                {filteredItems.map((item) => (
                    <li key={item}>{item}</li>
                ))}
            </ul>
        </div>
    );
}
```

#### useCallback（缓存函数）

```jsx
import { useCallback, useState } from 'react';

function Parent() {
    const [count, setCount] = useState(0);

    // 只有 count 变化时才创建新函数
    const handleClick = useCallback(() => {
        console.log('点击了', count);
    }, [count]);

    return <Child onClick={handleClick} />;
}

// 使用 React.memo 避免不必要的重新渲染
const Child = React.memo(({ onClick }) => {
    console.log('Child 渲染');
    return <button onClick={onClick}>点击</button>;
});
```

---

### 4.5 自定义 Hook

```jsx
// useLocalStorage.js
import { useState, useEffect } from 'react';

function useLocalStorage(key, initialValue) {
    const [value, setValue] = useState(() => {
        const saved = localStorage.getItem(key);
        return saved !== null ? JSON.parse(saved) : initialValue;
    });

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);

    return [value, setValue];
}

// 使用
function App() {
    const [name, setName] = useLocalStorage('name', '');

    return <input value={name} onChange={(e) => setName(e.target.value)} />;
}
```

**更多自定义 Hook 示例**：

```jsx
// useFetch
function useFetch(url) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(url)
            .then((res) => res.json())
            .then((data) => {
                setData(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err);
                setLoading(false);
            });
    }, [url]);

    return { data, loading, error };
}

// useToggle
function useToggle(initialValue = false) {
    const [value, setValue] = useState(initialValue);
    const toggle = () => setValue((v) => !v);
    return [value, toggle];
}
```

---

## 第五章：路由与状态管理

### 5.1 React Router

#### 安装

```bash
npm install react-router-dom
```

#### 基础配置

```jsx
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

function App() {
    return (
        <BrowserRouter>
            <nav>
                <Link to="/">首页</Link>
                <Link to="/about">关于</Link>
                <Link to="/users">用户</Link>
            </nav>

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/users" element={<Users />} />
                <Route path="/users/:id" element={<UserDetail />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}
```

#### 编程式导航

```jsx
import { useNavigate, useParams, useLocation } from 'react-router-dom';

function UserDetail() {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();

    return (
        <div>
            <h1>用户 {id}</h1>
            <button onClick={() => navigate('/users')}>返回</button>
            <button onClick={() => navigate(-1)}>后退</button>
        </div>
    );
}
```

---

### 5.2 Redux Toolkit（状态管理）

#### 安装

```bash
npm install @reduxjs/toolkit react-redux
```

#### 创建 Store

```javascript
// store/counterSlice.js
import { createSlice } from '@reduxjs/toolkit';

const counterSlice = createSlice({
    name: 'counter',
    initialState: { value: 0 },
    reducers: {
        increment: (state) => {
            state.value += 1;
        },
        decrement: (state) => {
            state.value -= 1;
        },
        incrementByAmount: (state, action) => {
            state.value += action.payload;
        },
    },
});

export const { increment, decrement, incrementByAmount } = counterSlice.actions;
export default counterSlice.reducer;
```

```javascript
// store/index.js
import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './counterSlice';

export const store = configureStore({
    reducer: {
        counter: counterReducer,
    },
});
```

#### 使用 Redux

```jsx
// main.jsx
import { Provider } from 'react-redux';
import { store } from './store';

ReactDOM.createRoot(document.getElementById('root')).render(
    <Provider store={store}>
        <App />
    </Provider>
);
```

```jsx
// Counter.jsx
import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement, incrementByAmount } from './store/counterSlice';

function Counter() {
    const count = useSelector((state) => state.counter.value);
    const dispatch = useDispatch();

    return (
        <div>
            <p>{count}</p>
            <button onClick={() => dispatch(increment())}>+1</button>
            <button onClick={() => dispatch(decrement())}>-1</button>
            <button onClick={() => dispatch(incrementByAmount(5))}>+5</button>
        </div>
    );
}
```

---

## 第六章：性能优化与进阶

### 6.1 React.memo（避免不必要的渲染）

```jsx
import React from 'react';

// 普通组件：props 变化就重新渲染
function Child({ name }) {
    console.log('Child 渲染');
    return <div>{name}</div>;
}

// 优化后：props 不变就不重新渲染
const Child = React.memo(({ name }) => {
    console.log('Child 渲染');
    return <div>{name}</div>;
});

// 自定义比较函数
const Child = React.memo(
    ({ name }) => <div>{name}</div>,
    (prevProps, nextProps) => {
        return prevProps.name === nextProps.name;
    }
);
```

---

### 6.2 代码分割（懒加载）

```jsx
import { lazy, Suspense } from 'react';

// 懒加载组件
const About = lazy(() => import('./pages/About'));
const Users = lazy(() => import('./pages/Users'));

function App() {
    return (
        <Suspense fallback={<div>加载中...</div>}>
            <Routes>
                <Route path="/about" element={<About />} />
                <Route path="/users" element={<Users />} />
            </Routes>
        </Suspense>
    );
}
```

---

### 6.3 错误边界

```jsx
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.log('错误:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return <h1>出错了</h1>;
        }
        return this.props.children;
    }
}

// 使用
<ErrorBoundary>
    <MyComponent />
</ErrorBoundary>;
```

---

### 6.4 Portals（传送门）

```jsx
import { createPortal } from 'react-dom';

function Modal({ children }) {
    return createPortal(
        <div className="modal">{children}</div>,
        document.getElementById('modal-root')
    );
}
```

---

### 6.5 高阶组件（HOC）

```jsx
// 高阶组件：接收组件，返回新组件
function withLoading(Component) {
    return function WithLoadingComponent({ isLoading, ...props }) {
        if (isLoading) {
            return <div>加载中...</div>;
        }
        return <Component {...props} />;
    };
}

// 使用
const UserListWithLoading = withLoading(UserList);

<UserListWithLoading isLoading={loading} users={users} />;
```

---

### 6.6 Render Props

```jsx
function Mouse({ render }) {
    const [position, setPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMove = (e) => {
            setPosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMove);
        return () => window.removeEventListener('mousemove', handleMove);
    }, []);

    return render(position);
}

// 使用
<Mouse
    render={({ x, y }) => (
        <p>
            鼠标位置: {x}, {y}
        </p>
    )}
/>;
```

---

## 🎯 学习路线建议

1. **第 1 周**：掌握 JSX、组件、Props，能写简单的静态页面
2. **第 2 周**：学习 State、事件处理、表单，做一个 Todo List
3. **第 3 周**：深入 Hooks（useState、useEffect、useContext）
4. **第 4 周**：学习 React Router 和 Redux Toolkit
5. **第 5 周**：性能优化、自定义 Hook，做一个完整项目

## 📚 推荐资源

-   [React 官方文档](https://react.dev/)
-   [React Router 文档](https://reactrouter.com/)
-   [Redux Toolkit 文档](https://redux-toolkit.js.org/)
-   [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
