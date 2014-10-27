/**
 * @file baidu reporter
 * @author chris<wfsr@foxmail.com>
 */

var util  = require('../../util');

var maps = {};

// 读取当前目录下的 json 文件，以文件名为 key
// json 配置文件中可以使用 javascript 注释
util.readConfigs(__dirname, maps);

var baidu = {

    eslint: function (error, level) {
        var map = maps.eslintMap;
        var rules = error.rules.split(',');

        var messages = [];
        rules.forEach(function (rule) {
            var code = map[rule];

            rule = maps.javascript[code];

            var desc = error.message;
            if (rule) {
                level.warn = rule.level;
                desc = rule.desc;
            }
            else {
                code = "000";
            }

            messages.push('rule ' + code + ': ' + desc);
        });

        return messages.join('|');
    },

    csshint: function (error, level) {
        var map = maps.csshintMap;
        var rules = error.rules.split(',');

        var messages = [];
        rules.forEach(function (rule) {
            var code = map[rule];

            rule = maps.javascript[code];

            var desc = error.message;
            if (rule) {
                level.warn = rule.level;
                desc = rule.desc;
            }
            else {
                code = "000";
            }

            messages.push('rule ' + code + ': ' + desc);
        });

        return messages.join('|');
    }
};



exports.transform = function (file) {
    var success = true;
    var log = this.log;
    var errors = file.errors;

    console.log();

    log.info('%s (%s message%s)', file.relative, errors.length, errors.length > 1 ? 's': '');

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

        msg += error.rules && coder ? coder(error, level) : error.message;

        // [强制] 规则对应为 error，[建议] 对应为 warn
        log[level.warn ? 'warn' : 'error'](msg);

        // 仅当所有错误违反的是 [建议] 规则时算通过
        success = success && level.warn;
    });
    console.log();

    return success;
};
