var webpack = require('webpack');
var path = require('path');

module.exports = {
    entry: {
        lib: ['./src/index.js']
    },

    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'fastsvgviewer.js',
        library: 'FastSvgViewer',
        publicPath: 'http://localhost:8080/built'
    },

    devServer: {
        contentBase: './development',
        host: '0.0.0.0',
        port: 8080,
        allowedHosts: [
            'local.youbim.com',
            'localhost',
            '192.168.0.169'
        ]
    },

    module: {
        loaders: [
            {
                test: /\.js$/,

                use: [
                    {
                        loader: 'babel-loader'
                    }
                ],

                exclude: '/node_modules/'
            }
        ]
    },

    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ]
};