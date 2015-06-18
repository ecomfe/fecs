/**
 * @file 禁止使用 for-in 遍历数组的规则.
 * @author  chris<wfsr.foxmail.com>
 */


module.exports = function (context) {

    'use strict';

    function isArray(node) {

        switch (node.type) {
            case 'ArrayExpression':
                return true;
            case 'NewExpression':
            case 'CallExpression':
                return node.callee.name === 'Array';
            default:
                break;
        }

        return false;
    }


    return {

        ForInStatement: function (node) {

            var right = node.right;
            if (right.type === 'Identifier') {
                var filter = function (item) {
                    return item.name === right.name;
                };

                var variable = context.getScope().variables.filter(filter)[0];

                if (!variable) {
                    return;
                }

                var parent = variable.identifiers[0].parent;
                switch (parent.type) {
                    case 'VariableDeclarator':
                        if (parent.init) {
                            right = parent.init;
                        }
                        // TODO: 考虑再追踪变量赋值语句中右侧的类型
                        break;

                    case 'FunctionExpression':
                    case 'FunctionDeclaration':
                    case 'ArrowFunctionExpression':
                        var doc = context.getJSDocComment(parent);
                        if (doc && ~doc.value.indexOf('@param {Array} ' + right.name)) {
                            right = {type: 'ArrayExpression'};
                        }
                        break;

                    default:
                        break;
                }

            }

            if (isArray(right)) {
                context.report(node, 'Don\'t traverse Array with for-in.');
            }
        }
    };

};
