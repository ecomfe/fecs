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
        var sourceCode = context.getSourceCode();

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

        function hasAwaitVariable(node) {
            var scope = scopes[scopes.length - 1];

            if (node.type === 'Identifier' && scope[node.name]) {
                return node.name;
            }
            else if (node.type === 'MemberExpression') {
                var name = sourceCode.getText(node).split('.').shift();
                return scope[name] && name;
            }
        }

        function tagIdentifier(node, scope) {
            switch (node.type) {
                case 'Identifier':
                    scope[node.name] = true;
                    break;

                case 'ObjectPattern':
                    node.properties.forEach(function (property) {
                        tagIdentifier(property.value, scope);
                    });
                    break;

                case 'ArrayPattern':
                    node.elements.forEach(function (element) {
                        tagIdentifier(element, scope);
                    });
                    break;
            }
        }

        function analyse(node) {
            var scope = scopes[scopes.length - 1];
            if (!scope || !node.init || node.init.type === 'YieldExpression') {
                return;
            }

            var name;
            var init = node.init;
            switch (init.type) {
                case 'Identifier':
                    name = init.name;
                    if (!scope[name]) {
                        return;
                    }
                    break;

                case 'MemberExpression':
                    name = sourceCode.getText(init).split('.').shift();
                    if (!scope[name]) {
                        return;
                    }
                    break;

                case 'NewExpression':
                case 'CallExpression':
                    name = sourceCode.getText(init.callee).replace(/^([^\(\.]+).*$/, '$1');
                    if (!scope[name]) {
                        var isInArgs = init.arguments.some(function (arg) {
                            name = hasAwaitVariable(arg);
                            return name;
                        });

                        if (!isInArgs) {
                            return;
                        }
                    }
                    break;

                default:
                    return;
            }

            tagIdentifier(node.id, scope);
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

            if (hasAwaitVariable(node.argument.callee)
                || node.argument.arguments.some(hasAwaitVariable)
            ) {
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
            'VariableDeclarator': analyse,
            'YieldExpression': validate
        };

        if (!useCO) {
            listeners.CallExpression = validateCO;
        }

        return listeners;
    }
};
