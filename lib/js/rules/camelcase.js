/**
 * @file Rule to flag non-camelcased identifiers
 * @author Nicholas C. Zakas
 * @author chris<wfsr@foxmail.com>
 */

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = function (context) {

    'use strict';

    var options = context.options[0] || {};
    var ignored = options.ignore;
    var ignoreWithQuotes = options.quote !== false;
    var sourceCode = context.getSourceCode();

    if (!Array.isArray(ignored)) {
        ignored = [ignored];
    }

    //--------------------------------------------------------------------------
    // Helpers
    //--------------------------------------------------------------------------

    /**
     * Checks if a string contains an underscore and isn't all upper-case
     *
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

    function isPrivate(name) {
        return name[0] === '_';
    }

    var regTest = /^\/.*\/$/;
    function isIgnored(name) {
        return ignored.some(function (item) {
            return regTest.test(item) ? new RegExp(item.slice(1, -1)).test(name) : item === name;
        });
    }

    var regCamel = /^[$a-zA-Z][$a-zA-Z\d]*$/;
    var regConst = /^[A-Z\d$]+(_[A-Z\d]+)*$/;
    function isCamelOrConst(name) {
        return regCamel.test(name) || regConst.test(name);
    }

    function hasPrivateTag(node) {
        var comments = sourceCode.getCommentsBefore(node);

        if (!comments.length) {
            return false;
        }

        var startLine = node.loc.start.line;

        return comments.some(function (comment) {
            return comment.type === 'Block'
                && comment.value[0] === '*'
                && startLine - comment.loc.end.line <= 1
                && comment.value.match(/\s@private\b/);
        });
    }

    function removeUnderscorePairs(name) {
        return name.replace(/^(_+)(.*?)\1?$/g, '$2');
    }

    /**
     * Reports an AST node as a rule violation.
     *
     * @param {ASTNode} node The node to report.
     * @param {string} ruleNumber code number for js spec
     * @return {void}
     * @private
     */
    function report(node, ruleNumber) {
        ruleNumber = ruleNumber || '025';
        context.report(node, 'Identifier \'{{name}}\' is not in camel case.baidu' + ruleNumber, {name: node.name});
    }

    return {

        Identifier: function (node) {

            // Leading and trailing underscores are commonly used to flag private/protected identifiers, strip them
            var name = removeUnderscorePairs(node.name);
            var effectiveParent = (node.parent.type === 'MemberExpression') ? node.parent.parent : node.parent;
            var effectiveType = effectiveParent.type;
            if (isIgnored(node.name)) {
                return;
            }

            // MemberExpressions get special rules
            if (node.parent.type === 'MemberExpression') {

                // Always report underscored object names
                if (node.parent.object.type === 'Identifier'
                    && node.parent.object.name === node.name
                    && isUnderscored(name)
                ) {
                    report(node);
                }
                // Report AssignmentExpressions only if they are the left side of the assignment
                else if (effectiveType === 'AssignmentExpression'
                    && isUnderscored(name)
                    && (effectiveParent.right.type !== 'MemberExpression'
                        || effectiveParent.left.type === 'MemberExpression'
                        && effectiveParent.left.property.name === node.name)
                ) {
                    report(node);
                }
            }
            // Report anything that is underscored that isn't a CallExpression
            else if (isUnderscored(node.name.replace(/^__|__$/g, ''))) {
                var ruleNumber;
                switch (effectiveType) {
                    case 'VariableDeclarator':
                    case 'AssignmentExpression':
                        ruleNumber = '025';
                        break;

                    case 'FunctionExpression':
                    case 'FunctionDeclaration':
                    case 'ArrowFunctionExpression':
                        ruleNumber = !effectiveParent.id || node.name !== effectiveParent.id.name
                            ? '028' : '027';
                        break;

                    default:
                        return;
                }
                report(node, ruleNumber);
            }
        },

        Property: function (node) {
            var name = String(node.key.name || node.key.value);
            var isPrivated = isPrivate(name);

            if (
                node.computed
                || node.type === 'SpreadProperty'
                || ignoreWithQuotes && node.key.type === 'Literal' && !isPrivated
            ) {
                return;
            }

            if (isPrivated && hasPrivateTag(node)) {
                return;
            }

            var noUnserscoreName = name.replace(/^__|__$/g, '');

            if ((!isCamelOrConst(noUnserscoreName) || isDashed(noUnserscoreName)) && !isIgnored(name)) {
                context.report(node, 'Property \'{{name}}\' is not in camel case.baidu030', {name: name});
            }
        }
    };

};


module.exports.schema = [
    {
        type: 'object',
        properties: {
            ignore: {
                oneOf: [
                    {
                        type: 'string'
                    },
                    {
                        type: 'array',
                        items: {
                            type: 'string'
                        }
                    }
                ]
            },
            quote: {
                type: 'boolean'
            }
        },
        additionalProperties: false
    }
];
