/**
 * @file less checker
 * @author chris<wfsr@foxmail.com>
 */

var lesslint = require('lesslint');

var util = require('../util');
var Checker = require('../checker');

var checker = new Checker({
    name: 'lesslint',
    type: 'css',
    suffix: 'less'
});


/**
 * 执行对 LESS 文件内容的检查
 *
 * @param {string} contents 文件内容
 * @param {string} path 文件路径
 * @param {Object} cliOptions 命令行中传过来的配置项
 * @return {Promise.<Object[], Object[]>} 返回带错误信息的 Promise 对象
 */
checker.check = function (contents, path, cliOptions) {

    var options = this.options;
    var name = options.name;
    var type = options.type;

    var config = util.getConfig(name, cliOptions.lookup && path);

    var errors = [];

    var success = function (result) {
        result[0] && result[0].messages.forEach(function (error) {
            errors.push(
                util.parseError(
                    {
                        type: type,
                        checker: name,
                        rule: error.ruleName
                    },
                    error
                )
            );
        });

        return errors;
    };

    var failure = function (reasons) {
        errors.push(
            util.parseError(
                {
                    type: type,
                    checker: name,
                    code: '999'
                },
                reasons[0] && reasons[0].messages[0]
            )
        );

        return errors;
    };

    config['max-error'] = cliOptions.maxerr;
    return lesslint
        .checkString(contents, path, config)
        .then(success, failure);
};

module.exports = checker;
