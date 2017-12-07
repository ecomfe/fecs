/**
 * @file A rule to set the maximum number of statements in a function.
 * @author Ian Christian Myers
 * @author chris<wfsr@foxmail.com>
 */

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = function (context) {

    'use strict';

    //--------------------------------------------------------------------------
    // Helpers
    //--------------------------------------------------------------------------

    var functionStack = [];
    var maxStatements = context.options[0] || 10;
    var ignore = context.options[1] || {};

    function isAMD(node) {
        var parent = node.parent;
        var params = node.params;
        var args = parent.arguments && parent.arguments.slice(-2)[0];

        return ignore.AMD
            && node.type === 'FunctionExpression'
            && (params[0] && params[0].name === 'require'
                || args && args.elements && args.elements.length === params.length)
            && parent.type === 'CallExpression'
            && parent.callee.name === 'define';
    }

    function isIIFE(node) {
        var parent = node.parent;

        return ignore.IIFE
            && parent.type === 'CallExpression'
            && parent.parent.parent.parent == null;
    }

    function startFunction() {
        functionStack.push(0);
    }

    function endFunction(node) {
        var count = functionStack.pop();
        if (count > maxStatements && !(isIIFE(node) || isAMD(node))) {
            context.report(
                node,
                'This function has too many statements ({{count}}). Maximum allowed is {{max}}.',
                {count: count, max: maxStatements}
            );
        }
    }

    function countStatements(node) {
        functionStack[functionStack.length - 1] += node.body.length;
    }

    //--------------------------------------------------------------------------
    // Public API
    //--------------------------------------------------------------------------

    return {
        'FunctionDeclaration': startFunction,
        'FunctionExpression': startFunction,
        'ArrowFunctionExpression': startFunction,

        'BlockStatement': countStatements,

        'FunctionDeclaration:exit': endFunction,
        'FunctionExpression:exit': endFunction,
        'ArrowFunctionExpression:exit': endFunction
    };

};

module.exports.schema = [
    {
        type: 'integer',
        minimum: 0
    },
    {
        type: 'object',
        properties: {
            AMD: {
                type: 'boolean'
            },
            IIFE: {
                type: 'boolean'
            }
        },
        additionalProperties: true
    }
];

