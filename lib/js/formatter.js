/**
 * @file js formatter
 * @author chris<wfsr@foxmail.com>
 */

var through    = require('through2');
var fixmyjs    = require('fixmyjs');
var jformatter = require('jformatter');
var RcLoader   = require('rcloader');

/**
 * 根据文件路径中扩展名判断当前能否处理
 *
 * @param {string} path 文件路径
 * @return {boolean} 是否可处理
 */
function canHandle(path) {
    return /\.js$/.test(path);
}

/**
 * 使用 fixmyjs 来修复 JavaScript 代码
 *
 * @param {string} contents 代码内容
 * @param {Object} config JSHINT 的配置选项
 * @return {string} 修复后的代码
 */
function fix(contents, config) {
    return fixmyjs.fix(contents, config);
}

/**
 * 负责格式化的转换流
 *
 * @param {Object} options 配置项
 * @return {Transform} 转换流
 */
module.exports = function (options) {
    var util = require('../util');

    var defaultConfig = require('./config').jshint;
    var rcloader = new RcLoader('.jshintrc', defaultConfig, {loader: util.parseJSON});
    var formatted = {};

    return through(
        {
            objectMode: true
        },

        function (file, enc, cb) {

            if (file.isStream()) {
                cb(new Error('Streaming not supported'));
                return;
            }

            if (formatted[file.path] || !canHandle(file.path) || file.isNull()) {
                cb(null, file);
                return;
            }

            formatted[file.path] = true;

            var config = options.lookup
                ? rcloader.for(file.path)
                : defaultConfig;

            try {
                file.contents = new Buffer(
                    jformatter.format(
                        fix(file.contents.toString(), config)
                    )
                );
            }
            catch (error) {
                if (options.debug) {
                    throw error;
                }

                this.emit('error', error);
            }

            cb(null, file);

        },

        function (cb) {
            rcloader = null;
            formatted = null;
            cb();
        }
    );
};
