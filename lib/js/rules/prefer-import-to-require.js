/**
 * @file Rule to Expected `import` but found `require`
 * @author ielgnaw(wuji0223@gmail.com)
 */

'use strict';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description: 'Expected `import` but found `require`.',
            category: 'ECMAScript 6',
            recommended: true
        },

        schema: []
    },

    create: function (context) {

        // 只在开启新作用域的时候， exit 时才需要 pop
        var scopes = [];

        // 顶层作用域是否有 require 的定义
        var hasReqiureInTopLevel = false;

        /**
         * 推出数组最后一个元素，只有在会开启作用域的节点的 exit 的时候才 pop
         */
        function pop() {
            scopes.pop();
        }

        /**
         * 遍历 Program 的节点，为了把在顶级作用域内的 require VariableDeclarator, FunctionDeclaration 放入 scopes
         *
         * @param {Object} node Program 节点
         */
        function traverseTopLevel(node) {
            // 把在顶级作用域内的 require VariableDeclarator, FunctionDeclaration 放入 scope
            var bodyNode = node.body;
            // console.log(bodyNode);
            bodyNode.forEach(function (b) {
                if ((b.type === 'VariableDeclaration' && b.declarations[0].id.name === 'require')
                    || (b.id && b.id.name === 'require')
                ) {
                    hasReqiureInTopLevel = true;
                    scopes.push({
                        node: b,
                        scope: context.getScope().variableScope,
                        hasReqiure: true
                    });
                }
            });
        }

        /**
         * FunctionDeclaration 的处理
         * 由于 js 是函数作用域，因此 FunctionDeclaration 单独处理
         *
         * @param {Object} node AST 节点对象
         */
        function handleFunctionDeclaration(node) {
            var bodyNode = node.body;
            var hasReqiure = (node.id && node.id.name === 'require')
                ||  bodyNode.body && bodyNode.body.length && bodyNode.body.some(function (b) {
                        if (b.type === 'FunctionDeclaration') {
                            return b.id.name === 'require';
                        }
                        else if (b.type === 'VariableDeclaration') {
                            return b.declarations[0].id.name === 'require';
                        }
                    }
                );

            scopes.push({
                node: node,
                scope: context.getScope().variableScope,
                hasReqiure: !!hasReqiure
            });
        }

        /**
         * 变量定义的处理
         *
         * @param {Object} node AST 节点对象
         */
        function handleVariableDeclarator(node) {
            if (!node.id || node.id.name !== 'require') {
                return;
            }

            for (var i = 0, len = scopes.length; i < len; i++) {
                var scope = scopes[i];
                if (scope.scope === context.getScope().variableScope) {
                    scope.hasReqiure = true;
                }
            }
        }

        /**
         * 块语句的处理
         *
         * @param {Object} node AST 节点对象
         */
        function handleBlockStatement(node) {
            var bodyNode = node.body;
            if (node.type === 'TryStatement') {
                bodyNode = node.block;
            }
            var hasReqiure = bodyNode.body && bodyNode.body.length && bodyNode.body.some(function (b) {
                if (b.type === 'FunctionDeclaration') {
                    return b.id.name === 'require';
                }
                else if (b.type === 'VariableDeclaration') {
                    return b.declarations[0].id.name === 'require';
                }
            });

            if (context.getScope().variableScope.upper.type === 'global' && hasReqiure) {
                hasReqiureInTopLevel = true;
            }

            scopes.push({
                node: node,
                scope: context.getScope().variableScope,
                hasReqiure: !!hasReqiure
            });
        }

        /**
         * CallExpression 的处理
         *
         * @param {Object} node AST 节点对象
         */
        function handleCallExpression(node) {
            if (!node.callee || node.callee.name !== 'require') {
                return;
            }
            // 说明是在顶层作用域下的 require CallExpression
            if (context.getScope().variableScope.upper.type === 'global' && !hasReqiureInTopLevel) {
                context.report(node, 'Expected `import` but found `require`.');
                return;
            }

            var valid = scopes.some(function (scope) {
                return scope.hasReqiure;
            });
            if (!valid) {
                context.report(node, 'Expected `import` but found `require`.');
            }
        }

        /**
         * Program:exit 的时候重置文件级别共享变量
         */
        function reset() {
            hasReqiureInTopLevel = false;
            scopes = [];
        }

        return {
            'Program': traverseTopLevel,
            'FunctionDeclaration': handleFunctionDeclaration,
            'FunctionDeclaration:exit': pop,
            'VariableDeclarator': handleVariableDeclarator,
            'WhileStatement': handleBlockStatement,
            'DoWhileStatement': handleBlockStatement,
            'ForStatement': handleBlockStatement,
            'ForInStatement': handleBlockStatement,
            'ForOfStatement': handleBlockStatement,
            'TryStatement': handleBlockStatement,
            'CatchClause': handleBlockStatement,
            'CallExpression': handleCallExpression,
            'Program:exit': reset
        };
    }
};
