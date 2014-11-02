/**
 * @file additional rules for eslint
 * @author chris<wfsr@foxmail.com>
 */


var fs   = require('fs');
var path = require('path');

var rules = require('eslint/lib/rules');

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
