/**
 * Created by liuqingling on 16/1/22.
 */
    //commenjs
var path = require("path");
var webpack = require('webpack');
var config = require("./config.json");
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    entry: {
        home: './js/home1'
    },
    output: {
        path: path.join(__dirname, '/dev'),  //打包输出的路径
        filename: '[name].js'/*+'?[chunkhash]'*/,			  //打包后的名字
        publicPath: '/static/'				//html引用路径，在这里是本地地址。
    },
    module:{
        loaders: [
            { test: /\.ejs$/, loader: "ejs-compiled-loader"},
            { test: /\.(css|less)$/, loader: ExtractTextPlugin.extract("style-loader", "css-loader","less-loader")},
            { test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192'},
            { test: /\.(js|jsx)$/, loader: 'babel-loader',exclude: /node_modules/, query: {
                presets: ['es2015']
            }},
            // 内联的base64的图片地址，图片要小于8k，直接的url的地址则不解析
           // { test: /\.scss$/, loader: 'style-loader!css-loader!sass-loader'}
        ]
    },  plugins: [
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin(),
       // new webpack.optimize.CommonsChunkPlugin(("commons.js" )),

        new ExtractTextPlugin("[name].css"),
        new HtmlWebpackPlugin({                        //根据模板插入css/js等生成最终HTML
            filename:'./html/index.html',    //生成的html存放路径，相对于 path
            template:'./html/index.html',    //html模板路径
            inject:true,    //允许插件修改哪些内容，包括head与body
            hash:false,    //为静态资源生成hash值
            minify:{    //压缩HTML文件
                    removeComments:true,    //移除HTML中的注释
                    collapseWhitespace:false,    //删除空白符与换行符
                    //removeScriptTypeAttributes:true,
            },
            chunks:["[name].js"]
        }),

        //new webpack.optimize.CommonsChunkPlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development')
        }
        )
    ],
    resolve: {
        extensions: ['', '.js','.css','.less']
    }
};
//require("!style!css!less!./core/less/*");
