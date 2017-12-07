/**
 * @file css formatter
 * @author chris<wfsr@foxmail.com>
 */

var Comb = require('csscomb');

var util = require('../util');
var Formatter = require('../formatter');


var formatter = new Formatter({
    name: 'csscomb',
    type: 'css',
    suffix: /\.(?:c|le|sa|sc)ss$/
});

var csscomb = new Comb('csscomb', 'css', 'less', 'scss', 'sass');
csscomb.use(require('./rules/space-after-value'));

/**
 * 执行对 CSS 文件内容的格式化
 *
 * @param {string} contents 文件内容
 * @param {string} path 文件路径
 * @param {Object} cliOptions 命令行中传过来的配置项
 * @return {string} 返回格式化后的内容
 */
formatter.format = function (contents, path, cliOptions) {

    var name = this.options.name;
    var config = util.getConfig(name, cliOptions.lookup && path);

    csscomb.configure(config);

    var syntax = /\.html?$/.test(path) ? 'css' : path.split('.').pop();

    return csscomb
        .processString(contents, {syntax: syntax})
        .catch(function (error) {
            return cliOptions.debug ? Promise.reject(error) : contents;
        });
};

module.exports = formatter;
