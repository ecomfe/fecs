/**
 * @file 校验错误信息输出
 * @author chris<wfsr@foxmail.com>
 */

// node处理和转换文件路径的工具模块（path）
var path    = require('path');
// 引入自定义的util
var util = require('../util');


/**
 * 错误等级
 *
 * @enum {number}
 */
var Severity = {
    // 命令参数：level、类型：number、说明：过滤，只剩下指定级别的错误，选值0、1或2
    WARN: 1,
    ERROR: 2
};


var defaultReporter = {

    /**
     * 校验错误信息输出报告
     *
     * @param {vinyl.File} file 校验的 vinyl 文件对象
     * @param {Array.<Object>} json 收集所有错误信息的数组
     * @param {Function} filter 过滤函数组
     * @param {Object} options cli 参数
     * @return {boolean} 标记是否通过检查（仅当没有 ERROR 级别的）
     */
    transform: function (file, json, filter, options) {
        // this.log创建自buildReporter中的reporter.log = log
        // log实现相关log方法的对象
        var log = this.log;
        var errors = file.errors;
        var item = {path: file.path, relative: file.relative};

        // 对提示信息作排序
        if (options.sort) {
            errors = errors.sort(function (a, b) {
                return a.line - b.line || a.column - b.column;
            });
        }

        errors = item.errors = file.errors = filter(errors.map(function (error) {
            var info = '→ ';

            // 全局性的错误可能没有位置信息
            if (typeof error.line === 'number') {
                info += ('line ' + error.line);
                if (typeof error.column === 'number') {
                    info += (', col ' + error.column);
                }
                info += ': ';
            }

            var message = error.message.replace(/baidu\d{3}$/, '').replace(/[\r\n]+/g, '');
            info += message;

            var rule = error.rule || 'syntax';
            if (options.rule) {
                info += '\t(' + util.colorize(rule, options.color && 'gray') + ')';
            }

            return {
                line: error.line,
                column: error.column,
                severity: error.origin.severity || 1,
                message: message,
                rule: rule,
                info: info
            };
        }));

        var success = true;
        if (!errors.length) {
            return success;
        }

        console.log();

        log.info('%s (%s message%s)', file.relative, errors.length, errors.length > 1 ? 's' : '');


        errors.forEach(function (error) {
            // 仅当所有错误违反的是 [建议] 规则时算通过
            success = success && error.severity === Severity.WARN;

            // [强制] 规则对应为 error，[建议] 对应为 warn
            log[error.severity === Severity.ERROR ? 'error' : 'warn'](error.info);
        });

        console.log();

        if (options.code) {
            item.code = file.contents.toString();
        }

        json.push(item);

        return success;
    },

    flush: function (success, json, count, errors) {
        this.log.info(
            'Linter found %s error%s in %s of %s file%s.',
            String(errors).replace(/\d(?=(\d{3})+$)/g, '$&,'),
            errors > 1 ? 's' : '',
            json.length,
            count,
            count > 1 ? 's' : ''
        );

        if (!errors) {
            this.log.info('Congratulations! Everything is OK!');
        }
    }
};

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
    // 错误过滤模块，校验错误信息输出前过滤
    var filterBuilder = require('./filter');
    // 获取错误过滤函数
    var globalFilter = filterBuilder.get(options);

    reporter.log = log;
    var fileCount = 0;
    var errorCount = 0;

    // mapStream() 操作流工具，事件流管道
    return util.mapStream(
        function (file, cb) {
            fileCount++;

            var errors = file.errors;

            if (errors && errors.length) {
                var filter = globalFilter;
                if (file.filter) {
                    filter = filterBuilder.get(file.filter);
                }

                var transform = reporter.transform || defaultReporter.transform;
                success = transform.call(reporter, file, json, filter, options) && success;

                errors = file.errors;
                errorCount += errors.length;
            }

            cb(null, file);
        },
        function () {
            if (typeof reporter.flush === 'function') {
                reporter.flush(success, json, fileCount, errorCount);
            }

            this.emit('done', success, json, fileCount, errorCount);
        }
    );
}

/**
 * 获取配置指定的 reporter，否则使用 defaultReporter
 *
 * @param {Object} log 实现相关 log 方法的对象
 * @param {Object} options cli 参数
 * @return {function():Transform} 能返回转换流的函数
 */
exports.get = function (log, options) {
    // 命令参数：reporter、类型：string、说明：指定reporter，内置可选值只有baidu，
    // 当包含“/”字符时从当前工作目录查找自定义的reporter实现，其它值按默认处理
    var reporter = options.reporter;

    if (!reporter) {
        return buildReporter(defaultReporter, log, options);
    }

    if (typeof reporter === 'function') {
        return buildReporter({transform: reporter}, log, options);
    }

    if (Object.prototype.toString.call(reporter) === '[object Object]' && (reporter.transform || reporter.flush)) {
        return buildReporter(reporter, log, options);
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
