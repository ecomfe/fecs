/**
 * @file 校验错误信息输出前过滤
 * @author chris<wfsr@foxmail.com>
 */

/**
 * 错误过滤模块
 *
 * @namespace
 */
var filter = {

    /**
     * 什么也不干
     *
     * @param {Object[]} errors 各 checker 检查出的错误信息
     * @return {Object[]}
     */
    noop: function (errors) {
        return errors;
    },

    /**
     * 组合过滤条件
     *
     * @param {Array.<Function>} fns 过滤函数数组
     * @return {Function} 组合得到的过滤操作函数
     */
    compose: function (fns) {
        return function (errors) {
            return errors.filter(function (error) {
                return fns.every(function (fn) {
                    return fn(error);
                });
            });
        };
    },

    /**
     * 行数过滤函数生成
     *
     * @param {string} expression 过滤行数的表达式
     * @return {Function} 能根据表达式过滤代码行错误的函数
     */
    lines: function (expression) {
        var tokens = (expression + '').replace(/[^\(\)\[\],\d<>=]/g, '').split(',');

        var open = false;
        var exp = tokens.reduce(function (exp, token) {
            var op = token.replace(/\d+/, '')[0];
            var line = token.replace(/\D+/, '');

            if (op) {
                switch (op) {
                    case '(':
                        op = '>';
                        open = true;
                        break;
                    case '[':
                        op = '>=';
                        open = true;
                        break;
                    case '<':
                    case '>':
                        open = false;
                        break;
                    case ')':
                        op = '<';
                        open = false;
                        break;
                    case ']':
                        op = '<=';
                        open = false;
                        break;
                }

                exp += 'l' + op + line + (open ? '&&' : '||');
            }
            else {
                exp += 'l===' + line + '||';
            }

            return exp;

        }, '');

        exp = exp.replace(/[\&\|]+$/, '');

        return new Function('error', 'var l=error.line;if(typeof l===void 0)return true;return ' + exp);
    },

    /**
     * 检查规则名过滤函数生成
     *
     * @param {string} expression 以逗号分隔的规则名组合
     * @return {Function} 能过滤指定规则名以外错误的函数
     */
    rules: function (expression) {
        var rules = String(expression).toLowerCase().split(/,\s*/);

        return function (error) {
            var ruleName = (error.rule || '').toLowerCase();

            return rules.some(function (rule) {
                return !rule || rule === ruleName;
            });
        };
    },

    /**
     * 生成根据错误的 serverity 过滤的函数
     *
     * @param {(string | number)} expression 指定的错误等级
     * @return {Function} 能过滤指定错误等级之外错误的函数
     */
    level: function (expression) {
        var level = (expression | 0) % 2;

        return function (error) {
            var severity = (error.severity | 0) % 2;
            return severity === level;
        };
    },

    /**
     * 获取过滤函数
     *
     * @param {Object} options cli 参数
     * @return {Function} 过滤函数
     */
    get: function (options) {

        var fns = 'lines, rules, level'.split(/,\s*/).map(function (key) {
            return options[key] && filter[key](options[key]);
        }).filter(Boolean);

        if (fns.length) {
            return filter.compose(fns);
        }

        return filter.noop;
    }
};

module.exports = filter;
