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
            // filter()
            return errors.filter(function (error) {
                // every()和some()方法是数组的逻辑判定：它们对数组元素应用指定的函数进行判定，返回true或false。
                // every()方法就像数学中的“针对所有”的量词：当且仅当针对数组中的
                // 所有元素调用判定函数都返回true，它才返回true
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
        // 用replace()过滤一下非表达式规则字符，split()分割成条件数组
        var tokens = (expression + '').replace(/[^\(\)\[\],\d<>=]/g, '').split(',');

        var open = false;
        // http://ourjs.com/detail/54a9f2ba5695544119000005
        var exp = tokens.reduce(function (exp, token) {
            // “\d” 任何ASCII数字，等价于[0-9]
            var op = token.replace(/\d+/, '')[0];
            // “\D”代表除了ASCII数字之外的任何字符，等价于[^0-9]
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
        // 利用new Function()动态执行代码
        return new Function('error', 'var l=error.line;if(typeof l===void 0)return true;return ' + exp);
    },

    /**
     * 检查规则名过滤函数生成
     *
     * @param {string} expression 以逗号分隔的规则名组合
     * @return {Function} 能过滤指定规则名以外错误的函数
     */
    rules: function (expression) {
        // 命令行参数：rules、类型：string、说明：过滤，只剩下指定的rule名，多个rule以“,”分隔
        var rules = String(expression).toLowerCase().split(/,\s*/);

        return function (error) {
            var ruleName = (error.rule || '').toLowerCase();
            // some()方法就像数学中的“存在”的量词：当数组中至少有一个元素调用判定函数返回true，
            // 它就返回true：并且当且仅当数值中的所有元素调用判定函数都返回false，它才返回false：
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
        // 命令喊参数：level、类型：number、说明：过滤，只剩下指定级别的错误，选值0、1或2
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
        // split()拆分成子串组成的数组
        // map()方法将调用的数组的每个元素做参数传递给指定的函数，并返回一个数组，它包含该函数的返回值
        // filter()方法返回的数组元素是调用的数组的一个子集
        var fns = 'lines, rules, level'.split(/,\s*/).map(function (key) {
            // 命名参数名称：lines、类型：string、说明：过滤，只剩下指定行的错误，
            // 以“[”、“]”、“(” 、“)” 表示数学上的闭区间和开区间，也可以直接用“>”、“<”和“=”的组合，
            // 允许多个条件组合，以“&&”或“||”连接条件，以“,” 表示多个并行的条件
            // 命令行参数：rules、类型：string、说明：过滤，只剩下指定的rule名，多个rule以“,”分隔
            // 命令喊参数：level、类型：number、说明：过滤，只剩下指定级别的错误，选值0、1或2
            return options[key] && filter[key](options[key]);
        }).filter(Boolean);

        if (fns.length) {
            // 组合过滤条件
            return filter.compose(fns);
        }
        // 什么也不干
        return filter.noop;
    }
};

module.exports = filter;
