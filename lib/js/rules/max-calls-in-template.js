/**
 * @file Rule to check function call times in templates.
 * @author chris<wfsr@foxmail.com>
 */
'use strict';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description: 'enforce a maximum function call times in template',
            category: 'ECMAScript 6',
            recommended: true
        },

        schema: [
            {
                type: 'integer',
                minimum: 1
            }
        ]
    },

    create: function (context) {
        var max = (context.options[0] | 0) || 1;

        /**
         * Check destructure depth
         *
         * @param {ASTNode} node The ObjectPattern or ArrayPattern node.
         */
        function validate(node) {
            if (!node.expressions.length) {
                return;
            }

            var times = node.expressions.map(function count(expression) {
                if (expression.type === 'CallExpression') {
                    var args = expression.arguments;
                    return 1 + (args.length ? Math.max.apply(Math, args.map(count)) : 0);
                }

                return 0;
            });

            times = Math.max.apply(Math, times);

            if (times > max) {
                context.report(
                    node,
                    'Too many nest function calls ({{times}}). Maximum allowed is {{max}}.',
                    {times: times, max: max}
                );
            }
        }

        return {
            TemplateLiteral: validate
        };
    }
};
