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
            var scope = context.getScope().childScopes[0];
            if (type === 'FunctionExpression'
                && !node.value.id
                || type === 'ArrowFunctionExpression'
                && !scope.thisFound
                && node.value.body.type === 'BlockStatement'
                && node.value.body.body.length > 1
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
