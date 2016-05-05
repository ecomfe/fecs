/**
 * @file Rule to enforce use standard Promise APIs.
 * @author chris<wfsr@foxmail.com>
 */
'use strict';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

var API = {
    all: true,
    race: true,
    resolve: true,
    reject: true
};

module.exports = {
    meta: {
        docs: {
            description: 'enforce use standard Promise APIs',
            category: 'ECMAScript 6',
            recommended: true
        },

        schema: [{
            type: 'object',
            additionalProperties: true
        }]
    },

    create: function (context) {
        var additions = context.options[0] || {};

        return {
            CallExpression: function (node) {
                var callee = node.callee;
                if (callee.type !== 'MemberExpression' || callee.object.name !== 'Promise') {
                    return;
                }

                var name = callee.property.name;
                if (!(name in API) && !(name in additions)) {
                    context.report(callee.property, 'Expected to use standard Promise APIs.');
                }
            }
        };
    }
};
