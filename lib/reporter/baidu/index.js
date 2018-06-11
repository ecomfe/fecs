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

if (maps.esNext) {
    util.extend(maps.javascript, maps.esNext);
}

/**
 * 用于匹配错误信息最后的百度规范编号
 *
 * @const
 * @type {RegExp}
 */
var BAIDU_CODE_REG = /baidu(\d{3})$/;

/**
 * 规则编号最大长度
 *
 * @const
 * @type {number}
 */
var RULE_CODE_MAX_WIDTH = 3;

/**
 * 错误等级
 *
 * @enum {number}
 */
var Severity = {
    WARN: 1,
    ERROR: 2
};

/**
 * baidu 自定义 reporter 针对各校验器 error 对象的处理
 *
 * @namespace
 */
var baidu = {

    /**
     * 对于 eslint rule 匹配多条规范时的区分处理函数集
     *
     * @type {Object}
     */
    eslintRules: {

        'fecs-indent': function (error) {
            var match = error.message.match(BAIDU_CODE_REG);
            return match ? match[1] : '003';
        },

        'fecs-valid-jsdoc': function (error) {
            var match = error.message.match(BAIDU_CODE_REG);
            return match ? match[1] : '999';
        },

        'fecs-valid-var-jsdoc': function (error) {
            var match = error.message.match(BAIDU_CODE_REG);
            return match ? match[1] : '999';
        },

        'fecs-valid-class-jsdoc': function (error) {
            var match = error.message.match(BAIDU_CODE_REG);
            return match ? match[1] : '999';
        },

        'fecs-valid-constructor': function (error) {
            var match = error.message.match(BAIDU_CODE_REG);
            return match ? match[1] : '999';
        },

        'fecs-esnext-ext': function (error) {
            var match = error.message.match(BAIDU_CODE_REG);
            return match ? match[1] : '999';
        },

        'fecs-camelcase': function (error) {
            var match = error.message.match(BAIDU_CODE_REG);
            return match ? match[1] : '999';
        },

        'fecs-properties-quote': function (error) {
            var match = error.message.match(BAIDU_CODE_REG);
            return match ? match[1] : '999';
        },

        'spaced-comment': function (error) {
            if (error.origin.nodeType === 'Block') {
                if (/^\/\*(eslint|jshint|jslint|istanbul|globals?)\b/.test(error.origin.source)) {
                    return '999';
                }
                return '039';
            }
            return '038';
        },

        'space-before-function-paren': function (error) {
            var message = error.message;
            return ~message.indexOf('Missing space') ? '007' : '009';
        },

        'no-undef': function (error) {
            var isReadOnly = error.message.match(/is read only\.$/);
            return isReadOnly ? '997' : '070';
        },

        'babel/new-cap': function (error) {
            var origin = error.origin;
            var chr = origin.source.charAt(origin.column - 1);
            if (chr === '"' || chr === '\'') {
                error.column += 1;
                chr = origin.source.charAt(origin.column);
            }

            if (/[A-Z]/.test(chr)) {
                return /[\.\[]/.test(origin.source.charAt(origin.column - 2)) ? '030' : '027';
            }

            return '029';
        },

        'fecs-no-extra-semi': function (error) {
            var origin = error.origin;

            return {
                MethodDefinition: '606',
                ClassDeclaration: '605',
                FunctionDeclaration: '023',
                ExportDefaultDeclaration: '607',
                ExportNamedDeclaration: '607',
                Decorator: '608'
            }[origin.nodeType] || '997';
        },

        'fecs-arrow-body-style': function (error) {
            return ~error.message.indexOf('Expected') ? '611' : '610';
        },

        'fecs-use-method-definition': function (error) {
            var origin = error.origin;

            return {
                FunctionExpression: '624',
                ArrowFunctionExpression: '626'
            }[origin.nodeType];
        },

        'no-extend-native': function (error) {
            return error.message.indexOf('Promise prototype') === 0 ? '643' : '096';
        },

        'fecs-use-for-of': function (error) {
            return ~error.message.indexOf('for-of') ? '635' : '625';
        },

        'fecs-prefer-spread-element': function (error) {
            var origin = error.origin;

            return {
                CallExpression: '633',
                SpreadElement: '634'
            }[origin.nodeType];
        },

        'fecs-prefer-async-await': function (error) {
            var origin = error.origin;

            return {
                CallExpression: '645',
                YieldExpression: '644'
            }[origin.nodeType];
        },

        'fecs-valid-map-set': function (error) {
            var origin = error.origin;

            return {
                AssignmentExpression: '636',
                ObjectExpression: '637',
                ForInStatement: '638',
                UnaryExpression: '639'
            }[origin.nodeType];
        },

        'fecs-valid-dom-style': function (error) {
            var origin = error.origin;

            return origin.nodeType === 'Literal' ? '138' : '137';
        },

        'fecs-no-require': function (error) {
            var origin = error.origin;

            return origin.nodeType === 'CallExpression' ? '655' : '998';
        }

    },

    /**
     * 针对  eslint 校验错误的处理
     *
     * @param {!Object} error eslint 的错误对象
     * @param {!Object} level 错误的等级数据
     * @return {string} 对应的规则编码入描述信息
     */
    eslint: function (error, level) {
        var code;

        if (baidu.eslintRules[error.rule]) {
            code = baidu.eslintRules[error.rule](error);

            // ignore error with empty code
            if (!code) {
                return '';
            }
        }
        else {
            code = maps.eslintMap[error.rule] || error.code;
        }

        var rule = maps.javascript[code];
        var desc = error.message.replace(BAIDU_CODE_REG, '');
        if (rule) {

            // 一些规范外的其他 eslint 规则， 配置的 warn 会被误判为 error， 这里做下判断
            if (code === '998' && error.origin && error.origin.severity === 1) {
                level.warn = 1;
            }
            else {
                level.warn = rule.level < 2 ? 1 : 0;
                desc = rule.desc;
            }
        }
        else {
            code = '999';
        }

        return '  JS' + code + ': ' + desc;
    },

    /**
     * 对于 csshint rule 匹配多条规范时的区分处理函数集
     *
     * @type {Object}
     */
    csshintRules: {

        'require-after-space': function (error) {
            return error.origin.errorChar === ':' ? '004' : '005';
        },

        'require-newline': function (error) {
            var map = {
                'selector': '008',
                'property': '011',
                'media-query-condition': '044'
            };

            return map[error.origin.errorChar];
        },

        'require-doublequotes': function (error) {
            return error.origin.errorChar === 'attr-selector' ? '010' : '024';
        },

        'require-number': function (error) {
            return error.origin.errorChar === 'font-weight' ? '039' : '040';
        },

        'shorthand': function (error) {
            return error.origin.errorChar === 'color' ? '030' : '015';
        }

    },

    lesslintRules: {},

    htmlcsRules: {},

    /**
     * 针对  csshint 校验错误的处理
     *
     * @param {!Object} error csshint 的错误对象
     * @param {!Object} level 错误的等级数据
     * @return {string} 对应的规则编码入描述信息
     */
    csshint: function (error, level) {
        var code;

        if (baidu.csshintRules[error.rule]) {
            code = baidu.csshintRules[error.rule](error);
        }
        else {
            code = maps.csshintMap[error.rule] || error.code;
        }

        var rule = maps.css[code];
        var desc = error.message.replace(BAIDU_CODE_REG, '');
        if (rule) {
            level.warn = rule.level < 2 ? 1 : 0;
            desc = rule.desc;
        }
        else {
            code = '999';
        }

        return ' CSS' + code + ': ' + desc;
    },

    /**
     * 针对  lesslint 校验错误的处理
     *
     * @param {!Object} error lesslint 的错误对象
     * @param {!Object} level 错误的等级数据
     * @return {string} 对应的规则编码入描述信息
     */
    lesslint: function (error, level) {
        var code;

        if (baidu.lesslintRules[error.rule]) {
            code = baidu.lesslintRules[error.rule](error);
        }
        else {
            code = maps.lesslintMap[error.rule] || error.code;
        }

        var rule = maps.css[code];
        var desc = error.message.replace(BAIDU_CODE_REG, '');
        if (rule) {
            level.warn = rule.level < 2 ? 1 : 0;
            desc = rule.desc;
        }
        else {
            code = '999';
        }

        return ' CSS' + code + ': ' + desc;
    },


    /**
     * 针对  htmlcs 校验错误的处理
     *
     * @param {!Object} error htmlcs 的错误对象
     * @param {!Object} level 错误的等级数据
     * @return {string} 对应的规则编码入描述信息
     */
    htmlcs: function (error, level) {
        var code;

        if (baidu.htmlcsRules[error.rule]) {
            code = baidu.htmlcsRules[error.rule](error);
        }
        else {
            code = maps.htmlcsMap[error.rule] || error.code;
            if (typeof code === 'object') {
                code = code[error.origin.code] || '999';
            }
        }

        var rule = maps.html[code];
        var desc = error.message.replace(BAIDU_CODE_REG, '');
        if (rule) {
            level.warn = rule.level < 2 ? 1 : 0;
            desc = rule.desc;
        }
        else {
            code = '999';
        }

        return 'HTML' + code + ': ' + desc;
    }
};


/**
 * 校验错误信息输出报告
 *
 * @param {vinyl.File} file 校验的 vinyl 文件对象
 * @param {Array.<Object>} json 收集所有错误信息的数组
 * @param {Function} filter 过滤函数组
 * @param {Object} options cli 参数
 * @return {boolean} 标记是否通过检查（仅当没有 ERROR 级别的）
 */
exports.transform = function (file, json, filter, options) {
    var log = this.log;
    var errors = file.errors;
    var item = {path: file.path, relative: file.relative};

    // 对提示信息作排序
    if (options.sort) {
        errors = errors.sort(function (a, b) {
            return a.line - b.line || a.column - b.column;
        });
    }

    errors = item.errors = file.errors = filter(errors.reduce(function (errors, error) {
        var info = '→ ';

        // 全局性的错误可能没有位置信息
        if (typeof error.line === 'number') {
            info += ('line ' + util.fixWidth(error.line, RULE_CODE_MAX_WIDTH));
            if (typeof error.column === 'number') {
                info += (', col ' + util.fixWidth(error.column, RULE_CODE_MAX_WIDTH));
            }
            info += ', ';
        }

        var coder = baidu[error.checker];
        var level = {warn: 1};
        var message = error.message.replace(BAIDU_CODE_REG, '').replace(/[\r\n]+/g, '');
        var desc;

        if (coder) {
            desc = coder(error, level);

            // ignore none desc error
            if (!desc) {
                return errors;
            }

            // 某些规范描述过于抽象需要加上原文错误补充说明
            if (~desc.indexOf('%s')) {
                desc = util.format(desc, message);
            }
            info += desc;
        }
        else {
            info += message;
        }

        var rule = error.rule;
        if (!rule) {
            rule = 'syntax';
            level.warn = 0;
        }

        if (options.rule) {
            info += '\t(' + util.colorize(rule, options.color && 'gray') + ')';
        }

        errors.push({
            line: error.line,
            column: error.column,
            severity: level.warn ? 1 : 2,
            message: desc || message,
            rule: rule,
            info: info
        });

        return errors;
    }, []));

    var success = true;
    if (!errors.length) {
        return success;
    }

    console.log();

    log.info('%s (%s message%s)', file.relative, errors.length, errors.length > 1 ? 's' : '');

    errors.forEach(function (error) {
        // 仅当所有错误违反的是 [建议] 规则时算通过
        success = success && error.severity === Severity.WARN;

        // [强制] 规则对应为 error，[建议] 对应为 warn
        log[error.severity === Severity.ERROR ? 'error' : 'warn'](error.info);
    });

    console.log();

    if (options.code) {
        item.code = file.contents.toString();
    }

    json.push(item);

    return success;
};
