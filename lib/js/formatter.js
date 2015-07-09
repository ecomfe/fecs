/**
 * @file js formatter
 * @author chris<wfsr@foxmail.com>
 */

var fixmyjs     = require('fixmyjs');
var jshint      = require('jshint').JSHINT;
var jformatter  = require('jformatter');
var esformatter = require('esformatter');

var util = require('../util');
var Formatter = require('../formatter');


/**
 * 使用 fixmyjs 来修复 JavaScript 代码
 *
 * @param {string} contents 代码内容
 * @param {Object} config JSHINT 的配置选项
 * @return {string} 修复后的代码
 */
function fix(contents, config) {
    return fixmyjs.fix(contents, config);
}

/**
 * 使用 fixmyjs 来安全修复 JavaScript 代码
 *
 * @param {string} contents 代码内容
 * @param {Object} config JSHINT 的配置选项
 * @return {string} 修复后的代码
 */
function safeFix(contents, config) {
    jshint(contents, config);
    return fixmyjs(jshint.data(), contents, config).run();
}


var formatter = new Formatter({
    name: 'jformatter',
    type: 'js',
    suffix: 'js'
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

    var jshintConfig = util.getConfig('jshint', cliOptions.lookup && path);
    var esformatterConfig = util.getConfig('esformatter', cliOptions.lookup && path);

    try {

        contents = cliOptions.safe === 'low'
            ? fix(contents, jshintConfig)
            : safeFix(contents, jshintConfig);

        contents = cliOptions.safe === 'high'
            ? contents
            : esformatter.format(jformatter.format(contents, config), esformatterConfig);

        // HACK: fix end of file
        contents = contents.replace(/[\r\n]*$/, '\n');

    }
    catch (error) {
        if (cliOptions.debug) {
            throw error;
        }
    }

    return contents;
};

module.exports = formatter;
