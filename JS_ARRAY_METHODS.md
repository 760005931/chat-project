# 📚 JavaScript 数组方法完全指南

这份文档涵盖了所有常用的 JavaScript 数组方法，每个方法都有详细的说明、示例和面试考点。

---

## 🚀 快速回忆 - 25 个常用数组方法分类

### 1️⃣ 遍历方法 (6 个)

-   `forEach` - 遍历数组
-   `map` - 映射转换
-   `filter` - 过滤筛选
-   `reduce` - 累加器（最强大）
-   `some` - 是否有满足条件的
-   `every` - 是否所有都满足

### 2️⃣ 转换方法 (4 个)

-   `join` - 数组转字符串
-   `concat` - 合并数组
-   `flat` - 扁平化
-   `flatMap` - 映射后扁平化

### 3️⃣ 查找方法 (4 个)

-   `find` - 查找元素
-   `findIndex` - 查找索引
-   `indexOf` - 精确匹配索引
-   `includes` - 是否包含

### 4️⃣ 修改方法 (8 个)

-   `push/pop` - 末尾增删
-   `unshift/shift` - 开头增删
-   `splice` - 万能修改
-   `slice` - 截取（不修改原数组）
-   `reverse` - 反转
-   `sort` - 排序

### 5️⃣ 其他方法 (3 个)

-   `fill` - 填充
-   `Array.from` - 类数组转数组
-   `Array.isArray` - 判断是否为数组

---

---

## 遍历方法

### 1. forEach - 遍历数组

**语法**：`array.forEach((item, index, array) => {})`

**特点**：

-   **不返回值**（返回 `undefined`）
-   **不能中断**（不能用 `break` 或 `return` 跳出循环）
-   **会修改原数组**（如果在回调中修改）

**示例**：

```javascript
const arr = [1, 2, 3];

arr.forEach((item, index) => {
    console.log(`索引 ${index}: ${item}`);
});
// 输出:
// 索引 0: 1
// 索引 1: 2
// 索引 2: 3

// ❌ 无法中断
arr.forEach((item) => {
    if (item === 2) return; // 只跳过当前循环，不会终止整个遍历
    console.log(item);
});
// 输出: 1, 3
```

**使用场景**：

-   单纯遍历数组，执行副作用操作（如打印、发请求）
-   不需要返回值的场景

---

### 2. map - 映射转换

**语法**：`array.map((item, index, array) => newItem)`

**特点**：

-   **返回新数组**（长度与原数组相同）
-   **不修改原数组**
-   每个元素都会被转换

**示例**：

```javascript
const arr = [1, 2, 3];

// 基础用法：每个元素乘以 2
const doubled = arr.map((item) => item * 2);
console.log(doubled); // [2, 4, 6]

// 对象数组转换
const users = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
];
const names = users.map((user) => user.name);
console.log(names); // ['Alice', 'Bob']

// 带索引
const withIndex = arr.map((item, index) => `${index}: ${item}`);
console.log(withIndex); // ['0: 1', '1: 2', '2: 3']
```

**使用场景**：

-   数据格式转换（如提取对象的某个属性）
-   数组元素批量处理

**面试考点**：

```javascript
// Q: map 和 forEach 的区别？
// A: map 返回新数组，forEach 返回 undefined

// Q: 能用 map 代替 forEach 吗？
// A: 可以，但如果不需要返回值，用 forEach 更语义化
```

---

### 3. filter - 过滤筛选

**语法**：`array.filter((item, index, array) => boolean)`

**特点**：

-   **返回新数组**（包含满足条件的元素）
-   **不修改原数组**
-   回调返回 `true` 的元素会被保留

**示例**：

```javascript
const arr = [1, 2, 3, 4, 5];

// 筛选偶数
const evens = arr.filter((item) => item % 2 === 0);
console.log(evens); // [2, 4]

// 筛选对象
const users = [
    { id: 1, name: 'Alice', age: 25 },
    { id: 2, name: 'Bob', age: 17 },
    { id: 3, name: 'Charlie', age: 30 },
];
const adults = users.filter((user) => user.age >= 18);
console.log(adults); // [{ id: 1, ... }, { id: 3, ... }]

// 去重（配合 indexOf）
const duplicates = [1, 2, 2, 3, 3, 4];
const unique = duplicates.filter((item, index, arr) => {
    return arr.indexOf(item) === index;
});
console.log(unique); // [1, 2, 3, 4]
```

**使用场景**：

-   数据筛选（如筛选符合条件的用户）
-   去重

---

### 4. reduce - 累加器

**语法**：`array.reduce((accumulator, item, index, array) => newAccumulator, initialValue)`

**特点**：

-   **返回单个值**（可以是任何类型：数字、对象、数组等）
-   **最灵活**的数组方法，可以实现 map、filter 等所有功能

**参数说明**：

-   `accumulator`：累积值（上一次回调的返回值）
-   `item`：当前元素
-   `initialValue`：初始值（可选，但**强烈建议提供**）

**示例**：

**1. 求和**

```javascript
const arr = [1, 2, 3, 4];

const sum = arr.reduce((acc, item) => {
    return acc + item;
}, 0); // 初始值是 0

console.log(sum); // 10

// 执行过程：
// 第1轮: acc=0, item=1 → 返回 0+1=1
// 第2轮: acc=1, item=2 → 返回 1+2=3
// 第3轮: acc=3, item=3 → 返回 3+3=6
// 第4轮: acc=6, item=4 → 返回 6+4=10
```

**2. 数组转对象**

```javascript
const users = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
];

const userMap = users.reduce((acc, user) => {
    acc[user.id] = user;
    return acc;
}, {}); // 初始值是空对象

console.log(userMap);
// { 1: { id: 1, name: 'Alice' }, 2: { id: 2, name: 'Bob' } }
```

**3. 扁平化数组**

```javascript
const nested = [[1, 2], [3, 4], [5]];

const flat = nested.reduce((acc, item) => {
    return acc.concat(item);
}, []);

console.log(flat); // [1, 2, 3, 4, 5]
```

**4. 统计出现次数**

```javascript
const fruits = ['apple', 'banana', 'apple', 'orange', 'banana', 'apple'];

const count = fruits.reduce((acc, fruit) => {
    acc[fruit] = (acc[fruit] || 0) + 1;
    return acc;
}, {});

console.log(count);
// { apple: 3, banana: 2, orange: 1 }
```

**使用场景**：

-   求和、求积
-   数组转对象
-   扁平化
-   分组统计

**面试考点**：

```javascript
// Q: 不提供初始值会怎样？
const arr = [1, 2, 3];
const sum1 = arr.reduce((acc, item) => acc + item); // 6 (初始值是 arr[0]=1)
const sum2 = arr.reduce((acc, item) => acc + item, 0); // 6

// Q: 空数组不提供初始值会报错！
const empty = [];
// empty.reduce((acc, item) => acc + item); // ❌ TypeError
empty.reduce((acc, item) => acc + item, 0); // ✅ 0
```

---

### 5. some - 是否有满足条件的元素

**语法**：`array.some((item, index, array) => boolean)`

**特点**：

-   返回 `true` 或 `false`
-   **只要有一个**元素满足条件，立即返回 `true` 并停止遍历
-   类似逻辑或 `||`

**示例**：

```javascript
const arr = [1, 2, 3, 4, 5];

// 是否有偶数
const hasEven = arr.some((item) => item % 2 === 0);
console.log(hasEven); // true

// 是否有大于 10 的数
const hasLarge = arr.some((item) => item > 10);
console.log(hasLarge); // false

// 对象数组
const users = [
    { name: 'Alice', age: 17 },
    { name: 'Bob', age: 25 },
];
const hasAdult = users.some((user) => user.age >= 18);
console.log(hasAdult); // true
```

**使用场景**：

-   检查数组中是否存在符合条件的元素
-   表单验证（是否有未填写的字段）

---

### 6. every - 是否所有元素都满足条件

**语法**：`array.every((item, index, array) => boolean)`

**特点**：

-   返回 `true` 或 `false`
-   **所有元素**都满足条件才返回 `true`
-   类似逻辑与 `&&`

**示例**：

```javascript
const arr = [2, 4, 6, 8];

// 是否都是偶数
const allEven = arr.every((item) => item % 2 === 0);
console.log(allEven); // true

// 是否都大于 5
const allLarge = arr.every((item) => item > 5);
console.log(allLarge); // false (2 和 4 不满足)

// 对象数组
const users = [
    { name: 'Alice', age: 25 },
    { name: 'Bob', age: 30 },
];
const allAdults = users.every((user) => user.age >= 18);
console.log(allAdults); // true
```

**使用场景**：

-   验证所有元素是否符合规则
-   权限检查（是否所有用户都有权限）

---

## 转换方法

### 7. join - 数组转字符串

**语法**：`array.join(separator)`

**特点**：

-   返回字符串
-   默认分隔符是 `,`

**示例**：

```javascript
const arr = ['a', 'b', 'c'];

console.log(arr.join()); // "a,b,c" (默认逗号)
console.log(arr.join('')); // "abc"
console.log(arr.join('-')); // "a-b-c"
console.log(arr.join(' | ')); // "a | b | c"

// 数字数组
const nums = [1, 2, 3];
console.log(nums.join('+')); // "1+2+3"
```

**使用场景**：

-   拼接 URL 参数
-   生成 CSV 数据

---

### 8. concat - 合并数组

**语法**：`array.concat(array2, array3, ...)`

**特点**：

-   **返回新数组**
-   **不修改原数组**

**示例**：

```javascript
const arr1 = [1, 2];
const arr2 = [3, 4];
const arr3 = [5, 6];

const merged = arr1.concat(arr2, arr3);
console.log(merged); // [1, 2, 3, 4, 5, 6]

// 也可以合并单个元素
const result = arr1.concat(10, arr2);
console.log(result); // [1, 2, 10, 3, 4]

// ES6 扩展运算符（更推荐）
const merged2 = [...arr1, ...arr2, ...arr3];
console.log(merged2); // [1, 2, 3, 4, 5, 6]
```

---

### 9. flat - 扁平化数组

**语法**：`array.flat(depth)`

**特点**：

-   返回新数组
-   `depth` 指定展开深度，默认是 1

**示例**：

```javascript
const nested = [1, [2, 3], [4, [5, 6]]];

console.log(nested.flat()); // [1, 2, 3, 4, [5, 6]] (默认深度 1)
console.log(nested.flat(2)); // [1, 2, 3, 4, 5, 6] (深度 2)
console.log(nested.flat(Infinity)); // [1, 2, 3, 4, 5, 6] (完全展开)

// 去除空项
const withHoles = [1, 2, , 4, 5];
console.log(withHoles.flat()); // [1, 2, 4, 5]
```

---

### 10. flatMap - 映射后扁平化

**语法**：`array.flatMap((item) => newItem)`

**特点**：

-   相当于 `map` + `flat(1)`
-   只展开一层

**示例**：

```javascript
const arr = [1, 2, 3];

// 每个元素变成 [item, item * 2]
const result = arr.flatMap((item) => [item, item * 2]);
console.log(result); // [1, 2, 2, 4, 3, 6]

// 等价于
const result2 = arr.map((item) => [item, item * 2]).flat();
console.log(result2); // [1, 2, 2, 4, 3, 6]

// 实际应用：提取所有标签
const articles = [
    { title: 'A', tags: ['js', 'react'] },
    { title: 'B', tags: ['vue', 'css'] },
];
const allTags = articles.flatMap((article) => article.tags);
console.log(allTags); // ['js', 'react', 'vue', 'css']
```

---

## 查找方法

### 11. find - 查找第一个满足条件的元素

**语法**：`array.find((item, index, array) => boolean)`

**特点**：

-   返回**第一个**满足条件的元素
-   找不到返回 `undefined`

**示例**：

```javascript
const arr = [1, 2, 3, 4, 5];

const found = arr.find((item) => item > 3);
console.log(found); // 4 (第一个大于 3 的)

const notFound = arr.find((item) => item > 10);
console.log(notFound); // undefined

// 对象数组
const users = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
];
const user = users.find((u) => u.id === 2);
console.log(user); // { id: 2, name: 'Bob' }
```

---

### 12. findIndex - 查找索引

**语法**：`array.findIndex((item, index, array) => boolean)`

**特点**：

-   返回**第一个**满足条件的元素的索引
-   找不到返回 `-1`

**示例**：

```javascript
const arr = [1, 2, 3, 4, 5];

const index = arr.findIndex((item) => item > 3);
console.log(index); // 3 (索引从 0 开始)

const notFound = arr.findIndex((item) => item > 10);
console.log(notFound); // -1
```

---

### 13. indexOf - 查找元素索引（精确匹配）

**语法**：`array.indexOf(searchElement, fromIndex)`

**特点**：

-   返回**第一个**匹配元素的索引
-   使用 `===` 严格相等
-   找不到返回 `-1`

**示例**：

```javascript
const arr = [1, 2, 3, 2, 1];

console.log(arr.indexOf(2)); // 1 (第一个 2 的索引)
console.log(arr.indexOf(2, 2)); // 3 (从索引 2 开始找)
console.log(arr.indexOf(10)); // -1

// 判断是否存在
if (arr.indexOf(3) !== -1) {
    console.log('存在');
}

// ES6 更推荐用 includes
if (arr.includes(3)) {
    console.log('存在');
}
```

---

### 14. includes - 是否包含某元素

**语法**：`array.includes(searchElement, fromIndex)`

**特点**：

-   返回 `true` 或 `false`
-   可以检测 `NaN`（indexOf 不行）

**示例**：

```javascript
const arr = [1, 2, 3, NaN];

console.log(arr.includes(2)); // true
console.log(arr.includes(10)); // false
console.log(arr.includes(NaN)); // true

// indexOf 无法检测 NaN
console.log(arr.indexOf(NaN)); // -1
```

---

## 修改方法

### 15. push - 末尾添加元素

**语法**：`array.push(element1, element2, ...)`

**特点**：

-   **修改原数组**
-   返回新数组的长度

**示例**：

```javascript
const arr = [1, 2];

const newLength = arr.push(3, 4);
console.log(arr); // [1, 2, 3, 4]
console.log(newLength); // 4
```

---

### 16. pop - 删除末尾元素

**语法**：`array.pop()`

**特点**：

-   **修改原数组**
-   返回被删除的元素

**示例**：

```javascript
const arr = [1, 2, 3];

const removed = arr.pop();
console.log(arr); // [1, 2]
console.log(removed); // 3
```

---

### 17. unshift - 开头添加元素

**语法**：`array.unshift(element1, element2, ...)`

**特点**：

-   **修改原数组**
-   返回新数组的长度

**示例**：

```javascript
const arr = [3, 4];

const newLength = arr.unshift(1, 2);
console.log(arr); // [1, 2, 3, 4]
console.log(newLength); // 4
```

---

### 18. shift - 删除开头元素

**语法**：`array.shift()`

**特点**：

-   **修改原数组**
-   返回被删除的元素

**示例**：

```javascript
const arr = [1, 2, 3];

const removed = arr.shift();
console.log(arr); // [2, 3]
console.log(removed); // 1
```

---

### 19. splice - 万能修改方法

**语法**：`array.splice(start, deleteCount, item1, item2, ...)`

**特点**：

-   **修改原数组**
-   可以删除、插入、替换
-   返回被删除的元素数组

**示例**：

**删除**

```javascript
const arr = [1, 2, 3, 4, 5];
const removed = arr.splice(1, 2); // 从索引 1 开始删除 2 个
console.log(arr); // [1, 4, 5]
console.log(removed); // [2, 3]
```

**插入**

```javascript
const arr = [1, 4, 5];
arr.splice(1, 0, 2, 3); // 从索引 1 开始，删除 0 个，插入 2 和 3
console.log(arr); // [1, 2, 3, 4, 5]
```

**替换**

```javascript
const arr = [1, 2, 3, 4, 5];
arr.splice(1, 2, 'a', 'b'); // 删除 2 个，插入 'a' 和 'b'
console.log(arr); // [1, 'a', 'b', 4, 5]
```

---

### 20. slice - 截取数组（不修改原数组）

**语法**：`array.slice(start, end)`

**特点**：

-   **不修改原数组**
-   返回新数组
-   `end` 不包含在内

**示例**：

```javascript
const arr = [1, 2, 3, 4, 5];

console.log(arr.slice(1, 3)); // [2, 3] (索引 1 到 2)
console.log(arr.slice(2)); // [3, 4, 5] (从索引 2 到末尾)
console.log(arr.slice(-2)); // [4, 5] (最后 2 个)
console.log(arr); // [1, 2, 3, 4, 5] (原数组不变)

// 复制数组
const copy = arr.slice();
console.log(copy); // [1, 2, 3, 4, 5]
```

---

### 21. reverse - 反转数组

**语法**：`array.reverse()`

**特点**：

-   **修改原数组**
-   返回反转后的数组

**示例**：

```javascript
const arr = [1, 2, 3];
arr.reverse();
console.log(arr); // [3, 2, 1]
```

---

### 22. sort - 排序

**语法**：`array.sort(compareFunction)`

**特点**：

-   **修改原数组**
-   默认按**字符串**排序（坑！）

**示例**：

**默认排序（字符串）**

```javascript
const arr = [10, 2, 30, 1];
arr.sort();
console.log(arr); // [1, 10, 2, 30] ❌ 错误！按字符串排序
```

**数字排序**

```javascript
const arr = [10, 2, 30, 1];

// 升序
arr.sort((a, b) => a - b);
console.log(arr); // [1, 2, 10, 30] ✅

// 降序
arr.sort((a, b) => b - a);
console.log(arr); // [30, 10, 2, 1]
```

**对象排序**

```javascript
const users = [
    { name: 'Alice', age: 25 },
    { name: 'Bob', age: 20 },
    { name: 'Charlie', age: 30 },
];

// 按年龄升序
users.sort((a, b) => a.age - b.age);
console.log(users);
// [{ name: 'Bob', age: 20 }, { name: 'Alice', age: 25 }, { name: 'Charlie', age: 30 }]
```

---

## 其他方法

### 23. fill - 填充数组

**语法**：`array.fill(value, start, end)`

**特点**：

-   **修改原数组**
-   用固定值填充

**示例**：

```javascript
const arr = [1, 2, 3, 4, 5];

arr.fill(0);
console.log(arr); // [0, 0, 0, 0, 0]

arr.fill(9, 1, 3);
console.log(arr); // [0, 9, 9, 0, 0]

// 创建固定长度的数组
const zeros = new Array(5).fill(0);
console.log(zeros); // [0, 0, 0, 0, 0]
```

---

### 24. Array.from - 类数组转数组

**语法**：`Array.from(arrayLike, mapFunction)`

**特点**：

-   静态方法
-   可以转换类数组对象、Set、Map 等

**示例**：

```javascript
// 字符串转数组
const str = 'hello';
const arr = Array.from(str);
console.log(arr); // ['h', 'e', 'l', 'l', 'o']

// Set 转数组
const set = new Set([1, 2, 3]);
const arr2 = Array.from(set);
console.log(arr2); // [1, 2, 3]

// 带映射函数
const arr3 = Array.from([1, 2, 3], (x) => x * 2);
console.log(arr3); // [2, 4, 6]

// 生成序列
const range = Array.from({ length: 5 }, (_, i) => i);
console.log(range); // [0, 1, 2, 3, 4]
```

---

### 25. Array.isArray - 判断是否为数组

**语法**：`Array.isArray(value)`

**示例**：

```javascript
console.log(Array.isArray([1, 2, 3])); // true
console.log(Array.isArray('hello')); // false
console.log(Array.isArray({ a: 1 })); // false
console.log(Array.isArray(null)); // false
```

---

## 🎯 面试高频对比

### map vs forEach

| 特性     | map          | forEach   |
| -------- | ------------ | --------- |
| 返回值   | 新数组       | undefined |
| 使用场景 | 需要转换数据 | 只需遍历  |

### some vs every

| 特性   | some                | every           |
| ------ | ------------------- | --------------- |
| 逻辑   | 或 (有一个满足即可) | 与 (所有都满足) |
| 返回值 | boolean             | boolean         |

### find vs filter

| 特性   | find     | filter |
| ------ | -------- | ------ |
| 返回值 | 单个元素 | 数组   |
| 数量   | 第一个   | 所有   |

### splice vs slice

| 特性       | splice         | slice |
| ---------- | -------------- | ----- |
| 修改原数组 | ✅             | ❌    |
| 用途       | 删除/插入/替换 | 截取  |

---

## 💡 记忆技巧

**会修改原数组的方法（7 个）**：

-   `push`, `pop`, `unshift`, `shift`
-   `splice`, `reverse`, `sort`

**不修改原数组的方法**：

-   `map`, `filter`, `reduce`, `slice`, `concat`
-   `find`, `findIndex`, `indexOf`, `includes`
-   `some`, `every`, `forEach`

**口诀**：

-   **增删改查**：push/pop/unshift/shift (增删), splice (改), find/filter (查)
-   **遍历三剑客**：forEach (遍历), map (转换), filter (筛选)
-   **累加器之王**：reduce (万能)
