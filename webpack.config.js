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