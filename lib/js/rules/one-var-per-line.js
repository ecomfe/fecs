/**
 * @file Rule to enforce one variable per line when destructuring.
 * @author chris<wfsr@foxmail.com>
 */
'use strict';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description: 'enforce one variable per line when destructuring',
            category: 'ECMAScript 6',
            recommended: true
        },

        schema: []
    },

    create: function (context) {

        /**
         * Check ecah variable in destructure node
         *
         * @param {ASTNode} node ObjectPattern/ArrayPattern/ImportDeclaration node.
         */
        function validate(node) {
            if (node.loc.start.line === node.loc.end.line) {
                return;
            }

            (node.properties || node.elements || node.specifiers).reduce(function (lastLine, item) {
                if (!item) {
                    return lastLine + 1;
                }

                if (lastLine + 1 > item.loc.start.line) {
                    context.report(item, 'One Variable per line when destructuring.');
                }

                return item.loc.end.line;
            }, node.loc.start.line);
        }

        return {
            ObjectPattern: validate,
            ArrayPattern: validate,

            ImportDeclaration: function (node) {
                if (!node.specifiers[0]) {
                    return;
                }

                var target = node.specifiers[0].type === 'ImportDefaultSpecifier'
                    ? {loc: node.loc, specifiers: node.specifiers.slice(1)}
                    : node;

                validate(target);
            }
        };
    }
};
