/**
 * @file Rule to flag use of unnecessary semicolons
 * @author Nicholas C. Zakas
 * @author chris<wfsr@foxmail.com>
 */

'use strict';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = function (context) {

    /**
     * Reports an unnecessary semicolon error.
     *
     * @param {(Node | Token)} nodeOrToken - A node or a token to be reported.
     * @param {(Node | Token)} locNode - A node or a token to be located.
     */
    function report(nodeOrToken, locNode) {
        var reportData = {
            node: nodeOrToken,
            message: 'Unnecessary semicolon.'
        };

        if (locNode) {
            reportData.loc = locNode.loc.start;
        }
        context.report(reportData);
    }

    /**
     * Checks for a part of a class body.
     * This checks tokens from a specified token to a next MethodDefinition or the end of class body.
     *
     * @param {Node} node - A node to be reported.
     * @param {Token} firstToken - The first token to check.
     */
    function checkForPartOfClassBody(node, firstToken) {
        for (var token = firstToken;
            token.type === 'Punctuator' && token.value !== '}';
            token = context.getTokenAfter(token)
        ) {
            if (token.value === ';') {
                report(node, token);
            }
        }
    }

    function isIIFE(node) {
        return node.type === 'CallExpression' && node.callee.type === 'FunctionExpression';
    }

    // function checkDecorator(node) {
    //     var token = context.getTokenAfter(node);
    //     var hasSemi = token.type === 'Punctuator' && token.value === ';';
    //     if (hasSemi) {
    //         report(node, token);
    //     }
    // }

    return {

        /**
         * Reports this empty statement, except if the parent node is a loop.
         *
         * @param {Node} node - A EmptyStatement node to be reported.
         */
        EmptyStatement: function (node) {
            var parent = node.parent;
            var allowedParentTypes = [
                'ForStatement', 'ForInStatement', 'ForOfStatement',
                'WhileStatement', 'DoWhileStatement'
            ];

            var exportFns = {
                ExportDefaultDeclaration: 1,
                ExportNamedDeclaration: 1
            };

            if (allowedParentTypes.indexOf(parent.type) === -1) {
                var beforeToken = context.getTokenBefore(node);
                if (!beforeToken) {
                    var afterToken = context.getTokenAfter(node);
                    var afterNode = context.getNodeByRangeIndex(afterToken.start);

                    // ignore for single IIFE module
                    if (
                        // ;(function () {})();
                        isIIFE(afterNode)
                        // ;(function () {}());
                        || afterNode.type === 'ExpressionStatement' && isIIFE(afterNode.expression)
                    ) {
                        return;
                    }

                    report(node);
                }
                else {

                    var beforeNode = context.getNodeByRangeIndex(beforeToken.start);

                    if (beforeNode.parent.type === 'FunctionDeclaration'
                        && exportFns[beforeNode.parent.parent.type]
                    ) {
                        beforeNode = beforeNode.parent;
                    }

                    report(beforeNode.parent, node);

                }
            }
        },

        /**
         * Checks tokens from the head of this class body to the first MethodDefinition or the end of this class body.
         *
         * @param {Node} node - A ClassBody node to check.
         */
        ClassBody: function (node) {
            checkForPartOfClassBody(node, context.getFirstToken(node, 1)); // 0 is `{`.
        },

        /**
         * Checks tokens from this MethodDefinition to the next MethodDefinition or the end of this class body.
         *
         * @param {Node} node - A MethodDefinition node of the start point.
         * @return {void}
         */
        MethodDefinition: function (node) {
            // if (!node.computed && node.decorators) {
            //     node.decorators.forEach(checkDecorator);
            // }
            checkForPartOfClassBody(node, context.getTokenAfter(node));
        }
    };

};

module.exports.schema = [];
