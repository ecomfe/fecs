/**
 * @file Rule to check destructure depth.
 * @author chris<wfsr@foxmail.com>
 * @copyright 2015 Alberto Rodríguez. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
'use strict';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description: 'enforce a maximum depth that destructure can be nested',
            category: 'ECMAScript 6',
            recommended: true
        },

        schema: [
            {
                type: 'integer',
                minimum: 0
            }
        ]
    },

    create: function (context) {
        var max = (context.options[0] | 0) || 2;

        /**
         * Check destructure depth
         *
         * @param {ASTNode} node The arrow function node.
         */
        function validate(node) {
            var depth = 0;

            for (var start = node, type; type = start.type; start = start.parent) {
                if (
                    type === 'VariableDeclarator'
                    || type === 'FunctionDeclaration'
                    || type === 'FunctionExpression'
                    || type === 'ArrowFunctionExpression'
                ) {
                    break;
                }

                if (type === 'ObjectPattern') {
                    depth++;
                }
            }

            if (depth > max) {
                context.report(
                    node,
                    'Too many nested destructure ({{depth}}). Maximum allowed is {{max}}.',
                    {depth: depth, max: max}
                );
            }
        }

        return {
            ObjectPattern: validate
        };
    }
};
