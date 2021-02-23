# React Hooks 和 Class 组件区别和混合使用

## 一、 类组件生命周期迁移到 Hooks

Hook 是 React 16.8 的新增特性。它可以让你在不编写 class 的情况下使用 state 以及其他的 React 特性。

- `constructor`：函数组件不需要构造函数。你可以通过调用 `useState` 来初始化 state。如果计算的代价比较昂贵，你可以传一个函数给 `useState`。

  ```js
  const [state, setState] = useState(initialState)
  setState(newState)
  ```

- `getDerivedStateFromProps`：一般情况下，我们不需要使用它，我们可以改为 在渲染时 安排一次更新。

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

- `shouldComponentUpdate`：可以用 `React.memo`包裹一个组件来对它的 props 进行浅比较

  ```js
  const Button = React.memo(props => {
    // 你的组件
  })
  ```

  注意：这不是一个 Hook 因为它的写法和 Hook 不同。`React.memo` 等效于 `PureComponent`，但它只比较 props。（你也可以通过第二个参数指定一个自定义的比较函数来比较新旧 props。如果函数返回 true，就会跳过更新。）
  `React.memo` 不比较 state，因为没有单一的 state 对象可供比较。但你也可以让子节点变为纯组件，或者 [用 useMemo 优化每一个具体的子节点](https://zh-hans.reactjs.org/docs/hooks-faq.html#how-to-memoize-calculations)。

- `render`：这是函数组件体本身。

- `componentDidMount`, `componentDidUpdate`： `useLayoutEffect`： useEffect Hook 可以表达所有这些(包括`不那么常见`的场景)的组合。

  可以把 `useEffect Hook` 看做 `componentDidMount`，`componentDidUpdate` 和 `componentWillUnmount` 这三个函数的组合。

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

  请记得 React 会等待浏览器完成画面渲染之后才会延迟调用 `useEffect`，因此会使得额外操作很方便。
  与 `componentDidMount` 或 `componentDidUpdate` 不同，使用 `useEffect` 调度的 effect 不会阻塞浏览器更新屏幕，这让你的应用看起来响应更快。大多数情况下，effect 不需要同步地执行。在个别情况下（例如测量布局），有单独的 `useLayoutEffect Hook` 供你使用，其 API 与 `useEffect` 相同。

- `componentWillUnmount`：相当于 `useEffect `里面返回的清理函数

  ```js
  useEffect(() => {
    // 需要在 componentDidMount/componentDidUpdate 执行的内容
    return function cleanup() {
      // 需要在 componentWillUnmount 执行的内容
    }
  }, [])
  ```

- `getSnapshotBeforeUpdate`，`componentDidCatch` 以及 `getDerivedStateFromError`：目前还没有这些方法的 Hook 等价写法，但很快会被添加。

生命周期对比如下：

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

## 二、 优缺点

**函数组件**
**特性：**
1、 无状态组件，无 state 和生命周期，无实例化的 this。

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
2、 比类组件复用性更强，更容易做到组件化和逻辑拆分，代码量更少。

## 三、 Class 组件 和 Hooks 组件混合使用

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

dom：
![img](./img/taowa.jpg)

当然在时间允许的情况下都写 Hooks 比较爽，时间不够就先复用类组件了。

参考 [官方文档 Hooks](https://zh-hans.reactjs.org/docs/hooks-intro.html)
