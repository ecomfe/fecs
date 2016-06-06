/**
 * @file Rule to enforce shim Promise.
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
            description: 'enforce shim Promise',
            category: 'ECMAScript 6',
            recommended: false
        },

        schema: [{type: 'string'}]
    },

    create: function (context) {

        var globalName = context.options[0] || '';
        var PROMISE = 'Promise';

        var nodeToBeChecked;
        var forceShim;

        function checkDefinition(node) {
            if (!forceShim && node.id && node.id.name === PROMISE) {
                var parent = node.parent;
                if (node.type === 'VariableDeclarator') {
                    parent = parent.parent;
                }

                if (parent.type !== 'Program') {
                    nodeToBeChecked = {node: node, scope: context.getScope().variableScope};
                }
            }
        }

        function checkShim(node) {
            var left = node.left;

            if (left.type === 'Identifier'
                && left.name === PROMISE
                && !util.variablesInScope(context).some(
                    function (variable) {
                        return variable.name === PROMISE;
                    }
                )
            ) {
                forceShim = true;
                nodeToBeChecked = null;
            }

            if (left.type !== 'MemberExpression') {
                return;
            }

            var objectName = left.object.name;

            if (
                !('value' in node.right && node.right.value == null)
                && left.property.name === PROMISE
                && ((globalName && globalName === objectName)
                || /^(?:window|global)$/.test(objectName))
            ) {
                forceShim = true;
                nodeToBeChecked = null;
            }
        }

        function validate() {
            if (nodeToBeChecked) {
                context.report(nodeToBeChecked.node.id, 'Promise should be shimmed to global scope.');
            }
        }

        return {
            'ClassDeclaration': checkDefinition,
            'VariableDeclarator': checkDefinition,
            'FunctionDeclaration': checkDefinition,
            'AssignmentExpression': checkShim,
            'Program:exit': validate
        };
    }
};
