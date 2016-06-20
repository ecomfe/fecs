/**
 * @file Rule to enforce using Map or Set.
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
            description: 'Enforce using Map or Set.',
            category: 'ECMAScript 6',
            recommended: false
        },

        schema: []
    },

    create: function (context) {


        /**
         * Find variable and it's write expression
         *
         * @param {string} name variable name
         * @param {function(ASTNode):boolean} checkType type of the write expression node
         * @return {?ASTNode}
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
            var checker = function (item) {
                if (item.isWrite() && checkType(item.writeExpr, variable)) {
                    result = item.writeExpr;
                    return true;
                }
            };

            if (variable) {
                variable.references.some(checker);
            }
            else {
                context.getScope().through.some(function (item) {
                    if (item.identifier.name === name) {
                        checker(item);
                        return true;
                    }
                });
            }

            return result;
        }

        function isPureObject(name) {
            var check = function (node, variable) {
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
            };

            return typeof name === 'string' ? findVariableReference(name, check) : check(name);
        }

        function isString(name) {
            var called = false;
            var result = name && findVariableReference(name, function (node, variable) {
                called = true;
                switch (node.type) {
                    case 'NewExpression':
                        return node.callee.name === 'String';

                    case 'Literal':
                        return typeof node.value === 'string';
                    case 'TemplateLiteral':
                        return true;

                    case 'BinaryExpression':
                        return node.left.type === 'Literal'
                            && typeof node.left.value === 'string'
                            || node.right.type === 'Literal'
                            && typeof node.right.value === 'string';

                    case 'CallExpression':
                        return node.callee.name === 'String'
                            || node.callee.type === 'MemberExpression'
                            && node.callee.property.name === 'toString';
                }
            });

            return called ? result : true;
        }

        function isBoolean(node) {
            var value = node.value;
            switch (node.type) {
                case 'Literal':
                    return  value === 1
                        || value === 0
                        || value === true
                        || value === false;

                case 'UnaryExpression':
                    return node.operator === '!';
            }
        }

        var refMap = {};

        function validate(node) {
            var left = node.left;
            if (left.type !== 'MemberExpression') {
                return;
            }

            var property = left.property;
            if (property.type !== 'Identifier' || !left.computed) {
                return;
            }

            var id = left.object.name;
            var ref = isPureObject(id);
            if (!ref) {
                return;
            }

            var key = [id, ref.loc.start.line, ref.loc.start.column].join('-');
            if (refMap[key]) {
                return;
            }
            if (property.type === 'Identifier' && !isString(property.name)) {
                refMap[key] = true;
                context.report(
                    node,
                    'Expected to use ' + (isBoolean(node.right) ? 'Set' : 'Map') + ' but found Object.'
                );
            }
        }

        return {
            AssignmentExpression: validate,

            ForInStatement: function (node) {
                var right = node.right;
                if (isPureObject(right.type === 'Identifier' ? right.name : right)) {
                    context.report(node, 'Expected to use Map or Set with interation.');
                }
            },

            UnaryExpression: function (node) {
                if (node.operator === 'delete'
                    && node.argument.type === 'MemberExpression'
                    && node.argument.object.type === 'Identifier'
                    && isPureObject(node.argument.object.name)
                ) {
                    context.report(node, 'Expected to use Map or Set if you need to add or remove items.');
                }
            },

            ObjectExpression: function (node) {
                var hasAllTrue = node.properties.length && !node.properties.some(function (property) {
                    var value = property.value.value;
                    return value !== true && value !== 1;
                });

                if (hasAllTrue) {
                    context.report(node, 'Expected to use Set if you need an identify collection.');
                }
            }
        };
    }
};
