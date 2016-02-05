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

        Property: function (node) {

            // getters, setters and computed properties are ignored
            if (node.kind === 'get' || node.kind === 'set' || node.computed || node.shorthand || node.method) {
                return;
            }

            if (node.value.type === 'FunctionExpression' && !node.value.id) {
                context.report(node, 'Expected MethodDefinition but saw FunctionExpression.');
            }

        }
    };

};

module.exports.schema = [];
