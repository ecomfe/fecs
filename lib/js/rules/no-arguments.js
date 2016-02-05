/**
 * @file Rule to flag use of arguments
 * @author chris<wfsr@foxmail.com>
 */

'use strict';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = function (context) {

    return {

        Identifier: function (node) {
            if (node.name === 'arguments') {
                context.report(node, 'Expected `...args` but found `arguments`.');
            }
        }
    };

};

module.exports.schema = [];
