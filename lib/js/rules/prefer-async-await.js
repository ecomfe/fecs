/**
 * @file Rule to enforce to use async and await.
 * @author chris<wfsr@foxmail.com>
 */
'use strict';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description: 'enforce to use async and await',
            category: 'ECMAScript 6',
            recommended: false
        },

        schema: [{
            type: 'object',
            properties: {
                co: {
                    type: 'boolean'
                }
            },
            additionalProperties: false
        }]
    },

    create: function (context) {
        var options = context.options[0] || {};
        var useCO = options.co === true;

        function validateCO(node) {
            var callee = node.callee;
            var args = node.arguments;

            if (callee.name === 'require'
                && args[0]
                && args[0].value === 'co'
                || callee.name === 'co'
                && args[0]
                && args[0].generator
                && args[0].type === 'FunctionExpression'
            ) {
                context.report(node, 'Expected to use `async` and `await`.');
            }

        }

        var scopes = [];
        function pushScope(node) {
            scopes.push({});
        }

        function popScope(node) {
            scopes.pop();
        }

        function validate(node) {
            var parent = node.parent;
            if (node._babelType !== 'AwaitExpression'
                || parent.type !== 'VariableDeclarator'
                && parent.type !== 'AssignmentExpression'
            ) {
                return;
            }

            var scope = scopes[scopes.length - 1];
            var name = parent.id && parent.id.name || parent.left && parent.left.name;

            var earlyAwaits = Object.keys(scope);
            parent = parent.parent.parent;
            scope[name] = {parent: parent};

            var args = node.argument.arguments;
            var hasAwaitVariable = function (node) {
                return node.type === 'Identifier' && scope[node.name];
            };

            if (args.some(hasAwaitVariable)) {
                return;
            }

            var hasSameParentAwait = function (name) {
                return parent === scope[name].parent;
            };

            if (earlyAwaits.length && earlyAwaits.some(hasSameParentAwait)) {
                context.report(node, 'Expected to excute in parallel.');
            }
        }

        var listeners = {
            'ArrowFunctionExpression': pushScope,
            'FunctionExpression': pushScope,
            'FunctionDeclaration': pushScope,
            'ArrowFunctionExpression:exit': popScope,
            'FunctionExpression:exit': popScope,
            'FunctionDeclaration:exit': popScope,
            'YieldExpression': validate
        };

        if (!useCO) {
            listeners.CallExpression = validateCO;
        }

        return listeners;
    }
};
