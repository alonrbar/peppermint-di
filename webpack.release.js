const webpack = require('webpack');
const merge = require('webpack-merge');
const base = require('./webpack.base.js');

module.exports = merge(base, {
    mode: 'production',
    output: {
        filename: 'resolver-js.min.js'
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin()
    ]
});