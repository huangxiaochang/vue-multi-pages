# vue-multi-pages

> a project of vue-mutli-pages

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).

多页面应用架构的目标：
1.不同的页面加载各种的第三方库，以减少vendor文件的体积
2.对于各页面中公用的js模块，进行分离，防止打包多次，浪费资源
3.不同页面提取不同的css
4.压缩js,css
5.每个页面能共享公共的chunk
6.同一页面中的模块按需加载
7.各页面的js按照顺序注入模板html中
8.可以在同一页面中实现单页面的效果
9.其他


以下的webpack配置可以实现以上的架构目标

webpack搭建多页面应用的方法和步骤：

1. 使用vue-cli搭建一个vue项目

2. 安装glob(高版本的node已集成，可以不用安装)，glob是一款允许使用*等符号匹配文件夹下的资源的插件

3.修改webpack配置，build/utils文件，增加以下内容：
	// add multi-pages entery config
	// get nulti-pages entery file， 获取入口文件，入口文件即为每一个页面
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
  
4. 修改webpack.base.conf.js:
	entery选项修改成：
    entry: utils.getMultiEntery() // getMultiEntery为在utils.js中设置的入口文件的值

5.修改webpack.dev.conf.js：
	删除
	new HtmlWebpackPlugin({
       filename: 'index.html',
       template: 'index.html',
       inject: true
    })
    以为是多页面，所以要生成多个
    在plugins数组中添加生成的多个html模板
    ...utils.htmlPlugin() 或者plugins.concat(utils.htmlPlugin())
    utils.htmlPlugin()为在utils.js中定义的生成多个页面模板的方法的返回值

6.修改webpack.prod.conf.js:
	修改的方法和原理和dev相同
	删除
	// new HtmlWebpackPlugin({
    //   filename: config.build.index,
    //   template: 'index.html',
    //   inject: true,
    //   minify: {
    //     removeComments: true,
    //     collapseWhitespace: true,
    //     removeAttributeQuotes: true
    //     // more options:
    //     // https://github.com/kangax/html-minifier#options-quick-reference
    //   },
    //   // necessary to consistently work with multiple chunks via CommonsChunkPlugin
    //   chunksSortMode: 'dependency'
    // }),
	以为是多页面，所以要生成多个
    在plugins数组中添加生成的多个html模板
    ...utils.htmlPlugin() 或者plugins.concat(utils.htmlPlugin())
    utils.htmlPlugin()为在utils.js中定义的生成多个页面模板的方法的返回值

7.从vendor中分离不同页面中引用的第三方库：
	1.修改webpack.prod.conf.js:
		new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks (module) {
        // any required modules inside node_modules are extracted to vendor
        return (
          module.resource &&
          /\.js$/.test(module.resource) &&
          module.resource.indexOf(
            path.join(__dirname, '../node_modules')
          ) === 0
        )
      }
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor-home',
      chunks: ['vendor'],
      minChunks: function (module, count) {
        return (
          module.resource &&
          /\.js$/.test(module.resource) &&
          module.resource.indexOf(path.join(__dirname, '../node_modules')) === 0 &&
          module.resource.indexOf('element-ui') !== -1
        )
      }
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor-demo',
      chunks: ['vendor'],
      minChunks: function (module, count) {
        return (
          module.resource &&
          /\.js$/.test(module.resource) &&
          module.resource.indexOf(path.join(__dirname, '../node_modules')) === 0 &&
          module.resource.indexOf('iview') !== -1
        )
      }
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'common-api',
      chunks: ['home', 'demo'],
      minChunks: Infinity
    }),
    // extract webpack runtime and module manifest to its own file in order to
    // prevent vendor hash from being updated whenever app bundle is updated
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
      minChunks: Infinity
    }),

	    要按顺序进行添加

8.可能会出现html模板中少引js的情况，解决的方案是对html模板进行排序
	修改utils.js文件：
	if (process.env.NODE_ENV === 'production') {
      conf = merge(conf, {
        minify: {
          removeComments: true,
          collapseWhitespace: true,
          removeAttributeQuotes: true
        },
        // 使用chunksSortMode进行排序，这样不仅可以解决少引js的情况，还可以解决html模板中按照顺序进行
        // 引入js的问题
        chunksSortMode: (chunk1, chunk2) => {
          return conf.chunks.indexOf(chunk1.names[0]) - conf.chunks.indexOf(chunk2.names[0])
        }
      })
    }

9.分离多个页面之间公用模块的问题
	在项目文件夹下新建一个common文件夹存放引用的公用木块， 并导出
	把公用的木块common增加到入口文件
	在utils.js中修改
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
	
	修改html模板生成的chunks配置
	let conf = {
      template: path,
      filename: filename + '.html',
      // 加入相应的js。如果没有该行，每一个页面都会引入所有的js脚本
      chunks: ['manifest', 'vendor', 'vendor-' + filename, 'common-api', filename],
      inject: true
    }
	添加提取公用模块的插件：
	webpack.prod.conf.js:
	// 提取公共js模块
    new webpack.optimize.CommonsChunkPlugin({
      name: 'common-api',
      chunks: ['home', 'demo'], // 要指定完全，即有多少的页面入口模块，就要指定多少
      minChunks: Infinity
    }),

多页应用中的每一个页面可以是单独的一个页面，也可以是一个单页应用的入口html模板，并且在这个页面中的
单页应用的配置（路由，全局组件， 全局的指令， vuex等）的配置和单页应用中的配置一模一样
即，多页应用，可以是多个单页应用组成的。在多页应用中的不同页面，页面之间的信息交互只能通过cookie, localstorage等方法进行，不能使用vuex, props,emit，bus来通信，这些通信的方法只能在单页应用中进行使用（或者是多页应用中的某个单页应用），此外在多页应用中的不同页面，也不能使用router-link来进行页面的跳转(只能在单页面应用中使用)，不过可以用a标签来进行跳转。
