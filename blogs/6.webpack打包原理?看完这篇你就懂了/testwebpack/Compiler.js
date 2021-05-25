const fs = require('fs')
const parser = require('@babel/parser')
const options = require('./webpack.config')

const Parser = {
  getAst: path => {
    // 读取入口文件
    const content = fs.readFileSync(path, 'utf-8')
    // 将文件内容转为AST抽象语法树
    return parser.parse(content, {
      sourceType: 'module'
    })
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
    // 2. 解析入口文件,获取 AST
    // 我们这里使用@babel/parser,这是 babel7 的工具,来帮助我们分析内部的语法,包括 es6,返回一个 AST 抽象语法树。
    const ast = Parser.getAst(this.entry)
    // console.log('———ast———————————————————————————————————')
    // console.log(ast) // AST树
  }
  // 重写 require函数,输出bundle
  generate() {}
}

new Compiler(options).run()