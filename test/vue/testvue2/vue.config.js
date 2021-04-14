/**
 * @Author: glhfwp
 * @Email:
 * @Create Date: 2021-03-17 18:21:59
 * @Last Modified By: glhfwp
 * @Modified Date: 2021-03-17 18:21:59
 * @Desc: 简单的处理
 */
// const path = require('path')
// const CopyWebpackPlugin = require('copy-webpack-plugin')
// const pageMethod = require('./util/getPages.js')
// const pages = pageMethod.pages()
const createHtmlWebpackPlugin = require('./util/create-html-webpack-plugin')

const isEnvProduction = process.env.NODE_ENV === 'production'

const BASE_URL = '/mypropage/'

module.exports = {
  publicPath: isEnvProduction ? BASE_URL : '/', // './../'
  parallel: require('os').cpus().length > 1, // 构建时开启多进程处理babel编译
  productionSourceMap: false, // map文件的作用在于：项目打包后，代码都是经过压缩加密的，如果运行时报错，输出的错误信息无法准确得知是哪里的代码报错。有了map就可以像未加密的代码一样，准确的输出是哪一行哪一列有错。如果不关掉，生产环境是可以通过map文件看到源码的。

  chainWebpack: config => {
    // https://segmentfault.com/q/1010000015291213 压缩代码的，不要在开发模式打开下面这个配置项，不然开发每次保存卡到爆【92% chunk asset optimization UglifyJSPlugin】
    isEnvProduction && config.optimization.minimize(true)
    config.plugins.delete('prefetch')

    config.optimization.splitChunks({
      automaticNameDelimiter: '-',
      cacheGroups: {
        index: {
          name: `chunk-index-vendors`,
          priority: -11,
          chunks: chunk => chunk.name === 'index',
          test: /[\\/]node_modules[\\/]/,
          enforce: true,
        },
        common: {
          name: 'chunk-common',
          priority: -20,
          chunks: 'all',
          minChunks: 2,
          reuseExistingChunk: true,
          enforce: true,
        },
      },
    })
    // 清除css，js版本号
    config.output.filename(isEnvProduction ? `static/js/[name].[contenthash:10].js` : `static/js/[name].[hash].js`).end()
    config.output.chunkFilename(isEnvProduction ? `static/js/[name].[contenthash:10].js` : `static/js/[name].[hash].js`).end()
    // 为生产环境修改配置...，extract-css是mini-css-extract-plugin的，开发环境extract默认false，这开启会报错
    isEnvProduction &&
      config.plugin('extract-css').tap(args => [
        {
          filename: `static/css/[name].[contenthash:10].css`,
          chunkFilename: `static/css/[name].[contenthash:10].css`,
        },
      ])

    /* 添加分析工具 需要时打开 */
    // if (isEnvProduction) {
    //   config
    //     .plugin('webpack-bundle-analyzer')
    //     .use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin)
    //     .end()
    // }
  },
  css: {
    // css拆分ExtractTextPlugin插件，骨架屏需要为true， Default: 生产环境下是 true ，开发环境下是 false。
    // 提取 CSS 在开发环境模式下是默认不开启的，因为它和【CSS 热更新不兼容】。你仍然可以将这个强制设置为true在所有情况下都强制提取，【但是开了CSS就不会热更新】。
    // extract: true,
    // 开启 CSS source maps?
    // sourceMap: false,
    // css预设器配置项
    loaderOptions: {
      sass: {
        prependData: `@import "~@/assets/css/_var.scss";`,
      },
    },
    // 启用 CSS modules for all css / pre-processor files.
    // modules: false, // 是否开启支持‘foo.module.css’样式
  },
  configureWebpack: config => {
    createHtmlWebpackPlugin.createHtml(config)
  },
  devServer: {
    host: 'localhost',
    port: 8080, // 测试环境http接口
    https: false, // https:{type:Boolean}
    // port: 443,
    // https: true,
    disableHostCheck: true,
    open: true, // 配置自动启动浏览器
  },
}
