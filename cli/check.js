/**
 * @file 代码风格检查入口
 * @author chris<wfsr@foxmail.com>
 */

var fs          = require('vinyl-fs');
var Readable    = require('stream').Readable;

var util        = require('../lib/util');
var ignored     = require('../lib/ignored');
var jschecker   = require('../lib/js/checker');
var csschecker  = require('../lib/css/checker');
var lesschecker = require('../lib/less/checker');
var htmlchecker = require('../lib/html/checker');

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

        return this.check(
            fs
                .src(patterns, {cwdbase: true, allowEmpty: true, stripBOM: false})
                .pipe(ignored(options, specials)),
            options
        );
    },

    /**
     * 处理从 stdin 输入的代码
     *
     * @param {Object} options minimist 处理后的 cli 参数
     * @return {Transform} 转换流
     */
    stdin: function (options) {
        return this.scriptStream(process.stdin, options);
    },

    /**
     * 处理以 string 形式输入的代码
     *
     * @param {Stream} string 代码字符串
     * @param {Object} options minimist 处理后的 cli 参数
     * @return {Transform} 转换流
     */
    string: function (string, options) {
        const scriptStream = new Readable();
        scriptStream.push(string);
        scriptStream.push(null);

        return this.scriptStream(scriptStream, options);
    },

    /**
     * 处理以字符串流形式输入的代码
     *
     * @param {Stream} scriptStream 代码字符串流
     * @param {Object} options minimist 处理后的 cli 参数
     * @return {Transform} 转换流
     */
    scriptStream: function (scriptStream, options) {
        var File = require('vinyl');

        var type = (options.type || 'js').split(',')[0];
        var handlers = {
            js: function () {
                return jschecker.exec(options);
            },
            css: function () {
                return csschecker.exec(options);
            },
            less: function () {
                return lesschecker.exec(options);
            },
            html: function () {
                return htmlchecker.exec(options);
            }
        };

        var handler = handlers[type];

        if (!handler) {
            return scriptStream;
        }

        return scriptStream
            .pipe(
                util.mapStream(function (chunk, cb) {
                    cb(null, new File({contents: chunk, path: 'current-file.' + type, stat: {size: chunk.length}}));
                })
            )
            .pipe(handler());
    },

    /**
     * 依次检查流
     *
     * @param {Stream} stream 文件流
     * @param {Object} options minimist 处理后的 cli 参数
     * @return {Transform} 转换流
     */
    check: function (stream, options) {
        return stream
            .pipe(jschecker.exec(options))
            .pipe(csschecker.exec(options))
            .pipe(lesschecker.exec(options))
            .pipe(htmlchecker.exec(options));
    },


    /**
     * 根据配置的 options.stream 获取检查后的流
     *
     * @param {Object} options minimist 处理后的 cli 参数
     * @return {Transform} 转换流
     */
    get: function (options) {
        var stream = options.stream;
        options.stream = !!stream;

        if (options.string) {
            return this.string(options.string, options);
        }

        if (typeof stream === 'boolean') {
            return this[stream ? 'stdin' : 'files'](options);
        }

        return this.check(stream, options);
    }
};

/**
 * check 处理入口
 *
 * @param {Object} options minimist 处理后的 cli 参数
 * @param {Function=} done 处理完成后的回调
 * @return {Transform} 转换流
 */
exports.run = function (options, done) {
    var pkg = require('../package');
    var name = util.format('%s@%s', require('../').leadName, pkg.version);

    console.time(name);

    var log = require('../lib/log')(options.color);
    var reporter = require('../lib/reporter').get(log, options);

    done = done || function (success, json) {
        console.timeEnd(name);

        if (options.format) {
            var formatter = require('../lib/formatter/');

            if (formatter[options.format]) {
                formatter[options.format](json);
            }
        }

        process.exit(success ? 0 : 1);
    };

    return streams
        .get(options)
        .pipe(reporter)
        .once('done', done);
};
