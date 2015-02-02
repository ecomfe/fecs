/**
 * @file A rule to set the maximum number of statements in a function.
 * @author Ian Christian Myers
 */

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = function (context) {

    'use strict';

    var inStrictMode = context.options[0] === 'strict';

    function check(node) {
        // allow multiple var declarations in for statement unless we're in strict mode
        // for (var i = 0, j = myArray.length; i < j; i++) {}
        var isFor = node.parent && node.parent.type === 'ForStatement';
        if (node.declarations.length > 1 && (inStrictMode || !isFor)) {
            context.report(node, 'Multiple var declaration');
        }
    }

    //--------------------------------------------------------------------------
    // Public API
    //--------------------------------------------------------------------------

    return {
        VariableDeclaration: check
    };

};
