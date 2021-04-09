# `避免nginx的try_files到404`

某服务器 nginx 配置 `try_files $uri =404` (或者根本就没写 try_files 配置)，H5 新增的一些路由部署后，访问显示 404，我们想要找到对应路由的静态文件 `index.html`，同时我们没有权限去改 nginx 规则。

我们的测试或者预发服务器经常是这种情况，部署大量的静态资源项目到各个多级的文件夹下，而很少改动 nginx，不像线上单独部署或者混合部署基本都要改 nginx，找不到时指向对应的 index.html。这时候该怎么办呢？

解决思路是： 匹配多路由目录下的 `index.html` 避免 `nginx` 的 `try_files` 后 404

## 1、 nginx try_files 指令

**try_files 指令：**

```
语法：try_files file ... uri 或 try_files file ... = code
默认值：无
作用域：server location
```

try_files 的作用是按顺序检查文件是否存在，返回第一个找到的文件或文件夹（结尾加斜线表示为文件夹），如果所有的文件或文件夹都找不到，会进行一个内部重定向到最后一个参数，最后一个参数可以是 `uri或=code`。如果最后一个参数是 `= 404` ，若给出的 file 都没有匹配到，则最后返回 `404`。最后一个参数必须要有，否则会返回`500`。

**示例 nginx.conf**

```bash
listen  80;
server_name  localhost;
index index.html index.htm;
# ......
location /abc  {
  root /export/www/abc/;
  location ~* .*\.(?:manifest|htm|html)$ {
    expires -1;
    add_header Cache-Control "max-age=0, s-maxage=120"; # html在nginx上不缓存，在CDN上缓存120秒
  }
  location ~* .*\.(?:js|css)$ {
    expires 30d; # 缓存30天
  }
  location ~* .*\.(?:jpg|jpeg|gif|png|ico|cur|gz|svg|svgz|mp4|ogg|ogv|webm|webp|otf)$ {
    expires 30d;
  }
  try_files $uri $uri/ /abc/index.html; # 线上的配置，测试预发机器一般没有配。
  # try_files $uri $uri/ =404;
  # try_files $uri $uri/ @abcd; # @xxx定义一个location段，不能被外部请求所访问，只能用于nginx内部配置指令使用，比如 try_files、error_page。
}
location @abcd {
  # ......
}
```

**请求示例**

1、 `try_files $uri =404` 配置：

请求 `localhost/abc/test.png` 会依次查找 1) `/export/www/abc/images/test.png` ，2）重定向 404

2、 `try_files $uri $uri/ /abc/index.html` 配置：

请求 `localhost/abc/test.png` 会依次查找 1) `/export/www/abc/images/test.png` ，2) 文件夹 `/export/www/abc/images/test.png` 下的 `index` ，3）请求 `/export/www/abc/index.html`

## 2、 单页面

### 2.1 方案 1 shell 脚本

详见 `./singlepage.sh`

```bash
rm -rf build/*
npm run build
mkdirArr=("page1" "page2" "page3")
for item in ${mkdirArr[@]}; do
  mkdir build/$item
  cp build/index.html build/$item
done
```

### 2.2 方案 2 webpack

以 `CRA create-react-app` 项目举例，用多个 `HtmlWebpackPlugin` 复制 `index.html` 到每个路由页面，以避免 `nginx try_files 404`

config/webpack.config.js

```js
// 修改cra的webpackConfig的plugins
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpackConfig = {
  // ...
  plugins: [
    // Generates an `index.html` file with the <script> injected.
    new HtmlWebpackPlugin(htmlWebpackPluginConfig()),
    ...createHtmlWebpackPlugin(),
    // ...
  ],
}
// 这是CRA原来 new HtmlWebpackPlugin 里的内容
function htmlWebpackPluginConfig(config) {
  return Object.assign(
    {},
    {
      inject: true,
      template: paths.appHtml,
    },
    isEnvProduction
      ? {
          minify: {
            removeComments: true,
            collapseWhitespace: true,
            removeRedundantAttributes: true,
            useShortDoctype: true,
            removeEmptyAttributes: true,
            removeStyleLinkTypeAttributes: true,
            keepClosingSlash: true,
            minifyJS: true,
            minifyCSS: true,
            minifyURLs: true,
          },
        }
      : undefined,
    config,
  )
}
// 根据数组创建多个html， ['home', 'detail']
function createHtmlWebpackPluginByArr(options = {}, routeArr = []) {
  const appDirectory = fs.realpathSync(process.cwd())
  return routeArr.map(item => {
    return new HtmlWebpackPlugin(
      htmlWebpackPluginConfig(
        isEnvProduction
          ? {
              ...options,
              filename: path.resolve(appDirectory, 'build', `${item}/index.html`),
            }
          : options,
      ),
    )
  })
}
// 用多个 HtmlWebpackPlugin 复制 index.html 到每个路由页面，以避免 nginx try_files 404
function createHtmlWebpackPlugin() {
  const pageArr = []
  // pageArr.push(...createHtmlWebpackPluginByArr({}, ['home', 'detail']))
  glob.sync('./src/views/*/index.js').forEach((filepath, index) => {
    const fileList = filepath.split('/')
    const fileName = fileList[fileList.length - 2]
    console.log(fileName)
    pageArr.push(...createHtmlWebpackPluginByArr({}, [fileName]))
  })
  return pageArr
}
```

这样一个`HtmlWebpackPlugin`生成外层的 index.html，`['home', 'detail']`循环的两个`HtmlWebpackPlugin`，就生成了两个文件夹和 index.html，避免了 nginx 的 try_files。

<img src="./img/避免nginx%20try_files404.png"  height="201" width="314">
<!-- ![img](./img/避免nginx%20try_files404.png) -->

**实际效果**

`try_files $uri =404` 配置或者没配 try_files，实际效果如下：

```bash
publicPath 为 '/abc/'  # 单页面publicPath可以取package.json的homepage，或者相对路径等多种实现方式都可以。
线上链接 https://www.xx.com/abc/index.html

线上html引入js  <script src="/abc/static/js/index.randomhash10.js"></script>
实际nginx查找 /export/www/abc/static/js/index.randomhash10.js

home路由链接 https://www.xx.com/abc/home
实际nginx查找 /export/www/abc/home/index.html
```

## 3、 多页面

以 `Vue-Cli4+Vue2.x` 项目举例，多页面每个页面都是单页面+路由的 SPA。

vue.config.js

```js
const pageMethod = require('./util/getPages.js')
const createHtmlWebpackPlugin = require('./util/create-html-webpack-plugin')
const BASE_URL = '/abc/'
module.exports = {
  pages: pageMethod.pages(), // 多页面
  publicPath: isEnvProduction ? BASE_URL : '/',
  // ......
  configureWebpack: config => {
    createHtmlWebpackPlugin.createHtml(config)
  },
}
```

create-html-webpack-plugin.js

```js
module.exports.createHtml = function (config) {
  const appDirectory = fs.realpathSync(process.cwd())
  function createHtmlWebpackPluginByArr(options = {}, routeArr = []) {
    return routeArr.map(item => {
      return new HtmlWebpackPlugin(
        isEnvProduction
          ? {
              ...options,
              filename: path.resolve(appDirectory, 'dist', `${item}/index.html`),
            }
          : options,
      )
    })
  }
  // 提取else页面
  config.plugins.forEach(val => {
    if (val instanceof HtmlWebpackPlugin) {
      if (val.options.sourceFileName === 'else' && isEnvProduction) {
        val.options.filename = 'pages/else/index.html' // 修改输出文件名
        // config.plugins.push(...createHtmlWebpackPluginByArr(val.options, ['pages/else/index', 'pages/else/rulepage']))
        glob.sync('./src/pages/else/views/*/*.vue').forEach((filepath, index) => {
          const fileList = filepath.split('/')
          const fileName = fileList[fileList.length - 2]
          config.plugins.push(...createHtmlWebpackPluginByArr(val.options, ['pages/else/' + fileName]))
        })
      }
    }
  })
}
```

**打包后 dist 文件夹，忽略部分文件**

```
.
├── pages
│   ├── else
│   │   ├── else1page
│   │   │   └── else1page.html
│   │   ├── index.html
│   │   └── else2page
│   │       └── else2page.html
│   ├── index.html
│   └── test.html
└── static
    ├── css
    │   ├── index.randomhash10.css
    │   ├── chunk-common.randomhash10.css
    │   ├── else.randomhash10.css
    │   └── ......
    └── js
        ├── index.randomhash10.js
        ├── chunk-common.randomhash10.js
        ├── chunk-else-vendors.randomhash10.js
        └── ......
```

**实际效果**

```
首页链接 https://www.xx.com/abc/pages/index.html
线上html引入js <script src="/abc/static/js/index.randomhash10.js"></script>
实际nginx查找 /export/www/abc/static/js/index.randomhash10.js

else1page路由链接 http://www.xx.com/abc/pages/else/else1page/
线上html引入js <script src="/abc/static/js/else.randomhash10.js"></script>
实际nginx查找 /export/www/abc/static/js/else.randomhash10.js
```

## 参考

http://nginx.org/en/docs/http/ngx_http_core_module.html#try_files
