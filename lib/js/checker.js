/**
 * @file eslint checker
 * @author chris<wfsr@foxmail.com>
 */

var rules = require('./rules');
var util = require('../util');
var esnext = require('./esnext');
var Checker = require('../checker');

var checker = new Checker({
    name: 'eslint',
    type: 'js',
    suffix: 'js,jsx,es,es6,vue,san,atom',
    ignore: /\.(m|min|mock|mockup)\.(js|es|es6)$/
});

rules.register();

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

    var config = util.parseExtends(util.getConfig(name, cliOptions.lookup && path), name);

    var maxerr = 0;
    var hasMax = cliOptions.maxerr > 0;
    var errors = [];

    esnext.removeRedundantRules(config);

    rules.registerPlugins(config.plugins);

    try {
        // 优先使用配置文件里的 ES 版本设置
        var ecmaVersion = config.parserOptions && config.parserOptions.ecmaVersion || cliOptions.es;

        if (ecmaVersion < 6) {
            config = util.mix(
                config,
                {
                    env: {es6: false},
                    parser: 'espree',
                    parserOptions: {
                        ecmaVersion: ecmaVersion
                    }
                }
            );
        }
        else if (ecmaVersion > 6 || ecmaVersion === 'next') {
            config = util.mix(
                config,
                {
                    env: {es6: true}
                }
            );
        }

        esnext.verify(contents, config, path).forEach(function (error) {
            if (hasMax) {
                maxerr++;
                if (maxerr > cliOptions.maxerr) {
                    return true;
                }
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
