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
            message: 'Unnecessary semicolon.',
            fix: function (fixer) {
                return fixer.remove(nodeOrToken);
            }
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
                var beforeNode = context.getNodeByRangeIndex(context.getTokenBefore(node).start);
                if (beforeNode.parent.type === 'FunctionDeclaration'
                    && exportFns[beforeNode.parent.parent.type]
                ) {
                    beforeNode = beforeNode.parent;
                }
                report(beforeNode.parent, node);
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
            checkForPartOfClassBody(node, context.getTokenAfter(node));
        },

        /**
         * Checks token after decorator.
         *
         * @param {Node} node - A Decorator node to check.
         */
        Decorator: function (node) {
            var token = context.getTokenAfter(node);
            var hasSemi = token.type === 'Punctuator' && token.value === ';';

            if (!node.parent.computed && hasSemi) {
                report(node, token);
            }
        }
    };

};

module.exports.schema = [];
