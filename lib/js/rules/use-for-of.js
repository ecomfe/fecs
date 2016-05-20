/**
 * @file Rule to enforce use for-of statement.
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
            description: 'enforce use for-of statement',
            category: 'ECMAScript 6',
            recommended: false
        },

        schema: []
    },

    create: function (context) {

        var isObject = util.isObjectNode(context);

        function validate(node) {
            context.report(node, 'Unexpected for-in, use for-of instead.');

            if (isObject(node.right)) {
                context.report(node.right, 'Expected to use Object.keys.');
            }
        }

        return {
            ForInStatement: validate
        };
    }
};
