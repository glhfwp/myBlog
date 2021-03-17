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
// const createHtmlWebpackPlugin = require('./util/create-html-webpack-plugin')

const isEnvProduction = process.env.NODE_ENV === 'production'

const BASE_URL = './../'

module.exports = {
  publicPath: isEnvProduction ? BASE_URL : '/', // './../'
  parallel: require('os').cpus().length > 1, // 构建时开启多进程处理babel编译
  productionSourceMap: false, // map文件的作用在于：项目打包后，代码都是经过压缩加密的，如果运行时报错，输出的错误信息无法准确得知是哪里的代码报错。有了map就可以像未加密的代码一样，准确的输出是哪一行哪一列有错。如果不关掉，生产环境是可以通过map文件看到源码的。

  chainWebpack: config => {
    config.optimization.minimize(true)
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
    // 为生产环境修改配置...
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
    // css拆分ExtractTextPlugin插件，默认true - 骨架屏需要为true
    extract: true,
    // modules: true, // 是否开启支持‘foo.module.css’样式
    loaderOptions: {
      sass: {
        prependData: `@import "~@/assets/css/_var.scss";`
      }
    }
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
