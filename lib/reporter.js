/**
 * @file 校验错误信息输出
 * @author chris<wfsr@foxmail.com>
 */

var through2 = require('through2');


/**
 * 校验错误信息输出报告
 *
 * @param {module:vinyl.File} file 校验的 vinyl 文件对象
 * @param {Object} log 自定义信息的输出
 */
function report(file, log) {
    console.log();
    log.info(file.relative);
    file.errors.forEach(function (error) {
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
};


module.exports = function (log) {
    var fail = false;

    return through2.obj(

        function (file, enc, cb) {
            if (file.errors && file.errors.length) {
                report(file, log);
                fail = true;
            }
            cb();
        },

        function (cb) {
            if (!fail) {
                log.info('Congratulations! Everything is OK!')
            }
            this.emit('end', fail);
            cb();
        }
    );
};
