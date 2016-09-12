/**
 * @file Rule to require braces in arrow function body.
 * @author Alberto Rodríguez
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
            description: 'require braces around arrow function bodies',
            category: 'ECMAScript 6',
            recommended: false
        },

        schema: [
            {
                'enum': ['always', 'as-needed']
            },
            {
                type: 'object',
                additionalProperties: {
                    type: 'boolean'
                }
            }
        ]
    },

    create: function (context) {
        var always = context.options[0] === 'always';
        var asNeeded = !context.options[0] || context.options[0] === 'as-needed';
        var needMaps = context.options[1] || {};


        var EXPECT_MESSAGE = 'Expected block statement surrounding arrow body.';
        var UNEXPECT_MESSAGE = 'Unexpected block statement surrounding arrow body.';
        function report(node, expect) {
            context.report(node, node.body.loc.start, expect ? EXPECT_MESSAGE : UNEXPECT_MESSAGE);
        }

        /**
         * Determines whether a arrow function body needs braces
         *
         * @param {ASTNode} node The arrow function node.
         * @return {void}
         */
        function validate(node) {
            var arrowBody = node.body;

            var isSurroundedByParentheses = context.getTokenBefore(arrowBody).value === '('
                && context.getTokenAfter(arrowBody).value === ')';

            if (arrowBody.type === 'BlockStatement') {
                var blockBody = arrowBody.body;
                var bodyLength = blockBody.length;
                var firstNode = blockBody[0];

                if (
                    // allow empty function
                    bodyLength === 0 && node.params.length > 0
                    || bodyLength > 0 && firstNode.type === 'LabeledStatement'
                ) {
                    report(node, true);
                    return;
                }

                if (bodyLength > 1) {
                    return;
                }

                if (asNeeded && firstNode && firstNode.type === 'ReturnStatement') {
                    if (!needMaps[firstNode.argument.type]) {
                        report(node);
                    }
                }
            }
            else if (always && !isSurroundedByParentheses) {
                report(node, true);
            }
        }

        return {
            ArrowFunctionExpression: validate
        };
    }
};
