/**
 * @file 禁止使用 for-in 遍历数组的规则.
 * @author  chris<wfsr.foxmail.com>
 */

var util = require('../../util');

module.exports = function (context) {

    'use strict';

    var isArray = util.isArrayNode(context);


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
                        break;

                    case 'RestElement':
                        right = {type: 'ArrayExpression'};
                        break;

                    case 'FunctionExpression':
                    case 'FunctionDeclaration':
                    case 'ArrowFunctionExpression':
                        var doc = context.getSourceCode().getJSDocComment(parent);
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

module.exports.schema = [];

