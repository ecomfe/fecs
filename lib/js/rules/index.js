/**
 * @file additional rules for eslint
 * @author chris<wfsr@foxmail.com>
 */


var fs   = require('fs');
var path = require('path');

var rules = require('eslint/lib/rules');
var Plugins = require('eslint/lib/config/plugins');

/**
 * 注册扩展的 eslint 校验规则
 *
 */
exports.register = function () {
    var dir = __dirname;
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

            rules.define([key], require(path.join(dir, file)));
        }
    });

};

/**
 * 标记已注册的插件
 *
 * @inner
 * @type {Object}
 */
var registered = Object.create(null);

/**
 * 注册外部插件
 * 见 eslint/lib/config/plugins.js load
 *
 * @param {string[]} plugins 插件名数组
 */
exports.registerPlugins = function (plugins) {
    if (!Array.isArray(plugins)) {
        return;
    }

    plugins.forEach(function (pluginName) {
        if (!registered[pluginName]) {
            Plugins.load(pluginName);
            registered[pluginName] = true;
        }
    });

    console.log(registered);
};
