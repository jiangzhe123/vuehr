'use strict'
// Template version: 1.2.7
// see http://vuejs-templates.github.io/webpack for documentation.

const path = require('path')

module.exports = {
  // dev 环境  开发环境  
  dev: {
    // 使用 config/dev.env.js 中定义的编译环境
    env: require('./dev.env'),
    //前端 服务器地址+端口号
    host: 'localhost', 
    port: 8080, 
    // 下面表示是否自定代开浏览器
    autoOpenBrowser: true,
    errorOverlay: true,
    notifyOnErrors: true,
    poll: false, 
    // 编译输出的二级目录
    assetsSubDirectory: 'static',
    // 编译发布的根目录，可配置为资源服务器域名或 CDN 域名
    assetsPublicPath: '/',
    //在实际项目开发过程中vue cli自带的服务器，但是我们实际要去请求我们的数据接口，服务器与服务器之间产生了一个代理跨域问题，我们需要修改自带服务的配置。在config 中的index文件中，有一个proxyTable参数
    //需要 proxyTable 代理的接口（可跨域）
    proxyTable: {
    //接口地址原本是 /save/index，但是为了匹配代理地址，在前面加一个 /,  因此接口地址需要写成这样的即可生效 /save/index。
      '/': {
        // 接口的域名
        target: 'http://localhost:9002',
        // secure: false,  // 如果是https接口，需要配置这个参数
        // 如果接口跨域，需要进行这个参数配置
        changeOrigin: true,
        pathRewrite: {
          '^/': ''
        }
      },
    },
    devtool: 'eval-source-map',
    cacheBusting: true,
    // 是否开启 cssSourceMap随着代码增多，我们需要对代码进行压缩。代码压缩后进行调bug定位将非常困难，于是引入sourcemap记录压缩前后的位置信息记录，当产生错误时直接定位到未压缩前的位置，将大大的方便我们调试。
    cssSourceMap: false,
  },

  //运行环境
  build: {
    // 使用 config/prod.env.js 中定义的编译环境 
    env: require('./prod.env'), 
    // 编译输入的 index.html 文件
    index: path.resolve(__dirname, '../dist/index.html'),
    // 编译输出的静态资源路径
    assetsRoot: path.resolve(__dirname, '../dist'),
    // 编译输出的二级目录
    assetsSubDirectory: 'static',
    // 编译发布的根目录，可配置为资源服务器域名或 CDN 域名
    //另外我还将 build 的路径前缀修改为 ' ./ '（原本为 ' / '），是因为打包之后，外部引入 js 和 css 文件时，如果路径以 ' / ' 开头，在本地是无法找到对应文件的（服务器上没问题）。所以如果需要在本地打开打包后的文件，就得修改文件路径。
    assetsPublicPath: './',
    // 是否开启 cssSourceMap
    productionSourceMap: true,
    devtool: '#source-map',
     // 是否开启 gzip
    productionGzip: false,
    // 需要使用 gzip 压缩的文件扩展名
    productionGzipExtensions: ['js', 'css'],
    bundleAnalyzerReport: process.env.npm_config_report
  }
}
