# 📕 Vue 3 深度学习指南

深入理解 Vue 3 核心原理、性能优化、设计模式和最佳实践。

---

## 📑 目录

-   [第一部分：响应式系统深度剖析](#第一部分响应式系统深度剖析)
-   [第二部分：虚拟 DOM 与 Diff 算法](#第二部分虚拟-dom-与-diff-算法)
-   [第三部分：组件通信的 7 种方式](#第三部分组件通信的-7-种方式)
-   [第四部分：性能优化实战](#第四部分性能优化实战)
-   [第五部分：设计模式与最佳实践](#第五部分设计模式与最佳实践)
-   [第六部分：常见问题与解决方案](#第六部分常见问题与解决方案)

---

## 第一部分：响应式系统深度剖析

### 1.1 Vue 2 响应式原理（Object.defineProperty）

#### 核心实现

```javascript
// Vue 2 响应式核心代码简化版
function defineReactive(obj, key, val) {
    const dep = new Dep(); // 依赖收集器

    Object.defineProperty(obj, key, {
        get() {
            // 依赖收集
            if (Dep.target) {
                dep.depend();
            }
            return val;
        },
        set(newVal) {
            if (newVal === val) return;
            val = newVal;
            // 通知更新
            dep.notify();
        },
    });
}

// 依赖收集器
class Dep {
    constructor() {
        this.subs = []; // 订阅者列表
    }

    depend() {
        if (Dep.target) {
            this.subs.push(Dep.target);
        }
    }

    notify() {
        this.subs.forEach((watcher) => watcher.update());
    }
}

// 观察者
class Watcher {
    constructor(vm, exp, cb) {
        this.vm = vm;
        this.exp = exp;
        this.cb = cb;
        this.value = this.get();
    }

    get() {
        Dep.target = this;
        const value = this.vm[this.exp];
        Dep.target = null;
        return value;
    }

    update() {
        const newValue = this.vm[this.exp];
        if (newValue !== this.value) {
            this.value = newValue;
            this.cb.call(this.vm, newValue);
        }
    }
}
```

#### Vue 2 的局限性

```javascript
const vm = new Vue({
    data: {
        obj: { a: 1 },
    },
});

// ❌ 新增属性不是响应式的
vm.obj.b = 2; // 不会触发更新

// ✅ 解决方案
Vue.set(vm.obj, 'b', 2);
// 或
vm.$set(vm.obj, 'b', 2);

// ❌ 数组索引修改不是响应式的
vm.arr[0] = 'new'; // 不会触发更新

// ✅ 解决方案
vm.$set(vm.arr, 0, 'new');
// 或使用数组方法
vm.arr.splice(0, 1, 'new');
```

---

### 1.2 Vue 3 响应式原理（Proxy）

#### 核心实现

```javascript
// Vue 3 响应式核心代码简化版
function reactive(target) {
    return new Proxy(target, {
        get(target, key, receiver) {
            const result = Reflect.get(target, key, receiver);

            // 依赖收集
            track(target, key);

            // 如果是对象，递归代理
            if (typeof result === 'object' && result !== null) {
                return reactive(result);
            }

            return result;
        },

        set(target, key, value, receiver) {
            const oldValue = target[key];
            const result = Reflect.set(target, key, value, receiver);

            // 触发更新
            if (oldValue !== value) {
                trigger(target, key);
            }

            return result;
        },

        deleteProperty(target, key) {
            const hadKey = Object.prototype.hasOwnProperty.call(target, key);
            const result = Reflect.deleteProperty(target, key);

            if (hadKey && result) {
                trigger(target, key);
            }

            return result;
        },
    });
}

// 依赖收集
const targetMap = new WeakMap();
let activeEffect = null;

function track(target, key) {
    if (!activeEffect) return;

    let depsMap = targetMap.get(target);
    if (!depsMap) {
        targetMap.set(target, (depsMap = new Map()));
    }

    let dep = depsMap.get(key);
    if (!dep) {
        depsMap.set(key, (dep = new Set()));
    }

    dep.add(activeEffect);
}

// 触发更新
function trigger(target, key) {
    const depsMap = targetMap.get(target);
    if (!depsMap) return;

    const dep = depsMap.get(key);
    if (dep) {
        dep.forEach((effect) => effect());
    }
}

// 副作用函数
function effect(fn) {
    activeEffect = fn;
    fn();
    activeEffect = null;
}
```

#### Vue 3 的优势

```javascript
import { reactive, ref } from 'vue';

const state = reactive({
    obj: { a: 1 },
});

// ✅ 新增属性自动响应式
state.obj.b = 2; // 会触发更新

// ✅ 数组索引修改自动响应式
state.arr[0] = 'new'; // 会触发更新

// ✅ 删除属性也是响应式的
delete state.obj.a; // 会触发更新
```

---

### 1.3 ref vs reactive 深度对比

#### 使用场景对比

```javascript
import { ref, reactive, toRefs } from 'vue';

// ❌ 错误：reactive 不能直接替换整个对象
const state = reactive({ count: 0 });
state = { count: 1 }; // 失去响应式

// ✅ 正确：ref 可以直接替换
const count = ref(0);
count.value = 1; // 保持响应式

// ❌ 错误：解构 reactive 会失去响应式
const { count } = reactive({ count: 0 });
count++; // 不会触发更新

// ✅ 正确：使用 toRefs
const state = reactive({ count: 0 });
const { count } = toRefs(state);
count.value++; // 会触发更新
```

#### 性能对比

```javascript
// ref: 适合基本类型，开销小
const count = ref(0);
const name = ref('Alice');

// reactive: 适合对象，但会递归代理所有嵌套属性
const state = reactive({
    user: {
        profile: {
            name: 'Alice',
            age: 25,
            address: {
                city: 'Beijing',
            },
        },
    },
});

// 优化：使用 shallowReactive 只代理第一层
import { shallowReactive } from 'vue';

const state = shallowReactive({
    count: 0,
    nested: { value: 1 }, // nested 不是响应式的
});
```

---

### 1.4 响应式陷阱与解决方案

#### 陷阱 1：解构丢失响应式

```javascript
// ❌ 错误
const state = reactive({ count: 0, name: 'Alice' });
const { count, name } = state; // 丢失响应式

// ✅ 解决方案 1：使用 toRefs
const { count, name } = toRefs(state);

// ✅ 解决方案 2：使用 computed
const count = computed(() => state.count);
```

#### 陷阱 2：数组/对象的响应式丢失

```javascript
// ❌ 错误
const list = ref([1, 2, 3]);
const first = list.value[0]; // first 不是响应式的

// ✅ 解决方案：使用 computed
const first = computed(() => list.value[0]);

// ❌ 错误：直接赋值数组
const list = ref([1, 2, 3]);
list = [4, 5, 6]; // 丢失响应式

// ✅ 正确：修改 .value
list.value = [4, 5, 6];
```

#### 陷阱 3：异步更新导致的问题

```javascript
import { ref, nextTick } from 'vue';

const count = ref(0);

function increment() {
    count.value++;
    console.log(count.value); // 1
    console.log(document.querySelector('#count').textContent); // 0 (DOM 还没更新)

    // ✅ 等待 DOM 更新
    nextTick(() => {
        console.log(document.querySelector('#count').textContent); // 1
    });
}
```

---

## 第二部分：虚拟 DOM 与 Diff 算法

### 2.1 虚拟 DOM 的本质

#### 什么是虚拟 DOM？

```javascript
// 真实 DOM
<div id="app">
    <p class="text">Hello</p>
</div>;

// 虚拟 DOM (JavaScript 对象)
const vnode = {
    tag: 'div',
    props: { id: 'app' },
    children: [
        {
            tag: 'p',
            props: { class: 'text' },
            children: 'Hello',
        },
    ],
};
```

#### 为什么需要虚拟 DOM？

```javascript
// ❌ 直接操作 DOM（性能差）
for (let i = 0; i < 1000; i++) {
    const div = document.createElement('div');
    div.textContent = i;
    document.body.appendChild(div); // 触发 1000 次重排重绘
}

// ✅ 虚拟 DOM（批量更新）
const vnodes = [];
for (let i = 0; i < 1000; i++) {
    vnodes.push({ tag: 'div', children: i });
}
// 一次性更新到真实 DOM
patch(oldVNode, newVNode);
```

---

### 2.2 Diff 算法详解

#### Vue 2 的双端 Diff 算法

```javascript
// 简化版 Vue 2 Diff 算法
function updateChildren(oldCh, newCh) {
    let oldStartIdx = 0;
    let oldEndIdx = oldCh.length - 1;
    let newStartIdx = 0;
    let newEndIdx = newCh.length - 1;

    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
        if (sameVnode(oldCh[oldStartIdx], newCh[newStartIdx])) {
            // 头头比较
            patchVnode(oldCh[oldStartIdx], newCh[newStartIdx]);
            oldStartIdx++;
            newStartIdx++;
        } else if (sameVnode(oldCh[oldEndIdx], newCh[newEndIdx])) {
            // 尾尾比较
            patchVnode(oldCh[oldEndIdx], newCh[newEndIdx]);
            oldEndIdx--;
            newEndIdx--;
        } else if (sameVnode(oldCh[oldStartIdx], newCh[newEndIdx])) {
            // 头尾比较
            patchVnode(oldCh[oldStartIdx], newCh[newEndIdx]);
            oldStartIdx++;
            newEndIdx--;
        } else if (sameVnode(oldCh[oldEndIdx], newCh[newStartIdx])) {
            // 尾头比较
            patchVnode(oldCh[oldEndIdx], newCh[newStartIdx]);
            oldEndIdx--;
            newStartIdx++;
        } else {
            // 乱序比较
            // ...
        }
    }
}
```

#### Vue 3 的快速 Diff 算法

```javascript
// Vue 3 优化：最长递增子序列
function patchKeyedChildren(c1, c2) {
    let i = 0;
    const l2 = c2.length;
    let e1 = c1.length - 1;
    let e2 = l2 - 1;

    // 1. 从头开始同步
    while (i <= e1 && i <= e2) {
        if (isSameVNodeType(c1[i], c2[i])) {
            patch(c1[i], c2[i]);
        } else {
            break;
        }
        i++;
    }

    // 2. 从尾开始同步
    while (i <= e1 && i <= e2) {
        if (isSameVNodeType(c1[e1], c2[e2])) {
            patch(c1[e1], c2[e2]);
        } else {
            break;
        }
        e1--;
        e2--;
    }

    // 3. 处理剩余节点（最长递增子序列）
    // ...
}
```

---

### 2.3 Key 的重要性

#### 为什么需要 key？

```vue
<!-- ❌ 没有 key：性能差 -->
<div v-for="item in list">{{ item }}</div>

<!-- ✅ 有 key：高效复用 -->
<div v-for="item in list" :key="item.id">{{ item }}</div>
```

#### 错误的 key 使用

```vue
<!-- ❌ 使用 index 作为 key -->
<div v-for="(item, index) in list" :key="index">
    <input v-model="item.value" />
</div>

<!-- 问题：删除第一项时，所有 input 的值会错位 -->
```

#### 正确的 key 使用

```vue
<!-- ✅ 使用唯一 ID -->
<div v-for="item in list" :key="item.id">
    <input v-model="item.value" />
</div>

<!-- ✅ 使用组合 key -->
<div v-for="item in list" :key="`${item.type}-${item.id}`">
    {{ item.name }}
</div>
```

---

## 第三部分：组件通信的 7 种方式

### 3.1 Props / Emits（父子通信）

```vue
<!-- 父组件 -->
<template>
    <Child :message="msg" @update="handleUpdate" />
</template>

<!-- 子组件 -->
<script setup>
const props = defineProps({ message: String });
const emit = defineEmits(['update']);

emit('update', 'new value');
</script>
```

---

### 3.2 v-model（双向绑定）

```vue
<!-- 父组件 -->
<template>
    <Child v-model="value" />
    <!-- 等价于 -->
    <Child :modelValue="value" @update:modelValue="value = $event" />
</template>

<!-- 子组件 -->
<script setup>
const props = defineProps(['modelValue']);
const emit = defineEmits(['update:modelValue']);

function updateValue(newValue) {
    emit('update:modelValue', newValue);
}
</script>

<!-- 多个 v-model -->
<Child v-model:title="title" v-model:content="content" />
```

---

### 3.3 Provide / Inject（跨层级通信）

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
```

**注意事项**：

-   Provide 的值应该是 `ref` 或 `reactive`，保持响应式
-   避免在后代组件中直接修改 provide 的值

---

### 3.4 EventBus（事件总线）

```javascript
// eventBus.js
import mitt from 'mitt';
export const eventBus = mitt();

// 组件 A：发送事件
import { eventBus } from './eventBus';
eventBus.emit('update', { data: 'hello' });

// 组件 B：接收事件
import { onMounted, onUnmounted } from 'vue';
import { eventBus } from './eventBus';

onMounted(() => {
    eventBus.on('update', handleUpdate);
});

onUnmounted(() => {
    eventBus.off('update', handleUpdate);
});

function handleUpdate(data) {
    console.log(data);
}
```

---

### 3.5 Vuex / Pinia（全局状态管理）

```javascript
// stores/counter.js
import { defineStore } from 'pinia';

export const useCounterStore = defineStore('counter', {
    state: () => ({ count: 0 }),
    actions: {
        increment() {
            this.count++;
        },
    },
});

// 组件中使用
import { useCounterStore } from '@/stores/counter';

const counter = useCounterStore();
counter.increment();
```

---

### 3.6 $attrs / $listeners（透传属性）

```vue
<!-- 父组件 -->
<Child class="custom" @click="handleClick" title="Hello" />

<!-- 子组件 -->
<template>
    <!-- 自动继承所有属性和事件 -->
    <div v-bind="$attrs">
        <slot />
    </div>
</template>

<script setup>
// 禁用自动继承
defineOptions({
    inheritAttrs: false,
});
</script>
```

---

### 3.7 Ref（父组件访问子组件）

```vue
<!-- 父组件 -->
<template>
    <Child ref="childRef" />
    <button @click="callChildMethod">调用子组件方法</button>
</template>

<script setup>
import { ref } from 'vue';

const childRef = ref(null);

function callChildMethod() {
    childRef.value.childMethod();
}
</script>

<!-- 子组件 -->
<script setup>
import { defineExpose } from 'vue';

function childMethod() {
    console.log('子组件方法被调用');
}

// 必须显式暴露
defineExpose({
    childMethod,
});
</script>
```

---

## 第四部分：性能优化实战

### 4.1 组件懒加载

```javascript
// 路由懒加载
const routes = [
    {
        path: '/about',
        component: () => import('./views/About.vue'),
    },
];

// 组件懒加载
import { defineAsyncComponent } from 'vue';

const AsyncComp = defineAsyncComponent(() =>
    import('./components/HeavyComponent.vue')
);
```

---

### 4.2 虚拟滚动

```vue
<template>
    <div class="virtual-list" @scroll="handleScroll">
        <div :style="{ height: totalHeight + 'px' }"></div>
        <div :style="{ transform: `translateY(${offsetY}px)` }">
            <div v-for="item in visibleItems" :key="item.id">
                {{ item.text }}
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
    items: Array,
    itemHeight: { type: Number, default: 50 },
});

const scrollTop = ref(0);
const containerHeight = 600;

const visibleCount = Math.ceil(containerHeight / props.itemHeight);
const startIndex = computed(() =>
    Math.floor(scrollTop.value / props.itemHeight)
);
const endIndex = computed(() => startIndex.value + visibleCount);

const visibleItems = computed(() =>
    props.items.slice(startIndex.value, endIndex.value)
);

const totalHeight = computed(() => props.items.length * props.itemHeight);
const offsetY = computed(() => startIndex.value * props.itemHeight);

function handleScroll(e) {
    scrollTop.value = e.target.scrollTop;
}
</script>
```

---

### 4.3 防抖与节流

```javascript
// 防抖
import { ref } from 'vue';

function useDebouncedRef(value, delay = 300) {
    const debouncedValue = ref(value);
    let timer = null;

    function setValue(newValue) {
        clearTimeout(timer);
        timer = setTimeout(() => {
            debouncedValue.value = newValue;
        }, delay);
    }

    return [debouncedValue, setValue];
}

// 使用
const [searchQuery, setSearchQuery] = useDebouncedRef('');
```

---

### 4.4 KeepAlive 缓存

```vue
<template>
    <keep-alive :include="['ComponentA', 'ComponentB']">
        <component :is="currentComponent" />
    </keep-alive>
</template>

<script setup>
import { ref, onActivated, onDeactivated } from 'vue';

// 组件激活时调用
onActivated(() => {
    console.log('组件被激活');
});

// 组件失活时调用
onDeactivated(() => {
    console.log('组件被缓存');
});
</script>
```

---

## 第五部分：设计模式与最佳实践

### 5.1 组合式函数（Composables）

```javascript
// useCounter.js
import { ref, computed } from 'vue';

export function useCounter(initialValue = 0) {
    const count = ref(initialValue);
    const doubleCount = computed(() => count.value * 2);

    function increment() {
        count.value++;
    }

    function decrement() {
        count.value--;
    }

    return {
        count,
        doubleCount,
        increment,
        decrement,
    };
}

// 使用
import { useCounter } from './useCounter';

const { count, increment } = useCounter(10);
```

---

### 5.2 状态管理最佳实践

```javascript
// stores/user.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useUserStore = defineStore('user', () => {
    // State
    const user = ref(null);
    const token = ref(localStorage.getItem('token'));

    // Getters
    const isLoggedIn = computed(() => !!token.value);
    const userName = computed(() => user.value?.name || 'Guest');

    // Actions
    async function login(credentials) {
        const res = await api.login(credentials);
        user.value = res.user;
        token.value = res.token;
        localStorage.setItem('token', res.token);
    }

    function logout() {
        user.value = null;
        token.value = null;
        localStorage.removeItem('token');
    }

    return {
        user,
        token,
        isLoggedIn,
        userName,
        login,
        logout,
    };
});
```

---

## 第六部分：常见问题与解决方案

### 6.1 内存泄漏问题

```vue
<script setup>
import { onMounted, onUnmounted } from 'vue';

// ❌ 错误：忘记清理定时器
onMounted(() => {
    setInterval(() => {
        console.log('tick');
    }, 1000);
});

// ✅ 正确：清理定时器
let timer = null;

onMounted(() => {
    timer = setInterval(() => {
        console.log('tick');
    }, 1000);
});

onUnmounted(() => {
    clearInterval(timer);
});
</script>
```

---

### 6.2 循环引用问题

```javascript
// ❌ 错误：组件 A 和 B 互相引用
// ComponentA.vue
import ComponentB from './ComponentB.vue';

// ComponentB.vue
import ComponentA from './ComponentA.vue';

// ✅ 解决方案：异步组件
// ComponentA.vue
const ComponentB = defineAsyncComponent(() => import('./ComponentB.vue'));
```

---

## 🎯 学习建议

1. **理解原理**：不要只会用 API，要理解背后的原理
2. **多写代码**：理论结合实践，做项目才能真正掌握
3. **阅读源码**：Vue 3 源码质量很高，值得学习
4. **关注性能**：从一开始就养成性能优化的习惯

## 📚 推荐资源

-   [Vue 3 源码解析](https://github.com/vuejs/core)
-   [Vue Mastery](https://www.vuemastery.com/)
-   [Vue 3 设计与实现](https://book.douban.com/subject/35768338/)
