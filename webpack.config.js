const path = require('path');
var webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin'); // чтобы css подключалось файлом, а не тегом <style> в шапке
const CopyWebpackPlugin = require('copy-webpack-plugin'); // чтобы скопировать картинки и шрифты в папку билда

const PATHS = {
    source: path.join(__dirname, 'src'),
    build: path.join(__dirname, 'dist')
};

module.exports = {
    entry: PATHS.source + '/js/index.js',
    output: {
        filename:  'js/[name].bundle.js',
        path: PATHS.build
    },
    devtool: 'inline-source-map',
    devServer: {
         contentBase: './dist'
    },
    resolve: {
        alias: {
            'vue$': 'vue/dist/vue.esm.js'
        },
        extensions: ['*', '.js', '.vue', '.json']
    },
    plugins: [
             new CleanWebpackPlugin([PATHS.build]),
             new HtmlWebpackPlugin({
                 filename: 'index.html',
                 template: 'src/index.html'
             }),
            new CopyWebpackPlugin([
                { context: PATHS.source, from: './fonts/*' },
                { context: PATHS.source, from: './img/**/*' }
            ]),
            new ExtractTextPlugin("css/[name].bundle.css"),
            new webpack.DefinePlugin({
                'process.env': {
                    NODE_ENV: '"development"'
                }
            })
   ],
    module: {
         rules: [
             {
                 test: /\.vue$/,
                 loader: 'vue-loader',
                 options: {
                     loaders: {}
                     // other vue-loader options go here
                 }
             },
            {
              test: /\.scss$/,
              use: ExtractTextPlugin.extract({
                     publicPath: '../',
                     fallback: "style-loader",
                  use: [
                          {
                              loader: 'css-loader',
                              options: {
                                  // If you are having trouble with urls not resolving add this setting.
                                  // See https://github.com/webpack-contrib/css-loader#url
                                  // url: false,
                                  minimize: true,
                                  sourceMap: true
                              }
                          },
                          {
                              loader: 'sass-loader',
                              options: {
                                  sourceMap: true
                              }
                          }
                      ]
                 })
            },
           {
             test: /\.css$/,
             use: ExtractTextPlugin.extract({
                   publicPath: '../',
                   fallback: "style-loader",
                 use: [
                     {
                         loader: 'css-loader',
                         options: {
                             // If you are having trouble with urls not resolving add this setting.
                             // See https://github.com/webpack-contrib/css-loader#url
                             //url: false,
                             minimize: true,
                             sourceMap: true
                         }
                     }
                 ]
               })
           },
           {
               test: /\.(png|svg|jpg|gif)$/,
               use: [
                       {
                           loader: 'file-loader',
                           options: {
                               name: 'img/[name].[ext]'
                           }
                       }
                    ]
           },
           {
               test: /\.(woff|woff2|eot|ttf|otf)$/,
               use: [
                   {
                       loader: 'file-loader',
                       options: {
                           name: 'fonts/[name].[ext]'
                       }
                   }
               ]
           }
     ]
   }
};
