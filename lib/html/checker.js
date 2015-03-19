/**
 * @file htmlcs checker
 * @author chris<wfsr@foxmail.com>
 */

var HTMLHint = require('htmlhint').HTMLHint;
var htmlcs   = require('htmlcs');


var util = require('../util');
var Checker = require('../checker');

var checker = new Checker({
    name: 'htmlcs',
    type: 'html',
    suffix: 'html',
    ignore: 'tpl.html,m.html,min.html'
});


/**
 * 执行对 HTML 文件内容的检查
 *
 * @param {string} contents 文件内容
 * @param {string} path 文件路径
 * @param {Object} cliOptions 命令行中传过来的配置项
 * @return {Array.<Object>} 返回错误信息的数组
 */
checker.check = function (contents, path, cliOptions) {

    var options = this.options;
    var name = options.name;
    var type = options.type;

    var config = util.getConfig(name, cliOptions.lookup ? path : '');
    var htmlhintConfig = util.getConfig('htmlhint', cliOptions.lookup ? path : '');

    var errors = [];

    try {

        config['max-error'] = cliOptions.maxerr;

        htmlcs.hint(contents, config).forEach(function (error) {
            errors.push(
                util.parseError(
                    {
                        type: type,
                        checker: name,
                        rule: error.rule
                    },
                    error
                )
            );
        });

        HTMLHint.verify(contents, htmlhintConfig).forEach(function (error) {
            errors.push(
                util.parseError(
                    {
                        type: type,
                        checker: 'htmlhint',
                        rule: error.rule.id
                    },
                    error
                )
            );
        });

    }
    catch (error) {
        if (cliOptions.debug) {
            throw error;
        }

        errors.push(
            util.parseError(
                {
                    type: type,
                    checker: name,
                    code: '999'
                },
                error
            )
        );
    }

    return errors;
};

module.exports = checker;
