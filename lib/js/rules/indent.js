/**
 * @file Rule to flag use of bad indent.
 * @author Nodeca Team <https://github.com/nodeca>
 * @author chris<wfsr@foxmail.com>
 */

'use strict';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------
module.exports = function (context) {

    var MESSAGE = 'Bad indentation ({{gotten}} instead {{needed}}).';

    var sourceCode = context.getSourceCode();

    var extraColumnStart = 0;
    var indentType = (context.options[0] === 'tab') ? 'tab' : 'space';
    var indentSize = +(context.options[1] || 4);
    var rootIndex = context.options[2] | 0;
    var indentSwitchCase = context.options[3] !== false;
    var tabSpaces = new Array(indentSize + 1).join(' ');
    var tabLineMap;

    /**
     * Get node indent
     *
     * @param {ASTNode} node AST node
     * @param {boolean} byLastLine get indent of node's last line
     * @param {boolean} excludeCommas  skip comma on start of line
     * @return {number} node indents
     */
    var getNodeIndent = function (node, byLastLine, excludeCommas) {
            byLastLine = byLastLine || false;
            excludeCommas = excludeCommas || false;

            var src = context.getSource(node, node.loc.start.column + extraColumnStart);
            var lines = src.split('\n');
            if (byLastLine) {
                src = lines[lines.length - 1];
            }
            else {
                src = lines[0];
            }

            var skip = excludeCommas ? ',' : '';

            var regExp;
            var tabReg = /\t/g;
            if (indentType === 'space') {
                var loc = node.loc[byLastLine ? 'end' : 'start'];
                if (tabReg.test(src) && !tabLineMap[loc.line]) {
                    tabLineMap[loc.line] = true;
                    context.report(node, loc, 'Expected space but saw tab.');
                }

                regExp = new RegExp('^[ ' + skip + ']+');
                src = src.replace(tabReg, tabSpaces);
            }
            else {
                regExp = new RegExp('^[\t' + skip + ']+');
            }

            var indent = regExp.exec(src);
            return indent ? indent[0].length : 0;
        };

    /**
     * Checks node is the first in its own start line. By default it looks by start line.
     *
     * @param {ASTNode} node The node to check
     * @return {boolean} true if its the first in the its start line
     */
    function isNodeFirstInLine(node) {
        var firstToken = context.getTokenBefore(node);
        var startLine = node.loc.start.line;
        var endLine = firstToken ? firstToken.loc.end.line : -1;

        return startLine !== endLine;
    }

    /**
     *  Check indent for nodes list
     *
     * @param {Array.<ASTNode>} nodes list of node objects
     * @param {number} indent needed indent
     * @param {boolean} excludeCommas skip comma on start of line
     * @param {?string=} messageSuffix string append to MESSAGE
     */
    var checkNodesIndent = function (nodes, indent, excludeCommas, messageSuffix) {
        nodes.forEach(function (node) {
            var nodeIndent = getNodeIndent(node, false, excludeCommas);
            if (nodeIndent !== indent && isNodeFirstInLine(node)) {
                context.report(node, MESSAGE + (messageSuffix || ''), {
                    gotten: nodeIndent,
                    needed: indent
                });
            }
        });
    };


    /**
     * Check last node line indent this detects, that block closed correctly
     *
     * @param {ASTNode} node AST node
     * @param {number} lastLineIndent needed indent
     */
    var checkLastNodeLineIndent = function (node, lastLineIndent) {
        var endIndent = getNodeIndent(node, true);
        if (endIndent !== lastLineIndent) {
            context.report(
                node,
                {
                    line: node.loc.end.line,
                    column: node.loc.end.column
                },
                MESSAGE,
                {
                    gotten: endIndent,
                    needed: lastLineIndent
                }
            );
        }
    };


    /**
     * Check indent for function block content
     *
     * @param {ASTNode} node AST node
     */
    var checkIndentInFunctionBlock = function (node) {

        // Search first caller in chain.
        // Ex.:
        //
        // Models <- Identifier
        //   .User
        //   .find()
        //   .exec(function () {
        //   // function body
        // });
        //
        // Looks for 'Models'
        var calleeNode = node.parent; // FunctionExpression

        var indent;

        if (~',Property,ArrayExpression,CallExpression'.indexOf(',' + calleeNode.parent.type)) {
            // If function is part of array or object, comma can be put at left
            indent = getNodeIndent(calleeNode, false, true);
        }
        else {
            // If function is standalone, simple calculate indent
            indent = getNodeIndent(calleeNode);
        }

        indent += indentSize;
        // If function content is not empty
        if (node.body.length) {
            // Calculate left shift position don't require strict indent
            // allow function body allign to (indentSize * X)
            while (getNodeIndent(node.body[0]) > indent) {
                indent += indentSize;
            }
        }

        checkNodesIndent(node.body, indent);

        checkLastNodeLineIndent(node, indent - indentSize);
    };


    /**
     * Check indent for array block content or object block content
     *
     * @param {ASTNode} node AST node
     */
    var checkIndentInArrayOrObjectBlock = function (node) {
        // Skip inline
        if (node.loc.start.line === node.loc.end.line) {
            return;
        }

        var elements = (node.type === 'ArrayExpression') ? node.elements : node.properties;

        // Skip if first element is in same line with this node
        if (elements.length > 0 && elements[0].loc.start.line === node.loc.start.line) {
            return;
        }

        var nodeIndent = getNodeIndent(node);

        var elementsIndent = nodeIndent + indentSize;
        // Elements can have double indent (detected by first item)
        if (elements.length > 0 && getNodeIndent(elements[0]) === elementsIndent + indentSize) {
            elementsIndent = elementsIndent + indentSize;
        }

        // Comma can be placed before property name
        checkNodesIndent(elements, elementsIndent, true);

        if (elements.length > 0) {
            // Skip last block line check if last item in same line
            if (elements[elements.length - 1].loc.end.line === node.loc.end.line) {
                return;
            }
        }

        checkLastNodeLineIndent(node, elementsIndent - indentSize);
    };

    /**
     * Check indent for html strings array
     *
     * @param {ASTNode} node AST node
     * @return {boolean}
     */
    var isHTMLStrings = function (node) {
        var varNode = node.parent.parent;

        if (node.loc.start.line === node.loc.end.line) {
            return false;
        }

        var types = {};
        var startColumn = getNodeIndent(node);
        var lastColumn = startColumn;
        var lastElement;
        var messages = [];
        var htmlFlag = 0;

        var comments = sourceCode.getComments(varNode).leading;
        if (comments[0] && /\bhtml\b/.test(comments[0].value)) {
            htmlFlag = 3;
        }

        node.elements.forEach(function (el, i) {
            types[el.type] = (types[el.type] | 0) + 1;
            if (htmlFlag !== 3 && el.type === 'Literal' && typeof el.value === 'string') {
                if (htmlFlag === 0 && ~el.value.indexOf('<')) {
                    htmlFlag |= 1;
                }
                else if (htmlFlag === 1 && ~el.value.indexOf('>')) {
                    htmlFlag |= 2;
                }
            }

            if (
                lastElement && lastElement.loc.start.line === el.loc.start.line
                || i === 0 && el.type === 'ArrayExpression' && node.loc.start.line === el.loc.start.line
            ) {
                return;
            }

            var column = el.loc.start.column;
            var needed;

            if (column <= startColumn) {
                needed = 'bigger then ' + (startColumn + indentSize);
            }
            else if (column !== lastColumn && Math.abs(column - lastColumn) !== indentSize) {
                needed = 'one of [' + [lastColumn - indentSize, lastColumn, lastColumn + indentSize].join(', ') + ']';
            }

            if (needed) {
                messages.push([el, {gotten: column, needed: needed}]);
            }
            else {
                lastColumn = column;
            }

            lastElement = el;
        });

        var validTypes = [
            'ArrayExpression', 'BinaryExpression',
            'CallExpression', 'ConditionalExpression',
            'Identifier', 'Literal', 'MemberExpression'
        ];

        var total = validTypes.reduce(
            function (total, type) {
                total += types[type] | 0;
                return total;
            },
            0
        );

        if (types.Literal === node.elements.length && htmlFlag !== 3) {
            return false;
        }

        if (htmlFlag === 3 || total === node.elements.length && total > 1) {
            messages.forEach(function (message) {
                context.report(message[0], MESSAGE, message[1]);
            });

            return true;
        }

        return false;
    };

    var caseIndentStore;

    /**
     * Returns the expected indentation for the case statement
     *
     * @param {SwitchCase} node node to examine
     * @return {number} indent size
     */
    function expectedCaseIndent(node) {
        var switchNode = node.parent;

        if (caseIndentStore[switchNode.loc.start.line]) {
            return caseIndentStore[switchNode.loc.start.line];
        }

        var switchIndent = getNodeIndent(switchNode);

        var caseIndent = switchIndent + (indentSwitchCase ? indentSize : 0);
        caseIndentStore[switchNode.loc.start.line] = caseIndent;

        return caseIndent;
    }


    /**
     * Check whether in the same line
     *
     * @param {ASTNode} left left node
     * @param {ASTNode} right right node
     * @return {boolean}
     */
    var isSameLine = function (left, right) {
        var target = right.loc.start.line;
        return left.loc.start.line === target || left.loc.end.line === target;
    };

    return {

        'Program': function (node) {
            tabLineMap = {};
            caseIndentStore = {};

            // Root nodes should have no indent
            checkNodesIndent(node.body, rootIndex);
        },

        'Program:exit': function () {
            tabLineMap = null;
        },

        'BlockStatement': function (node) {
            // Skip inline blocks
            if (node.loc.start.line === node.loc.end.line) {
                return;
            }

            if (node.parent && (
                    node.parent.type === 'FunctionExpression'
                    || node.parent.type === 'FunctionDeclaration'
                    || node.parent.type === 'ArrowFunctionExpression'
            )) {
                checkIndentInFunctionBlock(node);
                return;
            }

            var indent;

            // For this statements we should check indent from statement begin
            // (not from block begin)
            var statementsWithProperties = [
                'IfStatement', 'WhileStatement', 'ForStatement',
                'ForInStatement', 'ForOfStatement', 'DoWhileStatement'
            ];

            if (node.parent && statementsWithProperties.indexOf(node.parent.type) !== -1) {
                indent = getNodeIndent(node.parent);
            }
            else {
                indent = getNodeIndent(node);
            }

            checkNodesIndent(node.body, indent + indentSize);

            checkLastNodeLineIndent(node, indent);
        },

        'ObjectExpression': function (node) {
            checkIndentInArrayOrObjectBlock(node);
        },

        'ArrayExpression': function (node) {
            if (!isHTMLStrings(node)) {
                checkIndentInArrayOrObjectBlock(node);
            }
        },

        'SwitchStatement': function (node) {
            // Switch is not a 'BlockStatement'
            var indent = getNodeIndent(node);

            checkNodesIndent(node.cases, indent + (indentSwitchCase ? indentSize : 0), false, 'baidu004');

            checkLastNodeLineIndent(node, indent);
        },

        'SwitchCase': function (node) {
            // Skip inline cases
            if (node.loc.start.line === node.loc.end.line) {
                return;
            }

            var indent = expectedCaseIndent(node);
            checkNodesIndent(node.consequent, indent + indentSize);
        },

        'MemberExpression': function (node) {
            if (isSameLine(node.object, node.property)) {
                return;
            }

            var indent = getNodeIndent(node.object);
            var propertyIndex = getNodeIndent(node.property);
            var needed;

            if (node.parent.type === 'CallExpression') {
                if (indent !== propertyIndex && propertyIndex - indent !== indentSize) {
                    needed = indent + ' or ' + (indent + indentSize);
                }
            }
            else if (propertyIndex - indent !== indentSize) {
                needed = '' + (indent + indentSize);
            }

            if (needed) {
                context.report(
                    node.property,
                    MESSAGE,
                    {
                        gotten: propertyIndex,
                        needed: needed
                    }
                );
            }
        }
    };
};

module.exports.schema = [
    {
        'enum': ['tab', 'space']
    },
    {
        type: 'integer'
    },
    {
        type: 'integer'
    },
    {
        type: 'boolean'
    }
];

