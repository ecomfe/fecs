/**
 * @file htmlcs checker
 * @author chris<wfsr@foxmail.com>
 */

var htmlcs = require('htmlcs');
var Q = require('q');

var util = require('../util');
var Checker = require('../checker');

var jsChecker = require('../js/checker');
var cssChecker = require('../css/checker');

var checker = new Checker({
    name: 'htmlcs',
    type: 'html',
    suffix: 'html,htm',
    ignore: /\.(tpl|m|min)\.html?$/i
});

function checkScript(contents, path, cliOptions, pos, errors, indent) {
    var code =  ''
        // 在页面中应该禁止的规则
        + '/* eslint-disable fecs-valid-jsdoc, fecs-eol-last */'
        // 缩进需要调整
        + '/* eslint fecs-indent: [2, "spaces", 4, ' + indent.length + '] */'
        + '\n'
        + (/^\s*[\r\n]+/.test(contents) ? '' : new Array(pos.column + 1).join(' '))
        + contents.trimRight();

    var jsErrors = jsChecker.check(code, path, cliOptions);
    if (jsErrors.length) {
        jsErrors.forEach(function (error) {
            // 减 2 是因为一行是标签名，一行是上面加的规则注释
            error.line = (error.line | 0) + pos.line - 2;
            if (error.line === pos.line) {
                error.column += pos.column;
            }
            errors.push(error);
        });
    }

    return errors;
}

function checkStyle(contents, path, cliOptions, pos, errors, indent) {
    var code =  ''
        // 在页面中应该禁止的规则
        + '/* csshint-disable no-bom */'
        // 缩进需要调整
        + '/* csshint block-indent: ["    ", ' + indent.length + '] */'
        + '\n'
        + (/^\s*[\r\n]+/.test(contents) ? '' : new Array(pos.column + 1).join(' '))
        + contents.trimRight();

    var promise = cssChecker.check(code, path, cliOptions);
    var done = function (cssErrors) {
        if (cssErrors.length) {
            cssErrors.forEach(function (error) {
                // 减 2 是因为一行是标签名，一行是上面加的规则注释
                error.line = (error.line | 0) + pos.line - 2;
                if (error.line === pos.line) {
                    error.column += pos.column;
                }
                errors.push(error);
            });
        }
        return errors;
    };

    return promise.then(done, done);
}


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

    var config = util.getConfig(name, cliOptions.lookup && path);
    var errors = [];
    var linters = {};

    if (!cliOptions.type && config['script-content']) {
        linters.script = function (contents, pos, script, indent) {
            checkScript(contents, path, cliOptions, pos, errors, indent);
        };
    }

    var deferred;

    if (!cliOptions.type && config['style-content']) {
        deferred = Q.defer();
        var promises = [];
        var finish = function () {
            Q.all(promises).then(function () {
                deferred.resolve(errors);
            });
        };

        var timer;
        linters.style = function (contents, pos, style, indent) {
            promises.push(checkStyle(contents, path, cliOptions, pos, errors, indent));
            clearTimeout(timer);
            timer = setTimeout(finish, 10);
        };

        timer = setTimeout(function () {
            /* istanbul ignore else */
            if (!promises.length) {
                deferred.resolve(errors);
            }
        }, 20);
    }

    config.linters = linters;
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


    return deferred ? deferred.promise : errors;
};

module.exports = checker;
