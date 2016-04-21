/**
 * @file 检查 AMD 模块 id 的合法性
 * @author chris<wfsr.foxmail.com>
 */

// 模块 id 必须符合以下约束条件：
// 1. 类型为 string，并且是由 `/` 分割的一系列 terms 来组成。例如：`this/is/a/module`。
// 2. term 应该符合 [a-zA-Z0-9_-]+ 规则。
// 3. 不应该有 .js 后缀。
// 4. 跟文件的路径保持一致。

module.exports = function (context) {

    'use strict';

    var ID_REG = /^([a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+$/;

    function check(node) {
        var args = node.arguments;
        var argsCount = args.length;

        // 不是 define 的调用、只有一个参数、两个参数并且第一个是数组直接量，都不需要检查 id
        if (node.callee.name !== 'define'
            || argsCount < 2
            || argsCount === 2 && args[0].type === 'ArrayExpression'
        ) {
            return;
        }

        var id = args[0].value;

        // 第一个参数不是字符串直接量，或者字符串不符合模块 id term 的规则
        if (args[0].type !== 'Literal' || !ID_REG.test(id)) {
            context.report(node, 'Unexpected id of AMD module.');
        }

    }


    return {
        CallExpression: check
    };

};

module.exports.schema = [];
