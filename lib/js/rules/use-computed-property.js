/**
 * @file Rule to check computed property of object expression definition.
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
            description: 'Check computed property of object expression definition.',
            category: 'ECMAScript 6',
            recommended: false
        },

        schema: []
    },

    create: function (context) {

        var sourceCode = context.getSourceCode();

        /**
         * Find variable and it's write reference
         *
         * @param {string} name variable name
         * @param {function(ASTNode):boolean} checkType type of the write expression node
         * @return {?Reference}
         */
        function findVariableReference(name, checkType) {
            var variable;

            util.variablesInScope(context).some(function (item) {
                if (item.name === name) {
                    variable = item;
                    return true;
                }
            });

            var result;

            variable && variable.references.some(function (item) {
                if (item.isWrite() && checkType(item.writeExpr)) {
                    result = item;
                    return true;
                }
            });

            return result;
        }

        function isPureObject(name) {
            return name && findVariableReference(name, function (node) {
                switch (node.type) {
                    case 'NewExpression':
                        return node.callee.name === 'Object'
                            && (!node.arguments.length || node.arguments[0].type === 'ObjectExpression');

                    case 'ObjectExpression':
                        return true;

                    case 'CallExpression':
                        var callee = node.callee;
                        return callee.type === 'MemberExpression'
                            && callee.object.name === 'Object'
                            && callee.property.name === 'create'
                            && node.arguments[0]
                            && node.arguments[0].value === null
                            || callee.name === 'Object'
                            && (!node.arguments.length || node.arguments[0].type === 'ObjectExpression');
                }
            });
        }


        function validate(node) {
            var left = node.left;
            if (left.type !== 'MemberExpression' || left.object.type === 'MemberExpression') {
                return;
            }

            var id = left.object.name;
            var ref = isPureObject(id);
            if (!ref || sourceCode.getText(node.right).match('\\b' + id + '\\b')) {
                return;
            }

            if (ref.from === context.getScope()
                && ref.identifier.parent.parent.parent.parent === node.parent.parent.parent
            ) {
                context.report(
                    node,
                    'Expected to init `{{name}}` with {{adj}} property.',
                    {name: id, adj: left.computed ? 'computed' : 'this'}
                );
            }
        }

        return {
            AssignmentExpression: validate
        };
    }
};
