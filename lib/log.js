/**
 * @file 日志输出
 * @author chris<wfsr@foxmail.com>
 */

var chalk = require('chalk');
var util = require('util');


var fns = [
    { name: 'trace', color: chalk.grey, level: 0 },
    { name: 'debug', color: chalk.grey, level: 1 },
    { name: 'info', color: chalk.green, level: 2 },
    { name: 'warn', color: chalk.yellow, level: 3 },
    { name: 'error', color: chalk.red, level: 4 },
    { name: 'fatal', color: chalk.red, level: 5 }
];



module.exports = function (color) {
    var log = {};

    fns.forEach(function (item) {

        /**
         * @param {string} format 要输出的内容.
         * @param {...*} args 变长参数.
         */
        log[item.name] = color
            ? function (format, args) {

                var msg = util.format.apply(null, arguments);
                if (msg) {
                    console.log('fecs ' + item.color(item.name.toUpperCase()) + ' ' + msg);
                }
                else {
                    console.log();
                }
            }
            : function (format, args) {

                var msg = util.format.apply(null, arguments);
                if (msg) {
                    console.log('fecs [' + item.name.toUpperCase() + '] ' + msg);
                }
                else {
                    console.log();
                }
            };
    });

    return log;
};
