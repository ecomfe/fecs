/**
 * @file css formatter
 * @author chris<wfsr@foxmail.com>
 */

var through     = require('through2');
var Comb        = require('csscomb');
var cssbeautify = require('cssbeautify');
var RcLoader    = require('rcloader');

/**
 * 根据文件路径中扩展名判断当前能否处理
 *
 * @param {string} path 文件路径
 * @return {boolean} 是否可处理
 */
function canHandle(path) {
    return /\.(css|less|sass|scss)$/.test(path);
}


/**
 * 负责格式化的转换流
 *
 * @param {Object} options 配置项
 * @return {Transform} 转换流
 */
module.exports = function (options) {
    var util = require('../util');

    var defaultConfig = require('./config').csscomb;
    var rcloader = new RcLoader('.csscomb.json', defaultConfig, {loader: util.parseJSON});
    var csscomb = new Comb('csscomb');
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

            var config = options.lookup
                ? rcloader.for(file.path)
                : defaultConfig;

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

        },

        function (cb) {
            rcloader = null;
            formatted = null;
            cb();
        }
    );
};
