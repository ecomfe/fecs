/**
 * @file Rule to flag use of class
 * @author chris<wfsr@foxmail.com>
 */

'use strict';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/**
 * Check whether or not name is pascal style.
 *
 * @param {string} name name to be checked
 * @return {boolean}
 */
function isPascal(name) {
    return /^[A-Z][a-z\d\$]*$/.test(name);
}

module.exports = function (context) {

    return {

        FunctionDeclaration: function (node) {
            if (node.id && isPascal(node.id.name)) {
                context.report(
                    node,
                    'Expected `class {{name}}` but found `FunctionDeclaration`.',
                    {name: node.id.name}
                );
            }
        },

        FunctionExpression: function (node) {
            while (node.parent && node.parent.type !== 'VariableDeclarator') {
                node = node.parent;
            }

            if (!node.parent) {
                return;
            }

            if (node.parent.type === 'VariableDeclarator' && isPascal(node.parent.id.name)) {
                context.report(
                    node,
                    'Expected `class {{name}}` but found `FunctionExpression`.',
                    {name: node.parent.id.name}
                );
            }
        }
    };

};

module.exports.schema = [];
