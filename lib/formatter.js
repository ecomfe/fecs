/**
 * @file js formatter
 * @author chris<wfsr@foxmail.com>
 */

var util = require('util');
var events = require('events');

var fecsUtil = require('./util');

/**
 * Formatter 基类
 *
 * @constructor
 * @extends module:events.EventEmitter
 * @param {Object} options 配置项
 * @param {string} options.type 文件类型，可选值有 js | css | less | html
 * @param {string} options.name Formatter 的名称，用于错误信息的标识
 * @param {(string|RegExp)} options.suffix 逗号分隔的文件扩展名或能匹配文件的正则
 * @param {(string|RegExp)} ignore 忽略的文件名列表或匹配的正则
 */
var Formatter = function (options) {
    this.options = fecsUtil.mix({
        type: '',
        name: '',
        suffix: '',
        ignore: ''
    }, options);

    events.EventEmitter.call(this);
};

util.inherits(Formatter, events.EventEmitter);


/**
 * 检查当前文件是否可被格式化
 *
 * @param {module:vinyl} file vinly 文件对象
 * @return {boolean} 文件符合 suffix 指定的格式，不被 ignore 忽略并且不为空时返回 true，否则为 false
 */
Formatter.prototype.isValid = function (file) {
    var options = this.options;
    var path = file.path;

    if (!this._suffixReg) {
        this._suffixReg = fecsUtil.buildRegExp(options.suffix);
    }

    var result = this._suffixReg.test(path);

    if (options.ignore) {
        this._ignoreReg = this._ignoreReg || fecsUtil.buildRegExp(options.ignore);
        result = result && !this._ignoreReg.test(path);
    }

    return result && !file.isNull();
};

/**
 * 注册 Formatter 额外的规则
 *
 */
Formatter.prototype.register = function () {};



/**
 * 执行对文件内容的格式化
 *
 * @abstract
 * @param {string} contents 文件内容
 * @param {string} path 文件路径
 * @param {Object} cliOptions 命令行中传过来的配置项
 * @param {Function=} callback 出现此参数时，在检查完成需要调用 callback
 * @return {(void|string|Promise.<Object, Object>)} 返回格式化后的内容或 Promise 对象
 */
Formatter.prototype.format = function (contents, path, cliOptions) {
    throw new Error('format method not implement yet.');
};


/**
 * 对文件流执行格式化
 *
 * @param {Object} cliOptions 命令行传来的配置项
 * @return {module:through2} through2 的转换流
 */
Formatter.prototype.exec = function (cliOptions) {
    this.register();

    var formatter = this;

    return fecsUtil.mapStream(
        function (file, cb) {
            if (!formatter.isValid(file) || file.stat.size > cliOptions.maxsize) {
                cb(null, file);
                return;
            }

            var contents = file.contents.toString();
            var done = function (contents) {
                file.contents = Buffer.from(contents);
                cb(null, file);
            };

            // callback style
            if (formatter.format.length > 3) {
                return formatter.format(contents, file.path, cliOptions, done);
            }

            var promise = formatter.format(contents, file.path, cliOptions);

            // sync style
            if (typeof promise === 'string') {
                return done(promise);
            }

            // async style with promise
            promise.then(done, done);
        }
    );
};

module.exports = Formatter;
