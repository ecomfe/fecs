/**
 * @file 校验错误信息输出
 * @author chris<wfsr@foxmail.com>
 */

var fs      = require('fs');
var path    = require('path');
var through = require('through2');


/**
 * 默认 reporter
 *
 * @param {Object} reporter 实现与 defaultReporter 类型的 transform 与 flush 方法的对象
 * @param {Object} log 实现相关 log 方法的对象
 * @param {Object} options cli 参数
 * @return {Transform} 转换流
 */
function buildReporter(reporter, log, options) {
    var success = true;
    var json = [];

    reporter.log = log;

    return through(
        {
            objectMode: true
        },

        function (file, enc, cb) {
            if (file.errors && file.errors.length) {
                var result = reporter.transform(file, json, options);
                success = success && result;
            }
            cb();
        },

        function (cb) {
            if (typeof reporter.flush === 'function') {
                reporter.flush(success);
            }

            this.emit('end', success, json);
            cb();
        }
    );
}

var defaultReporter = {

    /**
     * 校验错误信息输出报告
     *
     * @param {vinyl.File} file 校验的 vinyl 文件对象
     * @param {Array.<Object>} json 收集所有错误信息的数组
     * @param {Object} options cli 参数
     */
    transform: function (file, json, options) {
        var log = this.log;
        var errors = file.errors;
        var item = {path: file.path};

        console.log();

        log.info('%s (%s message%s)', file.relative, errors.length, errors.length > 1 ? 's' : '');

        // 对提示信息作排序
        if (options.sort) {
            errors = errors.sort(function (a, b) {
                return a.line === b.line ? a.column - b.column : a.line - b.line;
            });
        }

        item.errors = errors.map(function (error) {
            var info = '→ ';

            // 全局性的错误可能没有位置信息
            if (typeof error.line === 'number') {
                info += ('line ' + error.line);
                if (typeof error.column === 'number') {
                    info += (', col ' + error.column);
                }
                info += ': ';
            }

            var message = error.message.replace(/baidu\d{3}$/, '');
            info += message;

            var rule = error.rule || 'syntax';
            if (options.rule) {
                info += '\t(' + rule + ')';
            }

            log.warn(info);

            return {
                line: error.line,
                column: error.column,
                message: message,
                rule: rule
            };
        });
        console.log();

        json.push(item);
    },

    flush: function (success) {
        if (success) {
            this.log.info('Congratulations! Everything is OK!');
        }
    }
};

/**
 * 获取配置指定的 reporter，否则使用 defaultReporter
 *
 * @param {Object} log 实现相关 log 方法的对象
 * @param {Object} options cli 参数
 * @return {function():Transform} 能返回转换流的函数
 */
exports.get = function (log, options) {
    var reporter = options.reporter;

    if (!reporter) {
        return buildReporter(defaultReporter, log, options);
    }


    // user reporter or native reporter
    var dir = ~reporter.indexOf('/') ? process.cwd() : __dirname;
    var modulePath = path.join(dir, reporter);

    try {
        return buildReporter(require(modulePath), log, options);
    }
    catch (error) {
        log.error(error);
        return buildReporter(defaultReporter, log, options);
    }
};
