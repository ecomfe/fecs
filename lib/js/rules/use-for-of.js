/**
 * @file Rule to enforce use for-of statement.
 * @author chris<wfsr@foxmail.com>
 */
'use strict';

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

        function isObject(node) {
            var type = node.type;
            switch (type) {

                case 'CallExpression':
                    var callee = node.callee;
                    if (
                        callee.type === 'MemberExpression'
                        && (
                            callee.object.name === 'Object'
                            && callee.property.name === 'keys'
                            || callee.object.name === 'Array'
                        )
                        || callee.type === 'Identifier' && callee.name === 'Array'
                    ) {
                        return false;
                    }

                    break;

                case 'NewExpression':
                    if (node.callee.name === 'Array') {
                        return false;
                    }

                    break;

                case 'ArrayExpression':
                    return false;

                case 'Identifier':
                    // TODO check type
                case 'ObjectExpression':
                default:
                    break;
            }

            return true;
        }

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
