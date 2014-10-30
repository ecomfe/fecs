/**
 * @file 代码风格检查入口
 * @author chris<wfsr@foxmail.com>
 */

var fs         = require('vinyl-fs');

var util       = require('../lib/util');
var jschecker  = require('../lib/js/checker');
var csschecker = require('../lib/css/checker');



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
    var reporter = require('../lib/reporter').get(log, options);

    fs.src(patterns, {cwdbase: true})
        .pipe(jschecker(options))
        .pipe(csschecker(options))
        // .pipe(htmlchecker(options))
        .pipe(reporter)
        .once('end', function (success) {
            console.timeEnd('fecs');
            process.exit(success ? 0 : 1);
        });
};
