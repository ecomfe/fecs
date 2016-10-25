/**
 * @file 检查 ES6 模块中是否使用 require
 * @author chris<wfsr.foxmail.com>
 *         ielgnaw(wuji0223@gmail.com)
 */

'use strict';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description: 'Disallow to use `require` in ES6 file.',
            category: 'ECMAScript 6',
            recommended: true
        },

        schema: []
    },

    create: function (context) {

        var taggedScopes = [];

        function clear() {
            taggedScopes.length = 0;
        }

        function hasRequireInScopes(node) {
            var scope = context.getScope();
            var variables = scope.variables;
            var variableScope = scope.variableScope;

            var found;

            for (var i = 0, len = taggedScopes.length; i < len; i++) {
                var tag = taggedScopes[i];
                if (tag.scope === variableScope) {
                    found = tag;
                    break;
                }
            }

            if (found) {
                return found.require;
            }

            while (scope.type !== 'global' && scope.type !== 'module') {
                scope = scope.upper;
                variables = variables.concat(scope.variables);
            }

            found = variables.some(function (variable) {
                if (variable.name === 'require') {
                    taggedScopes.push({
                        scope: variable.scope,
                        require: true
                    });

                    return true;
                }
            });

            return found;
        }

        function validate(node) {
            if (
                node.callee.name !== 'require'
                || node.callee.name === 'require' && hasRequireInScopes(node)
            ) {
                return;
            }

            context.report(node, 'Disallow to use `require` in ES6 file.');
        }

        return {
            'Program:exit': clear,
            'CallExpression': validate
        };
    }
};
