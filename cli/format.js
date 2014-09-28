/**
 * @file 代码格式化入口
 * @author chris<wfsr@foxmail.com>
 */

var fs        = require('vinyl-fs');
var path      = require('path');

var util      = require('../lib/util');
var jsformater = require('../lib/js/formater');
var cssformater = require('../lib/css/formater');


/**
 * check 处理入口
 *
 * @param {Object} options minimist 处理后的 cli 参数
 */
exports.run = function (options) {
    console.time('fecs');

    var log = require('../lib/log')(options.color);
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

    fs.src(patterns)
        .pipe(jsformater(options))
        .pipe(cssformater(options))
        // .pipe(htmlformater(options))
        .pipe(fs.dest(output))
        .on('end', function () {
            console.timeEnd('fecs');
        });
};
