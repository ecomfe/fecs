/**
 * @file Rule to flag use of arguments
 * @author chris<wfsr@foxmail.com>
 */

'use strict';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = function (context) {

    var MESSAGE = 'Use `export` on declare.';

    return {

        ExportNamedDeclaration: function (node) {
            if (!node.declaration) {
                context.report(node, MESSAGE);
            }
        },

        ExportDefaultDeclaration: function (node) {
            if (node.declaration && node.declaration.type === 'Identifier') {
                context.report(node, MESSAGE);
            }
        }
    };

};

module.exports.schema = [];
