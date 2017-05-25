/**
 * @file Rule to validate arrow function expression.
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
            description: 'Disallow to use arrow function expression within `this` context.',
            category: 'ECMAScript 6',
            recommended: false
        },

        schema: []
    },

    create: function (context) {

        /**
         * Shortcut for context.report
         *
         * @param {ASTNode} node the AST node
         */
        function report(node) {
            context.report(node, 'Disallow to use arrow function expression within `this` context.');
        }

        /**
         * Get the name path of member expression node
         *
         * @param {ASTNode} node the member expression node
         * @return {string}
         */
        function getName(node) {
            return context.getSourceCode().getText(node).replace(/[\s\r\n]+/g, '');
        }

        /**
         * Find variable and it's write expression
         *
         * @param {string} name variable name
         * @param {string} type type of the write expression node
         * @return {?ASTNode}
         */
        function findVariableReference(name, type) {
            var variable;

            util.variablesInScope(context).some(function (item) {
                if (item.name === name) {
                    variable = item;
                    return true;
                }
            });

            var result;

            variable && variable.references.some(function (item) {
                if (item.isWrite() && item.writeExpr.type === type) {
                    result = item.writeExpr;
                    return true;
                }
            });

            return result;
        }

        /**
         * Check if the property value specify by paths is arrow function expression
         *
         * @param {ASTNode} obj object expression node
         * @param {string[]} paths name paths
         */
        function checkTypedPropertyValue(obj, paths) {
            var name = paths.shift();
            var isLeave = !paths.length;

            obj.properties.some(function (property) {
                if (property.key.name === name) {
                    var value = property.value;

                    if (isLeave && value.type === 'ArrowFunctionExpression') {
                        report(value);
                    }
                    else if (!isLeave && value.type === 'ObjectExpression') {
                        checkTypedPropertyValue(value, paths);
                    }

                    return true;
                }
            });
        }

        function validate(node) {
            var callee = node.callee;
            if (callee.type !== 'MemberExpression'
                || callee.property.name !== 'call'
                && callee.property.name !== 'apply'
            ) {
                return;
            }

            var type = callee.object.type;
            var reference;
            if (type === 'Identifier') {
                reference = findVariableReference(callee.object.name, 'ArrowFunctionExpression');

                reference && report(reference);
            }
            else if (type === 'MemberExpression') {
                var paths = getName(callee.object).split('.');
                reference = findVariableReference(paths.shift(), 'ObjectExpression');

                reference && checkTypedPropertyValue(reference, paths);
            }
        }

        return {
            CallExpression: validate
        };
    }
};
