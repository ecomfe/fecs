/**
 * @file js formatter
 * @author chris<wfsr@foxmail.com>
 */

var CLIEngine = require('eslint').CLIEngine;
var esformatter = require('esformatter');

var esnext = require('./esnext');
var util = require('../util');
var Formatter = require('../formatter');

var formatter = new Formatter({
    name: 'esformatter',
    type: 'js',
    suffix: 'js,jsx,es,es6'
});

/**
 * 执行对 JS 文件内容的格式化
 *
 * @param {string} contents 文件内容
 * @param {string} path 文件路径
 * @param {Object} cliOptions 命令行中传过来的配置项
 * @return {string} 返回格式化后的内容
 */
formatter.format = function (contents, path, cliOptions) {

    var name = this.options.name;
    var config = util.getConfig(name, cliOptions.lookup && path);

    if (cliOptions.fix) {
        var eslintConfig = util.getConfig('eslint', cliOptions.lookup && path);
        esnext.removeRedundantRules(eslintConfig);

        var rules = Object.assign(eslintConfig.rules);

        if (!('indent' in rules)) {
            var fecsIndent = rules['fecs-indent'];
            rules.indent = [
                fecsIndent[0],
                {tab: fecsIndent[1], space: fecsIndent[2]}[fecsIndent[1]]
            ];
        }
        var cli = new CLIEngine({
            parser: eslintConfig.parser,
            envs: Object.keys(eslintConfig.env),
            globals: Object.keys(eslintConfig.globals),
            plugins: eslintConfig.plugins,
            fix: true,
            rules: rules
        });
        var report = cli.executeOnText(contents, path);

        contents = report.results[0].output || contents;
    }

    try {
        contents = esformatter.format(contents, config);
    }
    catch (error) {
        if (cliOptions.debug) {
            throw error;
        }
    }

    return contents;
};

module.exports = formatter;
