/**
 * @file Rule to check imports
 * @author chris<wfsr@foxmail.com>
 */

'use strict';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------


module.exports = function (context) {

    function report(node) {
        context.report(node, 'All `import` statements must be at the top of the module.');
    }

    return {

        'ImportDeclaration': function (node) {
            if (node.parent.type !== 'Program') {
                report(node);
            }
        },

        'Program:exit': function (node) {
            node.body.reduce(function (invalid, node) {
                if (node.type === 'ImportDeclaration') {
                    if (invalid) {
                        report(node);
                    }
                }
                else {
                    invalid = true;
                }

                return invalid;
            }, false);
        }
    };

};

module.exports.schema = [];
