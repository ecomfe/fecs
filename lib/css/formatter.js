/**
 * @file css formatter
 * @author chris<wfsr@foxmail.com>
 */

var through     = require('through2');
var Comb        = require('csscomb');
var cssbeautify = require('cssbeautify');

/**
 * 根据文件路径中扩展名判断当前能否处理
 *
 * @param {string} path 文件路径
 * @return {boolean} 是否可处理
 */
function canHandle(path) {
    return /\.(?:c|le|sa|sc)ss$/.test(path);
}


/**
 * 负责格式化的转换流
 *
 * @param {Object} options 配置项
 * @return {Transform} 转换流
 */
module.exports = function (options) {
    var util = require('../util');

    var csscomb = new Comb('csscomb');

    return through(
        {
            objectMode: true
        },

        function (file, enc, cb) {

            if (!canHandle(file.path) || file.isNull()) {
                cb(null, file);
                return;
            }

            var config = util.getConfig('csscomb', options.lookup ? file.path : '');

            csscomb.configure(config);

            try {
                file.contents = new Buffer(
                    csscomb.processString(
                        cssbeautify(file.contents.toString())
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

        }
    );
};
