# 📗 React 深度学习指南

深入理解 React 核心原理、性能优化、设计模式和最佳实践。

---

## 📑 目录

-   [第一部分：Reconciliation 与 Fiber 架构](#第一部分reconciliation-与-fiber-架构)
-   [第二部分：Hooks 深度剖析](#第二部分hooks-深度剖析)
-   [第三部分：组件通信的 8 种方式](#第三部分组件通信的-8-种方式)
-   [第四部分：性能优化实战](#第四部分性能优化实战)
-   [第五部分：设计模式与最佳实践](#第五部分设计模式与最佳实践)
-   [第六部分：常见问题与解决方案](#第六部分常见问题与解决方案)

---

## 第一部分：Reconciliation 与 Fiber 架构

### 1.1 什么是 Reconciliation？

Reconciliation 是 React 用来比较两棵虚拟 DOM 树并找出需要更新的部分的算法。

#### React 15 的 Stack Reconciler（同步递归）

```javascript
// React 15 的问题：同步递归，无法中断
function reconcile(element) {
    // 递归处理子元素
    element.children.forEach((child) => {
        reconcile(child); // 无法中断，会阻塞主线程
    });

    // 更新 DOM
    updateDOM(element);
}
```

**问题**：

-   递归过程不可中断
-   大型应用会导致页面卡顿
-   无法实现优先级调度

---

### 1.2 Fiber 架构（React 16+）

#### Fiber 的核心思想

```javascript
// Fiber 节点结构
const fiber = {
    // 节点类型
    type: 'div',

    // 属性
    props: { className: 'container' },

    // 指针
    child: null, // 第一个子节点
    sibling: null, // 下一个兄弟节点
    return: null, // 父节点

    // 状态
    alternate: null, // 对应的旧 fiber
    effectTag: null, // 副作用标记

    // 优先级
    expirationTime: 0,
};
```

#### Fiber 的工作流程

```javascript
// 1. Render 阶段（可中断）
function workLoop(deadline) {
    let shouldYield = false;

    while (nextUnitOfWork && !shouldYield) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
        shouldYield = deadline.timeRemaining() < 1;
    }

    if (nextUnitOfWork) {
        // 还有工作，继续调度
        requestIdleCallback(workLoop);
    } else {
        // 工作完成，进入 commit 阶段
        commitRoot();
    }
}

// 2. Commit 阶段（同步，不可中断）
function commitRoot() {
    // 一次性提交所有 DOM 更新
    commitWork(root);
}
```

---

### 1.3 Diff 算法优化

#### 三个假设

1. **不同类型的元素会产生不同的树**
2. **通过 key 属性标识哪些子元素是稳定的**
3. **只对同层级节点进行比较**

#### 实现细节

```javascript
function reconcileChildren(fiber, elements) {
    let index = 0;
    let oldFiber = fiber.alternate?.child;
    let prevSibling = null;

    while (index < elements.length || oldFiber) {
        const element = elements[index];
        let newFiber = null;

        const sameType = oldFiber && element && oldFiber.type === element.type;

        if (sameType) {
            // 更新节点
            newFiber = {
                type: oldFiber.type,
                props: element.props,
                dom: oldFiber.dom,
                parent: fiber,
                alternate: oldFiber,
                effectTag: 'UPDATE',
            };
        }

        if (element && !sameType) {
            // 新增节点
            newFiber = {
                type: element.type,
                props: element.props,
                dom: null,
                parent: fiber,
                alternate: null,
                effectTag: 'PLACEMENT',
            };
        }

        if (oldFiber && !sameType) {
            // 删除节点
            oldFiber.effectTag = 'DELETION';
            deletions.push(oldFiber);
        }

        if (oldFiber) {
            oldFiber = oldFiber.sibling;
        }

        if (index === 0) {
            fiber.child = newFiber;
        } else {
            prevSibling.sibling = newFiber;
        }

        prevSibling = newFiber;
        index++;
    }
}
```

---

## 第二部分：Hooks 深度剖析

### 2.1 useState 实现原理

```javascript
let currentFiber = null;
let hookIndex = 0;

function useState(initialValue) {
    const oldHook = currentFiber.alternate?.hooks?.[hookIndex];

    const hook = {
        state: oldHook ? oldHook.state : initialValue,
        queue: [],
    };

    // 处理更新队列
    const actions = oldHook ? oldHook.queue : [];
    actions.forEach((action) => {
        hook.state = typeof action === 'function' ? action(hook.state) : action;
    });

    const setState = (action) => {
        hook.queue.push(action);
        // 触发重新渲染
        scheduleUpdate();
    };

    currentFiber.hooks.push(hook);
    hookIndex++;

    return [hook.state, setState];
}
```

**为什么 Hooks 不能在条件语句中使用？**

```javascript
// ❌ 错误：条件语句会导致 hooks 顺序不一致
function Component() {
    if (condition) {
        const [state, setState] = useState(0); // Hook 1
    }
    const [name, setName] = useState(''); // Hook 2 或 Hook 1
}

// ✅ 正确：保持 hooks 顺序一致
function Component() {
    const [state, setState] = useState(0); // 始终是 Hook 1
    const [name, setName] = useState(''); // 始终是 Hook 2
}
```

---

### 2.2 useEffect 实现原理

```javascript
function useEffect(callback, deps) {
    const oldHook = currentFiber.alternate?.hooks?.[hookIndex];

    const hasChanged =
        !oldHook || !deps || deps.some((dep, i) => dep !== oldHook.deps[i]);

    const hook = {
        callback: hasChanged ? callback : oldHook.callback,
        deps,
        cleanup: oldHook?.cleanup,
    };

    if (hasChanged) {
        // 执行清理函数
        if (oldHook?.cleanup) {
            oldHook.cleanup();
        }

        // 执行副作用
        setTimeout(() => {
            hook.cleanup = hook.callback();
        }, 0);
    }

    currentFiber.hooks.push(hook);
    hookIndex++;
}
```

#### useEffect vs useLayoutEffect

```javascript
// useEffect: 异步执行，不阻塞渲染
useEffect(() => {
    console.log('DOM 已更新，但浏览器还没绘制');
}, []);

// useLayoutEffect: 同步执行，阻塞渲染
useLayoutEffect(() => {
    console.log('DOM 已更新，浏览器还没绘制，会阻塞绘制');
}, []);
```

**使用场景**：

-   `useEffect`：数据获取、订阅、日志等
-   `useLayoutEffect`：DOM 测量、同步 DOM 更新

---

### 2.3 useMemo 和 useCallback 原理

```javascript
function useMemo(factory, deps) {
    const oldHook = currentFiber.alternate?.hooks?.[hookIndex];

    const hasChanged =
        !oldHook || deps.some((dep, i) => dep !== oldHook.deps[i]);

    const hook = {
        value: hasChanged ? factory() : oldHook.value,
        deps,
    };

    currentFiber.hooks.push(hook);
    hookIndex++;

    return hook.value;
}

function useCallback(callback, deps) {
    return useMemo(() => callback, deps);
}
```

#### 何时使用 useMemo？

```javascript
// ❌ 不必要的 useMemo
const value = useMemo(() => 1 + 1, []); // 简单计算，不需要缓存

// ✅ 必要的 useMemo
const expensiveValue = useMemo(() => {
    return items.reduce((acc, item) => {
        // 复杂计算
        return acc + heavyCalculation(item);
    }, 0);
}, [items]);
```

---

### 2.4 自定义 Hook 最佳实践

```javascript
// useLocalStorage
function useLocalStorage(key, initialValue) {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            return initialValue;
        }
    });

    const setValue = (value) => {
        try {
            const valueToStore =
                value instanceof Function ? value(storedValue) : value;

            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(error);
        }
    };

    return [storedValue, setValue];
}

// usePrevious
function usePrevious(value) {
    const ref = useRef();

    useEffect(() => {
        ref.current = value;
    }, [value]);

    return ref.current;
}

// useDebounce
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}
```

---

## 第三部分：组件通信的 8 种方式

### 3.1 Props（父传子）

```jsx
function Parent() {
    return <Child message="Hello" onUpdate={(data) => console.log(data)} />;
}

function Child({ message, onUpdate }) {
    return <button onClick={() => onUpdate('data')}>{message}</button>;
}
```

---

### 3.2 Callback（子传父）

```jsx
function Parent() {
    const handleData = (data) => {
        console.log('收到数据:', data);
    };

    return <Child onData={handleData} />;
}

function Child({ onData }) {
    return <button onClick={() => onData('hello')}>发送</button>;
}
```

---

### 3.3 Context（跨层级）

```jsx
const ThemeContext = createContext('light');

function App() {
    const [theme, setTheme] = useState('light');

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            <Toolbar />
        </ThemeContext.Provider>
    );
}

function Toolbar() {
    return <ThemedButton />;
}

function ThemedButton() {
    const { theme, setTheme } = useContext(ThemeContext);

    return (
        <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
            当前主题: {theme}
        </button>
    );
}
```

---

### 3.4 Redux / Zustand（全局状态）

```javascript
// Zustand 示例
import create from 'zustand';

const useStore = create((set) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 })),
    decrement: () => set((state) => ({ count: state.count - 1 })),
}));

function Counter() {
    const { count, increment, decrement } = useStore();

    return (
        <div>
            <p>{count}</p>
            <button onClick={increment}>+</button>
            <button onClick={decrement}>-</button>
        </div>
    );
}
```

---

### 3.5 EventEmitter（事件总线）

```javascript
// eventBus.js
class EventBus {
    constructor() {
        this.events = {};
    }

    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach((callback) => callback(data));
        }
    }

    off(event, callback) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter(
                (cb) => cb !== callback
            );
        }
    }
}

export const eventBus = new EventBus();

// 组件 A
import { eventBus } from './eventBus';

function ComponentA() {
    const sendData = () => {
        eventBus.emit('update', { message: 'hello' });
    };

    return <button onClick={sendData}>发送</button>;
}

// 组件 B
function ComponentB() {
    useEffect(() => {
        const handleUpdate = (data) => {
            console.log(data);
        };

        eventBus.on('update', handleUpdate);

        return () => {
            eventBus.off('update', handleUpdate);
        };
    }, []);

    return <div>组件 B</div>;
}
```

---

### 3.6 Ref（父访问子）

```jsx
import { forwardRef, useImperativeHandle } from 'react';

const Child = forwardRef((props, ref) => {
    const [count, setCount] = useState(0);

    useImperativeHandle(ref, () => ({
        increment: () => setCount((c) => c + 1),
        getCount: () => count,
    }));

    return <div>Count: {count}</div>;
});

function Parent() {
    const childRef = useRef();

    const handleClick = () => {
        childRef.current.increment();
        console.log(childRef.current.getCount());
    };

    return (
        <>
            <Child ref={childRef} />
            <button onClick={handleClick}>增加</button>
        </>
    );
}
```

---

### 3.7 Render Props

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

### 3.8 HOC（高阶组件）

```jsx
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

## 第四部分：性能优化实战

### 4.1 React.memo

```jsx
// 避免不必要的重新渲染
const ExpensiveComponent = React.memo(({ data }) => {
    console.log('渲染');
    return <div>{data}</div>;
});

// 自定义比较函数
const ExpensiveComponent = React.memo(
    ({ data }) => <div>{data}</div>,
    (prevProps, nextProps) => {
        return prevProps.data.id === nextProps.data.id;
    }
);
```

---

### 4.2 useMemo 优化计算

```jsx
function TodoList({ todos, filter }) {
    // ❌ 每次渲染都会重新计算
    const filteredTodos = todos.filter((todo) => todo.status === filter);

    // ✅ 只在 todos 或 filter 变化时重新计算
    const filteredTodos = useMemo(() => {
        return todos.filter((todo) => todo.status === filter);
    }, [todos, filter]);

    return (
        <ul>
            {filteredTodos.map((todo) => (
                <li key={todo.id}>{todo.text}</li>
            ))}
        </ul>
    );
}
```

---

### 4.3 useCallback 优化函数

```jsx
function Parent() {
    const [count, setCount] = useState(0);

    // ❌ 每次渲染都会创建新函数
    const handleClick = () => {
        console.log('clicked');
    };

    // ✅ 函数只创建一次
    const handleClick = useCallback(() => {
        console.log('clicked');
    }, []);

    return <Child onClick={handleClick} />;
}

const Child = React.memo(({ onClick }) => {
    console.log('Child 渲染');
    return <button onClick={onClick}>点击</button>;
});
```

---

### 4.4 虚拟滚动

```jsx
function VirtualList({ items, itemHeight = 50 }) {
    const [scrollTop, setScrollTop] = useState(0);
    const containerHeight = 600;

    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = startIndex + visibleCount;

    const visibleItems = items.slice(startIndex, endIndex);
    const offsetY = startIndex * itemHeight;

    return (
        <div
            style={{ height: containerHeight, overflow: 'auto' }}
            onScroll={(e) => setScrollTop(e.target.scrollTop)}
        >
            <div style={{ height: items.length * itemHeight }}>
                <div style={{ transform: `translateY(${offsetY}px)` }}>
                    {visibleItems.map((item, index) => (
                        <div
                            key={startIndex + index}
                            style={{ height: itemHeight }}
                        >
                            {item}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
```

---

### 4.5 代码分割

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

## 第五部分：设计模式与最佳实践

### 5.1 容器组件与展示组件

```jsx
// 展示组件：只负责 UI
function UserList({ users, onDelete }) {
    return (
        <ul>
            {users.map((user) => (
                <li key={user.id}>
                    {user.name}
                    <button onClick={() => onDelete(user.id)}>删除</button>
                </li>
            ))}
        </ul>
    );
}

// 容器组件：负责数据和逻辑
function UserListContainer() {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetchUsers().then(setUsers);
    }, []);

    const handleDelete = (id) => {
        deleteUser(id).then(() => {
            setUsers(users.filter((u) => u.id !== id));
        });
    };

    return <UserList users={users} onDelete={handleDelete} />;
}
```

---

### 5.2 Compound Components（复合组件）

```jsx
const Tabs = ({ children }) => {
    const [activeIndex, setActiveIndex] = useState(0);

    return (
        <div>
            {React.Children.map(children, (child, index) => {
                return React.cloneElement(child, {
                    isActive: index === activeIndex,
                    onActivate: () => setActiveIndex(index),
                });
            })}
        </div>
    );
};

const Tab = ({ isActive, onActivate, children }) => {
    return (
        <div
            onClick={onActivate}
            style={{ fontWeight: isActive ? 'bold' : 'normal' }}
        >
            {children}
        </div>
    );
};

// 使用
<Tabs>
    <Tab>Tab 1</Tab>
    <Tab>Tab 2</Tab>
    <Tab>Tab 3</Tab>
</Tabs>;
```

---

## 第六部分：常见问题与解决方案

### 6.1 闭包陷阱

```jsx
// ❌ 问题：获取的是旧值
function Counter() {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCount(count + 1); // count 永远是 0
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return <div>{count}</div>;
}

// ✅ 解决方案 1：函数式更新
setCount((c) => c + 1);

// ✅ 解决方案 2：使用 useRef
const countRef = useRef(count);
countRef.current = count;
```

---

### 6.2 无限循环

```jsx
// ❌ 问题：无限循环
function Component() {
    const [data, setData] = useState([]);

    useEffect(() => {
        setData([...data, 'new']); // 每次都会触发 useEffect
    }, [data]);
}

// ✅ 解决方案：移除依赖
useEffect(() => {
    setData((prev) => [...prev, 'new']);
}, []); // 只执行一次
```

---

### 6.3 内存泄漏

```jsx
// ❌ 问题：组件卸载后仍然更新状态
function Component() {
    const [data, setData] = useState(null);

    useEffect(() => {
        fetchData().then(setData); // 组件卸载后仍会执行
    }, []);
}

// ✅ 解决方案：清理函数
useEffect(() => {
    let cancelled = false;

    fetchData().then((data) => {
        if (!cancelled) {
            setData(data);
        }
    });

    return () => {
        cancelled = true;
    };
}, []);
```

---

## 🎯 学习建议

1. **理解 Fiber**：React 的核心，理解它才能真正掌握 React
2. **熟练 Hooks**：现代 React 的基础，必须熟练掌握
3. **性能优化**：从一开始就要有性能意识
4. **阅读源码**：React 源码质量很高，值得深入学习

## 📚 推荐资源

-   [React 源码解析](https://github.com/facebook/react)
-   [React 技术揭秘](https://react.iamkasong.com/)
-   [React Hooks 完全指南](https://overreacted.io/)
