/**
 * @file css checker
 * @author chris<wfsr@foxmail.com>
 */

var through = require('through2');
var csshint = require('csshint');

/**
 * 根据文件路径中扩展名判断当前能否处理
 *
 * @param {string} path 文件路径
 * @return {boolean} 是否可处理
 */
function canHandle(path) {
    return /\.css$/.test(path);
}


/**
 * 负责代码风格检查的转换流
 *
 * @param {Object} options 配置项
 * @return {Transform} 转换流
 */
module.exports = function (options) {
    var util = require('../util');

    var checked = {};

    return through(
        {
            objectMode: true
        },

        function (file, enc, cb) {

            if (checked[file.path] || !canHandle(file.path) || file.isNull()) {
                cb(null, file);
                return;
            }

            file.errors = [];
            checked[file.path] = true;

            var config = util.getConfig('csshint', options.lookup ? file.path : '');

            try {
                var errors = csshint.checkString(file.contents.toString(), config);

                errors.forEach(function (error) {
                    file.errors.push(
                        util.parseError(
                            {
                                type: 'css',
                                checker: 'csshint',
                                rule: error.ruleName
                            },
                            error
                        )
                    );
                });
            }
            catch (error) {
                if (options.debug) {
                    throw error;
                }

                file.errors.push(
                    util.parseError(
                        {
                            type: 'css',
                            checker: 'csshint',
                            code: '999'
                        },
                        error
                    )
                );
            }

            cb(null, file);

        },

        function (cb) {
            checked = null;
            cb();
        }
    );
};
