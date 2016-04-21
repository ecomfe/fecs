/**
 * @file A rule to verify `super()` callings in method.
 * @author chris<wfsr.foxmail.com>
 */

'use strict';


module.exports = function (context) {

    /**
     * Searches a class node from ancestors of a node.
     *
     * @param {Node} node - A node to get.
     * @return {ClassDeclaration|ClassExpression|null} the found class node or `null`.
     */
    function getClassInAncestor(node) {
        while (node) {
            if (node.type === 'ClassDeclaration' || node.type === 'ClassExpression') {
                return node;
            }
            node = node.parent;
        }
    }

    /**
     * Checks whether or not a node is the null literal.
     *
     * @param {Node} node - A node to check.
     * @return {boolean} whether or not a node is the null literal.
     */
    function isNullLiteral(node) {
        return node === null || node.type === 'Literal' && node.value === null;
    }


    /**
     * Checks whether or not the current traversal context is on constructors.
     *
     * @param {{scope: Scope}} item - A checking context to check.
     * @return {boolean} whether or not the current traversal context is on constructors.
     */
    function isOnCurrentMethod(item) {
        return item && item.scope === context.getScope().variableScope.upper.variableScope;
    }

    // A stack for checking context.
    var stack = [];

    return {

        /**
         * Start checking.
         *
         * @param {MethodDefinition} node - A target node.
         * @return {void}
         */
        'MethodDefinition': function (node) {
            if (node.kind === 'constructor') {
                return;
            }

            stack.push({
                superCallings: [],
                scope: context.getScope().variableScope
            });
        },

        /**
         * Checks the result, then reports invalid `super()`.
         *
         * @param {MethodDefinition} node - A target node.
         * @return {void}
         */
        'MethodDefinition:exit': function (node) {
            if (node.kind === 'constructor') {
                return;
            }
            var result = stack.pop();

            var classNode = getClassInAncestor(node);

            if (isNullLiteral(classNode.superClass)) {
                result.superCallings.forEach(function (superCalling) {
                    context.report(superCalling, 'Invalid `super`.');
                });
            }
            else {
                var methodName = node.computed ? '<methodName>' : node.key.name;
                result.superCallings.forEach(function (superCalling) {
                    context.report(
                        superCalling,
                        'Expected `super.{{name}}` but found `super`.',
                        {name: methodName}
                    );
                });
            }
        },

        /**
         * Checks the result of checking, then reports invalid `super()`.
         *
         * @param {MethodDefinition} node - A target node.
         * @return {void}
         */
        'CallExpression': function (node) {
            var item = stack[stack.length - 1];
            if (isOnCurrentMethod(item)) {
                var callee = node.callee;
                var classNode = getClassInAncestor(node);
                if (node.callee.type === 'Super'
                    || isNullLiteral(classNode.superClass)
                    && callee.type === 'MemberExpression'
                    && callee.object.type === 'Super'
                ) {
                    item.superCallings.push(node);
                }
            }
        }
    };
};

module.exports.schema = [];
