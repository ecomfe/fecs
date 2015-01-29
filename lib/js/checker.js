/**
 * @file jscs checker
 * @author chris<wfsr@foxmail.com>
 */

var through  = require('through2');
var eslint   = require('eslint').linter;

/**
 * 根据文件路径中扩展名判断当前能否处理
 *
 * @param {string} path 文件路径
 * @return {boolean} 是否可处理
 */
function canHandle(path) {
    return /\.js$/i.test(path) && !/\.(min|m)\.js$/i.test(path);
}


/**
 * 负责代码风格检查的转换流
 *
 * @param {Object} options 配置项
 * @return {Transform} 转换流
 */
module.exports = function (options) {
    var util = require('../util');

    require('./rules').register();

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

            var eslintConfig = util.getConfig('eslint', options.lookup ? file.path : '');

            try {

                var contents = file.contents.toString();

                var maxerr = 0;
                var hasMax = options.maxerr > 0;
                eslint.verify(contents, eslintConfig).forEach(function (error) {
                    if (hasMax) {
                        maxerr++;
                        if (maxerr > options.maxerr) {
                            return;
                        }
                    }

                    if (typeof error.column === 'number') {
                        error.column++;
                    }

                    file.errors.push(
                        util.parseError(
                            {
                                type: 'js',
                                checker: 'eslint',
                                rule: error.ruleId
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
                            type: 'js',
                            checker: 'eslint',
                            code: '999'
                        },
                        error
                    )
                );
            }

            cb(null, file);

        }
    );
};
