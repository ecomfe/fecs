/**
 * @file css formatter
 * @author chris<wfsr@foxmail.com>
 */

var through  = require('through2');
var beautify = require('js-beautify').html;
var HTMLComb = require('htmlcomb');

/**
 * 根据文件路径中扩展名判断当前能否处理
 *
 * @param {string} path 文件路径
 * @return {boolean} 是否可处理
 */
function canHandle(path) {
    return /\.html?$/.test(path);
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
    var htmlcomb = new HTMLComb();

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

            var config = util.getConfig('jsbeautify', options.lookup ? file.path : '');

            try {
                file.contents = new Buffer(
                    htmlcomb.comb(beautify(file.contents.toString(), config))
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
