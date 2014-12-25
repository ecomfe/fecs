/**
 * @file jscs checker
 * @author chris<wfsr@foxmail.com>
 */

var through  = require('through2');
var HTMLHint = require('htmlhint').HTMLHint;
var htmlcs   = require('htmlcs');

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

            var htmlcsConfig = util.getConfig('htmlcs', options.lookup ? file.path : '');
            var htmlhintConfig = util.getConfig('htmlhint', options.lookup ? file.path : '');

            try {

                var contents = file.contents.toString();

                htmlcs.hint(contents, htmlcsConfig).forEach(function (error) {
                    file.errors.push(
                        util.parseError(
                            {
                                type: 'html',
                                checker: 'htmlcs',
                                rule: error.rule
                            },
                            error
                        )
                    );
                });

                HTMLHint.verify(contents, htmlhintConfig).forEach(function (error) {
                    file.errors.push(
                        util.parseError(
                            {
                                type: 'html',
                                checker: 'htmlhint',
                                rule: error.rule.id
                            },
                            error
                        )
                    );
                });


                cb(null, file);

            }
            catch (error) {
                if (options.debug) {
                    throw error;
                }

                file.errors.push(
                    util.parseError(
                        {
                            type: 'html',
                            checker: 'htmlcs',
                            code: '999'
                        },
                        error
                    )
                );
                cb(null, file);
            }


        },

        function (cb) {
            checked = null;
            cb();
        }
    );
};
