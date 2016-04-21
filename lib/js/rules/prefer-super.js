/**
 * @file Rule to flag use of super
 * @author chris<wfsr@foxmail.com>
 */

'use strict';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = function (context) {

    /**
     * Searches a class node that a node is belonging to.
     *
     * @param {Node} node A node to start searching.
     * @return {ClassDeclaration|ClassExpression|null} the found class node, or `null`.
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
     * @param {Node} node A node to check.
     * @return {boolean} whether or not a node is the null literal.
     */
    function isNullLiteral(node) {
        return node === null || node.type === 'Literal' && node.value === null;
    }

    /**
     * get MemberExpression object name path.
     *
     * @param {ASTNode} node AST node
     * @return {string} stringify name path
     */
    function getNamePath(node) {
        var result = [];
        var object = node;

        while (object) {
            if (object.property) {
                result.push(object.property.name);
            }
            if (object.name) {
                result.push(object.name);
            }
            object = object.object;
        }

        return result.reverse().join('.');

    }


    /**
     * Check whether or not should be use `super` instead.
     *
     * @param {Object} item A checking context
     * @param {CallExpression} node AST node of CallExpression
     * @return {boolean}
     */
    function isSuperCall(item, node) {
        return (
            item
            && item.superName
            && item.scope === context.getScope().variableScope.upper.variableScope
            && node.callee.type === 'MemberExpression'
            && ~',apply,call,'.indexOf(',' + node.callee.property.name + ',')
            && (
                getNamePath(node.callee.object) === item.superName
                || node.callee.object.object
                && getNamePath(node.callee.object.object) === item.superName + '.prototype'
               )
            && node.arguments[0] && node.arguments[0].type === 'ThisExpression'
        );
    }

    var stack = [];

    return {

        /**
         * Start checking.
         *
         * @param {MethodDefinition} node A target node.
         */
        'MethodDefinition': function (node) {
            // Skip if it has no extends or `extends null`.
            var classNode = getClassInAncestor(node);
            var noSuperClass = isNullLiteral(classNode.superClass);
            stack.push({
                superName: !noSuperClass && getNamePath(classNode.superClass),
                expectSuperCall: [],
                scope: context.getScope().variableScope
            });
        },

        /**
         * Treats the result of checking and reports invalid call.
         *
         * @param {MethodDefinition} node A target node.
         */
        'MethodDefinition:exit': function (node) {
            var item = stack.pop();

            // Skip if it has no extends or `extends null`.
            if (!item.superName) {
                return;
            }

            // Reports.
            item.expectSuperCall.forEach(function (node) {
                context.report(node, 'Use `super` call instead.');
            });
        },


        /**
         * Marks `SupuerClass` or `SuperClass.prototype.methodName` called.
         *
         * @param {CallExpression} node A target node.
         */
        'CallExpression:exit': function (node) {
            var item = stack[stack.length - 1];
            if (item && item.superName && isSuperCall(item, node)) {
                item.expectSuperCall.push(node);
            }
        }

    };

};

module.exports.schema = [];
