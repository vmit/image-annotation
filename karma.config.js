const _ = require('lodash');
const webpack = require('karma-webpack');
const webpackConfig = require('./webpack.config');


module.exports = function (config) {
    config.set({
        frameworks: [ 'jasmine' ],
        files: [
            'tests/**/*.spec.js'
        ],
        plugins: [ webpack, 'karma-jasmine', 'karma-yandex-launcher' ],
        browsers: [ 'Yandex' ],
        preprocessors: {
            'tests/**/*.spec.js': ['webpack']
        },
        webpack: _.omit(webpackConfig, 'entry', 'output')
    });
};