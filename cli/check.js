/**
 * @file 代码风格检查入口
 * @author chris<wfsr@foxmail.com>
 */

// 三方模块vinyl-fs
var fs          = require('vinyl-fs');
var Readable    = require('stream').Readable;
// 自定义lib下模块
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
        // 命令选项：type、命令类型：string、默认值：“js,css,less,html"
        // 说明：指定要处理的文件类型，类型之间以“,”分隔
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
     * 处理从stdin输入的代码
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
        // 命令选项：stream、命令类型：boolean、默认值：false、说明：是否使用process.stdin作为输入
        var stream = options.stream;
        // 通过!!转换成boolean类型
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
    // require('../') 省略文件名默认为index.js
    var name = util.format('%s@%s', require('../').leadName, pkg.version);
    // console.time(label)输出时间，表示计时开始。
    console.time(name);
    // 接受传来的color参数，是否使用颜色高亮，返回log对象，包含封装的不同的log方法
    var log = require('../lib/log')(options.color);
    // 引入reporter/index.js获取配置指定的 reporter，否则使用 defaultReporter
    var reporter = require('../lib/reporter').get(log, options);

    done = done || function (success, json) {
        // 结束计时
        console.timeEnd(name);
        // 命令选项：format、类型：string、说明：指定check命令的结果输出格式，
        // 支持checkstyle、json、xml与html，打开silient时也不影响输出
        // 命令选项：silent、类型：boolean、默认值：false、说明：是否隐藏所有通过console.log输出的信息
        if (options.format) {
            var formatter = require('../lib/formatter/');

            if (formatter[options.format]) {
                // 格式化输出结果
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
