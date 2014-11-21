/**
 * @file jscs checker
 * @author chris<wfsr@foxmail.com>
 */

var through  = require('through2');
var HTMLHint = require('htmlhint').HTMLHint;
var RcLoader = require('rcloader2');

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

    var config = require('./config');
    var defaultHTMLHintConfig = config.htmlhint;
    var htmlhintRcloader = new RcLoader('.htmlhintrc', defaultHTMLHintConfig, {loader: util.parseJSON});
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

            var htmlhintConfig = options.lookup
                ? htmlhintRcloader.for(file.path)
                : htmlhintRcloader;

            try {

                var contents = file.contents.toString();

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
                            checker: 'htmlhint',
                            code: '999'
                        },
                        error
                    )
                );
                cb(null, file);
            }


        },

        function (cb) {
            htmlhintRcloader = null;
            checked = null;
            cb();
        }
    );
};
