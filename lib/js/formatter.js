/**
 * @file js formatter
 * @author chris<wfsr@foxmail.com>
 */

var esformatter = require('esformatter');

var util = require('../util');
var Formatter = require('../formatter');

var formatter = new Formatter({
    name: 'esformatter',
    type: 'js',
    suffix: 'js,es,es6'
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
