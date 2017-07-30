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

            var name;
            switch (node.type) {
                case 'Identifier':
                    return scope[node.name];

                case 'MemberExpression':
                    name = sourceCode.getText(node).split('.').shift();
                    return scope[name];

                case 'NewExpression':
                case 'CallExpression':
                    name = sourceCode.getText(node.callee).split('.').shift();
                    return scope[name] || node.arguments.some(hasAwaitVariable);
            }
        }

        function tagIdentifier(node, scope) {
            switch (node.type) {
                case 'Identifier':
                    scope[node.name] = true;
                    break;

                case 'MemberExpression':
                    scope[sourceCode.getText(node).split('.').shift()] = true;
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
            if (!scope
                || node.type === 'VariableDeclarator'
                && (!node.init || node.init.type === 'YieldExpression')
                || node.type === 'AssignmentExpression'
                && node.right.type === 'YieldExpression'
            ) {
                return;
            }

            if (hasAwaitVariable(node.init || node.right)) {
                tagIdentifier(node.id || node.left, scope);
            }

        }

        function analyseDeps(node) {
            var scope = scopes[scopes.length - 1];
            var ignoreTypes = {
                AssignmentExpression: true,
                VariableDeclarator: true,
                YieldExpression: true
            };

            if (!scope || ignoreTypes[node.parent.type] || node.callee.type !== 'MemberExpression') {
                return;
            }

            if (hasAwaitVariable(node)) {
                tagIdentifier(node.callee, scope);
            }
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
            if (scope[name]) {
                return;
            }

            var earlyAwaits = Object.keys(scope);
            parent = parent.parent.parent;
            scope[name] = {parent: parent};

            var argument = node.argument;
            var argumentType = argument.type;
            if ((argumentType === 'Identifier' || argumentType === 'MemberExpression')
                && hasAwaitVariable(argument)
                || argumentType === 'CallExpression'
                && (hasAwaitVariable(argument.callee) || argument.arguments.some(hasAwaitVariable))
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
            'AssignmentExpression': analyse,
            'CallExpression:exit': analyseDeps,
            'AwaitExpression': validate,
            'YieldExpression': validate
        };

        if (!useCO) {
            listeners.CallExpression = validateCO;
        }

        return listeners;
    }
};
