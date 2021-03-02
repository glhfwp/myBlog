# React Hooks 和类组件对比

## 一、 类组件生命周期迁移到 Hooks

Hook 是 React 16.8 的新增特性。它可以让你在不编写 class 的情况下使用 state 以及其他的 React 特性。

### 1、 类组件生命周期和 Hooks

#### 1.1 `constructor`：函数组件不需要构造函数。你可以通过调用 `useState` 来初始化 state。如果计算的代价比较昂贵，你可以传一个函数给 `useState`

1、 类组件：

```js
class Com extends React.Component {
  state = {
    a: 1,
    b: 2,
  }
  componentDidMount() {
    handleA()
    handleB()
  }
}
```

2、 Hooks：

```js
function useA() {
  const [stateA, setStateA] = useState(0)
  useEffect(() => {
    handleA()
  }, [])
  return stateA
}

function useB() {
  const [stateB, setStateB] = useState(1)
  useEffect(() => {
    handleB()
  }, [])
  return stateB
}

function Com() {
  const a = useA()
  const b = useB()
}
```

#### 1.2 `getDerivedStateFromProps`：一般情况下，我们不需要使用它，我们可以改为在渲染时安排一次更新。

```js
function ScrollView({ row }) {
  let [isScrollingDown, setIsScrollingDown] = useState(false)
  let [prevRow, setPrevRow] = useState(null)
  if (row !== prevRow) {
    // Row 自上次渲染以来发生过改变。更新 isScrollingDown。
    setIsScrollingDown(prevRow !== null && row > prevRow)
    setPrevRow(row)
  }
  return `Scrolling down: ${isScrollingDown}`
}
```

React 会立即退出第一次渲染并用更新后的 state 重新运行组件以避免消耗太多性能。渲染期间的一次更新恰恰就是 getDerivedStateFromProps 一直以来的概念。

#### 1.3 `shouldComponentUpdate`：memo 和 useMemo

1、 可以用 `React.memo`包裹一个组件来对它的 props 进行浅比较，注意这不是一个 Hook 因为它的写法和 Hook 不同。`React.memo` 等效于 `PureComponent`，但它只比较 props。（你也可以通过第二个参数指定一个自定义的比较函数来比较新旧 props。如果函数返回 true，就会跳过更新。）

```js
const Button = React.memo(props => {
  // 你的组件
})
```

`React.memo` 不比较 state，因为没有单一的 state 对象可供比较。但你也可以让子节点变为纯组件，或者用 useMemo 做性能优化。

2、 在使用类组件的时候，我们需要利用 componentShouldUpdate 这个生命周期钩子来判断当前是否需要重新渲染，而改用 React Hooks 后，我们可以利用 useMemo 来判断该参数变化是否需要重新渲染，达到局部性能优化的效果。useMemo 和 useEffect 的用法基本上一样。

```js
export default React.memo(function({data}){
  return useMemo(() => (
    // data.test的各种处理逻辑，不会受data的其他参数变化影响导致重新渲染
  ), [data.test])
}
```

#### 1.4 `render`：这是函数组件体本身。

#### 1.5 `componentDidMount`, `componentDidUpdate`, `componentWillUnmount`： useEffect Hook

1、 可以把 `useEffect Hook` 看做 `componentDidMount`，`componentDidUpdate` 和 `componentWillUnmount` 这三个函数的组合。

注意 React 会等待浏览器完成画面渲染之后才会延迟调用 `useEffect`，因此会使得额外操作很方便。与 `componentDidMount` 或 `componentDidUpdate` 不同，使用 `useEffect` 调度的 effect 不会阻塞浏览器更新屏幕，这让你的应用看起来响应更快。大多数情况下，effect 不需要同步地执行。在个别情况下（例如测量布局），有单独的 `useLayoutEffect Hook` 供你使用，其 API 与 `useEffect` 相同。

```js
useEffect(() => {
  // 在 componentDidMount，以及 count 更改时 componentDidUpdate 执行的内容
  document.title = `You clicked ${count} times`
  return () => {
    // useEffect 可以在组件渲染后实现各种不同的副作用。有些副作用可能需要清除，所以需要返回一个函数来执行 componentWillUnmount 执行的内容。
    // 并不需要特定的代码来处理更新逻辑，因为 useEffect 默认就会处理。它会在调用一个新的 effect 之前对前一个 effect 进行清理。
  }
}, [count]) // 仅在 count 更改时更新
```

2、 例子如下

类组件：

```js
class VisibilityChange extends React.Component {
  componentDidMount() {
    document.addEventListener(this.visibilityChange, this.handleVisibilityChange, false)
  }
  componentWillUnmount() {
    document.removeEventListener(this.visibilityChange, this.handleVisibilityChange)
  }
  // ...省略代码
}
```

Hooks：

```js
function useVisibilityChange() {
  const [visibility, setVisibility] = useState(true)
  useEffect(() => {
    var hidden, visibilityChange
    // ...省略代码
    document.addEventListener(visibilityChange, handleVisibilityChange, false)
    return () => {
      document.removeEventListener(visibilityChange, handleVisibilityChange)
    }
  }, [])
}
```

生命周期明显更偏向于传统的事件驱动，而 React Hooks 数据驱动的特性能够变得更纯粹。

我们不需要考虑生命周期，我们可以使用多个 useEffect ，或者多个自定义 Hooks 来区分开多个无关联的逻辑代码段，保障高内聚特性。

#### 1.6 `componentWillUnmount`：相当于 `useEffect `里面返回的清理函数

```js
useEffect(() => {
  // 需要在 componentDidMount/componentDidUpdate 执行的内容
  return function cleanup() {
    // 需要在 componentWillUnmount 执行的内容
  }
}, [])
```

#### 1.7 `getSnapshotBeforeUpdate`，`componentDidCatch` 以及 `getDerivedStateFromError`：目前还没有这些方法的 Hook 等价写法，但很快会被添加。

### 2、 生命周期对比如下：

| class 组件               | Hooks 组件                  |
| ------------------------ | --------------------------- |
| constructor              | useState                    |
| getDerivedStateFromProps | useState 里面 setState 函数 |
| shouldComponentUpdate    | useMemo                     |
| render                   | 函数本身                    |
| componentDidMount        | useEffect                   |
| componentDidUpdate       | useEffect                   |
| componentWillUnmount     | useEffect 里面返回的函数    |
| getSnapshotBeforeUpdate  | 无                          |
| componentDidCatch        | 无                          |
| getDerivedStateFromError | 无                          |

## 二、 优缺点对比

**函数组件**

**特性：**

1、 无状态组件，无 state 和生命周期，无实例化的 this。

2、 逻辑简单容易复用

**类组件：**

**特性：**

1、 需要继承自 Component；

2、 内部可以定义自己的 state，用来保存组件自己内部的状态，而函数组件每次调用都会产生新的临时变量；

3、 使用组件自己的生命周期，可以在对应的生命周期中完成自己的逻辑；

**缺点：**

1、 复杂组件变得难以理解，最初编写 class 组件时，往往逻辑比较简单，但是业务增多，class 组件代码就会越来越复杂；

2、 高阶组件和 renderProps 设计的目的就是解决状态的复用的，但是多次使用高阶组件会产生太多的嵌套。

**Hooks**

**特性：**

1、 就是一套能够使函数组件更强大，更灵活的钩子函数；

2、 基本可以替代 class 组件(目前暂时还没有对应不常用的 getSnapshotBeforeUpdate，getDerivedStateFromError 和 componentDidCatch 生命周期的 Hook 等价写法)；

3、 若项目比较旧，并不需要直接将所有代码重构为 Hook，因为它完全向下兼容，可以渐进式地来使用；

4、 你不能在 class 组件内部使用 Hook，但毫无疑问你可以在组件树里混合使用 class 组件和使用了 Hook 的函数组件。不论一个组件是 class 还是一个使用了 Hook 的函数，都只是这个组件的实现细节而已。

**优点**

1、 抽离状态处理逻辑，不再需要关注类组件复杂的生命周期和 this 指向问题。

2、 逻辑简单容易复用，更容易做到组件化和逻辑拆分，代码量更少。

## 三、 一些注意点

### 1、 类组件和 Hooks 组件混合使用

你不能在 class 组件内部使用 Hook，但毫无疑问你可以在组件树里混合使用 class 组件和使用了 Hook 的函数组件。不论一个组件是 class 还是一个使用了 Hook 的函数，都只是这个组件的实现细节而已。

父组件：

```js
import Img from '@/components/Img'
export default React.memo(function ({ data }) {
  return (
    <div className="home">
      <Img pClassName="taowa" src={sealLogo} />
    </div>
  )
})
```

子组件：

```js
import React, { PureComponent } from 'react'
import classnames from 'classnames'

export default class SonImg extends PureComponent {
  render() {
    let { src, alt = '', pClassName = '', ...other } = this.props
    pClassName && console.log(pClassName)
    return <Img1 pClassName={classnames('taowa1', pClassName)} src={src} alt={alt} {...other} />
  }
}

const Img1 = React.memo(function ({ src, alt = '', pClassName = '', ...other }) {
  pClassName && console.log(pClassName)
  return <GrandSonImg pClassName={classnames('taowa2', pClassName)} src={src} alt={alt} {...other} />
})

class Img2 extends PureComponent {
  render() {
    let { src, alt = '', pClassName = '', ...other } = this.props
    pClassName && console.log(pClassName)
    src = src ? src.replace(/http:/g, 'https:') : ''
    return <img className={classnames('taowa3', pClassName)} src={src} alt={alt} {...other} />
  }
}
```

![img](./img/taowa.jpg)

当然在时间允许的情况下都写 Hooks 比较爽，时间不够就先复用类组件了。

### 2、 类组件和 Hooks 组件的状态

#### 2.1、 保存状态

类组件： state
Hooks 组件：useState/useReducer

两者的状态值都被挂载在组件实例对象 FiberNode 的 memoizedState 属性中。

但两者保存状态值的数据结构完全不同，Clss 组件是直接把 state 属性中挂载的这个开发者自定义的对象给保存到 memoizedState 属性中，而 React Hooks 是用链表来保存状态的，memoizedState 属性保存的实际上是这个链表的头指针。

```js
// react-reconciler/src/ReactFiberHooks.js
export type Hook = {
  memoizedState: any, // 最新的状态值
  baseState: any, // 初始状态值，如`useState(0)`，则初始值为0
  baseUpdate: Update<any, any> | null,
  queue: UpdateQueue<any, any> | null, // 临时保存对状态值的操作，更准确来说是一个链表数据结构中的一个指针
  next: Hook | null, // 指向下一个链表节点
}
```

#### 2.2、 更新状态

**类组件 setState**

this.setState() 将对组件 state 的更改排入队列批量推迟更新，并通知 React 需要使用更新后的 state 重新渲染此组件及其子组件。其实 setState 实际上不是异步，只是代码执行顺序不同，有了异步的感觉。

setState 在合成事件(onClick)、生命周期函数中是异步

setState 在原生事件(addEventListener)、setTimeout/setInterval/Promise 等异步执行的代码中是同步

原生事件绑定不会通过合成事件的方式处理，自然也不会进入更新事务的处理流程。setTimeout 也一样，在 setTimeout 回调执行时已经完成了原更新组件流程，不会放入进行异步更新，其结果自然是同步的。

**Hooks 组件更新状态的函数 dispatcher**

Hooks 组件每次调用 setName 这个 dispatcher 时，并不会立刻对状态值进行修改（对的，状态值的更新是异步的），而是创建一条修改操作——在对应 Hook 对象的 queue 属性挂载的链表上加一个新节点。在下次执行函数组件，再次调用 useState 时， React 才会根据每个 Hook 上挂载的更新操作链表来计算最新的状态值。

```js
const [name, setName] = useState('')
useEffect(() => {
  setName(name => name + 'a') // 'ab'
  setName(name => name + 'b') // 'ab'
  setName(name => name + 'c') // 'abc'
}, [])
```

## 参考

[官方文档 Hooks](https://zh-hans.reactjs.org/docs/hooks-intro.html)
[ReactHooks](https://github.com/facebook/react/blob/master/packages/react/src/ReactHooks.js)
