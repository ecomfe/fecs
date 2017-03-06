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
            if (node.kind === 'get'
                || node.kind === 'set'
                || node.computed
                || node.shorthand || node.method
            ) {
                return;
            }

            var type = node.value.type;
            var scope = {};
            if (type === 'ArrowFunctionExpression') {
                context.getScope().childScopes.some(function (item) {
                    return item.block === node.value && (scope = item);
                });
            }
            if (type === 'FunctionExpression'
                && !node.value.id
                || type === 'ArrowFunctionExpression'
                && !scope.thisFound
            ) {
                context.report(
                    node.value,
                    'Expected MethodDefinition but saw {{type}}.', {type: type}
                );
            }

        }
    };

};

module.exports.schema = [];
