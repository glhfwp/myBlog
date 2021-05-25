const fs = require('fs')
const path = require('path')
const options = require('./webpack.config')
const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default
const { transformFromAst } = require('@babel/core')

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
    // console.log('———output———————————————————————————————————')
    // console.log(output)
    /*
      {
        path: '/Users/xxxxxxxx/testwebpack/dist',
        filename: 'main.js'
      }
    */
  }
  // 构建启动
  run() {
    const { getAst, getDependecies, getCode } = Parser
    // 2. 解析入口文件,获取 AST
    // 我们这里使用@babel/parser,这是 babel7 的工具,来帮助我们分析内部的语法,包括 es6,返回一个 AST 抽象语法树。
    const ast = getAst(this.entry)
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

    const code = getCode(ast)
    console.log('———code———————————————————————————————————')
    console.log(code)
    /*
      "use strict";
      var _hello = require("./hello.js");
      document.write((0, _hello.say)("webpack"));
    */
    console.log({ code }) // 会自动把浏览器可执行代码转为字符串, 回车转\n
    /*
      {
        code: '"use strict";\n' +
          '\n' +
          'var _hello = require("./hello.js");\n' +
          '\n' +
          'document.write((0, _hello.say)("webpack"));'
      }
    */
  }
  // 重写 require函数,输出bundle
  generate() { }
}

new Compiler(options).run()