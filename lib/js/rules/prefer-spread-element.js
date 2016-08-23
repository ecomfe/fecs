/**
 * @file Rule to validate using of spread element.
 * @author chris<wfsr@foxmail.com>
 */
'use strict';

var util = require('../../util');

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description: 'validate using of spead element',
            category: 'ECMAScript 6',
            recommended: false
        },

        schema: [{
            type: 'object',
            properties: {
                copy: {
                    type: 'boolean'
                }
            },
            additionalProperties: false
        }]
    },

    create: function (context) {
        var options = context.options[0] || {};
        var useCopy = options.copy === true;


        function validateCopy(node) {
            if (node.parent.type === 'ArrayExpression' && node.parent.elements.length === 1) {
                context.report(node, 'Expected to use `Array.from` to copy Array.');
            }
        }

        var isArray = util.isArrayNode(context);

        function validateConcat(node) {
            if (node.callee.type !== 'MemberExpression'
                || node.callee.property.name !== 'concat'
                || node.callee.object.name === 'Buffer'
            ) {
                return;
            }

            if (node.arguments.some(isArray)) {
                context.report(node, 'Expected to use SpreadElement to concat Array.');
            }
        }

        return useCopy
            ? {CallExpression: validateConcat}
            : {CallExpression: validateConcat, SpreadElement: validateCopy};
    }
};
