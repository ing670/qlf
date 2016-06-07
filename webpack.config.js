/**
 * Created by liuqingling on 16/1/22.
 */
    //commenjs
var path = require("path");
var webpack = require('webpack');
//var config = require("./config.json");
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    devtool:'sourcemap',
    entry: {
        bootstrap: ['static/runtime/js/bootstrap'],
        app:['static/runtime/app'],
        base:['static/runtime/css/base.less'],
    },
    output: {
        path: path.join(__dirname, '/dist'),  //打包输出的路径
        filename: '[name].js'/*+'?[chunkhash]'*/,			  //打包后的名字
        publicPath: '/dist/'				//发布路径
    },
    module:{
        wrappedContextRecursive : false,
        loaders: [
            { test: /\.ejs$/, loader: "ejs-compiled-loader"},
            //{ test: /\.(css|less|scss)$/, loader: ExtractTextPlugin.extract('style-loader!css-loader','css-loader?sourceMap!less-loader?sourceMap',"sass")},
            { test: /\.(css)$/, loader: ExtractTextPlugin.extract('style-loader!css-loader!autoprefixer-loader?safe=true')},
            { test: /\.(less)$/, loader: ExtractTextPlugin.extract('css-loader!autoprefixer-loader!less-loader?safe=true')},
            { test: /\.(scss)$/, loader: ExtractTextPlugin.extract("sass")},
            { test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192'},
            { test: /\.(js|jsx)$/, loader: 'babel-loader'},
            { test: /\.json$/,loader:'json'},
            { test: /\.html$/, loader: "html"}
            // 内联的base64的图片地址，图片要小于8k，直接的url的地址则不解析
           // { test: /\.scss$/, loader: 'style-loader!css-loader!sass-loader'}
        ]
    },  plugins: [
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin(),
        new webpack.optimize.CommonsChunkPlugin({
            name: "common",
            minChunks: 2
        }),
        //new webpack.optimize.MinChunkSizePlugin(100),
        new ExtractTextPlugin("[name].min.css"),
        new HtmlWebpackPlugin({                        //根据模板插入css/js等生成最终HTML
            filename:'./index.html',    //生成的html存放路径，相对于 path
            template:'./index.html',    //html模板路径
            inject:false,    //允许插件修改哪些内容，包括head与body
            hash:false,    //为静态资源生成hash值
            minify:{    //压缩HTML文件
                    removeComments:true,    //移除HTML中的注释
                    collapseWhitespace:false,    //删除空白符与换行符
                    //removeScriptTypeAttributes:true,
            },
        }),

        //new webpack.optimize.CommonsChunkPlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development')
        })
    ],
    resolve: {
        root:__dirname,
        modulesDirectories:[path.join(__dirname, "static","runtime","js","components"),'node_modules'],
        //alias: {
        //    components:path.join(__dirname, "static","runtime","js","components"),
        //},
        extensions: ['', '.js','.css','.less','.sass','.scss','.json']
    }
};
//require("!style!css!less!./core/less/*");
