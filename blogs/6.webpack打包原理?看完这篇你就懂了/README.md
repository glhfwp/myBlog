# webpack 打包原理?看完这篇你就懂了!

## webpack 核心概念

entry: 编译入口
output: 输出
module: 模块，在 webpack 中，一切皆为模块，一个模块对应一个文件
Chunk: 代码块，一个 chunk 由多个模块组合而成，用于代码的合并与分割
Loader: 模块转换器，将非 js 模块转化为 webpack 能识别的 js 模块。将所有类型的文件,转换为应用程序的依赖图（和最终的 bundle）可以直接引用的模块。
Plugin: 扩展插件，在 webpack 运行的各个阶段，都会广播出去相对应的事件，插件可以监听到这些事件的发生，在特定的时机做相对应的事情

## webpack 基本概念对比

**webpack 中的 module，chunk 和 bundle**

- module 就是一个 js 模块，就是被 require 或 export 的模块，例如 ES 模块，commonjs 模块，AMD 模块
- chunk 是 代码块，是进行依赖分析的时候，代码分割出来的代码块，包括一个或多个 module，是被分组了的 module 集合，code spliting 之后的就是 chunk
- bundle 是 文件，最终打包出来的文件，通常一个 bundle 对应一个 chunk

**webpack 中 loader 和 plugin 在作用**

- loader 是模块转换器，将 webpack 不能处理的模块转换为 webpack 能处理的模块，就是 js 模块
- plugin 是功能扩展，干预 webpack 的打包过程，修改编译结果或打包结果

## webpack 核心对象

**Tapable：**

控制钩子的发布与订阅，Compiler 和 Compilation 对象都继承于 Tapable

**Compiler**

Compiler 继承 Tapable 对象，可以广播和监听 webpack 事件。
Compiler 对象是 webpack 的编译器，webpack 周期中只存在一个 Compiler 对象。
Compiler 对象在 webpack 启动时创建实例，compiler 实例中包含 webpack 的完整配置，包括 loaders, plugins 信息。

**Compilation**

Compilation 继承 Tapable 对象，可以广播和监听 webpack 事件。
Compilation 实例仅代表一次 webpack 构建和生成编译资源的的过程。
webpack 开发模式开启 watch 选项，每次检测到入口文件模块变化时，会创建一次新的编译: 生成一次新的编译资源和新的 compilation 对象，这个 compilation 对象包含了当前编译的模块资源 module, 编译生成的资源，变化的文件, 依赖的的状态

## 代码

按步骤代码调试 看提交记录

[testwebpack](https://github.com/glhfwp/myBlog/tree/main/blogs/6.webpack%E6%89%93%E5%8C%85%E5%8E%9F%E7%90%86%3F%E7%9C%8B%E5%AE%8C%E8%BF%99%E7%AF%87%E4%BD%A0%E5%B0%B1%E6%87%82%E4%BA%86/testwebpack)

## 参考

https://github.com/webfansplz/article/issues/38 webpack 打包原理 ? 看完这篇你就懂了! 实践加深理解,撸一个简易 webpack
