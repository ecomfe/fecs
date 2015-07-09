/**
 * @file spec helper
 * @author chris<wfsr@foxmail.com>
 */

var through = require('through2');

/**
 * 快速构建的流
 *
 * @param {Function} transform  转换方法
 * @param {?Function=} flush 结束方法
 * @return {module:through2} through2 的转换流
 */
exports.pass = function (transform, flush) {
    return through(
        {objectMode: true},
        function (file, enc, cb) {
            transform(file);
            cb(null, file);
        },
        flush
    );
};
