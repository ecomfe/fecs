/**
 * @file js formatter
 * @author chris<wfsr@foxmail.com>
 */

var through    = require('through2');
var fixmyjs    = require('fixmyjs');
var jshint     = require('jshint').JSHINT;
var jformatter = require('jformatter');

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
 * 使用 fixmyjs 来安全修复 JavaScript 代码
 *
 * @param {string} contents 代码内容
 * @param {Object} config JSHINT 的配置选项
 * @return {string} 修复后的代码
 */
function safeFix(contents, config) {
    jshint(contents, config);
    return fixmyjs(jshint.data(), contents, config).run();
}

/**
 * 负责格式化的转换流
 *
 * @param {Object} options 配置项
 * @return {Transform} 转换流
 */
module.exports = function (options) {
    var util = require('../util');

    var formatted = {};

    return through(
        {
            objectMode: true
        },

        function (file, enc, cb) {

            if (formatted[file.path] || !canHandle(file.path) || file.isNull()) {
                cb(null, file);
                return;
            }

            formatted[file.path] = true;

            var jshintConfig = util.getConfig('jshint', options.lookup ? file.path : '');
            var jformatterConfig = util.getConfig('jformatter', options.lookup ? file.path : '');

            try {
                var contents = file.contents.toString();

                file.contents = new Buffer(
                    options.safe
                        ? safeFix(contents, jshintConfig)
                        : jformatter.format(safeFix(contents, jshintConfig), jformatterConfig)
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
            formatted = null;
            cb();
        }
    );
};
