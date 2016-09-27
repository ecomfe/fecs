/**
 * @file Rule to enforce using AssignmentPattern.
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
            description: 'Enforce using AssignmentPattern.',
            category: 'ECMAScript 6',
            recommended: false
        },

        schema: []
    },

    create: function (context) {

        function report(node, name) {
            context.report(node, 'Enforce to use AssignmentPattern for `{{name}}`.', {name: name});
        }

        function isEmptyOrNullTest(node, name) {
            switch (node.type) {
                case 'UnaryExpression':
                    return node.operator === '!'
                        && node.argument.type === 'Identifier'
                        && node.argument.name === name;

                case 'BinaryExpression':
                    return node.operator === '=='
                        && node.right.value == null
                        || node.operator === '==='
                        && node.right.type === 'UnaryExpression'
                        && node.right.operator === 'void'
                        && node.right.argument.type === 'Literal'
                        && node.right.argument.value === 0;
            }
        }

        function isPureValue(node) {
            switch (node.type) {
                case 'Literal':
                    return true;

                case 'TemplateLiteral':
                    return !node.expressions.length;

                case 'ArrayExpression':
                    return node.elements.every(isPureValue);

                case 'ObjectExpression':
                    return node.properties.every(function (property) {
                        return !property.computed
                            && property.key
                            && property.key.type === 'Identifier'
                            && isPureValue(property.value);
                    });

                case 'NewExpression':
                case 'CallExpression':
                    var callee = node.callee;
                    var firstArg = node.arguments[0];

                    return callee.type === 'MemberExpression'
                        && callee.object.name === 'Object'
                        && callee.property.name === 'create'
                        && firstArg
                        && firstArg.value === null
                        || /(Object|Array|String|Number)/.test(callee.name)
                        && node.arguments.every(isPureValue);
            }

            return false;

        }

        function validate(node) {
            var left = node.left;
            var right = node.right;

            if (left.type !== 'Identifier') {
                return;
            }

            var name = left.name;
            var variable;

            util.variablesInScope(context).some(function (item) {
                if (item.name === name) {
                    variable = item;
                    return true;
                }
            });

            var def = variable && variable.defs[0];
            if (!def
                || (
                    def.type !== 'Parameter'
                    && (!def.node.id || def.node.id.type.slice(-7) !== 'Pattern')
                )
            ) {
                return;
            }

            // 参数查第一次赋值，解构变量查第二次赋值
            var asssign = variable.references.filter(function (ref) {
                return ref.isWrite();
            })[def.type === 'Parameter' ? 0 : 1];

            if (!asssign || asssign.writeExpr !== right) {
                return;
            }

            if (context.getScope().block.type === node.parent.parent.parent.type
                && isPureValue(right)
            ) {
                return report(node, name);
            }

            // TODO: 需要进一步检查 AssignmentPattern 的可行性，
            // 比如 alternate 赋值是否有依赖导致无法在定义时作为默认值
            switch (right.type) {

                case 'LogicalExpression':
                    if (right.operator === '||'
                        && right.left.name === name
                        && isPureValue(right.right)
                    ) {
                        report(node, name);
                    }
                    break;

                case 'ConditionalExpression':
                    if (right.test.name === name
                        && right.consequent.name === name
                        && isPureValue(right.alternate)
                        || isEmptyOrNullTest(right.test, name)
                        && right.alternate.name === name
                        && isPureValue(right.consequent)
                    ) {
                        report(node, name);
                    }
                    break;

                default:
                    var ifNode = node.parent.parent;
                    ifNode = ifNode.type !== 'IfStatement' ? ifNode.parent : ifNode;

                    if (ifNode.type === 'IfStatement'
                        && isEmptyOrNullTest(ifNode.test, name)
                        && isPureValue(right)
                    ) {
                        report(node, name);
                    }
                    break;
            }
        }

        return {
            AssignmentExpression: validate
        };
    }
};
