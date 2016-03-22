/**
 * @file 代码格式化入口
 * @author chris<wfsr@foxmail.com>
 */

var fs            = require('vinyl-fs');

var util          = require('../lib/util');
var ignored       = require('../lib/ignored');
var jsformatter   = require('../lib/js/formatter');
var cssformatter  = require('../lib/css/formatter');
var htmlformatter = require('../lib/html/formatter');

/**
 * 不同的输入流处理
 *
 * @namespace
 */
var streams = {

    /**
     * 处理文件系统中的代码
     *
     * @param {Object} options minimist 处理后的 cli 参数
     * @return {Transform} 转换流
     */
    files: function (options) {
        var patterns = util.buildPattern(options._, options.type);
        var specials = patterns.specials;
        delete patterns.specials;

        var output = options.output;

        if (options.replace || /^\.\/?$/.test(options.output)) {
            output = './';
        }
        // ignore output path auto
        else {
            patterns.push(('!./' + output + '/**').replace(/\/\.\//, '\/'));
        }

        return this.format(
            fs
                .src(patterns, {cwdbase: true, allowEmpty: true})
                .pipe(ignored(options, specials)),
            options
        ).pipe(fs.dest(output));
    },

    /**
     * 处理从 stdin 输入的代码
     *
     * @param {Object} options minimist 处理后的 cli 参数
     * @return {Transform} 转换流
     */
    stdin: function (options) {
        var File = require('vinyl');

        var type = (options.type || 'js').split(',')[0];
        var handlers = {
            js: function () {
                return jsformatter.exec(options);
            },
            css: function () {
                return cssformatter.exec(options);
            },
            less: function () {
                return cssformatter.exec(options);
            },
            html: function () {
                return htmlformatter.exec(options);
            }
        };

        var handler = handlers[type];

        if (!handler) {
            return process.stdin;
        }

        return process.stdin
            .pipe(
                util.mapStream(function (chunk, cb) {
                    cb(null, new File({contents: chunk, path: 'current-file.' + type, stat: {size: chunk.length}}));
                })
            )
            .pipe(handler())
            .pipe(
                util.mapStream(function (file, cb) {
                    process.stdout.write(file.contents.toString() + '\n');
                    cb(null, file);
                })
            );
    },

    /**
     * 依次格式化流
     *
     * @param {Stream} stream 文件流
     * @param {Object} options minimist 处理后的 cli 参数
     * @return {Transform} 转换流
     */
    format: function (stream, options) {
        return stream
            .pipe(jsformatter.exec(options))
            .pipe(cssformatter.exec(options))
            .pipe(htmlformatter.exec(options));
    },


    /**
     * 根据配置的 options.stream 获取格式化后的流
     *
     * @param {Object} options minimist 处理后的 cli 参数
     * @return {Transform} 转换流
     */
    get: function (options) {
        var stream = options.stream;
        options.stream = !!stream;

        if (typeof stream === 'boolean') {
            return this[stream ? 'stdin' : 'files'](options);
        }

        return this.format(stream, options);
    }
};

/**
 * format 处理入口
 *
 * @param {Object} options minimist 处理后的 cli 参数
 * @param {Function=} done 处理完成后的回调
 * @return {Transform} 转换流
*/
exports.run = function (options, done) {
    var pkg = require('../package');
    var name = util.format('%s@%s', require('../').leadName, pkg.version);
    console.time(name);

    return streams.get(options)
        .once('end', function () {
            console.timeEnd(name);
            done && done();
        });
};
