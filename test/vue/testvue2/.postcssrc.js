module.exports = {
  plugins: {
    autoprefixer: {},
    'postcss-pxtorem': {
      rootValue: 32,
      exclude: /node_modules/i,
      selectorBlackList: ['maxwidth768'],
      propWhiteList: [],
      minPixelValue: 2
    }
  }
}