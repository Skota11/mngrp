const webpack = require('webpack')
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
    mode:"production",
    entry: {
		home: './src/public/home-script.js',
		chat: './src/public/chat-script.js',
	},

	output: {
		path: path.resolve(__dirname, './dist/public'),
		filename: `./[name].js`,
	},

	plugins: [
		new HtmlWebpackPlugin({						//	追加
			inject: 'body',
			filename: 'home.html',
			template: './src/public/home.html',
			chunks: ['home'],
		}),
        new HtmlWebpackPlugin({					//	追加
			inject: 'body',
			filename: 'chat.html',
			template: './src/public/chat.html',
			chunks: ['chat'],
		}),
	],
  };