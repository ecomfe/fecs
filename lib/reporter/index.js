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
 * @return {Transform} 转换流
 */
function buildReporter(reporter, log) {
    var success = true;

    reporter.log = log;

    return through(
        {
            objectMode: true
        },

        function (file, enc, cb) {
            if (file.errors && file.errors.length) {
                var result = reporter.transform(file);
                success = success && result;
            }
            cb();
        },

        function (cb) {
            if (typeof reporter.flush === 'function') {
                reporter.flush(success);
            }

            this.emit('end', success);
            cb();
        }
    );
}

var defaultReporter = {

    /**
     * 校验错误信息输出报告
     *
     * @param {vinyl.File} file 校验的 vinyl 文件对象
     * @param {Object} log 自定义信息的输出
     */
    transform: function (file) {
        var log = this.log;
        var errors = file.errors;

        console.log();

        log.info('%s (%s message%s)', file.relative, errors.length, errors.length > 1 ? 's' : '');

        // 对提示信息作排序
        if (~file.relative.indexOf('.js')) {
            errors = errors.sort(function (a, b) {
                return a.line === b.line ? a.column - b.column : a.line - b.line;
            });
        }

        errors.forEach(function (error) {
            var msg = '→ ';

            // 全局性的错误可能没有位置信息
            if (typeof error.line === 'number') {
                msg += ('line ' + error.line);
                if (typeof error.column === 'number') {
                    msg += (', col ' + error.column);
                }
                msg += ': ';
            }

            msg += error.message;
            log.warn(msg);
        });
        console.log();
    },

    flush: function (sucess) {
        if (sucess) {
            this.log.info('Congratulations! Everything is OK!');
        }
    }
};

/**
 * 获取配置指定的 reporter，否则使用 defaultReporter
 *
 * @param {Object} log 实现相关 log 方法的对象
 * @param {Object} options cli 参数
 * @return {function():Transform} 返回能返回转换流的函数
 */
exports.get = function (log, options) {
    var reporter = options.reporter;

    if (!reporter) {
        return buildReporter(defaultReporter, log);
    }


    // user reporter or native reporter
    var dir = ~reporter.indexOf('/') ? process.cwd() : __dirname;
    var modulePath = path.join(dir, reporter);

    try {
        return buildReporter(require(modulePath), log);
    }
    catch (error) {
        log.error(error);
        return buildReporter(defaultReporter, log);
    }
};
