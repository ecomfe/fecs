/**
 * @file spec helper
 * @author chris<wfsr@foxmail.com>
 */

var util = require('../lib/util');

/**
 * 快速构建的流
 *
 * @param {Function} transform  转换方法
 * @param {?Function=} flush 结束方法
 * @return {module:through2} through2 的转换流
 */
exports.pass = function (transform, flush) {
    return util.mapStream(
        function (file, cb) {
            transform(file);
            cb(null, file);
        },
        flush
    );
};
