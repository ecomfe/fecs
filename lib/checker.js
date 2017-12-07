/**
 * @file jscs checker
 * @author chris<wfsr@foxmail.com>
 */
var util = require('util');

var fecsUtil = require('./util');

/**
 * Checker 基类
 *
 * @constructor
 * @param {Object} options 配置项
 * @param {string} options.type 文件类型，可选值有 js | css | less | html
 * @param {string} options.name Checker 的名称，用于错误信息的标识
 * @param {(string|RegExp)} options.suffix 逗号分隔的文件扩展名或能匹配文件的正则
 * @param {(string|RegExp)} ignore 忽略的文件名列表或匹配的正则
 */
var Checker = function (options) {
    this.options = fecsUtil.mix({
        type: '',
        name: '',
        suffix: '',
        ignore: ''
    }, options);
};

/**
 * 检查当前文件是否可被检查
 *
 * @param {module:vinyl} file vinly 文件对象
 * @return {boolean} 文件符合 suffix 指定的格式，不被 ignore 忽略并且不为空时返回 true，否则为 false
 */
Checker.prototype.isValid = function (file) {
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
 * 执行对文件内容的检查
 *
 * @abstract
 * @param {string} contents 文件内容
 * @param {string} path 文件路径
 * @param {Object} cliOptions 命令行中传过来的配置项
 * @param {Function=} callback 出现此参数时，在检查完成需要调用 callback
 * @return {(void|Object[]|Promise.<Object[], Object>)} 返回错误信息的数组或 Promise 对象
 */
Checker.prototype.check = function (contents, path, cliOptions) {
    throw new Error('check method not implement yet.');
};

/**
 * 对文件流执行检查
 *
 * @param {Object} cliOptions 命令行传来的配置项
 * @return {module:through2} through2 的转换流
 */
Checker.prototype.exec = function (cliOptions) {

    var checker = this;

    return fecsUtil.mapStream(
        function (file, cb) {
            if (!checker.isValid(file) || file.stat.size > cliOptions.maxsize) {
                cb(null, file);
                return;
            }

            var contents = file.contents.toString();

            var done = function (errors) {
                file.errors = errors;
                cb(null, file);
            };

            // callback style
            if (checker.check.length > 3) {
                return checker.check(contents, file.path, cliOptions, done);
            }

            var promise = checker.check(contents, file.path, cliOptions);

            // sync style
            if (util.isArray(promise)) {
                return done(promise);
            }

            // async style with promise
            promise.then(done, done);
        }
    );
};

module.exports = Checker;
