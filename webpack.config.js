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
        home: ['./js/home/index'],
        commoncss:['./css/common/abc']
    },
    output: {
        path: path.join(__dirname, '/dist'),  //打包输出的路径
        filename: 'js/[name].min.js'/*+'?[chunkhash]'*/,			  //打包后的名字
        publicPath: '/static/'				//发布路径
    },
    module:{
        loaders: [
            { test: /\.ejs$/, loader: "ejs-compiled-loader"},
            { test: /\.(css|less|scss)$/, loader: ExtractTextPlugin.extract("style-loader", "css-loader","less-loader","sass")},
            { test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192'},
            { test: /\.(js|jsx)$/, loader: 'babel-loader'},
            // 内联的base64的图片地址，图片要小于8k，直接的url的地址则不解析
           // { test: /\.scss$/, loader: 'style-loader!css-loader!sass-loader'}
        ]
    },  plugins: [
        new webpack.optimize.OccurenceOrderPlugin(),
        //new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin(),
        new webpack.optimize.CommonsChunkPlugin({
            name: "common",
            minChunks: 2
        }),

        //new webpack.optimize.MinChunkSizePlugin(100),
        new ExtractTextPlugin("css/[name].min.css"),
        new HtmlWebpackPlugin({                        //根据模板插入css/js等生成最终HTML
            filename:'./html/index.html',    //生成的html存放路径，相对于 path
            template:'./html/index.html',    //html模板路径
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
        extensions: ['', '.js','.css','.less','.sass','.scss']
    }
};
//require("!style!css!less!./core/less/*");
