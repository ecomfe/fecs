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


    /**
     * Checks whether or not the current traversal context is on constructors.
     *
     * @param {{scope: Scope}} item - A checking context to check.
     * @return {boolean} whether or not the current traversal context is on constructors.
     */
    function isSameScope(item) {
        return item && item.scope === context.getScope().variableScope;
    }


    function isAMDFactoryAndNoRequireParam(node) {
        var parent = node.parent;
        var params = node.params;

        var hasRequireInParams = params.length && params.some(function (param) {
            return param.name === 'require';
        });

        return {
            define: parent.type === 'CallExpression' && parent.callee.name === 'define',
            require: hasRequireInParams,
            scope: context.getScope().variableScope
        };
    }

    function push(node) {
        fns.push(isAMDFactoryAndNoRequireParam(node));
    }

    function pop(node) {
        fns.pop();
    }

    function detect(node) {
        if (node.id && node.id.name !== 'require') {
            return;
        }

        var fn = fns[fns.length - 1];
        if (isSameScope(fn)) {
            fn.require = true;
        }
    }

    function hasRequireOrNotAMD(item) {
        return item.withRequire || item.catchRequire || item.require || !item.define;
    }

    function check(node) {
        // 不是 require 的调用或不在 AMD factory 内的 require 调用或者正确的调用
        if (
            !fns.length
            || node.callee.name !== 'require'
            || node.arguments[0] && node.arguments[0].type !== 'Literal'
            || node.callee.name === 'require' && fns.some(hasRequireOrNotAMD)
        ) {
            return;
        }
        context.report(node, 'Expected a local require (Missing `require` in AMD factory).');
    }


    return {
        'Program': init,
        'ArrowFunctionExpression': push,
        'FunctionExpression': push,
        'VariableDeclarator': detect,
        'FunctionDeclaration': detect,
        'CallExpression': check,
        'FunctionExpression:exit': pop,
        'ArrowFunctionExpression:exit': pop,
        'Program:exit': clear,

        'WithStatement': function (node) {
            var type = node.object.type;

            var properties;
            if (type === 'ObjectExpression') {
                properties = node.object.properties;
            }
            else if (type === 'AssignmentExpression' && node.object.right.type === 'ObjectExpression') {
                properties = node.object.right.properties;
            }
            else if (type === 'Identifier') {
                var name = node.object.name;
                var variable = context.getScope().variableScope.variables.filter(function (variable) {
                    return variable.name === name;
                })[0];

                if (variable) {
                    var reference = variable.references.filter(function (reference) {
                        return reference.writeExpr && reference.writeExpr.type === 'ObjectExpression';
                    })[0];

                    properties = reference && reference.writeExpr.properties;
                }

            }

            var hasRequireProperty = properties && properties.some(function (property) {
                return property.key && property.key.name === 'require';
            });

            var fn = fns[fns.length - 1];
            if (isSameScope(fn)) {
                fn.withRequire = hasRequireProperty;
            }
        },
        'WithStatement:exit': function () {
            var fn = fns[fns.length - 1];
            if (isSameScope(fn)) {
                fn.withRequire = false;
            }
        },
        'CatchClause': function (node) {
            var fn = fns[fns.length - 1];
            if (isSameScope(fn)) {
                fn.catchRequire = node.param.name === 'require';
            }
        },
        'CatchClause:exit': function (node) {
            var fn = fns[fns.length - 1];
            if (isSameScope(fn)) {
                fn.catchRequire = false;
            }
        }
    };

};

module.exports.schema = [];

