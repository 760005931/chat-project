# 📘 Vue 3 完整学习指南

从零基础到进阶的 Vue 3 系统学习笔记，涵盖所有核心概念和最佳实践。

---

## 🚀 快速导航

-   [第一章：Vue 基础](#第一章vue-基础)
-   [第二章：组件化开发](#第二章组件化开发)
-   [第三章：响应式原理](#第三章响应式原理)
-   [第四章：Composition API](#第四章composition-api)
-   [第五章：路由与状态管理](#第五章路由与状态管理)
-   [第六章：进阶技巧](#第六章进阶技巧)

---

## 第一章：Vue 基础

### 1.1 什么是 Vue？

Vue 是一个**渐进式 JavaScript 框架**，用于构建用户界面。

**核心特点**：

-   **声明式渲染**：用模板语法描述 UI
-   **响应式数据**：数据变化自动更新视图
-   **组件化**：可复用的 UI 单元
-   **渐进式**：可以只用一部分功能，也可以全家桶

---

### 1.2 第一个 Vue 应用

#### 使用 CDN（快速体验）

```html
<!DOCTYPE html>
<html>
    <head>
        <title>Vue 入门</title>
        <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
    </head>
    <body>
        <div id="app">
            <h1>{{ message }}</h1>
            <button @click="count++">点击了 {{ count }} 次</button>
        </div>

        <script>
            const { createApp } = Vue;

            createApp({
                data() {
                    return {
                        message: 'Hello Vue!',
                        count: 0,
                    };
                },
            }).mount('#app');
        </script>
    </body>
</html>
```

#### 使用 Vite 创建项目（推荐）

```bash
# 创建项目
npm create vite@latest my-vue-app -- --template vue

# 进入项目
cd my-vue-app

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

---

### 1.3 模板语法

#### 文本插值

```vue
<template>
    <p>{{ message }}</p>
    <p>{{ 1 + 1 }}</p>
    <p>{{ ok ? 'YES' : 'NO' }}</p>
</template>

<script>
export default {
    data() {
        return {
            message: 'Hello',
            ok: true,
        };
    },
};
</script>
```

#### 原始 HTML

```vue
<template>
    <!-- ❌ 不会解析 HTML -->
    <p>{{ rawHtml }}</p>

    <!-- ✅ 会解析 HTML -->
    <p v-html="rawHtml"></p>
</template>

<script>
export default {
    data() {
        return {
            rawHtml: '<span style="color: red">红色文字</span>',
        };
    },
};
</script>
```

#### 属性绑定

```vue
<template>
    <!-- 绑定属性 -->
    <img :src="imageSrc" :alt="imageAlt" />

    <!-- 简写 -->
    <a :href="url">链接</a>

    <!-- 绑定多个属性 -->
    <div v-bind="objectOfAttrs"></div>
</template>

<script>
export default {
    data() {
        return {
            imageSrc: '/logo.png',
            imageAlt: 'Logo',
            url: 'https://vuejs.org',
            objectOfAttrs: {
                id: 'container',
                class: 'wrapper',
            },
        };
    },
};
</script>
```

---

### 1.4 指令

#### v-if / v-else / v-else-if（条件渲染）

```vue
<template>
    <div>
        <h1 v-if="type === 'A'">A</h1>
        <h1 v-else-if="type === 'B'">B</h1>
        <h1 v-else>C</h1>
    </div>

    <!-- 使用 template 包裹多个元素 -->
    <template v-if="ok">
        <h1>标题</h1>
        <p>段落</p>
    </template>
</template>

<script>
export default {
    data() {
        return {
            type: 'A',
            ok: true,
        };
    },
};
</script>
```

#### v-show（显示/隐藏）

```vue
<template>
    <!-- v-show 只是切换 display: none -->
    <h1 v-show="isVisible">Hello</h1>
</template>

<script>
export default {
    data() {
        return {
            isVisible: true,
        };
    },
};
</script>
```

**v-if vs v-show**：

-   `v-if`：真正的条件渲染，DOM 元素会被销毁/创建
-   `v-show`：只是 CSS 切换，DOM 元素始终存在
-   **选择**：频繁切换用 `v-show`，条件很少改变用 `v-if`

#### v-for（列表渲染）

```vue
<template>
    <!-- 遍历数组 -->
    <ul>
        <li v-for="(item, index) in items" :key="item.id">
            {{ index }}: {{ item.text }}
        </li>
    </ul>

    <!-- 遍历对象 -->
    <ul>
        <li v-for="(value, key, index) in user" :key="key">
            {{ index }}. {{ key }}: {{ value }}
        </li>
    </ul>

    <!-- 遍历数字 -->
    <span v-for="n in 10" :key="n">{{ n }}</span>
</template>

<script>
export default {
    data() {
        return {
            items: [
                { id: 1, text: 'Apple' },
                { id: 2, text: 'Banana' },
            ],
            user: {
                name: 'Alice',
                age: 25,
            },
        };
    },
};
</script>
```

**重要**：`key` 属性必须提供，且应该是唯一的标识符（不要用 index）。

#### v-on（事件监听）

```vue
<template>
    <!-- 完整写法 -->
    <button v-on:click="handleClick">点击</button>

    <!-- 简写 -->
    <button @click="handleClick">点击</button>

    <!-- 内联表达式 -->
    <button @click="count++">{{ count }}</button>

    <!-- 传参 -->
    <button @click="say('hello')">Say Hello</button>

    <!-- 访问事件对象 -->
    <button @click="handleClick($event)">点击</button>

    <!-- 事件修饰符 -->
    <form @submit.prevent="onSubmit">提交</form>
    <a @click.stop="doThis">链接</a>
    <input @keyup.enter="submit" />
</template>

<script>
export default {
    data() {
        return {
            count: 0,
        };
    },
    methods: {
        handleClick(event) {
            console.log('点击了', event);
        },
        say(message) {
            alert(message);
        },
        onSubmit() {
            console.log('提交表单');
        },
    },
};
</script>
```

**常用事件修饰符**：

-   `.stop`：阻止事件冒泡
-   `.prevent`：阻止默认行为
-   `.once`：只触发一次
-   `.self`：只在元素本身触发

**按键修饰符**：

-   `.enter`、`.tab`、`.delete`、`.esc`、`.space`
-   `.up`、`.down`、`.left`、`.right`

#### v-model（双向绑定）

```vue
<template>
    <!-- 文本输入 -->
    <input v-model="message" placeholder="输入文字" />
    <p>{{ message }}</p>

    <!-- 多行文本 -->
    <textarea v-model="text"></textarea>

    <!-- 复选框 -->
    <input type="checkbox" v-model="checked" />
    <label>{{ checked }}</label>

    <!-- 多个复选框 -->
    <input type="checkbox" value="Apple" v-model="fruits" />
    <input type="checkbox" value="Banana" v-model="fruits" />
    <p>{{ fruits }}</p>

    <!-- 单选框 -->
    <input type="radio" value="Male" v-model="gender" />
    <input type="radio" value="Female" v-model="gender" />
    <p>{{ gender }}</p>

    <!-- 下拉框 -->
    <select v-model="selected">
        <option disabled value="">请选择</option>
        <option>A</option>
        <option>B</option>
    </select>
</template>

<script>
export default {
    data() {
        return {
            message: '',
            text: '',
            checked: false,
            fruits: [],
            gender: '',
            selected: '',
        };
    },
};
</script>
```

**v-model 修饰符**：

```vue
<!-- .lazy: 失去焦点时才更新 -->
<input v-model.lazy="msg">

<!-- .number: 自动转为数字 -->
<input v-model.number="age" type="number">

<!-- .trim: 自动去除首尾空格 -->
<input v-model.trim="msg">
```

---

### 1.5 计算属性与侦听器

#### 计算属性（computed）

```vue
<template>
    <p>原始消息: {{ message }}</p>
    <p>反转消息: {{ reversedMessage }}</p>
    <p>全名: {{ fullName }}</p>
</template>

<script>
export default {
    data() {
        return {
            message: 'Hello',
            firstName: 'John',
            lastName: 'Doe',
        };
    },
    computed: {
        // 只读计算属性
        reversedMessage() {
            return this.message.split('').reverse().join('');
        },

        // 可读可写计算属性
        fullName: {
            get() {
                return this.firstName + ' ' + this.lastName;
            },
            set(newValue) {
                const names = newValue.split(' ');
                this.firstName = names[0];
                this.lastName = names[names.length - 1];
            },
        },
    },
};
</script>
```

**计算属性 vs 方法**：

-   计算属性有**缓存**，依赖不变时不会重新计算
-   方法每次调用都会执行

#### 侦听器（watch）

```vue
<script>
export default {
    data() {
        return {
            question: '',
            answer: '',
            user: {
                name: 'Alice',
                age: 25,
            },
        };
    },
    watch: {
        // 简单侦听
        question(newVal, oldVal) {
            console.log('问题变化:', oldVal, '->', newVal);
            this.getAnswer();
        },

        // 深度侦听对象
        user: {
            handler(newVal) {
                console.log('用户信息变化:', newVal);
            },
            deep: true,
            immediate: true, // 立即执行一次
        },

        // 侦听对象的某个属性
        'user.name'(newVal) {
            console.log('名字变化:', newVal);
        },
    },
    methods: {
        getAnswer() {
            // 获取答案的逻辑
        },
    },
};
</script>
```

---

### 1.6 Class 与 Style 绑定

#### 绑定 Class

```vue
<template>
    <!-- 对象语法 -->
    <div :class="{ active: isActive, 'text-danger': hasError }"></div>

    <!-- 绑定对象 -->
    <div :class="classObject"></div>

    <!-- 数组语法 -->
    <div :class="[activeClass, errorClass]"></div>

    <!-- 数组 + 对象 -->
    <div :class="[{ active: isActive }, errorClass]"></div>
</template>

<script>
export default {
    data() {
        return {
            isActive: true,
            hasError: false,
            classObject: {
                active: true,
                'text-danger': false,
            },
            activeClass: 'active',
            errorClass: 'text-danger',
        };
    },
};
</script>
```

#### 绑定 Style

```vue
<template>
    <!-- 对象语法 -->
    <div :style="{ color: activeColor, fontSize: fontSize + 'px' }"></div>

    <!-- 绑定对象 -->
    <div :style="styleObject"></div>

    <!-- 数组语法 -->
    <div :style="[baseStyles, overridingStyles]"></div>
</template>

<script>
export default {
    data() {
        return {
            activeColor: 'red',
            fontSize: 30,
            styleObject: {
                color: 'red',
                fontSize: '13px',
            },
            baseStyles: { color: 'blue' },
            overridingStyles: { fontSize: '20px' },
        };
    },
};
</script>
```

---

## 第二章：组件化开发

### 2.1 组件基础

#### 定义组件

```vue
<!-- MyButton.vue -->
<template>
    <button @click="handleClick">
        {{ text }}
    </button>
</template>

<script>
export default {
    name: 'MyButton',
    data() {
        return {
            text: '点击我',
        };
    },
    methods: {
        handleClick() {
            alert('按钮被点击了');
        },
    },
};
</script>

<style scoped>
button {
    padding: 10px 20px;
    background: #42b983;
    color: white;
    border: none;
    border-radius: 4px;
}
</style>
```

#### 使用组件

```vue
<!-- App.vue -->
<template>
    <div>
        <MyButton />
        <MyButton />
    </div>
</template>

<script>
import MyButton from './components/MyButton.vue';

export default {
    components: {
        MyButton,
    },
};
</script>
```

---

### 2.2 Props（父传子）

#### 定义 Props

```vue
<!-- ChildComponent.vue -->
<template>
    <div>
        <h2>{{ title }}</h2>
        <p>{{ content }}</p>
        <p>数量: {{ count }}</p>
    </div>
</template>

<script>
export default {
    name: 'ChildComponent',
    props: {
        // 简单声明
        title: String,

        // 详细声明
        content: {
            type: String,
            required: true,
        },

        // 带默认值
        count: {
            type: Number,
            default: 0,
        },

        // 对象/数组默认值必须用函数返回
        user: {
            type: Object,
            default() {
                return { name: 'Guest' };
            },
        },

        // 自定义验证
        age: {
            type: Number,
            validator(value) {
                return value >= 0 && value <= 120;
            },
        },
    },
};
</script>
```

#### 传递 Props

```vue
<!-- ParentComponent.vue -->
<template>
    <div>
        <!-- 静态传递 -->
        <ChildComponent title="标题" content="内容" />

        <!-- 动态传递 -->
        <ChildComponent :title="pageTitle" :content="pageContent" />

        <!-- 传递数字 -->
        <ChildComponent :count="42" />

        <!-- 传递对象 -->
        <ChildComponent :user="currentUser" />

        <!-- 传递所有属性 -->
        <ChildComponent v-bind="post" />
    </div>
</template>

<script>
import ChildComponent from './ChildComponent.vue';

export default {
    components: { ChildComponent },
    data() {
        return {
            pageTitle: '我的标题',
            pageContent: '我的内容',
            currentUser: { name: 'Alice', age: 25 },
            post: {
                title: '文章标题',
                content: '文章内容',
                count: 10,
            },
        };
    },
};
</script>
```

**Props 注意事项**：

-   Props 是**单向数据流**：父组件更新会流向子组件，反之不行
-   不要在子组件中直接修改 props
-   如果需要修改，应该用计算属性或本地 data

---

### 2.3 Emits（子传父）

#### 触发事件

```vue
<!-- ChildComponent.vue -->
<template>
    <button @click="handleClick">点击我</button>
</template>

<script>
export default {
    name: 'ChildComponent',
    emits: ['customEvent', 'update'],
    methods: {
        handleClick() {
            // 触发事件
            this.$emit('customEvent', '传递的数据');

            // 传递多个参数
            this.$emit('update', 1, 2, 3);
        },
    },
};
</script>
```

#### 监听事件

```vue
<!-- ParentComponent.vue -->
<template>
    <ChildComponent @customEvent="handleCustomEvent" @update="handleUpdate" />
</template>

<script>
import ChildComponent from './ChildComponent.vue';

export default {
    components: { ChildComponent },
    methods: {
        handleCustomEvent(data) {
            console.log('收到数据:', data);
        },
        handleUpdate(a, b, c) {
            console.log(a, b, c); // 1, 2, 3
        },
    },
};
</script>
```

#### v-model 的本质

```vue
<!-- 这两种写法等价 -->
<input v-model="searchText">

<input
  :value="searchText"
  @input="searchText = $event.target.value"
>
```

**自定义 v-model**：

```vue
<!-- CustomInput.vue -->
<template>
    <input
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
    />
</template>

<script>
export default {
    props: ['modelValue'],
    emits: ['update:modelValue'],
};
</script>

<!-- 使用 -->
<CustomInput v-model="searchText" />
```

---

### 2.4 插槽（Slots）

#### 默认插槽

```vue
<!-- ButtonWrapper.vue -->
<template>
    <button class="fancy-btn">
        <slot>默认内容</slot>
    </button>
</template>

<!-- 使用 -->
<ButtonWrapper>点击我</ButtonWrapper>
<ButtonWrapper></ButtonWrapper>
<!-- 显示"默认内容" -->
```

#### 具名插槽

```vue
<!-- Layout.vue -->
<template>
    <div class="container">
        <header>
            <slot name="header"></slot>
        </header>
        <main>
            <slot></slot>
            <!-- 默认插槽 -->
        </main>
        <footer>
            <slot name="footer"></slot>
        </footer>
    </div>
</template>

<!-- 使用 -->
<Layout>
  <template #header>
    <h1>页面标题</h1>
  </template>
  
  <p>主要内容</p>
  
  <template #footer>
    <p>页脚信息</p>
  </template>
</Layout>
```

#### 作用域插槽

```vue
<!-- TodoList.vue -->
<template>
    <ul>
        <li v-for="item in items" :key="item.id">
            <slot :item="item" :index="index"></slot>
        </li>
    </ul>
</template>

<script>
export default {
    props: ['items'],
};
</script>

<!-- 使用 -->
<TodoList :items="todos">
  <template #default="{ item, index }">
    <span>{{ index }}. {{ item.text }}</span>
  </template>
</TodoList>
```

---

### 2.5 生命周期

```vue
<script>
export default {
    // 创建阶段
    beforeCreate() {
        console.log('1. beforeCreate: 实例初始化之后');
    },
    created() {
        console.log('2. created: 数据观测、属性和方法运算完成');
        // 可以访问 data、computed、methods
        // 常用于发起 API 请求
    },

    // 挂载阶段
    beforeMount() {
        console.log('3. beforeMount: 挂载开始之前');
    },
    mounted() {
        console.log('4. mounted: 挂载完成');
        // 可以访问 DOM
        // 常用于操作 DOM、初始化第三方库
    },

    // 更新阶段
    beforeUpdate() {
        console.log('5. beforeUpdate: 数据更新，DOM 重新渲染之前');
    },
    updated() {
        console.log('6. updated: DOM 重新渲染完成');
    },

    // 卸载阶段
    beforeUnmount() {
        console.log('7. beforeUnmount: 卸载之前');
        // 清理定时器、取消订阅等
    },
    unmounted() {
        console.log('8. unmounted: 卸载完成');
    },
};
</script>
```

**生命周期图示**：

```
创建 → beforeCreate → created
  ↓
挂载 → beforeMount → mounted
  ↓
更新 → beforeUpdate → updated (数据变化时)
  ↓
卸载 → beforeUnmount → unmounted
```

---

## 第三章：响应式原理

### 3.1 Vue 2 vs Vue 3 响应式对比

| 特性     | Vue 2                   | Vue 3              |
| -------- | ----------------------- | ------------------ |
| 实现方式 | `Object.defineProperty` | `Proxy`            |
| 新增属性 | 需要 `$set`             | 自动响应           |
| 数组索引 | 不支持                  | 支持               |
| 性能     | 初始化慢                | 初始化快（懒代理） |

### 3.2 响应式 API

#### ref（基本类型）

```vue
<script setup>
import { ref } from 'vue';

const count = ref(0);
const message = ref('Hello');

// 访问值需要 .value
console.log(count.value); // 0
count.value++;

// 模板中自动解包，不需要 .value
</script>

<template>
    <p>{{ count }}</p>
    <p>{{ message }}</p>
</template>
```

#### reactive（对象类型）

```vue
<script setup>
import { reactive } from 'vue';

const state = reactive({
    count: 0,
    message: 'Hello',
    user: {
        name: 'Alice',
    },
});

// 直接访问，不需要 .value
console.log(state.count); // 0
state.count++;
state.user.name = 'Bob';
</script>

<template>
    <p>{{ state.count }}</p>
    <p>{{ state.user.name }}</p>
</template>
```

**ref vs reactive**：

-   `ref`：适合基本类型，需要 `.value`
-   `reactive`：适合对象，不需要 `.value`
-   `ref` 也可以包裹对象，但访问时需要 `.value`

---

## 第四章：Composition API

### 4.1 setup 函数

```vue
<script>
import { ref, computed, watch, onMounted } from 'vue';

export default {
    props: ['title'],
    emits: ['update'],
    setup(props, context) {
        // 响应式数据
        const count = ref(0);

        // 计算属性
        const doubleCount = computed(() => count.value * 2);

        // 方法
        const increment = () => {
            count.value++;
            context.emit('update', count.value);
        };

        // 侦听器
        watch(count, (newVal, oldVal) => {
            console.log('count 变化:', oldVal, '->', newVal);
        });

        // 生命周期
        onMounted(() => {
            console.log('组件已挂载');
        });

        // 返回给模板使用
        return {
            count,
            doubleCount,
            increment,
        };
    },
};
</script>
```

### 4.2 `<script setup>` 语法糖（推荐）

```vue
<script setup>
import { ref, computed, watch, onMounted } from 'vue';

// 定义 props
const props = defineProps({
    title: String,
});

// 定义 emits
const emit = defineEmits(['update']);

// 响应式数据
const count = ref(0);

// 计算属性
const doubleCount = computed(() => count.value * 2);

// 方法
const increment = () => {
    count.value++;
    emit('update', count.value);
};

// 侦听器
watch(count, (newVal) => {
    console.log('count:', newVal);
});

// 生命周期
onMounted(() => {
    console.log('组件已挂载');
});

// 不需要 return，自动暴露给模板
</script>

<template>
    <div>
        <p>{{ count }}</p>
        <p>{{ doubleCount }}</p>
        <button @click="increment">+1</button>
    </div>
</template>
```

### 4.3 组合式函数（Composables）

```javascript
// useCounter.js
import { ref, computed } from 'vue';

export function useCounter(initialValue = 0) {
    const count = ref(initialValue);
    const doubleCount = computed(() => count.value * 2);

    const increment = () => count.value++;
    const decrement = () => count.value--;
    const reset = () => (count.value = initialValue);

    return {
        count,
        doubleCount,
        increment,
        decrement,
        reset,
    };
}
```

**使用**：

```vue
<script setup>
import { useCounter } from './composables/useCounter';

const { count, doubleCount, increment, decrement, reset } = useCounter(10);
</script>

<template>
    <div>
        <p>{{ count }} (双倍: {{ doubleCount }})</p>
        <button @click="increment">+1</button>
        <button @click="decrement">-1</button>
        <button @click="reset">重置</button>
    </div>
</template>
```

---

## 第五章：路由与状态管理

### 5.1 Vue Router

#### 安装与配置

```bash
npm install vue-router@4
```

```javascript
// router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import About from '../views/About.vue';

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home,
    },
    {
        path: '/about',
        name: 'About',
        component: About,
    },
    {
        path: '/user/:id',
        name: 'User',
        component: () => import('../views/User.vue'), // 懒加载
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
```

```javascript
// main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

createApp(App).use(router).mount('#app');
```

#### 使用路由

```vue
<template>
    <div>
        <!-- 导航链接 -->
        <router-link to="/">首页</router-link>
        <router-link to="/about">关于</router-link>
        <router-link :to="{ name: 'User', params: { id: 123 } }"
            >用户</router-link
        >

        <!-- 路由出口 -->
        <router-view></router-view>
    </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

// 编程式导航
const goToAbout = () => {
    router.push('/about');
    // router.push({ name: 'About' });
    // router.replace('/about'); // 不留历史记录
    // router.go(-1); // 后退
};

// 获取路由参数
console.log(route.params.id);
console.log(route.query.name);
</script>
```

### 5.2 Pinia（状态管理）

#### 安装与配置

```bash
npm install pinia
```

```javascript
// main.js
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.mount('#app');
```

#### 定义 Store

```javascript
// stores/counter.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useCounterStore = defineStore('counter', () => {
    // State
    const count = ref(0);

    // Getters
    const doubleCount = computed(() => count.value * 2);

    // Actions
    function increment() {
        count.value++;
    }

    function decrement() {
        count.value--;
    }

    async function fetchData() {
        const res = await fetch('/api/data');
        const data = await res.json();
        count.value = data.count;
    }

    return {
        count,
        doubleCount,
        increment,
        decrement,
        fetchData,
    };
});
```

#### 使用 Store

```vue
<script setup>
import { useCounterStore } from '@/stores/counter';

const counter = useCounterStore();

// 直接访问
console.log(counter.count);
console.log(counter.doubleCount);

// 调用 actions
counter.increment();
counter.fetchData();
</script>

<template>
    <div>
        <p>{{ counter.count }}</p>
        <p>{{ counter.doubleCount }}</p>
        <button @click="counter.increment">+1</button>
    </div>
</template>
```

---

## 第六章：进阶技巧

### 6.1 动态组件

```vue
<template>
    <div>
        <button @click="currentTab = 'Home'">首页</button>
        <button @click="currentTab = 'About'">关于</button>

        <!-- 动态切换组件 -->
        <component :is="currentTab"></component>

        <!-- 缓存组件状态 -->
        <keep-alive>
            <component :is="currentTab"></component>
        </keep-alive>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import Home from './Home.vue';
import About from './About.vue';

const currentTab = ref('Home');
</script>
```

### 6.2 异步组件

```vue
<script setup>
import { defineAsyncComponent } from 'vue';

const AsyncComp = defineAsyncComponent(() =>
    import('./components/HeavyComponent.vue')
);

// 带加载状态
const AsyncCompWithOptions = defineAsyncComponent({
    loader: () => import('./components/HeavyComponent.vue'),
    loadingComponent: LoadingComponent,
    errorComponent: ErrorComponent,
    delay: 200,
    timeout: 3000,
});
</script>

<template>
    <AsyncComp />
</template>
```

### 6.3 Provide / Inject（跨层级传递）

```vue
<!-- 祖先组件 -->
<script setup>
import { provide, ref } from 'vue';

const theme = ref('dark');
const updateTheme = (newTheme) => {
    theme.value = newTheme;
};

provide('theme', theme);
provide('updateTheme', updateTheme);
</script>

<!-- 后代组件 -->
<script setup>
import { inject } from 'vue';

const theme = inject('theme');
const updateTheme = inject('updateTheme');
</script>

<template>
    <div :class="theme">
        <button @click="updateTheme('light')">切换主题</button>
    </div>
</template>
```

### 6.4 自定义指令

```javascript
// directives/focus.js
export const vFocus = {
    mounted(el) {
        el.focus();
    },
};
```

```vue
<script setup>
import { vFocus } from './directives/focus';
</script>

<template>
    <input v-focus />
</template>
```

---

## 🎯 学习路线建议

1. **第 1 周**：掌握第一章基础知识，能写简单的 Todo List
2. **第 2 周**：学习组件化开发，理解父子组件通信
3. **第 3 周**：深入响应式原理，学习 Composition API
4. **第 4 周**：掌握 Vue Router 和 Pinia
5. **第 5 周**：学习进阶技巧，做一个完整项目

## 📚 推荐资源

-   [Vue 3 官方文档](https://cn.vuejs.org/)
-   [Vue Router 文档](https://router.vuejs.org/zh/)
-   [Pinia 文档](https://pinia.vuejs.org/zh/)
-   [Vue Mastery](https://www.vuemastery.com/)
