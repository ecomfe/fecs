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
    return /\.js$/.test(path);
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

    require('./rules').register();

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

            var eslintConfig = util.getConfig('eslint', options.lookup ? file.path : '');

            try {

                var contents = file.contents.toString();

                eslint.verify(contents, eslintConfig).forEach(function (error) {
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

        },

        function (cb) {
            checked = null;
            cb();
        }
    );
};
