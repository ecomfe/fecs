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
    return !/\.tpl\.html?$/.test(path) && /\.html?$/.test(path);
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

            var htmlcsConfig = util.getConfig('htmlcs', options.lookup ? file.path : '');
            var htmlhintConfig = util.getConfig('htmlhint', options.lookup ? file.path : '');

            try {

                var contents = file.contents.toString();

                htmlcsConfig['max-error'] = options.maxerr;
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


        }
    );
};
