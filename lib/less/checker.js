/**
 * @file less checker
 * @author chris<wfsr@foxmail.com>
 */

var through = require('through2');
var lesslint = require('lesslint');

/**
 * 根据文件路径中扩展名判断当前能否处理
 *
 * @param {string} path 文件路径
 * @return {boolean} 是否可处理
 */
function canHandle(path) {
    return /\.less$/.test(path);
}


/**
 * 负责代码风格检查的转换流
 *
 * @param {Object} options 配置项
 * @return {Transform} 转换流
 */
module.exports = function (options) {
    var util = require('../util');

    return through(
        {
            objectMode: true
        },

        function (file, enc, cb) {

            if (!canHandle(file.path) || file.isNull() || file.stat.size > options.maxsize) {
                cb(null, file);
                return;
            }

            file.errors = [];

            var success = function (result) {
                result[0] && result[0].messages.forEach(function (error) {
                    file.errors.push(
                        util.parseError(
                            {
                                type: 'css',
                                checker: 'lesslint',
                                rule: error.ruleName
                            },
                            error
                        )
                    );
                });
            };

            var failure = function (reasons) {
                file.errors.push(
                    util.parseError(
                        {
                            type: 'css',
                            checker: 'lesslint',
                            code: '999'
                        },
                        reasons[0] && reasons[0].messages[0]
                    )
                );
            };

            var done = function () {
                cb(null, file);
            };

            var config = util.getConfig('lesslint', options.lookup ? file.path : '');
            config['max-error'] = options.maxerr;

            lesslint
                .checkString(file.contents.toString(), file.path, config)
                .then(success, failure)
                .done(done);


        }
    );
};
