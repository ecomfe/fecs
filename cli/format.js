/**
 * @file 代码格式化入口
 * @author chris<wfsr@foxmail.com>
 */

var fs           = require('vinyl-fs');

var util         = require('../lib/util');
var jsformatter  = require('../lib/js/formatter');
var cssformatter = require('../lib/css/formatter');


/**
 * check 处理入口
 *
 * @param {Object} options minimist 处理后的 cli 参数
 */
exports.run = function (options) {
    console.time('fecs');

    var types = options.t || options.type || 'js,css,html';

    var extensions = types;
    types = types.split(/\s*,\s*/);
    if (types.length > 1) {
        extensions = '{' + types.join(',') + '}';
    }

    var dirs = options._;
    if (!dirs.length) {
        dirs = ['./'];
    }

    var patterns = util.buildPattern(dirs, extensions);

    var output = options.output;

    fs.src(patterns, {cwdbase: true})
        .pipe(jsformatter(options))
        .pipe(cssformatter(options))
        .pipe(fs.dest(output))
        .on('end', function () {
            console.timeEnd('fecs');
        });
};
