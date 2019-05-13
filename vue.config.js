module.exports = {
  publicPath: '/vp-salary/dist/',
  lintOnSave: false,
  configureWebpack: {
    resolve: {
      extensions: ['.js', '.json', '.vue'],
    },
  },
  // 设为false打包时不生成.map文件
  productionSourceMap: false,
};
