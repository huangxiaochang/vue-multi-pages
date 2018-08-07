'use strict'
const path = require('path')
const config = require('../config')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const merge = require('webpack-merge')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const packageConfig = require('../package.json')
// glob 是webpack安装时依赖的一个第三方模块，该模块允许使用*等符合，例如lib/*.js就是获取lib文件夹下的所有
// js后缀的文件
const glob = require('glob')
// the path of multi-entery folder
const PAGE_PATH = path.resolve(__dirname, '../src/views') 

exports.assetsPath = function (_path) {
  const assetsSubDirectory = process.env.NODE_ENV === 'production'
    ? config.build.assetsSubDirectory
    : config.dev.assetsSubDirectory

  return path.posix.join(assetsSubDirectory, _path)
}

exports.cssLoaders = function (options) {
  options = options || {}

  const cssLoader = {
    loader: 'css-loader',
    options: {
      sourceMap: options.sourceMap
    }
  }

  const postcssLoader = {
    loader: 'postcss-loader',
    options: {
      sourceMap: options.sourceMap
    }
  }

  // generate loader string to be used with extract text plugin
  function generateLoaders (loader, loaderOptions) {
    const loaders = options.usePostCSS ? [cssLoader, postcssLoader] : [cssLoader]

    if (loader) {
      loaders.push({
        loader: loader + '-loader',
        options: Object.assign({}, loaderOptions, {
          sourceMap: options.sourceMap
        })
      })
    }

    // Extract CSS when that option is specified
    // (which is the case during production build)
    if (options.extract) {
      return ExtractTextPlugin.extract({
        use: loaders,
        fallback: 'vue-style-loader'
      })
    } else {
      return ['vue-style-loader'].concat(loaders)
    }
  }

  // https://vue-loader.vuejs.org/en/configurations/extract-css.html
  return {
    css: generateLoaders(),
    postcss: generateLoaders(),
    less: generateLoaders('less'),
    sass: generateLoaders('sass', { indentedSyntax: true }),
    scss: generateLoaders('sass'),
    stylus: generateLoaders('stylus'),
    styl: generateLoaders('stylus')
  }
}

// Generate loaders for standalone style files (outside of .vue)
exports.styleLoaders = function (options) {
  const output = []
  const loaders = exports.cssLoaders(options)

  for (const extension in loaders) {
    const loader = loaders[extension]
    output.push({
      test: new RegExp('\\.' + extension + '$'),
      use: loader
    })
  }

  return output
}

exports.createNotifierCallback = () => {
  const notifier = require('node-notifier')

  return (severity, errors) => {
    if (severity !== 'error') return

    const error = errors[0]
    const filename = error.file && error.file.split('!').pop()

    notifier.notify({
      title: packageConfig.name,
      message: severity + ': ' + error.name,
      subtitle: filename || '',
      icon: path.join(__dirname, 'logo.png')
    })
  }
}

// add multi-pages entery config
// get nulti-pages entery file
exports.getMultiEntery = () => {
  let enteryFiles = glob.sync(PAGE_PATH + '/*/*.js' )
  const map = {}
  enteryFiles.forEach((path) => {
    let filename = path.substring(path.lastIndexOf('\/') + 1, path.lastIndexOf('.'))
    map[filename] = path
  })
  // 公共js的入口文件
  map['common-api'] = path.resolve(__dirname, '../src/common/index')
  return map
}

// html of output for page
// 多页面中的html模板，最终的html由html-webpack-plugin生成
exports.htmlPlugin = () => {
  let enteryHtmls = glob.sync(PAGE_PATH + '/*/*.html')
  const html_arr = []
  enteryHtmls.forEach((path) => {
    let filename = path.substring(path.lastIndexOf('\/') + 1, path.lastIndexOf('.'))
    let conf = {
      template: path,
      filename: filename + '.html',
      // 加入相应的js。如果没有该行，每一个页面都会引入所有的js脚本
      chunks: ['manifest', 'vendor', 'vendor-' + filename, 'common-api', filename],
      inject: true
    }
    if (process.env.NODE_ENV === 'production') {
      conf = merge(conf, {
        minify: {
          removeComments: true,
          collapseWhitespace: true,
          removeAttributeQuotes: true
        },
        chunksSortMode: (chunk1, chunk2) => {
          return conf.chunks.indexOf(chunk1.names[0]) - conf.chunks.indexOf(chunk2.names[0])
        }
      })
    }
    html_arr.push(new HtmlWebpackPlugin(conf))
  })
  return html_arr
}