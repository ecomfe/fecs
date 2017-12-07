/**
 * @file css formatter
 * @author chris<wfsr@foxmail.com>
 */

var htmlcs   = require('htmlcs');

var util = require('../util');
var Formatter = require('../formatter');

var jsformatter = require('../js/formatter');
var cssformatter = require('../css/formatter');

var formatter = new Formatter({
    name: 'htmlcs',
    type: 'html',
    suffix: 'html,htm'
});

/**
 * 为 htmlcs 生成用于 HTML 内 script 与 style 标签内容的 formatter
 *
 * @param {string} path HTML 的文件路径，主要用于查找相关配置
 * @param {Object} options CLI 传来的配置
 * @return {Object}
 */
var buildFormatter = function (path, options) {
    return {
        formatter: {

            /**
             * 对 script 标签内容的 formatter
             *
             * @param {string} content 标签内容
             * @param {Node} node script 标签对象
             * @param {Object} opt 配置对象
             * @param {Object} helper 包含 indent 方法的对象
             * @return {string} 格式化后的内容
             */
            script: function (content, node, opt, helper) {
                var type = node.getAttribute('type');

                // javascript content
                if (!type || type === 'text/javascript') {
                    var formatted = jsformatter.format(content, path, options);

                    opt.level--;
                    content = helper.indent(formatted);
                }

                return Promise.resolve(content.replace(/(^\s*\n)|(\n\s*$)/g, ''));
            },

            /**
             * 对 style 标签内容的 formatter
             *
             * @param {string} content 标签内容
             * @param {Node} node style 标签对象
             * @param {Object} opt 配置对象
             * @param {Object} helper 包含 indent 方法的对象
             * @return {Promise.<string>} 格式化后的内容
             */
            style: function (content, node, opt, helper) {
                var type = node.getAttribute('type');
                var pattern = /(^\s*\n)|(\n\s*$)/g;

                // style content
                if (!type || type === 'text/css') {
                    return cssformatter
                        .format(content, path, options)
                        .then(function (formatted) {
                            opt.level--;
                            return helper.indent(formatted).replace(pattern, '');
                        });

                }


                return Promise.resolve(content.replace(pattern, ''));
            }
        }
    };
};

/**
 * 执行对 HTML 文件内容的格式化
 *
 * @param {string} contents 文件内容
 * @param {string} path 文件路径
 * @param {Object} cliOptions 命令行中传过来的配置项
 * @return {Promise.<string>} 返回格式化后的内容
 */
formatter.format = function (contents, path, cliOptions) {

    var name = this.options.name;
    var config = util.getConfig(name, cliOptions.lookup && path);

    config.format = util.extend(buildFormatter(path, cliOptions), config.format);

    return htmlcs.formatAsync(contents, config);
};

module.exports = formatter;
