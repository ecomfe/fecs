/**
 * @file baidu reporter
 * @author chris<wfsr@foxmail.com>
 */

var util  = require('../../util');

/**
 * 校验规则与对应语言规范的映射
 *
 * @namespace
 */
var maps = {};

// 读取当前目录下的 json 文件，以文件名为 key
// json 配置文件中可以使用 javascript 注释
util.readConfigs(__dirname, maps);


/**
 * 用于匹配错误信息最后的百度规范编号
 *
 * @const
 * @type {RegExp}
 */
var BAIDU_CODE_REG = /baidu(\d{3})$/;

/**
 * baidu 自定义 reporter 针对各校验器 error 对象的处理
 *
 * @namespace
 */
var baidu = {

    'fecs-valid-jsdoc': function (error) {
        var match = error.message.match(BAIDU_CODE_REG);
        return match ? match[1] : '000';
    },

    /**
     * 针对  eslint 校验错误的处理
     *
     * @param {!Object} error eslint 的错误对象
     * @param {!Object} level 错误的等级数据
     * @return {string} 对应的规则编码入描述信息
     */
    'eslint': function (error, level) {
        var code;

        if (baidu[error.rule]) {
            code = baidu[error.rule](error);
        }
        else {
            code = maps.eslintMap[error.rule] || error.code;
        }

        var rule = maps.javascript[code];
        var desc = error.message.replace(BAIDU_CODE_REG, '');
        if (rule) {
            level.warn = rule.level;
            desc = rule.desc;
        }
        else {
            code = '000';
        }

        return 'rule ' + code + ': ' + desc;
    },


    /**
     * 针对  csshint 校验错误的处理
     *
     * @param {!Object} error csshint 的错误对象
     * @param {!Object} level 错误的等级数据
     * @return {string} 对应的规则编码入描述信息
     */
    'csshint': function (error, level) {
        var code = maps.csshintMap[error.rule] || error.code;
        var rule = maps.css[code];

        var desc = error.message;
        if (rule) {
            level.warn = rule.level;
            desc = rule.desc;
        }
        else {
            code = '000';
        }

        return 'rule ' + code + ': ' + desc;

    }
};


/**
 * 校验错误信息输出报告
 *
 * @param {vinyl.File} file 校验的 vinyl 文件对象
 * @return {boolean} 标记是否通过检查（仅当没有 ERROR 级别的）
 */
exports.transform = function (file) {
    var success = true;
    var log = this.log;
    var errors = file.errors;

    console.log();

    log.info('%s (%s message%s)', file.relative, errors.length, errors.length > 1 ? 's' : '');

    errors.forEach(function (error) {
        var msg = '→ ';

        // 全局性的错误可能没有位置信息
        if (typeof error.line === 'number') {
            msg += ('line ' + util.fixWidth(error.line, 3));
            if (typeof error.column === 'number') {
                msg += (', col ' + util.fixWidth(error.column, 3));
            }
            msg += ', ';
        }

        var coder = baidu[error.checker];
        var level = {warn: true};
        var message = error.message.replace(BAIDU_CODE_REG, '');

        msg += coder ? coder(error, level) : message;

        // [强制] 规则对应为 error，[建议] 对应为 warn
        log[level.warn ? 'warn' : 'error'](msg, ~msg.indexOf('%s') ? message : '');

        // 仅当所有错误违反的是 [建议] 规则时算通过
        success = success && level.warn;
    });
    console.log();

    return success;
};
