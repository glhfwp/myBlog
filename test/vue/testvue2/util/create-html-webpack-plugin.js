// 避免nginx try_files 404
const glob = require('glob')
const fs = require('fs')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const isEnvProduction = process.env.NODE_ENV === 'production'

module.exports.createHtml = function(config) {
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

  // 提取页面
  config.plugins.forEach(val => {
    if (val instanceof HtmlWebpackPlugin) {
      // console.log(val)
      if (isEnvProduction) {
        // console.log(val)
        // val.options.filename = 'pages/else/index.html' // 修改输出文件名
        // config.plugins.push(...createHtmlWebpackPluginByArr(val.options, ['pages/else/index', 'pages/else/rulepage']))
        // glob.sync('./src/pages/else/views/*/*.vue').forEach((filepath, index) => {
        glob.sync('./src/views/*/*.vue').forEach((filepath, index) => {
          const fileList = filepath.split('/')
          const fileName = fileList[fileList.length - 2]
          // console.log(fileName)
          // config.plugins.push(...createHtmlWebpackPluginByArr(val.options, ['pages/else/' + fileName]))
          config.plugins.push(...createHtmlWebpackPluginByArr(val.options, [fileName]))
        })
      }
    }
  })
}
