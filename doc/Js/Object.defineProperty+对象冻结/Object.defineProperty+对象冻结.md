# Object.defineProperty+对象冻结

## 语法

### Object.defineProperty

```
Object.defineProperty(obj, prop, descriptor)
参数：
  obj 要定义属性的对象。
  prop  要定义或修改的属性的名称或 Symbol 。
  descriptor  要定义或修改的【属性描述符】。
返回值： 被传递给函数的对象。
```

对象里目前存在的属性描述符有两种主要形式：数据描述符/数据属性和存取描述符/访问器属性

#### 数据描述符/数据属性

数据描述符是一个具有值的属性，该值可以是可写的，也可以是不可写的。

```js
{
  configurable: true, // 密封 【false可改不可增删】，当且仅当该属性的 configurable 键值为 true 时，该属性的描述符才能够被改变，同时该属性也能从对应的对象上被删除。
  enumberable: true, // 枚举 当且仅当该属性的 enumerable 键值为 true 时，该属性才会出现在对象的枚举属性中。定义了对象的属性是否可以在 for...in 循环和 Object.keys() 中被枚举。
  value: 1, // 该属性对应的值。可以是任何有效的 JavaScript 值（数值，对象，函数等）。
  writable: true, // 冻结对象【false不可增删改】 当且仅当该属性的 writable 键值为 true 时，属性的值也就是上面的 value，才能被赋值运算符改变。
}
```

#### 存取描述符/访问器属性

存取描述符是由 getter 函数和 setter 函数所描述的属性。一个描述符只能是这两者其中之一；不能同时是两者。

```js
{
  configurable: true, // 同上
  enumerable: true, // 同上
  set: undefined, // 属性的 setter 函数，如果没有 setter，则为 undefined。当属性值被修改时，会调用此函数。该方法接受一个参数（也就是被赋予的新值），会传入赋值时的 this 对象。
  get: undefined, //属性的 getter 函数，如果没有 getter，则为 undefined。当访问该属性时，会调用此函数。执行时不传入任何参数，但是会传入 this 对象（由于继承关系，这里的this并不一定是定义该属性的对象）。该函数的返回值会被用作属性的值。
}
```

#### 默认值

`Object.defineProperty` 中 `configurable、enumerable 和 writable` 的默认值都是 `false`， `value、get、set` 字段的默认值为`undefined`

如果使用`直接赋值`的方式创建对象的属性，`configurable、enumerable 和 writable` 默认值则为 `true`，`value`则为 `对应的值`，`get、set` 字段的默认值为`undefined`

```js
let obj = {}
Object.defineProperty(obj, 'a', {})
// 等同于
Object.defineProperty(obj, 'a', {
  value: undefined,
  writable: false,
  configurable: false,
  enumerable: false,
})
Object.getOwnPropertyDescriptors(obj)
// {
//   a: {
//     configurable: false,
//     enumberable: false,
//     value: undefined,
//     writable: false,
//   },
// }

let obj2 = { a: 1 }
// 等同于
let obj2 = {}
Object.defineProperty(obj2, 'a', {
  value: 1,
  writable: true,
  configurable: true,
  enumerable: true,
})
Object.getOwnPropertyDescriptors(obj2)
// {
//   a: {
//     configurable: true
//     enumerable: true
//     value: 1
//     writable: true
//   },
// }
```

### 不可扩展对象

【可删改不可增】
`Object.preventExtensions(obj)`仅阻止添加自身的属性。但属性仍然可以添加到对象原型。可以用 `Object.isExtensible(obj)` 来判断对象是否可扩展

```js
let obj = { a: 1 }
Object.preventExtensions(obj)
Object.isExtensible(obj) // false
obj.b = 3 // {a:1} // throws an error in strict mode
obj.a = 2 // {a:2}
delete obj.a // {}
Object.getOwnPropertyDescriptors(obj2) // {}
```

### 密封对象

【可改不可增删】
`Object.seal(obj)`密封对象不可增删，而且已有的属性成员`configurable`特性将被设置成`false`，可以用 `Object.isSealed()` 来判断对象是否已经被密封

```js
let obj2 = { a: 1 }
Object.seal(obj2)
Object.isSealed(obj2) // true
obj2.b = 3 // {a:1} 不可增 // throws an error in strict mode
obj2.a = 3 // {a:3} 可改
delete obj2.a // {a:3} 不可删 // throws an error in strict mode

Object.getOwnPropertyDescriptors(obj2)
// {
//   a: {
//     configurable: false, // 密封
//     enumberable: true, // 枚举 表示能否通过for-in循环返回属性，自定义的对象属性，默认值为true。
//     value: 3,
//     writable: true, // 冻结对象
//   },
// }
```

### 冻结对象，不可写

【不可增删改】
`Object.freeze(obj)`冻结的对象既不可以扩展，又是密封的，而且对象数据属性的 `writable` 特性会被设置为 false。可用`Object.isFrozen(obj)`判断是否冻结。

```js
let obj3 = { a: 1 }
Object.freeze(obj3)
Object.isFrozen(obj3) // true
obj3.b = 3 // {a:1} // throws an error in strict mode
obj3.a = 3 // {a:1} // throws an error in strict mode
delete obj3.a // {a:1} // throws an error in strict mode

Object.getOwnPropertyDescriptors(obj3)
// {
//   a: {
//     configurable: false, // 密封
//     enumberable: true, // 枚举
//     value: 1,
//     writable: false, // 冻结对象
//   },
// }
```

注意： 可用对象访问器 get、set 来修改冻结对象

```js
let obj3 = { a: 1 }
let _obj3 = {}
Object.defineProperty(_obj3, 'a', {
  configurable: false,
  enumerable: true,
  set(val) {
    obj3.a = val
  },
  get() {
    return obj3.a
  },
})
Object.freeze(_obj3)
_obj3.a // 1
_obj3.a = 2
_obj3.a // 2
```

## 总结：

| 方法名                   | 增(extensible) | 删(configurable) | 改(writable) |
| ------------------------ | -------------- | ---------------- | ------------ |
| Object.preventExtensions | ❌             | ✅               | ✅           |
| Object.seal              | ❌             | ❌               | ✅           |
| Object.freeze            | ❌             | ❌               | ❌           |

## Vue 响应式系统和对象冻结

https://cn.vuejs.org/v2/guide/instance.html

这里唯一的例外是使用 `Object.freeze()`，这会阻止修改现有的 property，也意味着响应系统无法再追踪变化。

```js
var obj = {
  foo: 'bar',
}
Object.freeze(obj)
new Vue({
  el: '#app',
  data: obj,
})
```

```html
<div id="app">
  <p>{{ foo }}</p>
  <!-- 这里的 `foo` 不会更新！ -->
  <button v-on:click="foo = 'baz'">Change it</button>
</div>
```

## 参考

https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty

https://cn.vuejs.org/v2/guide/instance.html
