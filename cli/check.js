/**
 * @file 代码风格检查入口
 * @author chris<wfsr@foxmail.com>
 */

var fs        = require('vinyl-fs');
var path      = require('path');

var util      = require('../lib/util');
var jschecker = require('../lib/js/checker');
var csschecker = require('../lib/css/checker');
var reporter  = require('../lib/reporter');



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

    fs.src(patterns)
        .pipe(jschecker(options))
        .pipe(csschecker(options))
        // .pipe(htmlchecker(options))
        .pipe(reporter(log))
        .on('end', function (fail) {
            console.timeEnd('fecs');
            process.exit(fail ? 1 : 0);
        });
};
