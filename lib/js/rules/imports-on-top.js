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

        'Program:exit': function (node) {
            node.body.reduce(function (invalid, node) {
                if (node.type === 'ImportDeclaration'
                    || node.type === 'ExpressionStatement'
                    && node.expression.type === 'Literal'
                    && node.expression.value === 'use strict'
                ) {
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
