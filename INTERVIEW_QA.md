# 📝 前端面试题解大全 (Frontend Interview Q&A)

这份文档为您整理了面试中遇到的核心问题解答，涵盖 Vue 原理、网络安全、工程化及算法。

## 1. 自我介绍 (Self Introduction)

> **模板建议**：
> "面试官好，我叫[名字]，有[X]年前端开发经验。
> 我擅长使用 **Vue/React** 技术栈进行全栈开发。
> 在上家公司/项目中，我主要负责了[核心项目名]的开发，重点解决了[难点，如：长列表性能优化/实时通信稳定性]问题。
> 我对[技术领域，如：工程化/可视化]比较感兴趣。
> 今天希望能有机会加入贵公司。"

## 2. 拷打项目 (Project Deep Dive)

> **应对策略 (STAR 法则)**：
>
> -   **Situation (背景)**: 项目是为了解决什么问题？用户量多少？
> -   **Task (任务)**: 你负责哪个模块？难点在哪里？
> -   **Action (行动)**: 你用了什么技术？做了什么优化？（例如：引入虚拟滚动解决卡顿，引入 WebSocket 替换轮询）
> -   **Result (结果)**: 性能提升了多少？用户体验改善了哪里？

## 3. Vue 2 和 Vue 3 的区别

### 核心差异对比表

| 特性       | Vue 2                   | Vue 3                              |
| ---------- | ----------------------- | ---------------------------------- |
| 响应式原理 | `Object.defineProperty` | `Proxy`                            |
| API 风格   | Options API             | Composition API (兼容 Options API) |
| 包体积     | ~32KB                   | ~13KB (Tree-shaking 后更小)        |
| 性能       | 基准                    | 快 1.3-2 倍                        |
| TypeScript | 支持但不完善            | 原生支持，类型推断强               |
| 多根节点   | 不支持                  | 支持 Fragment                      |

### 详细解析

#### 1. 响应式原理升级

**Vue 2 (Object.defineProperty)**:

```javascript
// Vue 2 的响应式实现
Object.defineProperty(obj, 'name', {
    get() {
        // 依赖收集
        return value;
    },
    set(newVal) {
        value = newVal;
        // 触发更新
    },
});
```

**缺陷**：

-   无法监听对象属性的新增/删除 (需要 `Vue.set`)
-   无法监听数组索引和 length 变化
-   初始化时需要递归遍历所有属性，性能开销大

**Vue 3 (Proxy)**:

```javascript
// Vue 3 的响应式实现
const proxy = new Proxy(obj, {
    get(target, key) {
        track(target, key); // 依赖收集
        return Reflect.get(target, key);
    },
    set(target, key, value) {
        const result = Reflect.set(target, key, value);
        trigger(target, key); // 触发更新
        return result;
    },
});
```

**优势**：

-   原生支持数组和对象的所有操作
-   懒代理 (Lazy)：只有访问到深层对象时才代理，性能更好
-   可以监听 13 种操作 (get, set, has, deleteProperty 等)

#### 2. Composition API vs Options API

**Vue 2 (Options API)**:

```javascript
export default {
    data() {
        return { count: 0 };
    },
    methods: {
        increment() {
            this.count++;
        },
    },
    mounted() {
        console.log('mounted');
    },
};
```

**问题**：逻辑分散在不同选项中，复用困难。

**Vue 3 (Composition API)**:

```javascript
import { ref, onMounted } from 'vue';

export default {
    setup() {
        const count = ref(0);
        const increment = () => count.value++;

        onMounted(() => {
            console.log('mounted');
        });

        return { count, increment };
    },
};
```

**优势**：

-   逻辑聚合：相关代码写在一起
-   更好的 TypeScript 支持
-   更灵活的逻辑复用 (自定义 Hooks)

#### 3. 编译优化 (Patch Flag)

Vue 3 在编译阶段会给动态节点打上"补丁标记"：

```html
<div>
    <p>静态文本</p>
    <p>{{ dynamicText }}</p>
</div>
```

编译后：

```javascript
// Vue 3 会标记哪些是动态的
createVNode('p', null, '静态文本'); // 无标记
createVNode('p', null, dynamicText, 1 /* TEXT */); // 标记为动态文本
```

**效果**：Diff 时跳过静态节点，性能提升 50%+。

#### 4. 新特性示例

**Fragment (多根节点)**:

```vue
<!-- Vue 2: 必须有一个根元素 -->
<template>
    <div>
        <h1>Title</h1>
        <p>Content</p>
    </div>
</template>

<!-- Vue 3: 可以有多个根元素 -->
<template>
    <h1>Title</h1>
    <p>Content</p>
</template>
```

**Teleport (传送门)**:

```vue
<template>
    <button @click="open = true">打开弹窗</button>

    <!-- 将弹窗渲染到 body 下，而不是当前组件 -->
    <Teleport to="body">
        <div v-if="open" class="modal">弹窗内容</div>
    </Teleport>
</template>
```

#### 5. 性能对比

根据官方基准测试：

-   **初始化速度**：Vue 3 快 55%
-   **更新速度**：Vue 3 快 133%
-   **内存占用**：Vue 3 减少 54%

## 4. Vue 2 响应式细节 (set & push)

### Vue.set / $set 深度解析

#### 问题场景

```javascript
// Vue 2 中的"坑"
export default {
    data() {
        return {
            user: { name: 'Alice' },
        };
    },
    methods: {
        addAge() {
            // ❌ 这样不会触发视图更新！
            this.user.age = 18;

            // ✅ 必须这样
            this.$set(this.user, 'age', 18);
            // 或者
            this.user = { ...this.user, age: 18 };
        },
    },
};
```

#### 原理剖析

**为什么需要 `$set`？**

```javascript
// Vue 2 初始化时的响应式处理
function observe(data) {
    Object.keys(data).forEach((key) => {
        let value = data[key];
        Object.defineProperty(data, key, {
            get() {
                // 依赖收集
                dep.depend();
                return value;
            },
            set(newVal) {
                value = newVal;
                // 通知更新
                dep.notify();
            },
        });
    });
}
```

**问题**：只有初始化时存在的 `name` 被劫持了，后来新增的 `age` 没有 getter/setter。

**$set 的实现**：

```javascript
function set(target, key, val) {
    // 1. 如果是数组，使用 splice (已被劫持)
    if (Array.isArray(target)) {
        target.splice(key, 1, val);
        return val;
    }

    // 2. 如果属性已存在，直接赋值即可 (已有 setter)
    if (key in target) {
        target[key] = val;
        return val;
    }

    // 3. 核心：为新属性定义响应式
    defineReactive(target, key, val);

    // 4. 手动触发依赖更新
    target.__ob__.dep.notify();

    return val;
}
```

### 数组方法监听原理

#### Vue 2 的数组"黑魔法"

```javascript
// Vue 2 源码：重写数组原型方法
const arrayProto = Array.prototype;
const arrayMethods = Object.create(arrayProto);

['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'].forEach(
    (method) => {
        const original = arrayProto[method];

        Object.defineProperty(arrayMethods, method, {
            value: function (...args) {
                // 1. 先执行原生方法
                const result = original.apply(this, args);

                // 2. 获取新增的元素
                let inserted;
                switch (method) {
                    case 'push':
                    case 'unshift':
                        inserted = args;
                        break;
                    case 'splice':
                        inserted = args.slice(2);
                        break;
                }

                // 3. 对新增元素进行响应式处理
                if (inserted) {
                    this.__ob__.observeArray(inserted);
                }

                // 4. 手动触发更新
                this.__ob__.dep.notify();

                return result;
            },
        });
    }
);
```

#### 使用示例

```javascript
export default {
    data() {
        return {
            list: [1, 2, 3],
        };
    },
    methods: {
        addItem() {
            // ✅ 会触发更新 (push 被劫持)
            this.list.push(4);

            // ❌ 不会触发更新 (直接索引赋值)
            this.list[3] = 4;

            // ✅ 解决方案
            this.$set(this.list, 3, 4);
            // 或者
            this.list.splice(3, 1, 4);
        },
    },
};
```

#### 为什么不劫持数组索引？

**性能考虑**：

-   数组可能有成千上万个元素，为每个索引都定义 getter/setter 性能开销巨大。
-   数组的常见操作 (push, splice) 已经被重写，能覆盖 90% 的场景。

**Vue 3 的改进**：

```javascript
// Vue 3 用 Proxy 原生支持数组索引
const arr = reactive([1, 2, 3]);
arr[0] = 100; // ✅ 自动触发更新
arr.length = 0; // ✅ 也能触发更新
```

## 5. Vue 和 React 渲染原理区别

-   **Vue (可变数据)**：
    -   利用响应式系统，精确知道哪些组件依赖了哪些数据。
    -   数据变化时，自动触发对应组件的更新，不需要手动优化 (shouldComponentUpdate)。
-   **React (不可变数据)**：
    -   状态变化时，默认从根节点重新渲染整个子树。
    -   需要配合 `Virtual DOM Diff` 和手动优化 (`React.memo`, `useMemo`) 来跳过不必要的渲染。

## 6. Vue Scoped 样式穿透

-   **原理**：Vue 通过 PostCSS 给组件内的 DOM 添加唯一的自定义属性 (如 `data-v-123`)，CSS 选择器也会加上这个属性选择器 (如 `.box[data-v-123]`)。
-   **穿透方法**：
    -   **Vue 2**: `>>>` 或 `/deep/`
        ```css
        .parent /deep/ .child {
            color: red;
        }
        ```
    -   **Vue 3**: `::v-deep()`
        ```css
        :deep(.child) {
            color: red;
        }
        ```

## 7. HTTPS 建立连接与数字证书

-   **流程 (TLS 握手)**：
    1.  **Client Hello**: 客户端发送支持的加密套件和随机数。
    2.  **Server Hello**: 服务端返回选定的加密套件、随机数和**数字证书**。
    3.  **验证证书**: 客户端验证证书的合法性 (有效期、颁发机构、域名)。
    4.  **密钥交换**: 验证通过后，利用证书公钥加密生成“预主密钥”发给服务端。
    5.  **生成会话密钥**: 双方利用随机数和预主密钥生成对称加密的 Session Key，之后的通信都用这个 Key 加密。
-   **证书可靠性**：
    -   **数字签名**: CA (证书颁发机构) 用自己的私钥对证书内容进行签名。客户端用内置的 CA 公钥解密签名，比对哈希值，确保未被篡改。

## 8. 根证书 (Root Certificate)

-   **定义**：信任链的起点。根证书是自签名的 (自己信任自己)。
-   **信任来源**：操作系统 (Windows/macOS) 和浏览器出厂时内置了受信任的根证书列表。如果证书链能追溯到这些内置的根证书，就被认为是安全的。

## 9. URL 输入到页面渲染全过程

1.  **DNS 解析**: 域名 -> IP 地址。
2.  **TCP 连接**: 三次握手。
3.  **发送 HTTP 请求**: 浏览器发送 GET 请求。
4.  **服务器处理**: 返回 HTML 文件。
5.  **浏览器解析渲染**:
    -   解析 HTML 生成 **DOM 树**。
    -   解析 CSS 生成 **CSSOM 树**。
    -   合并生成 **Render Tree (渲染树)**。
    -   **Layout (回流/重排)**: 计算元素位置和大小。
    -   **Paint (重绘)**: 绘制像素。
    -   **Composite**: 合成图层，显示在屏幕上。

## 10. Tailwind CSS 映射原理

-   Tailwind 是一个 **Utility-first** 的 CSS 框架。
-   它不是在浏览器运行时建立映射，而是在 **构建阶段 (Build Time)**。
-   **JIT (Just-In-Time) 引擎**会扫描你的 HTML/JS/Vue 文件，提取出所有用到的类名 (如 `text-center`, `p-4`)，然后动态生成对应的 CSS 规则。

## 11. Tailwind 怎么减少冗余 CSS

-   **按需生成 (Purge/JIT)**：
    -   传统的 CSS 框架 (如 Bootstrap) 会把所有样式打包进去，文件很大。
    -   Tailwind (特别是开启 JIT 后) **只生成你用到的样式**。如果你没用 `mt-10`，最终的 CSS 文件里就没有这一行。这使得生产环境的 CSS 文件非常小 (通常 < 10kb)。

## 12. 浏览器缓存 (Browser Cache)

-   **强缓存 (不用发请求)**：
    -   `Cache-Control: max-age=3600` (优先级高，HTTP/1.1)
    -   `Expires` (HTTP/1.0)
-   **协商缓存 (发请求问服务器)**：
    -   如果强缓存失效，浏览器发送请求带上 `If-None-Match` (对应 ETag) 或 `If-Modified-Since` (对应 Last-Modified)。
    -   如果服务器判断文件没变，返回 **304 Not Modified**，浏览器继续用本地缓存。

## 13. Pinia 和 Vuex 的区别

1.  **API 设计**：Pinia 去掉了 `Mutation`，只有 `State`, `Getter`, `Action` (支持同步和异步)，更简洁。
2.  **TypeScript**：Pinia 原生支持 TS，推断能力极强；Vuex 对 TS 支持较差。
3.  **体积**：Pinia 更轻量 (约 1kb)。
4.  **架构**：Pinia 没有嵌套的模块 (Modules)，每个 Store 都是独立的，扁平化设计。

## 14. XSS 攻击与预防

-   **定义**: 跨站脚本攻击 (Cross-Site Scripting)，恶意脚本注入到网页中执行。
-   **类型**:
    -   **存储型**: 恶意脚本存入数据库 (如评论区)。
    -   **反射型**: 恶意脚本在 URL 参数中。
    -   **DOM 型**: 前端 JS 操作 DOM 时不慎插入代码。
-   **预防**:
    1.  **转义 (Escaping)**: 对用户输入进行 HTML 实体转义 (如 `<` 转 `&lt;`)。现代框架 (Vue/React) 默认已做。
    2.  **CSP (内容安全策略)**: 设置 HTTP 头 `Content-Security-Policy`，限制脚本加载源。
    3.  **HttpOnly Cookie**: 防止 JS 读取 Cookie。

## 15. Vue 2 vs Vue 3 双向绑定原理

-   **Vue 2 (Object.defineProperty)**:
    -   递归遍历对象所有属性，进行劫持。
    -   缺点：初始化慢 (递归)，无法监听新增属性/删除属性/数组索引。
-   **Vue 3 (Proxy)**:
    -   直接代理整个对象。
    -   只有访问到深层属性时才递归代理 (Lazy)，性能好。
    -   原生支持数组和动态属性监听。

## 16. 文件上传安全 (防止图床/WebShell)

1.  **后缀名白名单**: 只允许 `.jpg`, `.png`，禁止 `.php`, `.html`, `.sh`。
2.  **MIME Type 检查**: 检查文件头 (Magic Number) 而不仅仅是后缀。
3.  **重命名**: 上传后随机生成文件名，防止覆盖或利用原文件名攻击。
4.  **存储隔离**: 不要把文件存在 Web 服务器目录下，存在专门的 **OSS/S3** 对象存储中。
5.  **不执行权限**: 确保上传目录没有“执行脚本”的权限。

## 17. SSR vs SSG

-   **SSR (Server-Side Rendering)**:
    -   **服务端渲染**。每次用户请求，服务器实时运行 JS 生成 HTML。
    -   **优点**: SEO 好，首屏快，数据实时。
    -   **缺点**: 服务器压力大。
    -   **场景**: 动态内容多的网站 (如微博、电商)。
-   **SSG (Static Site Generation)**:
    -   **静态站点生成**。构建时 (Build time) 生成好所有 HTML 页面。
    -   **优点**: 访问速度极快 (纯静态文件)，服务器压力小。
    -   **缺点**: 内容更新需要重新构建发布。
    -   **场景**: 博客、文档站。

## 18. 算法题：删除数组重复元素

```javascript
// 方法 1: Set (最常用)
const arr = [1, 2, 2, 3, 3, 4];
const unique1 = [...new Set(arr)];
// 或者 Array.from(new Set(arr))

// 方法 2: filter + indexOf
const unique2 = arr.filter((item, index) => {
    return arr.indexOf(item) === index;
});

// 方法 3: Map (性能好)
const unique3 = [];
const map = new Map();
for (const item of arr) {
    if (!map.has(item)) {
        map.set(item, true);
        unique3.push(item);
    }
}
```

---

## 💼 字节跳动前端一面真题解析

### 19. H5 如何和客户端进行通信 (JSBridge)

**JSBridge** 是实现 H5 页面和 Native 客户端（iOS/Android）双向通信的桥梁。

#### 通信原理

**1. H5 调用 Native**

**方案一：URL Scheme 拦截 (传统方案)**

```javascript
// H5 端
function callNative(method, params) {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = `myapp://${method}?params=${JSON.stringify(params)}`;
    document.body.appendChild(iframe);
    setTimeout(() => document.body.removeChild(iframe), 100);
}

callNative('getUserInfo', { userId: 123 });
```

Native 端拦截 URL：

```swift
// iOS (WKWebView)
func webView(_ webView: WKWebView,
             decidePolicyFor navigationAction: WKNavigationAction) {
  if let url = navigationAction.request.url,
     url.scheme == "myapp" {
    // 解析 URL，执行对应的 Native 方法
    handleJSBridge(url)
    return .cancel
  }
  return .allow
}
```

**方案二：注入全局对象 (现代方案)**

**Android:**

```java
// Native 端注入
webView.addJavascriptInterface(new JSBridge(), "NativeBridge");

public class JSBridge {
  @JavascriptInterface
  public String getUserInfo(String userId) {
    // 执行 Native 逻辑
    return "{\"name\":\"Alice\"}";
  }
}
```

```javascript
// H5 端调用
const userInfo = window.NativeBridge.getUserInfo('123');
```

**iOS (WKWebView):**

```swift
// Native 端注册
webView.configuration.userContentController
  .add(self, name: "getUserInfo")

func userContentController(_ controller: WKUserContentController,
                           didReceive message: WKScriptMessage) {
  if message.name == "getUserInfo" {
    // 处理逻辑
  }
}
```

```javascript
// H5 端调用
window.webkit.messageHandlers.getUserInfo.postMessage({ userId: 123 });
```

**2. Native 调用 H5**

```swift
// iOS
webView.evaluateJavaScript("window.onNativeCallback({data: 'hello'})")

// Android
webView.loadUrl("javascript:window.onNativeCallback({data: 'hello'})")
```

#### 完整的 JSBridge 封装

```javascript
class JSBridge {
    constructor() {
        this.callbacks = {}; // 存储回调函数
        this.callbackId = 0;
    }

    // H5 调用 Native
    call(method, params, callback) {
        const id = this.callbackId++;
        this.callbacks[id] = callback;

        if (window.NativeBridge) {
            // Android
            window.NativeBridge.call(method, JSON.stringify(params), id);
        } else if (window.webkit) {
            // iOS
            window.webkit.messageHandlers.call.postMessage({
                method,
                params,
                callbackId: id,
            });
        }
    }

    // Native 回调 H5
    onCallback(callbackId, data) {
        const callback = this.callbacks[callbackId];
        if (callback) {
            callback(data);
            delete this.callbacks[callbackId];
        }
    }
}

// 使用
const bridge = new JSBridge();
bridge.call('getUserInfo', { userId: 123 }, (data) => {
    console.log('用户信息:', data);
});
```

### 20. 一码多端技术方案

**一码多端**指使用同一套代码部署到多个平台（Web、iOS、Android、小程序等）。

#### 主流方案对比

| 方案            | 原理                   | 优势             | 劣势                 | 代表               |
| --------------- | ---------------------- | ---------------- | -------------------- | ------------------ |
| **编译时转换**  | 将源码编译成各平台代码 | 性能好，接近原生 | 平台差异需要条件编译 | Taro, Uni-app      |
| **运行时适配**  | 运行时动态适配平台 API | 开发体验好       | 性能略差             | Kbone              |
| **自绘引擎**    | 自己实现渲染引擎       | 跨平台一致性强   | 包体积大，学习成本高 | Flutter            |
| **Bridge 通信** | JS 调用 Native 组件    | 可复用 Web 生态  | 性能瓶颈在 Bridge    | React Native, Weex |

#### Taro 编译流程示例

```
React/Vue 源码
    ↓ (AST 解析)
抽象语法树
    ↓ (平台适配)
├─ 微信小程序 (WXML + WXSS)
├─ 支付宝小程序 (AXML + ACSS)
├─ H5 (HTML + CSS)
└─ React Native (JSX)
```

### 21. 小程序双线程模型

#### 架构图

```
┌─────────────────────────────────────┐
│         Native 层 (微信客户端)        │
│  ┌──────────────┐  ┌──────────────┐ │
│  │  视图层 (View) │  │ 逻辑层 (App)  │ │
│  │   WebView    │  │  JS Engine   │ │
│  │  渲染 WXML   │  │  执行 JS     │ │
│  └──────┬───────┘  └───────┬──────┘ │
│         │                  │        │
│         └────── JSBridge ───┘        │
└─────────────────────────────────────┘
```

#### 为什么要双线程？

**1. 安全隔离**

-   逻辑层无法直接操作 DOM，防止恶意代码注入。
-   视图层无法执行任意 JS，防止 XSS 攻击。

**2. 性能优化**

-   逻辑层和视图层并行运行，互不阻塞。
-   即使 JS 计算量大，也不会卡住 UI 渲染。

#### 通信机制

```javascript
// 逻辑层 (page.js)
Page({
    data: { count: 0 },
    increment() {
        this.setData({ count: this.data.count + 1 });
        // setData 会将数据序列化成 JSON，通过 JSBridge 发送到视图层
    },
});
```

**数据流**:

```
逻辑层 setData({ count: 1 })
    ↓ (序列化)
JSON 字符串: '{"count":1}'
    ↓ (JSBridge)
视图层接收
    ↓ (反序列化 + Diff)
更新 Virtual DOM
    ↓
渲染真实 DOM
```

**性能陷阱**:

```javascript
// ❌ 频繁 setData 会导致性能问题
for (let i = 0; i < 100; i++) {
    this.setData({ count: i }); // 触发 100 次通信！
}

// ✅ 批量更新
this.setData({ count: 100 });
```

### 22. 小程序审核后能否替换内容？

**答案：不可以（技术上可以，但违规）**

#### 技术限制

1. **代码包限制**：小程序的所有代码必须在审核包中，禁止动态下载执行远程 JS。
2. **内容安全检测**：微信会对后端返回的动态内容进行**实时检测**（文本、图片）。

#### 违规后果

```
第一次: 警告 + 限制发布
第二次: 下架 7-30 天
第三次: 永久封禁
```

#### 合规的动态内容更新

```javascript
// ✅ 允许：后端返回的业务数据
wx.request({
    url: 'https://api.example.com/products',
    success(res) {
        // 动态展示商品列表（内容合规）
        this.setData({ products: res.data });
    },
});

// ❌ 禁止：动态加载远程代码
eval(remoteCode); // 违规！
new Function(remoteCode)(); // 违规！
```

### 23. 不用框架实现 SPA (单页应用)

#### Hash 模式实现

```html
<!DOCTYPE html>
<html>
    <head>
        <title>Simple SPA</title>
    </head>
    <body>
        <nav>
            <a href="#/">首页</a>
            <a href="#/about">关于</a>
            <a href="#/contact">联系</a>
        </nav>
        <div id="app"></div>

        <script>
            // 路由配置
            const routes = {
                '/': '<h1>首页</h1><p>欢迎来到首页</p>',
                '/about': '<h1>关于</h1><p>这是关于页面</p>',
                '/contact': '<h1>联系</h1><p>联系我们：contact@example.com</p>',
            };

            // 路由渲染函数
            function render() {
                const hash = window.location.hash.slice(1) || '/';
                const content = routes[hash] || '<h1>404</h1><p>页面不存在</p>';
                document.getElementById('app').innerHTML = content;
            }

            // 监听 hash 变化
            window.addEventListener('hashchange', render);

            // 初始化
            render();
        </script>
    </body>
</html>
```

#### History 模式实现

```javascript
class Router {
    constructor(routes) {
        this.routes = routes;
        this.init();
    }

    init() {
        // 监听 popstate (浏览器前进/后退)
        window.addEventListener('popstate', () => this.render());

        // 拦截所有 <a> 标签点击
        document.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                e.preventDefault();
                const path = e.target.getAttribute('href');
                this.push(path);
            }
        });

        this.render();
    }

    push(path) {
        window.history.pushState({}, '', path);
        this.render();
    }

    render() {
        const path = window.location.pathname;
        const content = this.routes[path] || '<h1>404</h1>';
        document.getElementById('app').innerHTML = content;
    }
}

// 使用
new Router({
    '/': '<h1>首页</h1>',
    '/about': '<h1>关于</h1>',
});
```

### 24. 小程序 vs H5 渲染对比

| 维度         | 小程序                              | H5                           |
| ------------ | ----------------------------------- | ---------------------------- |
| **渲染架构** | 双线程 (逻辑层 + 视图层)            | 单线程 (JS + 渲染共用主线程) |
| **首屏加载** | 代码包预下载 + 本地缓存             | 实时下载资源                 |
| **组件**     | Native 组件 (如 `<map>`, `<video>`) | DOM 模拟，性能较差           |
| **动画**     | 支持 GPU 加速的 `transform`         | 依赖 CSS/JS，可能卡顿        |
| **网络请求** | 走 Native 网络栈，支持 HTTP/2       | 受浏览器限制                 |
| **包体积**   | 主包 2MB，分包 20MB                 | 无限制                       |

**为什么小程序更快？**

1. **预加载**：代码包提前下载并缓存。
2. **原生组件**：地图、视频等直接调用 Native，性能高。
3. **双线程**：JS 计算不阻塞 UI 渲染。
4. **优化编译**：WXML 编译成高效的渲染指令。

### 25. Vue MVVM 模式详解

#### MVVM 架构图

```
┌──────────┐      ┌──────────────┐      ┌──────────┐
│  Model   │◄────►│  ViewModel   │◄────►│   View   │
│ (数据层)  │      │  (Vue 实例)   │      │  (DOM)   │
└──────────┘      └──────────────┘      └──────────┘
                         │
                    数据双向绑定
```

#### 核心实现原理

**1. 数据劫持 (Reactivity)**

```javascript
// Vue 2: Object.defineProperty
function observe(obj) {
    Object.keys(obj).forEach((key) => {
        let value = obj[key];
        const dep = new Dep(); // 依赖收集器

        Object.defineProperty(obj, key, {
            get() {
                if (Dep.target) {
                    dep.addSub(Dep.target); // 收集依赖
                }
                return value;
            },
            set(newVal) {
                if (newVal !== value) {
                    value = newVal;
                    dep.notify(); // 通知更新
                }
            },
        });
    });
}
```

**2. 依赖收集 (Dep)**

```javascript
class Dep {
    constructor() {
        this.subs = []; // 订阅者列表
    }

    addSub(watcher) {
        this.subs.push(watcher);
    }

    notify() {
        this.subs.forEach((watcher) => watcher.update());
    }
}
```

**3. 观察者 (Watcher)**

```javascript
class Watcher {
    constructor(vm, key, callback) {
        this.vm = vm;
        this.key = key;
        this.callback = callback;

        Dep.target = this; // 设置当前 Watcher
        this.value = vm[key]; // 触发 getter，完成依赖收集
        Dep.target = null;
    }

    update() {
        const newValue = this.vm[this.key];
        if (newValue !== this.value) {
            this.value = newValue;
            this.callback(newValue);
        }
    }
}
```

**4. 完整示例**

```javascript
// 数据
const data = { message: 'Hello' };
observe(data);

// 创建 Watcher (模拟 Vue 的渲染 Watcher)
new Watcher(data, 'message', (newVal) => {
    document.getElementById('app').textContent = newVal;
});

// 修改数据，自动更新视图
data.message = 'Hello Vue!'; // DOM 自动更新
```

### 26. 性能优化全景图

#### 1. 加载性能优化

**资源优化**

```javascript
// 代码分割 (Code Splitting)
const Home = () => import('./views/Home.vue');

// 图片懒加载
<img loading="lazy" src="image.jpg">

// 预加载关键资源
<link rel="preload" href="font.woff2" as="font">
```

**网络优化**

```nginx
# Nginx 配置 Gzip
gzip on;
gzip_types text/css application/javascript;

# 开启 HTTP/2
listen 443 ssl http2;
```

#### 2. 渲染性能优化

**减少重排/重绘**

```javascript
// ❌ 触发多次重排
for (let i = 0; i < 100; i++) {
    element.style.top = i + 'px'; // 每次都重排
}

// ✅ 使用 transform (只触发合成)
element.style.transform = `translateY(${i}px)`;
```

**虚拟滚动**

```javascript
// 只渲染可见区域的 20 条数据
const visibleData = allData.slice(startIndex, endIndex);
```

#### 3. JavaScript 优化

**防抖/节流**

```javascript
// 防抖：停止触发后才执行
function debounce(fn, delay) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

// 节流：固定时间间隔执行
function throttle(fn, delay) {
    let last = 0;
    return function (...args) {
        const now = Date.now();
        if (now - last > delay) {
            last = now;
            fn.apply(this, args);
        }
    };
}
```

### 27. 算法：进制转换

```javascript
// 10 进制转 N 进制
function toBase(num, base) {
    if (num === 0) return '0';

    const digits = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';

    while (num > 0) {
        result = digits[num % base] + result;
        num = Math.floor(num / base);
    }

    return result;
}

console.log(toBase(255, 16)); // "FF"
console.log(toBase(10, 2)); // "1010"

// N 进制转 10 进制
function fromBase(str, base) {
    const digits = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = 0;

    for (let i = 0; i < str.length; i++) {
        const digit = digits.indexOf(str[i].toUpperCase());
        result = result * base + digit;
    }

    return result;
}

console.log(fromBase('FF', 16)); // 255
console.log(fromBase('1010', 2)); // 10
```

### 28. 算法：最长公共前缀

```javascript
/**
 * LeetCode 14: Longest Common Prefix
 * @param {string[]} strs
 * @return {string}
 */
function longestCommonPrefix(strs) {
    if (!strs || strs.length === 0) return '';

    // 方法一：横向扫描
    let prefix = strs[0];

    for (let i = 1; i < strs.length; i++) {
        while (strs[i].indexOf(prefix) !== 0) {
            prefix = prefix.slice(0, -1);
            if (!prefix) return '';
        }
    }

    return prefix;
}

// 方法二：纵向扫描 (逐字符比较)
function longestCommonPrefix2(strs) {
    if (!strs || strs.length === 0) return '';

    for (let i = 0; i < strs[0].length; i++) {
        const char = strs[0][i];

        for (let j = 1; j < strs.length; j++) {
            if (i >= strs[j].length || strs[j][i] !== char) {
                return strs[0].slice(0, i);
            }
        }
    }

    return strs[0];
}

console.log(longestCommonPrefix(['flower', 'flow', 'flight'])); // "fl"
console.log(longestCommonPrefix(['dog', 'racecar', 'car'])); // ""
```

### 29. 发布订阅模式 (EventEmitter)

```javascript
class EventEmitter {
    constructor() {
        this.events = {}; // { eventName: [callback1, callback2, ...] }
    }

    // 订阅事件
    on(eventName, callback) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(callback);
        return this; // 支持链式调用
    }

    // 发布事件
    emit(eventName, ...args) {
        const callbacks = this.events[eventName];
        if (callbacks) {
            callbacks.forEach((callback) => callback(...args));
        }
        return this;
    }

    // 取消订阅
    off(eventName, callback) {
        const callbacks = this.events[eventName];
        if (callbacks) {
            if (callback) {
                // 移除特定回调
                this.events[eventName] = callbacks.filter(
                    (cb) => cb !== callback
                );
            } else {
                // 移除所有回调
                delete this.events[eventName];
            }
        }
        return this;
    }

    // 只订阅一次
    once(eventName, callback) {
        const wrapper = (...args) => {
            callback(...args);
            this.off(eventName, wrapper);
        };
        this.on(eventName, wrapper);
        return this;
    }
}

// 使用示例
const emitter = new EventEmitter();

const handler1 = (data) => console.log('Handler 1:', data);
const handler2 = (data) => console.log('Handler 2:', data);

emitter.on('dataChange', handler1);
emitter.on('dataChange', handler2);

emitter.emit('dataChange', { value: 100 });
// 输出:
// Handler 1: { value: 100 }
// Handler 2: { value: 100 }

emitter.off('dataChange', handler1);
emitter.emit('dataChange', { value: 200 });
// 输出:
// Handler 2: { value: 200 }

// once 示例
emitter.once('init', () => console.log('初始化完成'));
emitter.emit('init'); // 输出: 初始化完成
emitter.emit('init'); // 不输出 (已自动取消订阅)
```

**发布订阅 vs 观察者模式**

| 特性       | 发布订阅模式                       | 观察者模式                     |
| ---------- | ---------------------------------- | ------------------------------ |
| **耦合度** | 低 (通过事件中心解耦)              | 高 (Subject 直接维护 Observer) |
| **中介**   | 有 (Event Channel)                 | 无                             |
| **应用**   | Vue EventBus, Node.js EventEmitter | Vue 响应式系统 (Dep + Watcher) |

### 30. 算法：列表转树 (List to Tree)

**题目**：将扁平的列表数据转换为树形结构。

#### 输入数据示例

```javascript
const list = [
    { id: 1, name: '部门1', pid: 0 },
    { id: 2, name: '部门2', pid: 1 },
    { id: 3, name: '部门3', pid: 1 },
    { id: 4, name: '部门4', pid: 3 },
    { id: 5, name: '部门5', pid: 4 },
    { id: 6, name: '部门6', pid: 0 },
];
```

#### 期望输出

```javascript
[
    {
        id: 1,
        name: '部门1',
        pid: 0,
        children: [
            {
                id: 2,
                name: '部门2',
                pid: 1,
                children: [],
            },
            {
                id: 3,
                name: '部门3',
                pid: 1,
                children: [
                    {
                        id: 4,
                        name: '部门4',
                        pid: 3,
                        children: [
                            { id: 5, name: '部门5', pid: 4, children: [] },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: 6,
        name: '部门6',
        pid: 0,
        children: [],
    },
];
```

#### 解法一：递归法 (时间复杂度 O(n²))

**核心思想**：对于每个节点，递归查找其所有子节点。

```javascript
function listToTree(list, pid = 0) {
    const result = [];

    for (const item of list) {
        if (item.pid === pid) {
            // 递归查找子节点
            const children = listToTree(list, item.id);
            result.push({
                ...item,
                children,
            });
        }
    }

    return result;
}

const tree = listToTree(list);
console.log(JSON.stringify(tree, null, 2));
```

##### 递归执行过程图解

**测试数据**：

```javascript
const list = [
    { id: 1, name: '部门1', pid: 0 },
    { id: 2, name: '部门2', pid: 1 },
    { id: 3, name: '部门3', pid: 1 },
    { id: 4, name: '部门4', pid: 3 },
];
```

**调用栈展开**：

```
listToTree(list, 0) ← 第一次调用，查找 pid=0 的节点
  ↓
  遍历 list，找到 { id: 1, pid: 0 }
  ↓
  递归调用: listToTree(list, 1) ← 查找 id=1 的子节点
    ↓
    遍历 list，找到 { id: 2, pid: 1 }
    ↓
    递归调用: listToTree(list, 2) ← 查找 id=2 的子节点
      ↓
      遍历 list，没找到 pid=2 的节点
      ↓
      返回 [] ← 空数组
    ↓
    继续遍历，找到 { id: 3, pid: 1 }
    ↓
    递归调用: listToTree(list, 3) ← 查找 id=3 的子节点
      ↓
      遍历 list，找到 { id: 4, pid: 3 }
      ↓
      递归调用: listToTree(list, 4) ← 查找 id=4 的子节点
        ↓
        遍历 list，没找到 pid=4 的节点
        ↓
        返回 [] ← 空数组
      ↓
      返回 [{ id: 4, children: [] }]
    ↓
    返回 [{ id: 2, children: [] }, { id: 3, children: [{ id: 4, ... }] }]
  ↓
  返回 [{ id: 1, children: [{ id: 2, ... }, { id: 3, ... }] }]
```

##### 逐步执行详解

**第 1 步：查找根节点 (pid=0)**

```javascript
listToTree(list, 0);
// 遍历 list
// item = { id: 1, pid: 0 } ✅ 匹配
// 需要找 id=1 的子节点 → 递归调用
```

**第 2 步：查找 id=1 的子节点**

```javascript
listToTree(list, 1);
// 遍历 list
// item = { id: 2, pid: 1 } ✅ 匹配
// 需要找 id=2 的子节点 → 递归调用

// item = { id: 3, pid: 1 } ✅ 匹配
// 需要找 id=3 的子节点 → 递归调用
```

**第 3 步：查找 id=2 的子节点**

```javascript
listToTree(list, 2);
// 遍历 list
// 没有 pid=2 的节点
// 返回 []
```

**第 4 步：查找 id=3 的子节点**

```javascript
listToTree(list, 3);
// 遍历 list
// item = { id: 4, pid: 3 } ✅ 匹配
// 需要找 id=4 的子节点 → 递归调用
```

**第 5 步：查找 id=4 的子节点**

```javascript
listToTree(list, 4);
// 遍历 list
// 没有 pid=4 的节点
// 返回 []
```

**回溯组装**：

```javascript
// 第5步返回 [] 给第4步
// 第4步组装: { id: 4, children: [] }，返回给第2步

// 第3步返回 [] 给第2步
// 第2步组装:
//   { id: 2, children: [] }
//   { id: 3, children: [{ id: 4, children: [] }] }
// 返回给第1步

// 第1步组装:
//   { id: 1, children: [{ id: 2, ... }, { id: 3, ... }] }
```

##### 为什么时间复杂度是 O(n²)？

**分析**：

```javascript
// 假设有 n 个节点
listToTree(list, 0)
  ↓
  遍历 n 个节点 (外层循环)
    ↓
    每个节点都可能触发递归
      ↓
      递归内部又遍历 n 个节点 (内层循环)
```

**最坏情况**（链式结构）：

```
部门1 (pid=0)
  └─ 部门2 (pid=1)
      └─ 部门3 (pid=2)
          └─ 部门4 (pid=3)
```

**遍历次数**：

-   查找 pid=0：遍历 4 次
-   查找 pid=1：遍历 4 次
-   查找 pid=2：遍历 4 次
-   查找 pid=3：遍历 4 次
-   **总计**：4 × 4 = 16 次 = O(n²)

##### 优化思路

**问题**：每次递归都要遍历整个数组。

**改进方向**：

1. **提前分组**：先把数据按 `pid` 分组，避免重复遍历。
2. **使用 Map**：建立 `id → node` 的映射，O(1) 查找（这就是解法二）。

**优点**：代码简洁，易理解。  
**缺点**：每次都要遍历整个列表，性能较差。  
**适用场景**：数据量小（< 100）、代码可读性优先的场景。

#### 解法二：Map 映射法 (时间复杂度 O(n)) ⭐ 推荐

**核心思想**：先建立"身份证档案"（Map），再根据"父子关系"（pid）把节点挂到对应的家族树上。

##### 图解执行过程

**原始数据**：

```javascript
const list = [
    { id: 1, name: '部门1', pid: 0 },
    { id: 2, name: '部门2', pid: 1 },
    { id: 3, name: '部门3', pid: 1 },
    { id: 4, name: '部门4', pid: 3 },
];
```

**第一步：建立 Map 映射（建档案）**

目的：为每个节点创建一个"带 children 的副本"，并用 Map 快速查找。

```javascript
// 执行后 Map 的内容：
map = {
  1 => { id: 1, name: '部门1', pid: 0, children: [] },
  2 => { id: 2, name: '部门2', pid: 1, children: [] },
  3 => { id: 3, name: '部门3', pid: 1, children: [] },
  4 => { id: 4, name: '部门4', pid: 3, children: [] }
}
```

**第二步：建立父子关系（挂到家族树）**

遍历每个节点，根据 `pid` 找到父节点，把自己塞进父节点的 `children`。

**处理 id=1**：

```javascript
const node = map.get(1);
if (item.pid === 0) {
    result.push(node); // pid=0 是根节点
}
// result = [{ id: 1, name: '部门1', pid: 0, children: [] }]
```

**处理 id=2**：

```javascript
const node = map.get(2);
const parent = map.get(1); // 找到父节点 (id=1)
parent.children.push(node); // 把自己塞进父节点的 children

// 此时 map.get(1).children = [{ id: 2, name: '部门2', pid: 1, children: [] }]
```

**处理 id=3**：

```javascript
const parent = map.get(1);
parent.children.push(map.get(3));

// 此时 map.get(1).children = [部门2, 部门3]
```

**处理 id=4**：

```javascript
const parent = map.get(3); // 父节点是 id=3
parent.children.push(map.get(4));

// 此时 map.get(3).children = [部门4]
```

**最终树结构**：

```
部门1 (id=1)
  ├─ 部门2 (id=2)
  └─ 部门3 (id=3)
       └─ 部门4 (id=4)
```

##### 完整代码 + 详细注释

```javascript
function listToTree(list) {
    const map = new Map(); // 创建一个"快速查找表"
    const result = []; // 存放根节点

    // 【第一步】建立映射：给每个节点"登记造册"
    list.forEach((item) => {
        map.set(item.id, {
            ...item, // 复制原数据
            children: [], // 初始化 children 为空数组
        });
    });

    // 【第二步】建立关系：根据 pid 找爸爸，挂到爸爸的 children 下
    list.forEach((item) => {
        const node = map.get(item.id); // 从 Map 取出当前节点

        if (item.pid === 0) {
            // 如果 pid=0，说明是根节点（没有爸爸）
            result.push(node);
        } else {
            // 否则，找到爸爸，把自己塞进爸爸的 children
            const parent = map.get(item.pid);
            if (parent) {
                // 防止数据有问题（找不到爸爸）
                parent.children.push(node);
            }
        }
    });

    return result;
}

const tree = listToTree(list);
console.log(JSON.stringify(tree, null, 2));
```

##### 为什么用 Map？

**对比：不用 Map 的递归法**

```javascript
// 每次都要遍历整个数组找子节点
function listToTree(list, pid = 0) {
    const result = [];
    for (const item of list) {
        // 外层循环 n 次
        if (item.pid === pid) {
            const children = listToTree(list, item.id); // 内层又循环 n 次
            result.push({ ...item, children });
        }
    }
    return result;
}
// 时间复杂度：O(n²) - 嵌套循环
```

**用 Map 的优势**

```javascript
const parent = map.get(item.pid); // O(1) 直接找到父节点！
```

**类比**：

-   **不用 Map**：像在一堆身份证里**翻找**某个人（慢）
-   **用 Map**：像用身份证号在**电脑系统**里查询（快）

**优点**：只遍历两次列表，性能最优。  
**适用场景**：大数据量场景。

##### 面试时怎么说？

**面试官**："为什么用 Map？"

**你的回答**：

> "因为需要频繁根据 `id` 查找节点。如果用数组的 `find` 方法，每次查找都是 O(n)，总体就是 O(n²)。而 Map 的查找是 O(1)，所以整体复杂度降到了 O(n)。这在数据量大的时候性能差距会非常明显。"

#### 解法三：原地修改法 (空间复杂度 O(1))

**思路**：直接在原数组上修改，不创建新对象。

```javascript
function listToTree(list) {
    const map = {};
    const result = [];

    // 1. 建立 id -> item 的映射
    list.forEach((item) => {
        item.children = []; // 直接在原对象上添加 children
        map[item.id] = item;
    });

    // 2. 建立父子关系
    list.forEach((item) => {
        if (item.pid === 0) {
            result.push(item);
        } else {
            const parent = map[item.pid];
            if (parent) {
                parent.children.push(item);
            }
        }
    });

    return result;
}
```

**优点**：不创建新对象，节省内存。  
**缺点**：会修改原数组。

#### 解法四：reduce 函数式写法

```javascript
function listToTree(list) {
    const map = list.reduce((acc, item) => {
        acc[item.id] = { ...item, children: [] };
        return acc;
    }, {});

    return list.reduce((tree, item) => {
        const node = map[item.id];

        if (item.pid === 0) {
            tree.push(node);
        } else {
            const parent = map[item.pid];
            parent && parent.children.push(node);
        }

        return tree;
    }, []);
}
```

##### reduce 详解

**reduce 是什么？**

`reduce` 是数组的"累加器"，它会**遍历数组**，把每次的计算结果**累积**起来。

**语法**：

```javascript
array.reduce((累积值, 当前元素) => {
    // 处理逻辑
    return 新的累积值;
}, 初始值);
```

##### 第一个 reduce：建立 Map

```javascript
const map = list.reduce((acc, item) => {
    acc[item.id] = { ...item, children: [] };
    return acc;
}, {});
```

**等价于 forEach 写法**：

```javascript
const map = {}; // 初始值是空对象

list.forEach((item) => {
    map[item.id] = { ...item, children: [] };
});
```

**逐步执行**（假设 `list = [{ id: 1, pid: 0 }, { id: 2, pid: 1 }]`）：

| 轮次    | item                | acc (累积值)   | 执行后的 acc                                       |
| ------- | ------------------- | -------------- | -------------------------------------------------- |
| 初始    | -                   | `{}`           | `{}`                                               |
| 第 1 轮 | `{ id: 1, pid: 0 }` | `{}`           | `{ 1: { id: 1, pid: 0, children: [] } }`           |
| 第 2 轮 | `{ id: 2, pid: 1 }` | `{ 1: {...} }` | `{ 1: {...}, 2: { id: 2, pid: 1, children: [] } }` |

**最终 map**：

```javascript
{
  1: { id: 1, pid: 0, children: [] },
  2: { id: 2, pid: 1, children: [] }
}
```

##### 第二个 reduce：建立树结构

```javascript
return list.reduce((tree, item) => {
    const node = map[item.id];

    if (item.pid === 0) {
        tree.push(node);
    } else {
        const parent = map[item.pid];
        parent && parent.children.push(node);
    }

    return tree;
}, []);
```

**等价于 forEach 写法**：

```javascript
const tree = []; // 初始值是空数组

list.forEach((item) => {
    const node = map[item.id];

    if (item.pid === 0) {
        tree.push(node);
    } else {
        const parent = map[item.pid];
        if (parent) {
            parent.children.push(node);
        }
    }
});

return tree;
```

**逐步执行**：

| 轮次    | item                | tree (累积值) | 执行逻辑                                           | 执行后的 tree                             |
| ------- | ------------------- | ------------- | -------------------------------------------------- | ----------------------------------------- |
| 初始    | -                   | `[]`          | -                                                  | `[]`                                      |
| 第 1 轮 | `{ id: 1, pid: 0 }` | `[]`          | `pid=0`，是根节点 → `tree.push(node)`              | `[{ id: 1, ..., children: [] }]`          |
| 第 2 轮 | `{ id: 2, pid: 1 }` | `[...]`       | `pid=1`，找到父节点 → `parent.children.push(node)` | `[{ id: 1, children: [{ id: 2, ... }] }]` |

##### 关键点解析

**1. `parent && parent.children.push(node)` 是什么意思？**

这是**短路运算**的写法，等价于：

```javascript
if (parent) {
    parent.children.push(node);
}
```

**原理**：

-   `&&` 左边为 `true` 时，才执行右边。
-   如果 `parent` 是 `null` 或 `undefined`，右边不会执行，避免报错。

**2. 为什么要 `return acc` 和 `return tree`？**

因为 `reduce` 要求**每次都返回累积值**，下一轮才能继续累加。

**错误示范**：

```javascript
list.reduce((acc, item) => {
    acc[item.id] = { ...item, children: [] };
    // ❌ 忘记 return，下一轮 acc 会变成 undefined
}, {});
```

##### reduce vs forEach 完整对比

**reduce 写法（原代码）**：

```javascript
function listToTree(list) {
    const map = list.reduce((acc, item) => {
        acc[item.id] = { ...item, children: [] };
        return acc;
    }, {});

    return list.reduce((tree, item) => {
        const node = map[item.id];
        if (item.pid === 0) {
            tree.push(node);
        } else {
            const parent = map[item.pid];
            parent && parent.children.push(node);
        }
        return tree;
    }, []);
}
```

**forEach 写法（完全等价）**：

```javascript
function listToTree(list) {
    // 第一步：建立 map
    const map = {};
    list.forEach((item) => {
        map[item.id] = { ...item, children: [] };
    });

    // 第二步：建立树
    const tree = [];
    list.forEach((item) => {
        const node = map[item.id];
        if (item.pid === 0) {
            tree.push(node);
        } else {
            const parent = map[item.pid];
            if (parent) {
                parent.children.push(node);
            }
        }
    });

    return tree;
}
```

##### reduce 的优势与劣势

**优势**：

-   **函数式编程风格**：代码更简洁，一行搞定。
-   **链式调用**：可以连续 `.reduce().map().filter()`。

**劣势**：

-   **可读性差**：初学者不容易理解。
-   **调试困难**：不如 forEach 直观。

**建议**：

-   **初学者**：先用 forEach 写法，等熟练后再用 reduce。
-   **面试**：两种写法都要会，面试官可能会问"能用 reduce 改写吗？"

#### 性能对比

| 方法       | 时间复杂度 | 空间复杂度 | 优点     | 缺点         |
| ---------- | ---------- | ---------- | -------- | ------------ |
| 递归法     | O(n²)      | O(n)       | 代码简洁 | 性能差       |
| Map 映射法 | O(n)       | O(n)       | 性能最优 | 需要额外空间 |
| 原地修改法 | O(n)       | O(1)       | 节省内存 | 修改原数组   |

#### 扩展：树转列表 (Tree to List)

```javascript
function treeToList(tree) {
    const result = [];

    function traverse(nodes) {
        nodes.forEach((node) => {
            const { children, ...rest } = node;
            result.push(rest);

            if (children && children.length > 0) {
                traverse(children);
            }
        });
    }

    traverse(tree);
    return result;
}

// 使用
const flatList = treeToList(tree);
console.log(flatList);
```

#### 面试追问

**Q1: 如果数据不保证顺序（子节点可能在父节点之前），怎么办？**  
**A**: Map 映射法天然支持乱序数据，因为它先建立所有节点的映射，再建立关系。

**Q2: 如果有循环引用（A 的父节点是 B，B 的父节点是 A），怎么处理？**  
**A**: 需要加入已访问节点的检测：

```javascript
const visited = new Set();
list.forEach((item) => {
    if (visited.has(item.id)) {
        console.warn('检测到循环引用:', item.id);
        return;
    }
    visited.add(item.id);
    // ... 后续逻辑
});
```

**Q3: 如果要支持多个根节点（pid 可能是 null、0、undefined），怎么办？**  
**A**: 修改判断条件：

```javascript
const isRoot = (pid) => pid === 0 || pid === null || pid === undefined;

if (isRoot(item.pid)) {
    result.push(node);
}
```

📊 现在三种解法的对比

| 解法          | 详细程度                       | 适合人群           |
| ------------- | ------------------------------ | ------------------ |
| 递归法        | ⭐⭐⭐⭐⭐ 完整图解 + 调用栈   | 初学者理解递归思想 |
| Map 映射法    | ⭐⭐⭐⭐⭐ 完整图解 + 逐步执行 | 面试必备，性能最优 |
| reduce 函数式 | ⭐⭐⭐⭐⭐ 完整对比 + 表格     | 函数式编程爱好者   |
