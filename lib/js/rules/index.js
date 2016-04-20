/**
 * @file additional rules for eslint
 * @author chris<wfsr@foxmail.com>
 */


var fs   = require('fs');
var path = require('path');

var eslintRules = require('eslint/lib/rules');
var eslintPlugins = require('eslint/lib/config/plugins');

/**
 * 注册扩展的 eslint 校验规则
 *
 * @param {string=} [dir = __dirname] the directory of rules
 */
exports.register = function (dir) {
    dir = dir || __dirname;

    var cur = path.relative(dir, __filename);
    var reg = /([^\\\/]+)\.js$/i;

    fs.readdirSync(dir).forEach(function (file) {
        if (file === cur) {
            return;
        }

        var match = file.match(reg);
        if (match) {
            var key = 'fecs-' + match[1].replace(/[A-Z]/g, function (a) {
                return '-' + a.toLowerCase();
            });

            eslintRules.define(key, path.join(dir, file));
        }
    });
};

/**
 * 注册外部插件
 * 见 eslint/lib/config/plugins.js load
 *
 * @param {string[]} plugins 插件名数组
 */
exports.registerPlugins = function (plugins) {
    if (!Array.isArray(plugins)) {
        plugins = Array.prototype.slice.call(arguments);
    }

    plugins.forEach(eslintPlugins.load, eslintPlugins);
};
