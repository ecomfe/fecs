/**
 * @file eslint checker
 * @author chris<wfsr@foxmail.com>
 */

var eslint   = require('eslint').linter;

var rules = require('./rules');
var util = require('../util');
var Checker = require('../checker');

var checker = new Checker({
    name: 'eslint',
    type: 'js',
    suffix: 'js,es6',
    ignore: 'm.js,min.js'
});

/**
 * 注册自定义规则
 *
 */
checker.register = function () {
    rules.register();
};


/**
 * 执行对 JS 文件内容的检查
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

    var config = util.getConfig(name, cliOptions.lookup && path);

    var maxerr = 0;
    var hasMax = cliOptions.maxerr > 0;
    var errors = [];

    rules.registerPlugins(config.plugins);

    try {
        eslint.verify(contents.replace(/\r\n?/g, '\n'), config).some(function (error) {
            if (hasMax) {
                maxerr++;
                if (maxerr > cliOptions.maxerr) {
                    return true;
                }
            }

            /* istanbul ignore else */
            if (typeof error.column === 'number') {
                error.column++;
            }

            errors.push(
                util.parseError(
                    {
                        type: type,
                        checker: name,
                        rule: error.ruleId
                    },
                    error
                )
            );
        });
    }
    catch (error) {
        errors.push(
            util.parseError(
                {
                    type: type,
                    checker: name,
                    code: '998'
                },
                error
            )
        );
    }

    return errors;
};

module.exports = checker;

