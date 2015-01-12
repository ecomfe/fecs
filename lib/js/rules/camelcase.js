/**
 * @file Rule to flag non-camelcased identifiers
 * @author Nicholas C. Zakas
 */

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = function (context) {

    'use strict';

    var options = context.options[0] || {};
    var ignored = options.ignore;

    //--------------------------------------------------------------------------
    // Helpers
    //--------------------------------------------------------------------------

    /**
     * Checks if a string contains an underscore and isn't all upper-case
     * @param {string} name The string to check.
     * @return {boolean} if the string is underscored
     * @private
     */
    function isUnderscored(name) {

        // if there's an underscore, it might be A_CONSTANT, which is okay
        return name.indexOf('_') > -1 && name !== name.toUpperCase();
    }

    function isDashed(name) {
        return name.indexOf('-') > -1;
    }

    var regTest = /^\/.*\/$/;
    function isIgnored(name) {

        if (Object.prototype.toString.call(ignored) === '[object Array]') {
            return ignored.some(function (item) {
                return regTest.test(item) ? new RegExp(item.slice(1, -1)).test(name) : item === name;
            });
        }

        return false;
    }

    /**
     * Reports an AST node as a rule violation.
     * @param {ASTNode} node The node to report.
     * @return {void}
     * @private
     */
    function report(node) {
        context.report(node, 'Identifier \'{{name}}\' is not in camel case.', {name: node.name});
    }

    return {

        'Identifier': function (node) {

            // Leading and trailing underscores are commonly used to flag private/protected identifiers, strip them
            var name = node.name.replace(/^_+|_+$/g, '');
            var effectiveParent = (node.parent.type === 'MemberExpression') ? node.parent.parent : node.parent;

            // MemberExpressions get special rules
            if (node.parent.type === 'MemberExpression') {

                // Always report underscored object names
                if (node.parent.object.type === 'Identifier' &&
                        node.parent.object.name === node.name &&
                        isUnderscored(name)) {
                    report(node);
                }
                // Report AssignmentExpressions only if they are the left side of the assignment
                else if (effectiveParent.type === 'AssignmentExpression' &&
                        isUnderscored(name) &&
                        (effectiveParent.right.type !== 'MemberExpression' ||
                        effectiveParent.left.type === 'MemberExpression' &&
                        effectiveParent.left.property.name === node.name)) {
                    report(node);
                }
            }
            // Report anything that is underscored that isn't a CallExpression
            else if (isUnderscored(name) && effectiveParent.type !== 'CallExpression') {
                report(node);
            }
        },

        'Property': function (node) {
            var name = node.key.name || node.key.value;

            if ((isUnderscored(name) || isDashed(name)) && !isIgnored(name)) {
                context.report(node, 'Property \'{{name}}\' is not in camel case.', {name: name});
            }
        }
    };

};
