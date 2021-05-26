// 定义一个立即执行函数,传入生成的依赖关系图
(function (graph) {
  // 重写require函数
  function require(module) {
    // console.log(module) // ./src/index.js

    // 找到对应moduleId的依赖对象,调用require函数,eval执行,拿到exports对象
    function localRequire(relativePath) {
      return require(graph[module].dependecies[relativePath]) // {__esModule: true, say: ƒ say(name)}
    }

    // 定义exports对象
    var exports = {};
    (function (require, exports, code) {
      // console.log(code) // "use strict";\n\nvar _hello = require("./hello.js");\n\ndocument.write((0, _hello.say)("webpack"));

      eval(code)// Uncaught TypeError: Cannot read property 'code' of undefined  可以看到,我们在执行"./src/index.js"文件代码的时候报错了,这是因为 index.js 里引用依赖 hello.js,而我们没有对依赖进行处理,接下来我们对依赖引用进行处理。
      // commonjs语法使用module.exports暴露实现,我们传入的exports对象会捕获依赖对象(hello.js)暴露的实现(exports.say = say)并写入

    })(localRequire, exports, graph[module].code);

    // 暴露exports对象,即暴露依赖对象对应的实现
    return exports;
  }

  // 从入口文件开始执行
  require('./src/index.js')
})({
  "./src/index.js": {
    "dependecies": {
      "./hello.js": "./src/hello.js"
    },
    "code": "\"use strict\";\n\nvar _hello = require(\"./hello.js\");\n\ndocument.write((0, _hello.say)(\"webpack\"));"
  },
  "./src/hello.js": {
    "dependecies": {},
    "code": "\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.say = say;\n\nfunction say(name) {\n  return \"hello \".concat(name);\n}"
  }
})