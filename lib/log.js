/**
 * @file 日志输出
 * @author chris<wfsr@foxmail.com>
 */

var chalk = require('chalk');
var util  = require('util');


var fns = [
    {name: 'trace', color: chalk.grey, level: 0},
    {name: 'debug', color: chalk.grey, level: 1},
    {name: 'info', color: chalk.green, level: 2},
    {name: 'warn', color: chalk.yellow, level: 3},
    {name: 'error', color: chalk.red, level: 4},
    {name: 'fatal', color: chalk.red, level: 5}
];


/**
 * 日志模块
 *
 * @param {boolean} color 是否使用颜色高亮输出
 * @return {Object} 包含 trace/debug/info/warn/error/fatal 等方法的 log 对象
 */
module.exports = function (color) {
    var log = {};
    var fixWidth = require('./util').fixWidth;
    var name = require('../').leadName;

    fns.forEach(function (item) {

        /**
         * 不同类型的 log 方法
         *
         * @param {string} format 要输出的内容.
         * @param {...*} args 变长参数.
         */
        log[item.name] = color
            ? function (format, args) {

                var msg = util.format.apply(null, arguments);
                if (msg) {
                    console.log(name + ' ' + item.color(fixWidth(item.name.toUpperCase(), 5)) + ' ' + msg);
                }
                else {
                    console.log();
                }
            }
            : function (format, args) {

                var msg = util.format.apply(null, arguments);
                if (msg) {
                    console.log(name + ' [' + fixWidth(item.name.toUpperCase(), 5) + '] ' + msg);
                }
                else {
                    console.log();
                }
            };
    });

    return log;
};
