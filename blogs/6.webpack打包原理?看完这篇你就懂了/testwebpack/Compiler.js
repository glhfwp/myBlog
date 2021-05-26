const fs = require('fs')
const path = require('path')
const options = require('./webpack.config')
const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default
const { transformFromAst } = require('@babel/core')
const { mkdirs } = require('./utils/mkdir')

const Parser = {
  getAst: path => {
    // 读取入口文件
    const content = fs.readFileSync(path, 'utf-8')
    // 将文件内容转为AST抽象语法树
    return parser.parse(content, {
      sourceType: 'module'
    })
  },
  getDependecies: (ast, filename) => {
    const dependecies = {}
    // 遍历所有的 import 模块,存入dependecies
    traverse(ast, {
      // 类型为 ImportDeclaration 的 AST 节点 (即为import 语句)
      ImportDeclaration({ node }) {
        // console.log('———AST节点———————————————————————————————————')
        // console.log(node) // AST节点

        const dirname = path.dirname(filename)
        // 保存依赖模块路径,之后生成依赖关系图需要用到
        const filepath = './' + path.join(dirname, node.source.value)
        dependecies[node.source.value] = filepath
      }
    })
    return dependecies
  },
  getCode: ast => {
    // AST转换为code
    const { code } = transformFromAst(ast, null, {
      presets: ['@babel/preset-env']
    })
    return code
  }
}

// 1. 定义 Compiler 类
class Compiler {
  constructor(options) {
    // webpack 配置
    const { entry, output } = options
    // 入口
    this.entry = entry
    // 出口
    this.output = output
    // 模块
    this.modules = []
    // console.log('———entry———————————————————————————————————')
    // console.log(entry)
    /*
      ./src/index.js
    */
    console.log('———output———————————————————————————————————')
    console.log(output)
    /*
      {
        path: '/Users/xxxxxxxx/testwebpack/dist',
        filename: 'main.js'
      }
    */
  }
  // 构建启动
  run() {
    // 解析入口文件
    const info = this.build(this.entry)
    // console.log('———info———————————————————————————————————')
    // console.log(info)
    /*
      无依赖：
      {
        filename: './src/index.js',
        dependecies: {},
        code: '"use strict";\n' +
          '\n' +
          '// import { say } from "./hello.js";\n' +
          'document.write(say("webpack"));'
      }
      有依赖：
      {
        filename: './src/index.js',
        dependecies: { './hello.js': './src/hello.js' },
        code: '"use strict";\n' +
          '\n' +
          'var _hello = require("./hello.js");\n' +
          '\n' +
          'document.write((0, _hello.say)("webpack"));'
      }
    */

    // 5. 递归解析所有依赖项,生成依赖关系图
    this.modules.push(info)
    this.modules.forEach(({ dependecies }) => {
      // 判断有依赖对象,递归解析所有依赖项
      if (dependecies) {
        for (const dependency in dependecies) {
          this.modules.push(this.build(dependecies[dependency]))
        }
      }
    })
    // 生成依赖关系图
    const dependencyGraph = this.modules.reduce(
      (graph, item) => ({
        ...graph,
        // 使用文件路径作为每个模块的唯一标识符,保存对应模块的依赖对象和文件内容
        [item.filename]: {
          dependecies: item.dependecies,
          code: item.code
        }
      }),
      {}
    )
    // console.log('———dependencyGraph———————————————————————————————————')
    // console.log(dependencyGraph)
    /*
      无依赖：
      {
        './src/index.js': {
          dependecies: {},
          code: '"use strict";\n' +
            '\n' +
            '// import { say } from "./hello.js";\n' +
            'document.write(say("webpack"));'
        }
      }
      有依赖：
      {
        './src/index.js': {
          dependecies: { './hello.js': './src/hello.js' },
          code: '"use strict";\n' +
            '\n' +
            'var _hello = require("./hello.js");\n' +
            '\n' +
            'document.write((0, _hello.say)("webpack"));'
        },
        './src/hello.js': {
          dependecies: { './hello.js': './src/hello.js' },
          code: '"use strict";\n' +
            '\n' +
            'var _hello = require("./hello.js");\n' +
            '\n' +
            'document.write((0, _hello.say)("webpack"));'
        }
      }
    */

    // 6. 重写 require 函数,输出 bundle
    this.generate(dependencyGraph)
  }
  build(filename) {
    const { getAst, getDependecies, getCode } = Parser
    // 2. 解析入口文件,获取 AST
    // 我们这里使用@babel/parser,这是 babel7 的工具,来帮助我们分析内部的语法,包括 es6,返回一个 AST 抽象语法树。
    const ast = getAst(filename)
    // console.log('———ast———————————————————————————————————')
    // console.log(ast) // AST树

    // 3. 找出所有依赖模块
    // Babel 提供了@babel/traverse(遍历)方法维护这 AST 树的整体状态,我们这里使用它来帮我们找出依赖模块。
    const dependecies = getDependecies(ast, this.entry)
    // console.log('———dependecies———————————————————————————————————')
    // console.log(dependecies)
    /*
      无依赖时:
        {}
      有依赖时递归打印2次：
        { './hello.js': './src/hello.js' }
    */

    // 4. AST 转换为 code
    // 将 AST 语法树转换为浏览器可执行代码,我们这里使用@babel/core 和 @babel/preset-env。
    const code = getCode(ast)
    // console.log('———code———————————————————————————————————')
    // console.log(code)
    /*
      "use strict";
      var _hello = require("./hello.js");
      document.write((0, _hello.say)("webpack"));
    */
    // console.log({ code }) // 会自动把浏览器可执行代码转为字符串, 回车转\n
    /*
      {
        code: '"use strict";\n' +
          '\n' +
          'var _hello = require("./hello.js");\n' +
          '\n' +
          'document.write((0, _hello.say)("webpack"));'
      }
    */
    return {
      filename, // 文件路径,可以作为每个模块的唯一标识符
      dependecies, // 依赖对象,保存着依赖模块路径
      code, // 文件内容
    }
  }
  // 重写 require函数 (浏览器不能识别commonjs语法),输出bundle
  generate(code) {
    // !!注意先创建一个dist文件夹
    mkdirs('./dist/', () => {
      // 输出文件路径
      const filePath = path.join(this.output.path, this.output.filename)
      console.log('———filePath———————————————————————————————————')
      console.log(filePath)
      /*
        /Users/xxxxxxxx/testwebpack/dist/main.js
      */
      // 懵逼了吗? 没事,下一节我们捋一捋
      const bundle = `(function(graph){
        function require(module){
          function localRequire(relativePath){
            return require(graph[module].dependecies[relativePath])
          }
          var exports = {};
          (function(require,exports,code){
            eval(code)
          })(localRequire,exports,graph[module].code);
          return exports;
        }
        require('${this.entry}')
      })(${JSON.stringify(code)})`

      // 把文件内容写入到文件系统
      fs.writeFileSync(filePath, bundle, 'utf-8')
    })
  }
}

new Compiler(options).run()