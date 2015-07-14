/**
 * @file 检查 AMD 模块定义时是否使用 local require
 * @author chris<wfsr.foxmail.com>
 */

module.exports = function (context) {

    'use strict';

    var fns;

    function init() {
        fns = [];
    }

    function clear() {
        fns.length = 0;
    }

    function isAMDFactoryAndNoRequireParam(node) {
        var parent = node.parent;
        var params = node.params;

        return (!params.length || params[0].name !== 'require')
            && parent.type === 'CallExpression'
            && parent.callee.name === 'define';
    }

    function push(node) {
        fns.push(isAMDFactoryAndNoRequireParam(node));
    }

    function pop(node) {
        fns.pop();
    }

    function hasAMDFactory(item) {
        return item;
    }

    function check(node) {
        var args = node.arguments;
        // 不是 require 的调用或不在 AMD factory 内的 require 调用
        if (!fns.length || node.callee.name !== 'require' || !fns.some(hasAMDFactory)) {
            return;
        }

        context.report(node, 'Expected a local require (Missing `require` in AMD factory).');
    }


    return {
        'Program': init,
        'ArrowFunctionExpression': push,
        'FunctionExpression': push,
        'CallExpression': check,
        'FunctionExpression:exit': pop,
        'ArrowFunctionExpression:exit': pop,
        'Program:exit': clear
    };

};
