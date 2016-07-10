/**
 * @file Rule to validate constructor.
 * @author chris<wfsr@foxmail.com>
 */
'use strict';


var util = require('../../util');

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        schema: []
    },

    create: function (context) {

        var sourceCode = context.getSourceCode();

        var stack = [];
        function push(node) {
            stack.push({});
        }

        var MESSAGE = 'Expected to fix up `constructor` after override `prototype`.baidu';

        function pop(node) {
            var prototype = stack.pop();

            Object.keys(prototype).forEach(function (key) {
                prototype[key].forEach(function (item) {
                    context.report(
                        item.node,
                        MESSAGE + (item.isNew ? 110 : 111)
                    );
                });
            });
        }

        /**
         * 匹配 .prototype 或 .prototype.constructor 结尾
         *
         * @const
         * @type {RegExp}
         */
        var PROTO_CTOR_PATTERN = /^(.+)\.prototype(\.constructor)?$/;

        function check(prototype, key, node) {

            switch (node.type) {
                case 'Identifier':
                    var name = node.name;
                    var variable;
                    util.variablesInScope(context).some(function (item) {
                        if (item.name === name) {
                            variable = item;
                            return;
                        }
                    });

                    var asssign = variable && variable.references.filter(function (ref) {
                        return ref.isWrite();
                    })[0];

                    if (asssign) {
                        check(prototype, key, asssign.writeExpr);
                    }

                    break;
                case 'ObjectExpression':
                    var hasConstructor = function (property) {
                        return property.key && property.key.name === 'constructor';
                    };

                    if (!node.properties.some(hasConstructor)) {
                        prototype[key].push({node: node, isNew: false});
                    }
                    break;

                case 'NewExpression':
                    prototype[key].push({node: node, isNew: true});
                    break;
            }

        }

        function validate(node) {
            if (node.left.type !== 'MemberExpression') {
                return;
            }

            var leftExpression = sourceCode.getText(node.left);
            var match = leftExpression.match(PROTO_CTOR_PATTERN);

            if (!match) {
                return;
            }

            var prototype = stack[stack.length - 1];

            // 有对 xxx.prototype.constructor 的赋值，清空之前 xxx.prototype 赋值的节点
            if (match[2] && prototype[match[1]] && match[1] === sourceCode.getText(node.right)) {
                delete prototype[match[1]];
                return;
            }

            prototype[match[1]] = prototype[match[1]] || [];

            check(prototype, match[1], node.right);
        }

        return {
            'Program': push,
            'FunctionDeclaration': push,
            'FunctionExpression': push,
            'AssignmentExpression': validate,
            'FunctionDeclaration:exit': pop,
            'FunctionExpression:exit': pop,
            'Program:exit': pop
        };
    }
};
