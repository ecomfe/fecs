/**
 * @file Rule to enforce use standard Promise APIs.
 * @author chris<wfsr@foxmail.com>
 */
'use strict';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/**
 * 标准 Promise API
 *
 * @namespace
 */
var apis = {
    'all': true,
    'catch': true,
    'race': true,
    'resolve': true,
    'reject': true,
    'then': true
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

        function validate(node) {
            var callee = node.callee;
            if (callee.type !== 'MemberExpression' || callee.object.type !== 'Identifier') {
                return;
            }

            var objectName = callee.object.name.toLowerCase();
            // Identifier or Literal
            var propertyName = callee.property.name || callee.property.value;

            if (
                objectName === 'q' && propertyName === 'defer'
                || (objectName === 'jquery' || objectName === '$') && propertyName === 'Deferred'
                || objectName === 'promise' && !(propertyName in apis) && !(propertyName in additions)
            ) {
                context.report(callee.property, 'Expected to use standard Promise APIs.');
            }
        }

        return {
            CallExpression: validate,
            NewExpression: validate
        };
    }
};
