const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');

module.exports = {
    entry: [path.resolve('./src/index.ts')],
    output: {
        path: path.resolve('./dist'),        
        library: 'peppermint-di',
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    externals: [nodeExternals()],
    module: {
        rules: [
            { test: /.ts$/, use: ['ts-loader', 'ts-nameof-loader'] }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js'],
        modules: [path.resolve('./src'), 'node_modules']
    },
    plugins: [
        new webpack.optimize.ModuleConcatenationPlugin()
    ]
};