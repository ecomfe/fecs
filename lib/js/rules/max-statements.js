/**
 * @fileoverview A rule to set the maximum number of statements in a function.
 * @author Ian Christian Myers
 */

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = function(context) {

    'use strict';

    //--------------------------------------------------------------------------
    // Helpers
    //--------------------------------------------------------------------------

    var functionStack = [];
    var maxStatements = context.options[0] || 10;

    function isXMD(node) {
        var parent = node.parent;
        var params = node.params;
        var args = parent && parent.parent && parent.parent.arguments && parent.parent.arguments.slice(-2);
        return node.type === 'FunctionExpression'
            && (params[0] && params[0].name === 'require' || args && args[0].elements.length === params.length)
            && parent && parent.type === 'CallExpression'
            && (parent.callee.name === 'define' || parent.callee.type === 'FunctionExpression');
    }

    function startFunction() {
        functionStack.push(0);
    }

    function endFunction(node) {
        var count = functionStack.pop();
        if (count > maxStatements && !isXMD(node)) {
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

        'BlockStatement': countStatements,

        'FunctionDeclaration:exit': endFunction,
        'FunctionExpression:exit': endFunction
    };

};
