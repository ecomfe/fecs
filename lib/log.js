/**
 * @file 日志输出
 * @author chris<wfsr@foxmail.com>
 */

// chalk定制控制台日志的样式https://github.com/chalk/chalk
var chalk = require('chalk');
// node核心模块常用函数模块（util），不清楚可以看node模块加载机制
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
    // 字符固定宽度
    var fixWidth = require('./util').fixWidth;
    // fecs
    var name = require('../').leadName;
    // forEach()方法从头至尾遍历数组，为每个元素调用指定的函数
    fns.forEach(function (item) {

        /**
         * 不同类型的 log 方法
         *
         * @param {string} format 要输出的内容.
         * @param {...*} args 变长参数.
         */
        log[item.name] = color
            ? function (format, args) {
                // apply()传入参数util.format
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
